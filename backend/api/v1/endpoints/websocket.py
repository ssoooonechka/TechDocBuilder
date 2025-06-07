from fastapi import APIRouter
from starlette import status
from starlette.websockets import WebSocket, WebSocketDisconnect

from services.collaboration import Collaboration
from services.connection_client import ConnectionManager
from services.redis_client import AsyncRedisClient

manager = ConnectionManager()
router = APIRouter(
    prefix="/ws",
    tags=["ws"]
)

collaboration = Collaboration()


@router.websocket("/collaborate")
async def websocket_endpoint(websocket: WebSocket, access_token: str, room_uuid: str):
    await websocket.accept()
    room_id = None

    try:
        access_data = await Collaboration.verify_access(
            redis_client=AsyncRedisClient(),
            access_token=access_token,
            room_uuid=room_uuid
        )
        if not access_data:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        user_id = access_data.get("user_id")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        room_id = access_data["room_id"]
        await collaboration.connect(room_id, websocket, user_id)

        while True:
            try:
                data = await websocket.receive_bytes()
                await collaboration.broadcast(room_id, data, websocket)
            except RuntimeError:
                try:
                    data = await websocket.receive_text()
                    await collaboration.broadcast(room_id, data.encode('utf-8'), websocket)
                except RuntimeError as e:
                    print(f"Unsupported message format: {e}")
                    continue
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                break

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        if room_id:
            collaboration.disconnect(room_id, websocket)
        try:
            await websocket.close()
        except:
            pass
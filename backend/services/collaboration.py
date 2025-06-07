from typing import Dict
from starlette.websockets import WebSocket
from starlette import status

from services.core.room_service import RoomService
from services.redis_client import AsyncRedisClient
from utils.jwt_manager import decode_access_token

class Collaboration:
    def __init__(self):
        self.rooms: Dict[str, Dict[WebSocket, str]] = {}

    async def connect(self, room_id: str, websocket: WebSocket, user_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = {}
        self.rooms[room_id][websocket] = user_id

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms and websocket in self.rooms[room_id]:
            del self.rooms[room_id][websocket]
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def disconnect_user(self, room_id: str, user_id: str):
        if room_id not in self.rooms:
            return
        disconnected = []
        for ws in list(self.rooms[room_id].keys()):
            if self.rooms[room_id][ws] == user_id:
                try:
                    await ws.close(code=status.WS_1008_POLICY_VIOLATION)
                    disconnected.append(ws)
                except Exception as e:
                    print(f"Error closing websocket: {e}")
        for ws in disconnected:
            self.disconnect(room_id, ws)

    async def broadcast(self, room_id: str, message: bytes, sender: WebSocket):
        if room_id in self.rooms:
            for connection in list(self.rooms[room_id].keys()):
                if connection != sender:
                    try:
                        await connection.send_bytes(message)
                    except Exception as e:
                        print(f"Broadcast error: {e}")
                        self.disconnect(room_id, connection)

    @staticmethod
    async def verify_access(
            redis_client: AsyncRedisClient,
            access_token: str,
            room_uuid: str
    ) -> Dict[str, str] | None:
        try:
            token_data = decode_access_token(token=access_token)
            user_id = token_data.get("user_id")

            existing_room = await RoomService.get_by_room_uuid(
                owner_id=user_id,
                room_uuid=room_uuid
            )
            if existing_room:
                return {
                    "room_id": room_uuid,
                    "permissions": "owner",
                    "user_id": user_id
                }

            permissions = await redis_client.get_value(f"{room_uuid}:{user_id}")
            print(room_uuid, user_id)
            print(permissions)
            if permissions:
                return {
                    "room_id": room_uuid,
                    "permissions": permissions,
                    "user_id": user_id
                }

            return None

        except Exception as e:
            print(f"Access verification error: {e}")
            return None
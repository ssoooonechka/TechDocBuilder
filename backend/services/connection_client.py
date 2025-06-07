from typing import Dict, Optional, List
from starlette.websockets import WebSocket

from services.core.room_service import RoomService
from services.redis_client import AsyncRedisClient
import json
from datetime import datetime

from utils.jwt_manager import decode_access_token


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.redis = AsyncRedisClient()

    async def authenticate_connection(self, websocket: WebSocket, room_id: str, access_token: str) -> Optional[str]:
        try:
            token_data = decode_access_token(access_token)
            user_id = token_data.get("user_id")

            room_info = await self.get_room_info(room_id)
            if not room_info:
                await websocket.close(code=401)
                return None

            if str(room_info['owner_id']) != user_id:
                if user_id not in room_info.get('members', []):
                    await websocket.close(code=403)
                    return None

            return user_id
        except Exception as e:
            await websocket.close(code=400)
            return None

    async def connect(self, room_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        await self.notify_presence(room_id, user_id, True)

    async def disconnect(self, room_id: str, user_id: str):
        if room_id in self.active_connections and user_id in self.active_connections[room_id]:
            del self.active_connections[room_id][user_id]
            await self.notify_presence(room_id, user_id, False)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def get_room_info(self, room_id: str) -> Optional[dict]:
        room_key = f"room:{room_id}"
        room_info = await self.redis.get_value(room_key)

        if room_info:
            return json.loads(room_info)

        room_from_db = await RoomService.get_by_room_info(room_id)
        if not room_from_db:
            return None

        room_dict = room_from_db.model_dump()
        await self.redis.set_value(room_key, json.dumps(room_dict), expire=3600)

        return room_dict

    async def notify_presence(self, room_id: str, user_id: str, is_online: bool):
        message = {
            "type": "presence",
            "user_id": user_id,
            "is_online": is_online,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(room_id, message)

    async def broadcast(self, room_id: str, message: dict, exclude_user_ids: List[str] = None):
        if room_id in self.active_connections:
            for uid, connection in self.active_connections[room_id].items():
                if exclude_user_ids and uid in exclude_user_ids:
                    continue
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending to {uid}: {e}")
                    await self.disconnect(room_id, uid)

    async def get_document(self, room_id: str) -> Optional[dict]:
        doc = await self.redis.get_value(f"doc:{room_id}")
        return json.loads(doc) if doc else None

    async def update_document(self, room_id: str, user_id: str, content: str) -> dict:
        doc_key = f"doc:{room_id}"

        current = await self.get_document(room_id) or {
            "content": "",
            "version": 0,
            "history": []
        }

        new_version = current["version"] + 1
        updated = {
            "content": content,
            "version": new_version,
            "last_modified_by": user_id,
            "last_modified_at": datetime.utcnow().isoformat(),
            "history": current["history"][-9:] + [{
                "content": current["content"],
                "version": current["version"],
                "modified_by": current.get("last_modified_by"),
                "modified_at": current.get("last_modified_at")
            }]
        }

        await self.redis.set_value(doc_key, json.dumps(updated))
        return updated
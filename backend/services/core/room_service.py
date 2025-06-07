import uuid
from typing import Optional

from database.core import get_session
from database.models.room.repository import RoomRepository
from models.core.room import RoomRead, RoomUpdate, RoomBase, RoomCreate
from services.core.user_service import UserService
from services.redis_client import AsyncRedisClient
from utils.hash_manager import encrypt
from utils.room import generate_password


class RoomService:
    @staticmethod
    async def create_room(room_init_data: RoomBase, user_id: int) -> RoomRead:
        async with get_session() as session:
            repo = RoomRepository(session=session)

            room_uuid = str(uuid.uuid4())

            new_room = RoomCreate(
                name=room_init_data.name,
                content=room_init_data.content,
                owner_id=user_id,
                room_uuid=room_uuid
            )

            new_room = await repo.create_room(
                room_data=new_room
            )

            return new_room

    @staticmethod
    async def update_room_settings(room_uuid: str, update_data: RoomUpdate) -> bool:
        async with get_session() as session:
            repo = RoomRepository(session=session)

            updated_room = await repo.update_room_settings(
                room_uuid=room_uuid,
                update_data=update_data
            )

            return True if updated_room else False

    @staticmethod
    async def get_by_room_uuid(room_uuid: str, owner_id: int) -> Optional[RoomRead]:
        async with get_session() as session:
            repo = RoomRepository(session=session)

            room = await repo.get_by_room_uuid(
                room_uuid=room_uuid,
                owner_id=owner_id
            )

            return room

    @staticmethod
    async def get_by_room_info(room_uuid: str) -> Optional[RoomRead]:
        async with get_session() as session:
            repo = RoomRepository(session=session)

            room = await repo.get_by_room_info(
                room_uuid=room_uuid,
            )

            return room
        
    
    @staticmethod
    async def get_all_by_owner(owner_id: int):
        async with get_session() as session:
            repo = RoomRepository(session=session)
            rooms = await repo.get_all_by_owner(
                owner_id=owner_id
            )

            return rooms

    @staticmethod
    async def save_room_link(
            redis_client: AsyncRedisClient,
            room_uuid: str,
            permissions: str 
    ):
        room_password = await generate_password()
        value = f"{room_uuid}:{room_password}:{permissions}:{str(uuid.uuid4())}"

        room_invite_link = await encrypt(input_string=value)

        await redis_client.set_value(
            key=room_invite_link,
            value=value,
            expire=5 * 60
        )

        return room_invite_link, room_password, permissions 


    @staticmethod
    async def get_room_uuid_by_link(
            redis_client: AsyncRedisClient,
            invite_link: str,
            room_password: str
    ) -> Optional[str]:
        stored_value = await redis_client.get_value(invite_link)
        if not stored_value:
            return None

        parts = stored_value.split(":")
        if len(parts) < 4:
            return None

        room_uuid, password, _, _ = parts

        if password == room_password:
            await redis_client.delete_value(invite_link)
            return room_uuid

        return None

    @staticmethod
    async def set_invited_user(
            redis_client: AsyncRedisClient,
            invited_user_id: int,
            room_uuid: str,
            permissions: str
        ):
        key = f"{room_uuid}:{invited_user_id}"

        await redis_client.set_value(
            key=key,
            value=permissions,
            expire=24 * 60 * 60
        )

    @staticmethod
    async def delete_invited_user(
        redis_client: AsyncRedisClient,
        username: int,
        room_uuid: str,
    ):
        invited_user_id = await UserService.get_by_username(username=username)
        key = f"{room_uuid}:{invited_user_id.id}"
        await redis_client.delete_value(key=key)

        return invited_user_id.id

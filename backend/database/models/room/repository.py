from typing import List, Optional

from sqlalchemy import update, select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.room.model import Room
from models.api.room import RoomInfo
from models.core.room import (
    RoomRead,
    RoomCreate,
    RoomUpdate
)
from utils.base_repository import BaseRepository


class RoomRepository(BaseRepository[Room, RoomRead]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Room)

    async def create_room(self, room_data: RoomCreate) -> RoomRead:
        db_room = await self.create(
            data=room_data,
            returning_model=RoomRead
        )
        return db_room

    async def update_room_settings(
            self,
            room_uuid: str,
            update_data: RoomUpdate
    ) -> Optional[RoomRead]:
        stmt = (
            update(self.model)
            .where(self.model.room_uuid == room_uuid)
            .values(**update_data.model_dump(exclude_unset=True))
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        record = result.scalar_one_or_none()
        return RoomRead.model_validate(record) if record else None

    async def get_by_room_uuid(self, room_uuid: str, owner_id: int) -> Optional[RoomRead]:
        result = await self.session.execute(
            select(self.model)
            .where(
                (self.model.room_uuid == room_uuid) &
                (self.model.owner_id == owner_id)
            )
        )
        
        room = result.scalar_one_or_none()
        return RoomRead.model_validate(room) if room else None

    async def get_by_room_info(self, room_uuid: str) -> Optional[RoomRead]:
        result = await self.session.execute(
            select(self.model)
            .where(self.model.room_uuid == room_uuid)
        )

        room = result.scalar_one_or_none()
        return RoomRead.model_validate(room) if room else None

    async def get_all_by_owner(
            self,
            owner_id: int
    ) -> Optional[List[RoomInfo]]:

        result = await self.session.execute(
            select(self.model)
            .where(self.model.owner_id == owner_id)
            .group_by(self.model.id)
        )

        rooms = result.scalars().all()
        if rooms:
            return [
                RoomInfo(
                    room_uuid=room.room_uuid,
                    name=room.name,
                )
                for room in rooms
            ]

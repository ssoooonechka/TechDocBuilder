from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RoomBase(BaseModel):
    name: str
    content: Optional[str] = None


class RoomCreate(RoomBase):
    room_uuid: str
    owner_id: int


class RoomUpdate(BaseModel):
    name: str = None
    content: str = None


class RoomRead(RoomCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from datetime import datetime

from pydantic import BaseModel


class StarBase(BaseModel):
    user_id: int
    template_id: int


class StarCreate(StarBase):
    pass


class StarDelete(StarBase):
    pass


class StarRead(StarCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

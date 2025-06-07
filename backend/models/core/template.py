from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TemplateBase(BaseModel):
    name: str
    content: str
    is_public: bool


class TemplateCreate(TemplateBase):
    owner_id: int


class TemplateUpdate(BaseModel):
    is_public: Optional[bool] = None
    content: Optional[str] = None
    name: Optional[str] = None


class TemplateRead(TemplateCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PublicTemplatesInfo(BaseModel):
    name: str
    stars: int
    starred_by_user: bool
    last_update: datetime


class OwnerTemplatesInfo(BaseModel):
    name: str
    last_update: datetime


class AdditOwnerTemplatesInfo(OwnerTemplatesInfo):
    stars: int
    content: str
    is_public: bool


class AdditPublicTemplatesInfo(OwnerTemplatesInfo):
    stars: int
    content: str
    is_public: bool
    starred_by_user: bool

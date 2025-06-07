from pydantic import BaseModel

from models.api.token import TokenPayload
from models.core.room import RoomUpdate, RoomBase


class RoomUUIDPayload(BaseModel):
    room_uuid: str


class RoomCreateRequest(TokenPayload):
    data: RoomBase


class RoomUpdateRequest(TokenPayload, RoomUUIDPayload):
    update_data: RoomUpdate


class RoomInviteLinkRequest(RoomUUIDPayload, TokenPayload):
    permissions: str 


class RoomConnectingRequest(TokenPayload):
    room_password: str


class RoomInviteLinkResponse(BaseModel):
    invite_link: str
    room_password: str
    permissions: str


class RoomInfo(BaseModel):
    room_uuid: str
    name: str


class RoomAccessRequest(RoomUUIDPayload, TokenPayload):
    pass


class RoomRemoveInvited(RoomUUIDPayload, TokenPayload):
    username: str

from typing import Optional
from fastapi import APIRouter, Depends
from starlette.responses import JSONResponse
from models.api.room import (
    RoomRemoveInvited,
    RoomUpdateRequest,
    RoomCreateRequest,
    RoomInviteLinkRequest,
    RoomConnectingRequest,
    RoomInviteLinkResponse, RoomAccessRequest
)
from services.collaboration import Collaboration
from services.core.room_service import RoomService
from services.redis_client import get_redis_client
from utils.jwt_manager import decode_access_token
from api.v1.endpoints.websocket import collaboration


router = APIRouter(
    prefix="/room",
    tags=["room"]
)


@router.post(path="/create")
async def create_room(request: RoomCreateRequest):
    token_data = decode_access_token(
        token=request.access_token
    )

    new_room = await RoomService.create_room(
        room_init_data=request.data,
        user_id=token_data.get("user_id")
    )

    return new_room


@router.patch(path="/update")
async def update_room(request: RoomUpdateRequest):
    token_data = decode_access_token(
        token=request.access_token
    )

    room_uuid = request.room_uuid

    existing_room = await RoomService.get_by_room_uuid(
        room_uuid=room_uuid,
        owner_id=token_data.get("user_id")
    )

    if not existing_room: return "not room"

    if existing_room.owner_id != token_data.get("user_id"): return "permission"

    is_updated = await RoomService.update_room_settings(
        room_uuid=room_uuid,
        update_data=request.update_data
    )

    return is_updated


@router.post(path="/invite_link", response_class=JSONResponse, response_model=RoomInviteLinkResponse)
async def get_invite_link(
        request: RoomInviteLinkRequest,
        redis_client = Depends(get_redis_client)
) -> str | RoomInviteLinkResponse:
    token_data = decode_access_token(
        token=request.access_token
    )

    room_uuid = request.room_uuid

    existing_room = await RoomService.get_by_room_uuid(
        room_uuid=room_uuid,
        owner_id=token_data.get("user_id")
    )

    if not existing_room: return "not room"

    if existing_room.owner_id != token_data.get("user_id"): return "permission"

    invite_link, room_password, permissions = await RoomService.save_room_link(
        redis_client=redis_client,
        room_uuid=room_uuid,
        permissions=request.permissions
    )

    return RoomInviteLinkResponse(
        invite_link=invite_link,
        room_password=room_password,
        permissions=permissions
    )

@router.post(path="/connect/{invite_link}", response_class=JSONResponse)
async def connecting_room(
        invite_link: str,
        request: RoomConnectingRequest,
        redis_client = Depends(get_redis_client)
) -> Optional[str]:
    token_data = decode_access_token(
        token=request.access_token
    )

    if not token_data.get("user_id"): 
        return JSONResponse({"error": "permission"}, status_code=403)

    stored_value = await redis_client.get_value(invite_link)
    if not stored_value:
        return JSONResponse({"error": "invalid link"}, status_code=404)

    parts = stored_value.split(":")
    if len(parts) < 4:
        return JSONResponse({"error": "invalid data format"}, status_code=400)

    room_uuid, password, permissions, _ = parts

    if password != request.room_password:
        return JSONResponse({"error": "invalid password"}, status_code=403)

    await RoomService.set_invited_user(
        redis_client=redis_client,
        invited_user_id=token_data.get("user_id"),
        room_uuid=room_uuid,
        permissions=permissions
    )

    return JSONResponse({
        "room_uuid": room_uuid,
        "permissions": permissions
    })


@router.get("/info/{room_uuid}")
async def get_room_info(room_uuid: str, access_token: str):
    token_data = decode_access_token(
        token=access_token
    )

    if not token_data: return 401

    user_id = token_data.get("user_id")

    response = await RoomService.get_by_room_uuid(
        room_uuid=room_uuid,
        owner_id=user_id
    )

    return response


@router.get("/my")
async def get_my_rooms(access_token: str):
    token_data = decode_access_token(
        token=access_token
    )

    if not token_data: return 401

    user_id = token_data.get("user_id")

    response = await RoomService.get_all_by_owner(
        owner_id=user_id
    )

    return response


@router.post(path="/access")
async def check_access(
        request: RoomAccessRequest,
        redis_client = Depends(get_redis_client)
):
    return await Collaboration.verify_access(
        redis_client=redis_client,
        access_token=request.access_token,
        room_uuid=request.room_uuid
    )

@router.delete(path="/invited")
async def check_access(
        request: RoomRemoveInvited,
        redis_client = Depends(get_redis_client)
):
    print(request)
    token_data = decode_access_token(
        token=request.access_token
    )

    room_uuid = request.room_uuid

    existing_room = await RoomService.get_by_room_uuid(
        room_uuid=room_uuid,
        owner_id=token_data.get("user_id")
    )

    if not existing_room: return "not room"

    user_id = await RoomService.delete_invited_user(
        redis_client=redis_client,
        username=request.username,
        room_uuid=request.room_uuid
    )
    
    await collaboration.disconnect_user(room_uuid, user_id)
    return True

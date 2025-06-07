from fastapi import APIRouter
from models.api.user import UserUpdateRequest
from services.core.user_service import UserService
from utils.jwt_manager import decode_access_token

router = APIRouter(
    prefix="/user",
    tags=["auth"]
)


@router.patch(path="/update")
async def update_user(request: UserUpdateRequest):
    token_data = decode_access_token(
        token=request.access_token
    )

    is_updated = await UserService.update_user(
        user_id=token_data.get("user_id"),
        update_data=request.update_data
    )

    return is_updated


@router.get(path="/profile_info")
async def get_profile_info(access_token: str):
    token_data = decode_access_token(
        token=access_token
    )

    user = await UserService.get_user(
        user_id=token_data.get("user_id"),
    )

    return user

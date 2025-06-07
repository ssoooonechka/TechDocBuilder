from fastapi import APIRouter
from starlette.responses import JSONResponse

from models.api.token import TokenPayload
from models.core.user import UserCreate, UserLogin
from services.core.user_service import UserService
from utils.jwt_manager import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post(path="/register", response_class=JSONResponse, response_model=TokenPayload)
async def register_new_user(user_data: UserCreate) -> str | TokenPayload:
    new_user = await UserService.create_user(
        user_data=user_data
    )

    if not new_user: return "error"

    access_token = create_access_token(
        data={
            "user_id": new_user.id,
            "username": new_user.username
        }
    )
    return TokenPayload(
        access_token=access_token
    )


@router.post(path="/login", response_class=JSONResponse, response_model=TokenPayload)
async def login_user(credentials: UserLogin):
    user = await UserService.auth_user(
        credentials=credentials
    )

    if not user: return "error"

    access_token = create_access_token(
        data={
            "user_id": user.id,
            "username": user.username
        }
    )
    return TokenPayload(
        access_token=access_token
    )


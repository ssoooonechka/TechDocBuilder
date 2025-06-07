from fastapi import APIRouter

from models.api.token import TokenPayload
from services.core.star_service import StarService
from utils.jwt_manager import decode_access_token

router = APIRouter(
    prefix="/star",
    tags=["star"]
)


@router.delete(path="/{template_name}")
async def remove_star(template_name: str, request: TokenPayload):
    token_data = decode_access_token(
        token=request.access_token
    )

    is_updated = await StarService.remove_star(
        user_id=token_data.get("user_id"),
        template_name=template_name
    )

    return is_updated


@router.post(path="/{template_name}")
async def create_star(template_name: str, request: TokenPayload):
    token_data = decode_access_token(
        token=request.access_token
    )

    is_created = await StarService.create_star(
        user_id=token_data.get("user_id"),
        template_name=template_name
    )

    return is_created

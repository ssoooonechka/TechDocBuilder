from fastapi import APIRouter
from starlette.exceptions import HTTPException

from models.api.template import TemplateCreateRequest, TemplateUpdateRequest
from services.core.template_service import TemplateService
from utils.jwt_manager import decode_access_token


router = APIRouter(
    prefix="/template",
    tags=["template"]
)


@router.post(path="/create")
async def create_template(request: TemplateCreateRequest):
    token_data = decode_access_token(
        token=request.access_token
    )

    new_template = await TemplateService.create_template(
        template_data=request.data,
        owner_id=token_data.get("user_id")
    )

    return new_template


@router.patch(path="/update")
async def update_template(request: TemplateUpdateRequest):
    token_data = decode_access_token(
        token=request.access_token
    )

    username = token_data.get("username")

    template_name = request.old_template_name

    is_exist = await TemplateService.get_by_name(
        owner_name=username,
        template_name=template_name
    )

    if not is_exist: return 404

    updated_template = await TemplateService.update_template(
        template_name=template_name,
        owner_id=token_data.get("user_id"),
        update_data=request.update_data
    )

    if updated_template: return 200


@router.get(path="/owner_template")
async def get_template_by_name(template_name: str, access_token: str):
    token_data = decode_access_token(
        token=access_token
    )
    username = token_data.get("username")

    is_exist = await TemplateService.get_by_name(
        owner_name=username,
        template_name=template_name
    )

    if not is_exist: return HTTPException(status_code=404, detail="Not found")

    return is_exist


@router.get(path="/public_template")
async def get_template_by_name(template_name: str, access_token: str):
    token_data = decode_access_token(
        token=access_token
    )

    if not token_data: return 401

    is_exist = await TemplateService.get_public_template_info(
        template_name=template_name,
        user_id=token_data.get("user_id")

    )

    if not is_exist: return HTTPException(status_code=404, detail="Not found")

    return is_exist


@router.get("/public")
async def get_public_templates(access_token: str):
    token_data = decode_access_token(
        token=access_token
    )

    if not token_data: return 401

    user_id = token_data.get("user_id")

    response = await TemplateService.get_all_public(
        user_id=user_id
    )

    return response


@router.get("/my")
async def get_my_templates(access_token: str):
    token_data = decode_access_token(
        token=access_token
    )

    if not token_data: return 401

    user_id = token_data.get("user_id")

    response = await TemplateService.get_all_by_owner(owner_id=user_id)

    return response

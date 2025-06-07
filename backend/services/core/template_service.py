from typing import Optional

from database.core import get_session
from database.models.template.repository import TemplateRepository
from models.core.template import (
    TemplateRead,
    TemplateCreate,
    TemplateUpdate,
    TemplateBase,
    AdditOwnerTemplatesInfo
)


class TemplateService:
    @staticmethod
    async def create_template(template_data: TemplateBase, owner_id: int) -> TemplateRead:
        async with get_session() as session:
            repo = TemplateRepository(session=session)

            template_model = TemplateCreate(
                **template_data.model_dump(),
                owner_id=owner_id
            )

            new_template = await repo.create_template(
                template_data=template_model
            )
            return new_template

    @staticmethod
    async def update_template(
        template_name: str,
        owner_id: int,
        update_data: TemplateUpdate
    ) -> Optional[TemplateRead]:
        async with get_session() as session:
            repo = TemplateRepository(session=session)
            updated_template = await repo.update_template(
                template_name=template_name,
                update_data=update_data,
                owner_id=owner_id
            )
            return updated_template

    @staticmethod
    async def get_by_name(
        template_name: str,
        owner_name: str
    ) -> Optional[AdditOwnerTemplatesInfo]:
        async with get_session() as session:
            repo = TemplateRepository(session=session)
            template = await repo.get_by_name(
                template_name=template_name,
                owner_name=owner_name
            )
            return template

    @staticmethod
    async def get_public_template_info(
        template_name: str,
        user_id: int,
    ) -> Optional[AdditOwnerTemplatesInfo]:
        async with get_session() as session:
            repo = TemplateRepository(session=session)
            template = await repo.get_public_template_info(
                template_name=template_name,
                user_id=user_id
            )
            return template

    @staticmethod
    async def get_all_by_owner(owner_id: int):
        async with get_session() as session:
            repo = TemplateRepository(session=session)
            templates = await repo.get_all_by_owner(
                owner_id=owner_id
            )

            return templates

    @staticmethod
    async def get_all_public(user_id: int):
        async with get_session() as session:
            repo = TemplateRepository(session=session)
            templates = await repo.get_all_public(user_id=user_id)

            return templates

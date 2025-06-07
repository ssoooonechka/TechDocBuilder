from typing import Optional

from sqlalchemy import update, select, func, exists
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.star.model import Star
from database.models.template.model import Template
from database.models.user.model import User
from models.core.template import (
    TemplateRead,
    TemplateCreate,
    TemplateUpdate,
    AdditOwnerTemplatesInfo,
    AdditPublicTemplatesInfo, OwnerTemplatesInfo, PublicTemplatesInfo
)
from utils.base_repository import BaseRepository


class TemplateRepository(BaseRepository[Template, TemplateRead]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Template)

    async def create_template(self, template_data: TemplateCreate) -> TemplateRead:
        db_template = await self.create(
            data=template_data,
            returning_model=TemplateRead
        )
        return db_template

    async def update_template(
            self,
            owner_id: int,
            template_name: str,
            update_data: TemplateUpdate
    ) -> Optional[TemplateRead]:
        stmt = (
            update(self.model)
            .where(
                self.model.name == template_name,
                self.model.owner_id == owner_id
            )
            .values(**update_data.model_dump(exclude_unset=True))
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        record = result.scalar_one_or_none()
        return TemplateRead.model_validate(record) if record else None

    async def get_by_name(
            self,
            template_name: str,
            owner_name: str
    ) -> Optional[AdditOwnerTemplatesInfo]:
        result = await self.session.execute(
            select(
                Template,
                func.count(Star.id).label('stars_count')
            )
            .join(User, Template.owner_id == User.id)
            .join(Star, Template.id == Star.template_id, isouter=True)
            .where(
                Template.name == template_name,
                User.username == owner_name
            )
            .group_by(Template.id)
        )

        row = result.first()
        if not row:
            return None

        template, stars_count = row

        return AdditOwnerTemplatesInfo(
            name=template.name,
            is_public=template.is_public,
            stars=stars_count,
            content=template.content,
            last_update=template.updated_at
        )

    async def get_public_template_info(
            self,
            template_name: str,
            user_id: int
    ) -> Optional[AdditPublicTemplatesInfo]:
        starred_subquery = (
            select(1)
            .where(
                Star.template_id == Template.id,
                Star.user_id == user_id
            )
            .correlate(Template)
        )

        query = (
            select(
                Template,
                func.count(Star.id).label('stars_count'),
                exists(starred_subquery).label('starred_by_user')
            )
            .join(User, Template.owner_id == User.id)
            .join(Star, Template.id == Star.template_id, isouter=True)
            .where(
                Template.name == template_name,
                Template.is_public == True
            )
            .group_by(Template.id)
        )

        result = await self.session.execute(query)
        row = result.first()

        if not row:
            return None

        template, stars_count, starred_by_user = row

        return AdditPublicTemplatesInfo(
            name=template.name,
            stars=stars_count,
            content=template.content,
            is_public=template.is_public,
            starred_by_user=bool(starred_by_user) if user_id is not None else False,
            last_update=template.updated_at
        )

    async def get_all_by_owner(
            self,
            owner_id: int
    ):

        result = await self.session.execute(
            select(Template)
            .where(Template.owner_id == owner_id)
            .group_by(Template.id)
        )

        templates = result.scalars().all()
        if templates:
            return [
                OwnerTemplatesInfo(
                    name=template.name,
                    last_update=template.updated_at
                )
                for template in templates]

    async def get_all_public(self, user_id):
        starred_subquery = (
            select(1)
            .where(
                Star.template_id == Template.id,
                Star.user_id == user_id
            )
            .correlate(Template)
        )

        query = (
            select(
                Template,
                func.count(Star.id).label('stars_count'),
                exists(starred_subquery).label('starred_by_user')
            )
            .join(User, Template.owner_id == User.id, isouter=True)
            .join(Star, Template.id == Star.template_id, isouter=True)
            .where(
                Template.is_public == True
            )
            .group_by(Template.id, Template.name, Template.owner_id, Template.is_public, Template.updated_at)
        # все поля Template
        )

        result = await self.session.execute(query)
        rows = result.all()

        if not rows:
            return []

        return [
            PublicTemplatesInfo(
                name=template.name,
                stars=stars_count,
                starred_by_user=bool(starred_by_user) if user_id is not None else False,
                last_update=template.updated_at
            )
            for template, stars_count, starred_by_user in rows
        ]

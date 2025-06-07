from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models.star.model import Star
from database.models.template.model import Template
from models.core.star import StarCreate, StarRead
from utils.base_repository import BaseRepository


class StarRepository(BaseRepository[Star, StarRead]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Star)

    async def _get_template_id(self, template_name: str) -> int:
        stmt = select(Template.id).where(Template.name == template_name)
        result = await self.session.execute(stmt)
        template_id = result.scalar_one_or_none()

        if template_id is None:
            raise ValueError(f"Template with name '{template_name}' not found")
        return template_id

    async def create_star(self, template_name: str, user_id: int) -> StarRead:
        template_id = await self._get_template_id(template_name)

        star_data = StarCreate(
            user_id=user_id,
            template_id=template_id
        )

        db_star = await self.create(
            data=star_data,
            returning_model=StarRead
        )
        return db_star

    async def remove_star(self, template_name: str, user_id: int) -> bool:
        template_id = await self._get_template_id(template_name)

        stmt = (
            delete(self.model)
            .where(
                self.model.user_id == user_id,
                self.model.template_id == template_id
            )
            .returning(self.model.id)
        )

        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one_or_none() is not None
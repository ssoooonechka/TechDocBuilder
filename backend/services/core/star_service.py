from database.core import get_session
from database.models.star.repository import StarRepository


class StarService:
    @staticmethod
    async def create_star(template_name: str, user_id: int):
        async with (get_session() as session):
            repo = StarRepository(session=session)


            new_star = await repo.create_star(
                template_name=template_name,
                user_id=user_id
            )
            return new_star

    @staticmethod
    async def remove_star(template_name: str, user_id: int):
        async with get_session() as session:
            repo = StarRepository(session=session)

            new_star = await repo.remove_star(
                template_name=template_name,
                user_id=user_id
            )
            return new_star

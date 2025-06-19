from typing import Optional

from database.core import get_session
from database.models.user.repository import UserRepository
from models.core.user import UserCreate, UserRead, UserLogin, UserUpdate
from utils.hash_manager import encrypt, get_password_hash


class UserService:
    @staticmethod
    async def create_user(user_data: UserCreate) -> UserRead:
        async with get_session() as session:
            repo = UserRepository(session=session)

            user_data.password = await get_password_hash(
                password=user_data.password
            )

            new_user = await repo.create_user(
                user_data=user_data
            )

            return new_user

    @staticmethod
    async def auth_user(credentials: UserLogin) -> Optional[UserRead]:
        async with get_session() as session:
            repo = UserRepository(session=session)

            user = await repo.authenticate_user(
                credentials=credentials
            )

            return user

    @staticmethod
    async def update_user(user_id: int, update_data: UserUpdate) -> bool:
        async with get_session() as session:
            repo = UserRepository(session=session)

            updated_user = await repo.update_user_profile(
                user_id=user_id,
                update_data=update_data
            )

            return True if updated_user else False

    @staticmethod
    async def get_user(user_id: int):
        async with get_session() as session:
            repo = UserRepository(session=session)

            current_user = await repo.get_user(
                user_id=user_id
            )

            return current_user

    @staticmethod
    async def get_by_username(username: int):
        async with get_session() as session:
            repo = UserRepository(session=session)

            current_user = await repo.get_by_username(
                username=username
            )

            return current_user

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database.models.user.model import User
from models.core.user import (
    UserCreate,
    UserUpdate,
    UserRead,
    UserLogin
)
from utils.base_repository import BaseRepository
from utils.hash_manager import encrypt


class UserRepository(BaseRepository[User, UserRead]):

    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def create_user(self, user_data: UserCreate) -> UserRead:
        db_user = await self.create(
            data=user_data,
            returning_model=UserRead
        )
        return db_user

    async def authenticate_user(self, credentials: UserLogin) -> Optional[UserRead]:
        user = await self.get_by_username(credentials.username)
        hashed_password = await encrypt(
            input_string=credentials.password
        )
        if (not user) or (hashed_password != user.password):
            return None
        return UserRead.model_validate(user)

    async def get_by_username(self, username: str) -> Optional[UserRead]:
        result = await self.session.execute(
            select(self.model)
            .where(func.lower(self.model.username) == func.lower(username))
        )
        user = result.scalar_one_or_none()
        return UserRead.model_validate(user) if user else None

    async def get_user(self, user_id: int) -> Optional[UserRead]:
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == user_id)
        )
        user = result.scalar_one_or_none()
        return UserRead.model_validate(user) if user else None

    async def get_by_username(self, username: int) -> Optional[UserRead]:
        result = await self.session.execute(
            select(self.model)
            .where(self.model.username == username)
        )
        user = result.scalar_one_or_none()
        return UserRead.model_validate(user) if user else None

    async def update_user_profile(
            self,
            user_id: int,
            update_data: UserUpdate
    ) -> Optional[UserRead]:
        return await self.update(
            update_id=user_id,
            data=update_data,
            returning_model=UserRead
        )

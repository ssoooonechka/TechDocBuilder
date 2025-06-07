from typing import Type, TypeVar, Generic, Optional, List, Dict, Any
from sqlalchemy import insert, select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from sqlalchemy.orm import DeclarativeBase

T = TypeVar('T', bound=DeclarativeBase)
M = TypeVar('M', bound=BaseModel)
CreateSchema = TypeVar('CreateSchema', bound=BaseModel)
UpdateSchema = TypeVar('UpdateSchema', bound=BaseModel)


class BaseRepository(Generic[T, M]):

    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def create(
            self,
            data: CreateSchema,
            returning_model: Type[M]
    ) -> Optional[M]:
        stmt = (
            insert(self.model)
            .values(**data.model_dump())
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        record = result.scalar_one()
        return returning_model.model_validate(record)

    async def get(
            self,
            get_id: int,
            returning_model: Type[M]
    ) -> Optional[M]:
        result = await self.session.execute(
            select(self.model).where(self.model.id == get_id)
        )
        record = result.scalar_one_or_none()
        return returning_model.model_validate(record) if record else None

    async def get_all(
            self,
            returning_model: Type[M],
            skip: int = 0,
            limit: int = 100,
            **filters: Dict[str, Any]
    ) -> List[M]:
        result = await self.session.execute(
            select(self.model)
            .filter_by(**filters)
            .offset(skip)
            .limit(limit)
        )
        return [returning_model.model_validate(r) for r in result.scalars()]

    async def update(
            self,
            update_id: int,
            data: UpdateSchema,
            returning_model: Type[M]
    ) -> Optional[M]:
        stmt = (
            update(self.model)
            .where(self.model.id == update_id)
            .values(**data.model_dump(exclude_unset=True))
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        record = result.scalar_one_or_none()
        return returning_model.model_validate(record) if record else None

    async def delete(self, delete_id: int) -> bool:
        stmt = (
            delete(self.model)
            .where(self.model.id == delete_id)
            .returning(self.model.id)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one_or_none() is not None

    async def exists(self, **filters) -> bool:
        result = await self.session.execute(
            select(self.model.id).filter_by(**filters).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def count(self, **filters) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(
                select(self.model).filter_by(**filters).subquery()
            )
        )
        return result.scalar_one()
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase
from contextlib import asynccontextmanager
import importlib
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker


class Base(AsyncAttrs, DeclarativeBase):
    pass


async def init_db() -> None:
    engine = await get_engine()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose(False)


async def cook_models():
    for pkg in os.listdir("database/models"):
        if not pkg.endswith(".py") and not pkg.endswith("__"):
            importlib.import_module(
                name=f".{pkg}.model",
                package="database.models"
            )


@asynccontextmanager
async def get_session():
    engine = await get_engine()
    async_session_factory = await get_session_factory(engine)

    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
            await engine.dispose()


async def get_engine():
    engine = create_async_engine(
        "postgresql+asyncpg://postgres:15032003@localhost:5432/docs",
        future=True
    )
    return engine


async def get_session_factory(engine):
    async_session_factory = sessionmaker(
        bind=engine,
        expire_on_commit=False,
        class_=AsyncSession
    )

    return async_session_factory

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from infrastructure.setup import setup_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await setup_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="TechDoc Builder",
    version='0.0.1'
)
app.include_router(
    router
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


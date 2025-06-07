from fastapi import APIRouter
from api.v1.endpoints.websocket import router as ws_router
from api.v1.endpoints.auth import router as auth_router
from api.v1.endpoints.user import router as user_router
from api.v1.endpoints.room import router as room_router
from api.v1.endpoints.template import router as template_router
from api.v1.endpoints.star import router as star_router
from api.v1.endpoints.convertor import router as convertor_router


router = APIRouter(
    prefix="/v1"
)

router.include_router(ws_router)
router.include_router(auth_router)
router.include_router(user_router)
router.include_router(room_router)
router.include_router(template_router)
router.include_router(star_router)
router.include_router(convertor_router)

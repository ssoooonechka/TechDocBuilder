from database.core import cook_models, init_db
from utils.logger import Logger


logger = Logger(name="doc_builder")


async def setup_db():
    logger.debug(msg="Start setup db")
    await cook_models()
    await init_db()
    logger.debug(msg="Success setup db")

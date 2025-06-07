import os
from redis.asyncio import Redis, ConnectionPool


class AsyncRedisClient:
    def __init__(self):
        self.url = os.getenv('REDIS_STORAGE', "redis://localhost:6379/0")
        pool = ConnectionPool.from_url(url=self.url, decode_responses=True)
        self.redis = Redis.from_pool(connection_pool=pool)

    async def set_value(self, key: str, value: str, expire: int = None):
        await self.redis.set(key, value, ex=expire)

    async def get_value(self, key: str) -> str:
        return await self.redis.get(key)

    async def delete_value(self, key: str):
        await self.redis.delete(key)

    async def exists_value(self, key: str):
        return await self.redis.exists(key)

    async def close(self):
        return await self.redis.close()


async def get_redis_client():
    client = AsyncRedisClient()
    try:
        yield client
    finally:
        await client.redis.close()

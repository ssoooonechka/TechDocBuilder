from secrets import token_urlsafe


async def generate_password() -> str:
    return token_urlsafe(16)

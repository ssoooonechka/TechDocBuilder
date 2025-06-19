import hashlib
import bcrypt


async def encrypt(input_string: str) -> str:
    sha256_hash = hashlib.sha256()

    sha256_hash.update(input_string.encode('utf-8'))

    hashed_string = sha256_hash.hexdigest()

    return hashed_string


async def get_password_hash(password: str) -> bytes:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())


async def check_password(password: str, hashed_password: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password)

from datetime import datetime, timedelta, timezone
import jwt
import os


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        payload=to_encode,
        key=os.getenv("SECRET_KEY", "key)"),
        algorithm=os.getenv("ALGORITHM", "HS256")
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    try:
        decoded_token = jwt.decode(
            token,
            os.getenv("SECRET_KEY", "key)"),
            algorithms=[os.getenv("ALGORITHM", "HS256")]
        )

        return decoded_token
    except Exception:
        return None

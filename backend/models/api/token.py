from pydantic import BaseModel


class TokenPayload(BaseModel):
    access_token: str

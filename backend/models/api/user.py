from models.api.token import TokenPayload
from models.core.user import UserUpdate


class UserUpdateRequest(TokenPayload):
    update_data: UserUpdate

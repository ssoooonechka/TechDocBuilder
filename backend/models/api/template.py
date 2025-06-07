from models.api.token import TokenPayload
from models.core.template import (
    TemplateBase,
    TemplateUpdate
)


class TemplateCreateRequest(TokenPayload):
    data: TemplateBase


class TemplateUpdateRequest(TokenPayload):
    update_data: TemplateUpdate
    old_template_name: str

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.core import Base
from utils.mixins.timestamp import TimestampMixin


class Template(Base, TimestampMixin):
    __tablename__ = "templates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    is_public: Mapped[bool] = mapped_column(nullable=False, default=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey(
        column="users.id",
        ondelete="CASCADE"),
        nullable=False
    )
    owner: Mapped["User"] = relationship(back_populates="templates")

    stars: Mapped[list["Star"]] = relationship(
        back_populates="template", cascade="all, delete-orphan", passive_deletes=True
    )

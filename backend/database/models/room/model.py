from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.core import Base
from utils.mixins.timestamp import TimestampMixin


class Room(Base, TimestampMixin):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(unique=False, nullable=False)
    room_uuid: Mapped[str] = mapped_column(unique=True, nullable=False)
    content: Mapped[str] = mapped_column(nullable=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey(
        column="users.id",
        ondelete="CASCADE"),
        nullable=False
    )
    owner: Mapped["User"] = relationship(back_populates="rooms")

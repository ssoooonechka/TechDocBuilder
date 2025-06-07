from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.core import Base
from utils.mixins.timestamp import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    mail: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_online: Mapped[bool] = mapped_column(default=False)

    templates: Mapped[list["Template"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    rooms: Mapped[list["Room"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    stars: Mapped[list["Star"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

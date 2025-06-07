from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.core import Base
from utils.mixins.timestamp import TimestampMixin


class Star(Base, TimestampMixin):
    __tablename__ = "stars"
    __table_args__ = (UniqueConstraint("user_id", "template_id", name="unique_star"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(ForeignKey(
        column="users.id",
        ondelete="CASCADE"),
        nullable=False
    )
    template_id: Mapped[int] = mapped_column(ForeignKey(
        column="templates.id",
        ondelete="CASCADE"),
        nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="stars")
    template: Mapped["Template"] = relationship(back_populates="stars", passive_deletes=True)

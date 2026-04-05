import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Leaderboard(Base):
    __tablename__ = "leaderboard"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    missions_completed: Mapped[int] = mapped_column(Integer, default=0)
    accuracy_percent: Mapped[float] = mapped_column(Float, default=0.0)
    league: Mapped[str] = mapped_column(String(20), default="newbie")
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

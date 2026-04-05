import uuid
from datetime import datetime

from pydantic import BaseModel


class AchievementResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str
    icon: str
    condition_type: str
    condition_value: int
    xp_bonus: int
    rarity: str
    earned: bool = False
    earned_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserAchievementResponse(BaseModel):
    id: uuid.UUID
    achievement_id: uuid.UUID
    slug: str
    title: str
    description: str
    icon: str
    rarity: str
    xp_bonus: int
    earned_at: datetime

    model_config = {"from_attributes": True}

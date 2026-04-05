import uuid
from datetime import datetime

from pydantic import BaseModel


class MissionListItem(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None = None
    attack_type: str
    environment: str
    difficulty: int
    xp_reward: int
    order_index: int
    time_limit_seconds: int | None = None
    status: str = "not_started"

    model_config = {"from_attributes": True}


class ScenarioListItem(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None = None
    icon: str | None = None
    difficulty: int
    order_index: int
    is_active: bool
    missions_count: int = 0
    completed_count: int = 0

    model_config = {"from_attributes": True}


class ScenarioResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None = None
    icon: str | None = None
    difficulty: int
    order_index: int
    is_active: bool
    missions: list[MissionListItem] = []

    model_config = {"from_attributes": True}

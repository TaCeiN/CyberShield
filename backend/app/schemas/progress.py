import uuid
from datetime import datetime

from pydantic import BaseModel


class ProgressSummary(BaseModel):
    total_missions: int
    completed_missions: int
    total_xp: int
    security_level: int
    accuracy_percent: float
    total_errors: int


class DashboardData(BaseModel):
    user_stats: ProgressSummary
    recent_achievements: list[dict] = []
    scenario_progress: list[dict] = []
    attack_type_stats: list[dict] = []


class HistoryItem(BaseModel):
    mission_id: uuid.UUID
    mission_title: str
    scenario_title: str
    status: str
    xp_earned: int
    correct_answers: int
    wrong_answers: int
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}

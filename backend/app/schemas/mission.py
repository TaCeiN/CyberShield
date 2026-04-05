import uuid

from pydantic import BaseModel


class StepChoiceResponse(BaseModel):
    id: uuid.UUID
    choice_text: str
    order_index: int

    model_config = {"from_attributes": True}


class StepChoiceWithFeedback(BaseModel):
    id: uuid.UUID
    choice_text: str
    is_correct: bool
    feedback_text: str
    consequence_text: str | None = None
    hp_change: int
    order_index: int

    model_config = {"from_attributes": True}


class MissionStepResponse(BaseModel):
    id: uuid.UUID
    step_order: int
    context_text: str
    context_type: str
    context_data: dict | None = None
    choices: list[StepChoiceResponse] = []

    model_config = {"from_attributes": True}


class MissionResponse(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None = None
    story_text: str | None = None
    attack_type: str
    environment: str
    difficulty: int
    xp_reward: int
    time_limit_seconds: int | None = None
    steps: list[MissionStepResponse] = []

    model_config = {"from_attributes": True}


class AnswerRequest(BaseModel):
    step_id: uuid.UUID
    choice_id: uuid.UUID


class AnswerResponse(BaseModel):
    is_correct: bool
    feedback_text: str
    consequence_text: str | None = None
    hp_change: int
    current_hp: int
    next_step: MissionStepResponse | None = None
    mission_completed: bool = False
    new_achievements: list[dict] = []


class MissionStartResponse(BaseModel):
    mission: MissionResponse
    current_hp: int = 100
    current_step: int = 0


class MissionResultResponse(BaseModel):
    xp_earned: int
    correct_answers: int
    wrong_answers: int
    total_steps: int
    accuracy_percent: float
    new_achievements: list[dict] = []
    league_changed: bool = False
    new_league: str | None = None

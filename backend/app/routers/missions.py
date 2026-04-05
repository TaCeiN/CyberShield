import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.mission import AnswerRequest
from app.services.progress_service import (
    get_mission_with_steps,
    start_mission,
    submit_answer,
    complete_mission,
)

router = APIRouter()


@router.get("/{mission_id}")
async def get_mission(
    mission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    mission = await get_mission_with_steps(db, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Миссия не найдена")

    steps_data = []
    for step in mission.steps:
        steps_data.append({
            "id": step.id,
            "step_order": step.step_order,
            "context_text": step.context_text,
            "context_type": step.context_type,
            "context_data": step.context_data,
            "choices": [
                {
                    "id": c.id,
                    "choice_text": c.choice_text,
                    "order_index": c.order_index,
                }
                for c in step.choices
            ],
        })

    return {
        "id": mission.id,
        "slug": mission.slug,
        "title": mission.title,
        "description": mission.description,
        "story_text": mission.story_text,
        "attack_type": mission.attack_type,
        "environment": mission.environment,
        "difficulty": mission.difficulty,
        "xp_reward": mission.xp_reward,
        "time_limit_seconds": mission.time_limit_seconds,
        "steps": steps_data,
    }


@router.post("/{mission_id}/start")
async def start(
    mission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    mission = await get_mission_with_steps(db, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Миссия не найдена")

    progress = await start_mission(db, current_user.id, mission_id)

    first_step = None
    if mission.steps:
        step = mission.steps[0]
        first_step = {
            "id": step.id,
            "step_order": step.step_order,
            "context_text": step.context_text,
            "context_type": step.context_type,
            "context_data": step.context_data,
            "choices": [
                {
                    "id": c.id,
                    "choice_text": c.choice_text,
                    "order_index": c.order_index,
                }
                for c in step.choices
            ],
        }

    return {
        "mission": {
            "id": mission.id,
            "slug": mission.slug,
            "title": mission.title,
            "story_text": mission.story_text,
            "attack_type": mission.attack_type,
            "environment": mission.environment,
            "xp_reward": mission.xp_reward,
            "time_limit_seconds": mission.time_limit_seconds,
        },
        "first_step": first_step,
        "current_hp": 100,
        "current_step": 0,
    }


@router.post("/{mission_id}/answer")
async def answer(
    mission_id: uuid.UUID,
    data: AnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await submit_answer(db, current_user.id, mission_id, data.step_id, data.choice_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/complete")
async def complete(
    mission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await complete_mission(db, current_user.id, mission_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

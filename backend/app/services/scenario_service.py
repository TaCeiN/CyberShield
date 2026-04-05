import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.scenario import Scenario
from app.models.mission import Mission
from app.models.user_progress import UserProgress


async def get_all_scenarios(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    result = await db.execute(
        select(Scenario).where(Scenario.is_active == True).order_by(Scenario.order_index)
    )
    scenarios = result.scalars().all()

    scenario_list = []
    for scenario in scenarios:
        missions_result = await db.execute(
            select(Mission).where(Mission.scenario_id == scenario.id)
        )
        missions = missions_result.scalars().all()
        missions_count = len(missions)

        completed_result = await db.execute(
            select(func.count()).select_from(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.mission_id.in_([m.id for m in missions]),
                UserProgress.status == "completed",
            )
        )
        completed_count = completed_result.scalar() or 0

        scenario_list.append({
            "id": scenario.id,
            "slug": scenario.slug,
            "title": scenario.title,
            "description": scenario.description,
            "icon": scenario.icon,
            "difficulty": scenario.difficulty,
            "order_index": scenario.order_index,
            "is_active": scenario.is_active,
            "missions_count": missions_count,
            "completed_count": completed_count,
        })

    return scenario_list


async def get_scenario_by_slug(db: AsyncSession, slug: str, user_id: uuid.UUID) -> dict | None:
    result = await db.execute(
        select(Scenario)
        .options(selectinload(Scenario.missions))
        .where(Scenario.slug == slug)
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        return None

    missions_data = []
    for mission in sorted(scenario.missions, key=lambda m: m.order_index):
        progress_result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.mission_id == mission.id,
            )
        )
        progress = progress_result.scalar_one_or_none()
        status = progress.status if progress else "not_started"

        missions_data.append({
            "id": mission.id,
            "slug": mission.slug,
            "title": mission.title,
            "description": mission.description,
            "attack_type": mission.attack_type,
            "environment": mission.environment,
            "difficulty": mission.difficulty,
            "xp_reward": mission.xp_reward,
            "order_index": mission.order_index,
            "time_limit_seconds": mission.time_limit_seconds,
            "status": status,
        })

    return {
        "id": scenario.id,
        "slug": scenario.slug,
        "title": scenario.title,
        "description": scenario.description,
        "icon": scenario.icon,
        "difficulty": scenario.difficulty,
        "order_index": scenario.order_index,
        "is_active": scenario.is_active,
        "missions": missions_data,
    }

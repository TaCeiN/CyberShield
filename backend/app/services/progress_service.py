import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.mission import Mission, MissionStep, StepChoice
from app.models.scenario import Scenario
from app.models.user import User
from app.models.user_progress import UserProgress, UserAnswer
from app.models.achievement import UserAchievement, Achievement
from app.services.rating_service import update_leaderboard, calculate_league


async def get_mission_with_steps(db: AsyncSession, mission_id: uuid.UUID) -> Mission | None:
    result = await db.execute(
        select(Mission)
        .options(selectinload(Mission.steps).selectinload(MissionStep.choices))
        .where(Mission.id == mission_id)
    )
    return result.scalar_one_or_none()


async def start_mission(db: AsyncSession, user_id: uuid.UUID, mission_id: uuid.UUID) -> UserProgress:
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.mission_id == mission_id,
        )
    )
    progress = result.scalar_one_or_none()

    if progress:
        progress.status = "in_progress"
        progress.current_step = 0
        progress.correct_answers = 0
        progress.wrong_answers = 0
        progress.xp_earned = 0
        progress.started_at = datetime.now(timezone.utc)
        progress.completed_at = None
    else:
        progress = UserProgress(
            user_id=user_id,
            mission_id=mission_id,
            status="in_progress",
            current_step=0,
            started_at=datetime.now(timezone.utc),
        )
        db.add(progress)

    await db.commit()
    await db.refresh(progress)
    return progress


async def submit_answer(
    db: AsyncSession,
    user_id: uuid.UUID,
    mission_id: uuid.UUID,
    step_id: uuid.UUID,
    choice_id: uuid.UUID,
) -> dict:
    choice_result = await db.execute(
        select(StepChoice).where(StepChoice.id == choice_id)
    )
    choice = choice_result.scalar_one_or_none()
    if not choice:
        raise ValueError("Вариант ответа не найден")

    step_result = await db.execute(
        select(MissionStep).where(MissionStep.id == step_id)
    )
    step = step_result.scalar_one_or_none()
    if not step:
        raise ValueError("Шаг не найден")

    answer = UserAnswer(
        user_id=user_id,
        step_id=step_id,
        choice_id=choice_id,
        is_correct=choice.is_correct,
    )
    db.add(answer)

    progress_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.mission_id == mission_id,
        )
    )
    progress = progress_result.scalar_one_or_none()
    if not progress:
        raise ValueError("Прогресс не найден")

    if choice.is_correct:
        progress.correct_answers += 1
    else:
        progress.wrong_answers += 1

    progress.current_step += 1

    mission = await get_mission_with_steps(db, mission_id)
    total_steps = len(mission.steps)
    current_hp = 100
    answers_result = await db.execute(
        select(UserAnswer).where(
            UserAnswer.user_id == user_id,
            UserAnswer.step_id.in_([s.id for s in mission.steps]),
        )
    )
    all_answers = answers_result.scalars().all()
    for ans in all_answers:
        c_result = await db.execute(select(StepChoice).where(StepChoice.id == ans.choice_id))
        c = c_result.scalar_one_or_none()
        if c:
            current_hp += c.hp_change
    current_hp += choice.hp_change
    current_hp = max(0, min(100, current_hp))

    mission_completed = progress.current_step >= total_steps or current_hp <= 0

    next_step = None
    if not mission_completed and progress.current_step < total_steps:
        next_step_model = mission.steps[progress.current_step]
        next_step = {
            "id": next_step_model.id,
            "step_order": next_step_model.step_order,
            "context_text": next_step_model.context_text,
            "context_type": next_step_model.context_type,
            "context_data": next_step_model.context_data,
            "choices": [
                {
                    "id": c.id,
                    "choice_text": c.choice_text,
                    "order_index": c.order_index,
                }
                for c in next_step_model.choices
            ],
        }

    new_achievements = []
    if mission_completed:
        status = "failed" if current_hp <= 0 else "completed"
        progress.status = status
        progress.completed_at = datetime.now(timezone.utc)

        if status == "completed":
            xp = mission.xp_reward
            if progress.wrong_answers == 0:
                xp = int(xp * 1.5)
            progress.xp_earned = xp

            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one()
            user.total_xp += xp
            user.current_league = calculate_league(user.total_xp)

            await update_leaderboard(db, user_id)
            new_achievements = await _check_achievements(db, user_id)

    await db.commit()

    return {
        "is_correct": choice.is_correct,
        "feedback_text": choice.feedback_text,
        "consequence_text": choice.consequence_text,
        "hp_change": choice.hp_change,
        "current_hp": current_hp,
        "next_step": next_step,
        "mission_completed": mission_completed,
        "new_achievements": new_achievements,
    }


async def complete_mission(db: AsyncSession, user_id: uuid.UUID, mission_id: uuid.UUID) -> dict:
    progress_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.mission_id == mission_id,
        )
    )
    progress = progress_result.scalar_one_or_none()
    if not progress:
        raise ValueError("Прогресс не найден")

    mission = await get_mission_with_steps(db, mission_id)
    total_steps = len(mission.steps)
    total_answers = progress.correct_answers + progress.wrong_answers
    accuracy = (progress.correct_answers / total_answers * 100) if total_answers > 0 else 0

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    return {
        "xp_earned": progress.xp_earned,
        "correct_answers": progress.correct_answers,
        "wrong_answers": progress.wrong_answers,
        "total_steps": total_steps,
        "accuracy_percent": round(accuracy, 1),
        "new_achievements": [],
        "league_changed": False,
        "new_league": user.current_league,
    }


async def get_progress_summary(db: AsyncSession, user_id: uuid.UUID) -> dict:
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    total_missions_result = await db.execute(select(func.count()).select_from(Mission))
    total_missions = total_missions_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count()).select_from(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.status == "completed",
        )
    )
    completed_missions = completed_result.scalar() or 0

    correct_result = await db.execute(
        select(func.sum(UserProgress.correct_answers)).where(UserProgress.user_id == user_id)
    )
    total_correct = correct_result.scalar() or 0

    wrong_result = await db.execute(
        select(func.sum(UserProgress.wrong_answers)).where(UserProgress.user_id == user_id)
    )
    total_wrong = wrong_result.scalar() or 0

    total_answers = total_correct + total_wrong
    accuracy = (total_correct / total_answers * 100) if total_answers > 0 else 0

    return {
        "total_missions": total_missions,
        "completed_missions": completed_missions,
        "total_xp": user.total_xp,
        "security_level": user.security_level,
        "accuracy_percent": round(accuracy, 1),
        "total_errors": total_wrong,
    }


async def get_dashboard_data(db: AsyncSession, user_id: uuid.UUID) -> dict:
    stats = await get_progress_summary(db, user_id)

    achievements_result = await db.execute(
        select(UserAchievement, Achievement)
        .join(Achievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == user_id)
        .order_by(UserAchievement.earned_at.desc())
        .limit(5)
    )
    recent_achievements = [
        {
            "slug": ach.slug,
            "title": ach.title,
            "icon": ach.icon,
            "rarity": ach.rarity,
            "earned_at": ua.earned_at.isoformat() if ua.earned_at else None,
        }
        for ua, ach in achievements_result.all()
    ]

    scenarios_result = await db.execute(
        select(Scenario).where(Scenario.is_active == True).order_by(Scenario.order_index)
    )
    scenarios = scenarios_result.scalars().all()
    scenario_progress = []
    for sc in scenarios:
        missions_result = await db.execute(
            select(Mission).where(Mission.scenario_id == sc.id)
        )
        missions = missions_result.scalars().all()
        completed_result = await db.execute(
            select(func.count()).select_from(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.mission_id.in_([m.id for m in missions]),
                UserProgress.status == "completed",
            )
        )
        completed = completed_result.scalar() or 0
        scenario_progress.append({
            "slug": sc.slug,
            "title": sc.title,
            "icon": sc.icon,
            "total": len(missions),
            "completed": completed,
        })

    attack_types = ["phishing", "social_engineering", "password_brute", "mitm", "skimming"]
    attack_type_stats = []
    for at in attack_types:
        missions_result = await db.execute(
            select(Mission).where(Mission.attack_type == at)
        )
        missions = missions_result.scalars().all()
        if missions:
            completed_result = await db.execute(
                select(func.count()).select_from(UserProgress).where(
                    UserProgress.user_id == user_id,
                    UserProgress.mission_id.in_([m.id for m in missions]),
                    UserProgress.status == "completed",
                )
            )
            completed = completed_result.scalar() or 0
            attack_type_stats.append({
                "type": at,
                "total": len(missions),
                "completed": completed,
            })

    return {
        "user_stats": stats,
        "recent_achievements": recent_achievements,
        "scenario_progress": scenario_progress,
        "attack_type_stats": attack_type_stats,
    }


async def get_history(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    result = await db.execute(
        select(UserProgress, Mission, Scenario)
        .join(Mission, UserProgress.mission_id == Mission.id)
        .join(Scenario, Mission.scenario_id == Scenario.id)
        .where(UserProgress.user_id == user_id)
        .order_by(UserProgress.completed_at.desc().nullslast())
    )
    rows = result.all()
    return [
        {
            "mission_id": progress.mission_id,
            "mission_title": mission.title,
            "scenario_title": scenario.title,
            "status": progress.status,
            "xp_earned": progress.xp_earned,
            "correct_answers": progress.correct_answers,
            "wrong_answers": progress.wrong_answers,
            "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
        }
        for progress, mission, scenario in rows
    ]


async def _check_achievements(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    from app.services.achievement_service import check_all_achievements
    return await check_all_achievements(db, user_id)

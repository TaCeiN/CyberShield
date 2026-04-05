from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.learning_progress import LearningProgress
from app.data.learning_modules import LEARNING_MODULES
from app.services.rating_service import calculate_league

router = APIRouter()

THEMES = [
    {"id": "phishing", "name": "Фишинг", "icon": "🎣", "description": "Как распознать цифровую удочку", "scenarios_count": 4},
    {"id": "skimming", "name": "Скимминг", "icon": "💳", "description": "Как защитить свои деньги", "scenarios_count": 4},
    {"id": "password", "name": "Подбор пароля", "icon": "🔐", "description": "Как создать непробиваемый пароль", "scenarios_count": 4},
    {"id": "social", "name": "Соц. инженерия", "icon": "🎭", "description": "Как не стать жертвой манипуляции", "scenarios_count": 4},
]

_THEME_MAP = {
    "phishing": "Фишинг",
    "skimming": "Скимминг",
    "password": "Подбор пароля",
    "social": "Соц. инженерия",
}

_THEME_REVERSE = {v: k for k, v in _THEME_MAP.items()}

TOTAL_MODULES = len(LEARNING_MODULES)  # 16


class SubmitAnswerRequest(BaseModel):
    scenario_id: int
    choice_index: int
    is_correct: bool


# ─── Content endpoints ───

@router.get("/themes")
async def get_themes(current_user: User = Depends(get_current_user)):
    return THEMES


@router.get("/modules")
async def get_all_modules(current_user: User = Depends(get_current_user)):
    return [
        {"scenario_id": m["scenario_id"], "theme": m["theme"], "title": m["title"]}
        for m in LEARNING_MODULES
    ]


@router.get("/modules/{scenario_id}")
async def get_module(scenario_id: int, current_user: User = Depends(get_current_user)):
    for m in LEARNING_MODULES:
        if m["scenario_id"] == scenario_id:
            return m
    raise HTTPException(status_code=404, detail="Модуль не найден")


@router.get("/themes/{theme_id}/modules")
async def get_theme_modules(theme_id: str, current_user: User = Depends(get_current_user)):
    theme_name = _THEME_MAP.get(theme_id)
    if not theme_name:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return [m for m in LEARNING_MODULES if m["theme"] == theme_name]


# ─── Progress endpoints ───

@router.post("/submit")
async def submit_learning_answer(
    body: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Records learning answer. Upserts into learning_progress.
    Correct: +5 security_level, +10 XP.
    Wrong: -10 security_level.
    """
    # Find the module to get theme
    module = None
    for m in LEARNING_MODULES:
        if m["scenario_id"] == body.scenario_id:
            module = m
            break
    if not module:
        raise HTTPException(status_code=404, detail="Модуль не найден")

    theme = module["theme"]

    # Upsert learning_progress (replace if already answered)
    stmt = pg_insert(LearningProgress).values(
        user_id=current_user.id,
        scenario_id=body.scenario_id,
        theme=theme,
        is_correct=body.is_correct,
    )
    stmt = stmt.on_conflict_do_update(
        constraint="uq_learning_user_scenario",
        set_={"is_correct": body.is_correct, "completed_at": func.now()},
    )
    await db.execute(stmt)

    # Update user stats
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()

    if body.is_correct:
        user.security_level = min(100, user.security_level + 5)
        user.total_xp += 10
    else:
        user.security_level = max(0, user.security_level - 10)

    user.current_league = calculate_league(user.total_xp)

    await db.flush()

    # Check achievements
    from app.services.achievement_service import check_all_achievements
    new_achievements = await check_all_achievements(db, current_user.id)

    # Update leaderboard
    from app.services.rating_service import update_leaderboard
    await update_leaderboard(db, current_user.id)

    await db.commit()
    await db.refresh(user)

    return {
        "security_level": user.security_level,
        "total_xp": user.total_xp,
        "current_league": user.current_league,
        "change": 5 if body.is_correct else -10,
        "is_correct": body.is_correct,
        "new_achievements": new_achievements,
    }


@router.get("/dashboard")
async def get_learning_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Full dashboard data based on learning modules."""
    user_result = await db.execute(select(User).where(User.id == current_user.id))
    user = user_result.scalar_one()

    # Count completed modules
    completed_result = await db.execute(
        select(func.count()).select_from(LearningProgress).where(
            LearningProgress.user_id == current_user.id
        )
    )
    completed_total = completed_result.scalar() or 0

    # Count correct
    correct_result = await db.execute(
        select(func.count()).select_from(LearningProgress).where(
            LearningProgress.user_id == current_user.id,
            LearningProgress.is_correct == True,
        )
    )
    correct_total = correct_result.scalar() or 0

    # Count wrong
    wrong_total = completed_total - correct_total
    accuracy = (correct_total / completed_total * 100) if completed_total > 0 else 0

    # Per-theme progress
    theme_progress = []
    for theme_info in THEMES:
        theme_name = _THEME_MAP[theme_info["id"]]
        t_completed = await db.execute(
            select(func.count()).select_from(LearningProgress).where(
                LearningProgress.user_id == current_user.id,
                LearningProgress.theme == theme_name,
            )
        )
        t_correct = await db.execute(
            select(func.count()).select_from(LearningProgress).where(
                LearningProgress.user_id == current_user.id,
                LearningProgress.theme == theme_name,
                LearningProgress.is_correct == True,
            )
        )
        theme_progress.append({
            "id": theme_info["id"],
            "name": theme_name,
            "icon": theme_info["icon"],
            "total": theme_info["scenarios_count"],
            "completed": t_completed.scalar() or 0,
            "correct": t_correct.scalar() or 0,
        })

    # Recent completions
    recent_result = await db.execute(
        select(LearningProgress)
        .where(LearningProgress.user_id == current_user.id)
        .order_by(LearningProgress.completed_at.desc())
        .limit(5)
    )
    recent = recent_result.scalars().all()
    recent_history = []
    for r in recent:
        module = next((m for m in LEARNING_MODULES if m["scenario_id"] == r.scenario_id), None)
        if module:
            recent_history.append({
                "scenario_id": r.scenario_id,
                "title": module["title"],
                "theme": r.theme,
                "is_correct": r.is_correct,
                "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            })

    return {
        "user_stats": {
            "total_modules": TOTAL_MODULES,
            "completed_modules": completed_total,
            "correct_answers": correct_total,
            "wrong_answers": wrong_total,
            "accuracy_percent": round(accuracy, 1),
            "security_level": user.security_level,
            "total_xp": user.total_xp,
            "current_league": user.current_league,
        },
        "theme_progress": theme_progress,
        "recent_history": recent_history,
    }


@router.get("/activity")
async def get_learning_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns per-day completion counts for the activity grid (last 140 days)."""
    from datetime import datetime, timedelta

    since = datetime.utcnow() - timedelta(days=140)

    result = await db.execute(
        select(
            func.date(LearningProgress.completed_at).label("day"),
            func.count().label("cnt"),
        )
        .where(
            LearningProgress.user_id == current_user.id,
            LearningProgress.completed_at >= since,
        )
        .group_by(func.date(LearningProgress.completed_at))
        .order_by(func.date(LearningProgress.completed_at))
    )
    rows = result.all()
    return [{"date": str(r.day), "count": r.cnt} for r in rows]


@router.get("/stats")
async def get_learning_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()
    return {
        "security_level": user.security_level,
        "total_xp": user.total_xp,
        "current_league": user.current_league,
    }

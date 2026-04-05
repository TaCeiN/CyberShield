import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.learning_progress import LearningProgress
from app.models.leaderboard import Leaderboard


# Leagues calibrated for learning system (max 160 XP = 16 modules × 10 XP)
LEAGUES = [
    {"slug": "newbie", "title": "Новичок", "xp_min": 0, "xp_max": 30},
    {"slug": "defender", "title": "Защитник", "xp_min": 31, "xp_max": 80},
    {"slug": "expert", "title": "Эксперт", "xp_min": 81, "xp_max": 130},
    {"slug": "master", "title": "Мастер", "xp_min": 131, "xp_max": None},
]


def calculate_league(total_xp: int) -> str:
    for league in reversed(LEAGUES):
        if total_xp >= league["xp_min"]:
            return league["slug"]
    return "newbie"


async def update_leaderboard(db: AsyncSession, user_id: uuid.UUID) -> None:
    """Update leaderboard entry for user based on LearningProgress."""
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    # Count completed modules (distinct scenario_id)
    completed_result = await db.execute(
        select(func.count(func.distinct(LearningProgress.scenario_id))).where(
            LearningProgress.user_id == user_id,
        )
    )
    modules_completed = completed_result.scalar() or 0

    # Count correct / total for accuracy
    correct_result = await db.execute(
        select(func.count()).select_from(LearningProgress).where(
            LearningProgress.user_id == user_id,
            LearningProgress.is_correct == True,
        )
    )
    total_correct = correct_result.scalar() or 0

    total_result = await db.execute(
        select(func.count()).select_from(LearningProgress).where(
            LearningProgress.user_id == user_id,
        )
    )
    total_answers = total_result.scalar() or 0

    accuracy = (total_correct / total_answers * 100) if total_answers > 0 else 0

    lb_result = await db.execute(
        select(Leaderboard).where(Leaderboard.user_id == user_id)
    )
    lb = lb_result.scalar_one_or_none()

    if lb:
        lb.total_xp = user.total_xp
        lb.missions_completed = modules_completed
        lb.accuracy_percent = round(accuracy, 1)
        lb.league = user.current_league
    else:
        lb = Leaderboard(
            user_id=user_id,
            total_xp=user.total_xp,
            missions_completed=modules_completed,
            accuracy_percent=round(accuracy, 1),
            league=user.current_league,
        )
        db.add(lb)

    await db.flush()


async def get_top_leaderboard(db: AsyncSession, user_id: uuid.UUID, limit: int = 50) -> dict:
    result = await db.execute(
        select(Leaderboard, User)
        .join(User, Leaderboard.user_id == User.id)
        .order_by(Leaderboard.total_xp.desc())
        .limit(limit)
    )
    rows = result.all()

    entries = []
    user_position = None
    for idx, (lb, user) in enumerate(rows, 1):
        entry = {
            "position": idx,
            "user_id": str(user.id),
            "username": user.username,
            "display_name": user.display_name or user.username,
            "avatar_url": user.avatar_url,
            "total_xp": lb.total_xp,
            "missions_completed": lb.missions_completed,
            "accuracy_percent": lb.accuracy_percent,
            "league": lb.league,
        }
        entries.append(entry)
        if user.id == user_id:
            user_position = idx

    # If user not in top N, find their actual position
    if user_position is None:
        user_result = await db.execute(select(User).where(User.id == user_id))
        current_user = user_result.scalar_one()

        pos_result = await db.execute(
            select(func.count()).select_from(Leaderboard).where(
                Leaderboard.total_xp > current_user.total_xp
            )
        )
        user_position = (pos_result.scalar() or 0) + 1

    return {
        "entries": entries,
        "user_position": user_position,
    }


async def get_leagues_leaderboard(db: AsyncSession) -> list[dict]:
    league_data = []
    for league in LEAGUES:
        result = await db.execute(
            select(Leaderboard, User)
            .join(User, Leaderboard.user_id == User.id)
            .where(Leaderboard.league == league["slug"])
            .order_by(Leaderboard.total_xp.desc())
            .limit(20)
        )
        rows = result.all()
        members = [
            {
                "username": user.username,
                "display_name": user.display_name or user.username,
                "total_xp": lb.total_xp,
                "avatar_url": user.avatar_url,
            }
            for lb, user in rows
        ]
        league_data.append({
            "slug": league["slug"],
            "title": league["title"],
            "xp_min": league["xp_min"],
            "xp_max": league["xp_max"],
            "members_count": len(members),
            "top_members": members,
        })
    return league_data

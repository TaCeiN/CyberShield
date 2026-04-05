import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.models.learning_progress import LearningProgress
from app.data.learning_modules import LEARNING_MODULES


# Pre-compute theme -> module counts
_THEME_MODULE_COUNTS: dict[str, int] = {}
for _m in LEARNING_MODULES:
    _t = _m["theme"]
    _THEME_MODULE_COUNTS[_t] = _THEME_MODULE_COUNTS.get(_t, 0) + 1


async def check_all_achievements(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    all_achievements_result = await db.execute(select(Achievement))
    all_achievements = all_achievements_result.scalars().all()

    earned_result = await db.execute(
        select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
    )
    earned_ids = {row for row in earned_result.scalars().all()}

    # First pass: check all conditions WITHOUT adding XP (avoid cascade)
    new_achievements = []
    for ach in all_achievements:
        if ach.id in earned_ids:
            continue

        earned = await _check_condition(db, user_id, ach)
        if earned:
            ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
            db.add(ua)

            new_achievements.append({
                "slug": ach.slug,
                "title": ach.title,
                "description": ach.description,
                "icon": ach.icon,
                "rarity": ach.rarity,
                "xp_bonus": ach.xp_bonus,
            })

    if new_achievements:
        await db.flush()

    return new_achievements


async def _check_condition(db: AsyncSession, user_id: uuid.UUID, achievement: Achievement) -> bool:
    ct = achievement.condition_type
    cv = achievement.condition_value

    if ct == "modules_completed":
        # Count distinct completed modules
        result = await db.execute(
            select(func.count(func.distinct(LearningProgress.scenario_id)))
            .where(LearningProgress.user_id == user_id)
        )
        count = result.scalar() or 0
        return count >= int(cv)

    elif ct == "theme_done":
        # All modules of a theme completed
        theme_id = str(cv)
        total_in_theme = _THEME_MODULE_COUNTS.get(theme_id, 0)
        if total_in_theme == 0:
            return False

        result = await db.execute(
            select(func.count(func.distinct(LearningProgress.scenario_id)))
            .where(
                LearningProgress.user_id == user_id,
                LearningProgress.theme == theme_id,
            )
        )
        completed = result.scalar() or 0
        return completed >= total_in_theme

    elif ct == "correct_count":
        # Count correct answers
        result = await db.execute(
            select(func.count())
            .select_from(LearningProgress)
            .where(
                LearningProgress.user_id == user_id,
                LearningProgress.is_correct == True,
            )
        )
        count = result.scalar() or 0
        return count >= int(cv)

    elif ct == "security_level":
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one()
        return user.security_level >= int(cv)

    elif ct == "xp_total":
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one()
        return user.total_xp >= int(cv)

    return False


async def get_all_achievements_for_user(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    all_result = await db.execute(select(Achievement))
    all_achievements = all_result.scalars().all()

    earned_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == user_id)
    )
    earned_map = {ua.achievement_id: ua for ua in earned_result.scalars().all()}

    return [
        {
            "id": ach.id,
            "slug": ach.slug,
            "title": ach.title,
            "description": ach.description,
            "icon": ach.icon,
            "condition_type": ach.condition_type,
            "condition_value": ach.condition_value,
            "xp_bonus": ach.xp_bonus,
            "rarity": ach.rarity,
            "earned": ach.id in earned_map,
            "earned_at": earned_map[ach.id].earned_at.isoformat() if ach.id in earned_map else None,
        }
        for ach in all_achievements
    ]


async def get_user_achievements(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    result = await db.execute(
        select(UserAchievement, Achievement)
        .join(Achievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == user_id)
        .order_by(UserAchievement.earned_at.desc())
    )
    return [
        {
            "id": ua.id,
            "achievement_id": ach.id,
            "slug": ach.slug,
            "title": ach.title,
            "description": ach.description,
            "icon": ach.icon,
            "rarity": ach.rarity,
            "xp_bonus": ach.xp_bonus,
            "earned_at": ua.earned_at.isoformat() if ua.earned_at else None,
        }
        for ua, ach in result.all()
    ]

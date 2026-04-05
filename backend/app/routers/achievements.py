from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.achievement_service import get_all_achievements_for_user, get_user_achievements

router = APIRouter()


@router.get("/")
async def list_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_all_achievements_for_user(db, current_user.id)


@router.get("/my")
async def my_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_achievements(db, current_user.id)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.rating_service import get_top_leaderboard, get_leagues_leaderboard

router = APIRouter()


@router.get("/")
async def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_top_leaderboard(db, current_user.id)


@router.get("/leagues")
async def get_leagues(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_leagues_leaderboard(db)

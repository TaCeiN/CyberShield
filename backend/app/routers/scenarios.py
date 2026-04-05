from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.scenario_service import get_all_scenarios, get_scenario_by_slug

router = APIRouter()


@router.get("/")
async def list_scenarios(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scenarios = await get_all_scenarios(db, current_user.id)
    return scenarios


@router.get("/{slug}")
async def get_scenario(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scenario = await get_scenario_by_slug(db, slug, current_user.id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Сценарий не найден")
    return scenario

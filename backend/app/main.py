from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, scenarios, missions, progress, leaderboard, achievements, ws, learning

app = FastAPI(
    title="CyberShield API",
    description="API для образовательного симулятора кибербезопасности",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["Scenarios"])
app.include_router(missions.router, prefix="/api/missions", tags=["Missions"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(ws.router, tags=["WebSocket"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/health")
async def api_health_check():
    return {"status": "ok"}

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/cybershield"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "cybershield-hackathon-secret-key-2024"
    CORS_ORIGINS: str = "http://localhost:3000"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()

import uuid
from datetime import datetime, timedelta, timezone

import redis.asyncio as aioredis
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def store_refresh_token(user_id: str, token: str) -> None:
    await redis_client.setex(
        f"refresh_token:{user_id}",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token,
    )


async def verify_refresh_token(user_id: str, token: str) -> bool:
    stored = await redis_client.get(f"refresh_token:{user_id}")
    return stored == token


async def revoke_refresh_token(user_id: str) -> None:
    await redis_client.delete(f"refresh_token:{user_id}")


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def register_user(db: AsyncSession, username: str, email: str, password: str) -> User:
    result = await db.execute(select(User).where((User.email == email) | (User.username == username)))
    existing = result.scalar_one_or_none()
    if existing:
        if existing.email == email:
            raise ValueError("Пользователь с таким email уже существует")
        raise ValueError("Имя пользователя уже занято")

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        display_name=username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

import json
import logging
import redis as redis_lib
from typing import Any, Optional
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
_client: Optional[redis_lib.Redis] = None


def get_redis() -> redis_lib.Redis:
    global _client
    if _client is None:
        _client = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
    return _client


def cache_get(key: str) -> Optional[Any]:
    try:
        val = get_redis().get(key)
        return json.loads(val) if val else None
    except redis_lib.RedisError as e:
        logger.warning("cache_get failed for key=%s: %s", key, e)
        return None


def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    try:
        get_redis().setex(key, ttl, json.dumps(value, default=str))
        return True
    except redis_lib.RedisError as e:
        logger.warning("cache_set failed for key=%s: %s", key, e)
        return False

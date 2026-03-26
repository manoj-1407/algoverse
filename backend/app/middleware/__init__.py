import time
import logging
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Token-bucket rate limiter for CPU-heavy endpoints.
    Enforced per IP. In production swap the in-process dict
    for a Redis-backed counter so it works across replicas.
    """
    LIMITS: dict[str, tuple[int, int]] = {
        "/api/v2/benchmark": (5, 60),
        "/api/v2/sort":      (60, 60),
        "/api/v2/compare":   (30, 60),
    }

    def __init__(self, app):
        super().__init__(app)
        self._buckets: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path not in self.LIMITS:
            return await call_next(request)

        max_calls, window = self.LIMITS[path]
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        calls = self._buckets[path][client_ip]
        self._buckets[path][client_ip] = [t for t in calls if now - t < window]

        if len(self._buckets[path][client_ip]) >= max_calls:
            logger.warning("rate limit hit: ip=%s path=%s", client_ip, path)
            return Response(
                content='{"detail":"Too many requests. Slow down."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(window)},
            )

        self._buckets[path][client_ip].append(now)
        return await call_next(request)


class RequestTimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        t0 = time.perf_counter()
        response = await call_next(request)
        ms = (time.perf_counter() - t0) * 1000
        response.headers["X-Response-Time-Ms"] = f"{ms:.2f}"
        return response

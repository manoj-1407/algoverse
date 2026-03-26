import time
import tracemalloc
from typing import Any, Callable


def timed_run(fn: Callable, *args, **kwargs) -> tuple[Any, float, float]:
    tracemalloc.start()
    t0 = time.perf_counter()
    result = fn(*args, **kwargs)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return result, round(ms, 4), round(peak / 1024, 2)


def clamp(val: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, val))


def safe_avg(values: list[float]) -> float:
    return round(sum(values) / len(values), 4) if values else 0.0


def paginate(items: list, page: int, page_size: int) -> dict:
    total = len(items)
    start = (page - 1) * page_size
    return {
        "items": items[start:start + page_size],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }

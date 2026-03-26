from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.cache import cache_get, cache_set
from app.algorithms.sorting import SORTING_REGISTRY, run_sort, generate_dataset
from app.models.benchmark import BenchmarkRun, BenchmarkResult

router = APIRouter(tags=["benchmark"])

LEADERBOARD_LIMIT = 50


class BenchmarkRequest(BaseModel):
    algorithms: list[str]
    sizes: list[int] = [100, 500, 1000, 2000, 5000]
    pattern: str = "random"
    runs_per_size: int = Field(default=3, ge=1, le=5)


@router.post("/benchmark")
def benchmark(req: BenchmarkRequest, db: Session = Depends(get_db)):
    if len(req.algorithms) > 12:
        raise HTTPException(400, "Max 12 algorithms per run")
    if len(req.sizes) > 10:
        raise HTTPException(400, "Max 10 size points per run")
    unknown = [a for a in req.algorithms if a not in SORTING_REGISTRY]
    if unknown:
        raise HTTPException(400, f"Unknown algorithms: {unknown}")
    results = {a: [] for a in req.algorithms}
    for size in req.sizes:
        for algo in req.algorithms:
            times, comps, mems = [], [], []
            for _ in range(req.runs_per_size):
                d = run_sort(algo, generate_dataset(size, req.pattern), False)
                times.append(d["time_ms"])
                comps.append(d["comparisons"])
                mems.append(d["memory_kb"])
            results[algo].append({
                "size": size,
                "time_ms": round(sum(times) / len(times), 4),
                "comparisons": int(sum(comps) / len(comps)),
                "memory_kb": round(sum(mems) / len(mems), 2),
            })
    run = BenchmarkRun(algorithms=req.algorithms, sizes=req.sizes, pattern=req.pattern, results=results)
    db.add(run)
    db.flush()
    for algo, pts in results.items():
        for p in pts:
            db.add(BenchmarkResult(
                run_id=run.id, algorithm=algo, input_size=p["size"],
                time_ms=p["time_ms"], memory_kb=p["memory_kb"],
                comparisons=p["comparisons"], pattern=req.pattern,
            ))
    db.commit()
    return {"run_id": run.id, "pattern": req.pattern, "sizes": req.sizes, "results": results}


@router.get("/leaderboard")
def leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    if limit > LEADERBOARD_LIMIT:
        limit = LEADERBOARD_LIMIT
    cache_key = f"leaderboard:v3:{limit}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    rows = (
        db.query(
            BenchmarkResult.algorithm,
            func.avg(BenchmarkResult.time_ms).label("avg_time"),
            func.min(BenchmarkResult.time_ms).label("best_time"),
            func.count(BenchmarkResult.id).label("runs"),
            func.avg(BenchmarkResult.comparisons).label("avg_comparisons"),
        )
        .group_by(BenchmarkResult.algorithm)
        .order_by(func.avg(BenchmarkResult.time_ms))
        .limit(limit)
        .all()
    )
    data = [{
        "algorithm": r.algorithm,
        "avg_time_ms": round(r.avg_time, 4),
        "best_time_ms": round(r.best_time, 4),
        "total_runs": r.runs,
        "avg_comparisons": int(r.avg_comparisons),
    } for r in rows]
    cache_set(cache_key, data, 60)
    return data

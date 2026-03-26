from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import hashlib

from app.core.cache import cache_get, cache_set
from app.algorithms.sorting import SORTING_REGISTRY, run_sort, generate_dataset

router = APIRouter(tags=["sorting"])


class SortRequest(BaseModel):
    algorithm: str
    data: list[int] = Field(default_factory=list)
    size: Optional[int] = None
    pattern: str = "random"
    track_steps: bool = False


class CompareRequest(BaseModel):
    algorithms: list[str]
    size: int = Field(default=1000, ge=10, le=50000)
    pattern: str = "random"


@router.get("/algorithms")
def list_algorithms():
    sorting_meta = []
    for key in SORTING_REGISTRY:
        fn, avg, worst, space, stable, cat = SORTING_REGISTRY[key]
        sorting_meta.append({
            "key": key, "avg": avg, "worst": worst,
            "space": space, "stable": stable, "category": cat,
        })
    return {
        "sorting": sorting_meta,
        "graph": ["dijkstra", "astar", "bfs", "dfs", "bellman_ford", "floyd_warshall", "prims_mst", "topological_sort"],
        "dynamic_programming": ["fibonacci", "lcs", "edit_distance", "knapsack", "coin_change", "lis", "matrix_chain"],
        "backtracking": ["n_queens", "sudoku", "maze"],
        "string": ["kmp", "rabin_karp"],
        "mathematical": ["sieve", "huffman", "gcd_lcm", "fast_exp"],
        "total": len(SORTING_REGISTRY) + 8 + 7 + 3 + 2 + 4,
    }


@router.get("/dataset")
def get_dataset(size: int = 50, pattern: str = "random"):
    if size > 10000:
        raise HTTPException(400, "Max 10,000")
    return {"data": generate_dataset(size, pattern), "size": size, "pattern": pattern}


@router.post("/sort")
def sort_data(req: SortRequest):
    if req.algorithm not in SORTING_REGISTRY:
        raise HTTPException(404, f"'{req.algorithm}' not found. Available: {list(SORTING_REGISTRY.keys())}")
    data = req.data if req.data else (generate_dataset(req.size, req.pattern) if req.size else None)
    if not data:
        raise HTTPException(400, "Provide 'data' or 'size'")
    if len(data) > 10000:
        raise HTTPException(400, "Max 10,000 elements")
    if not req.track_steps:
        ck = f"sort:{req.algorithm}:{hashlib.md5(str(data[:20]).encode()).hexdigest()}"
        cached = cache_get(ck)
        if cached:
            return {**cached, "cached": True}
    result = run_sort(req.algorithm, data, req.track_steps)
    if not req.track_steps:
        cache_set(ck, result, 180)
    return result


@router.post("/compare")
def compare(req: CompareRequest):
    data = generate_dataset(req.size, req.pattern)
    results = []
    for algo in req.algorithms:
        if algo not in SORTING_REGISTRY:
            continue
        d = run_sort(algo, data[:], False)
        results.append({
            "algorithm": algo, "time_ms": d["time_ms"], "comparisons": d["comparisons"],
            "swaps": d["swaps"], "memory_kb": d["memory_kb"],
            "complexity": d["avg_complexity"], "space": d["space_complexity"],
        })
    results.sort(key=lambda x: x["time_ms"])
    for i, r in enumerate(results):
        r["rank"] = i + 1
    return {
        "input_size": req.size, "pattern": req.pattern,
        "winner": results[0]["algorithm"] if results else None,
        "results": results,
    }

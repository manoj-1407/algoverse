"""
Main API v2 router — assembles all endpoint sub-routers.

Architecture fix: the original file put every single endpoint into one 300-line
router.py.  Endpoints are now split by domain under app/api/v1/endpoints/:

    sorting.py   — /algorithms, /dataset, /sort, /compare
    benchmark.py — /benchmark, /leaderboard
    graph.py     — /graph, /graph/astar
    algorithms.py — /dp, /backtrack, /string, /math
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    sorting_router,
    benchmark_router,
    graph_router,
    algorithms_router,
)

router = APIRouter(prefix="/api/v2")

router.include_router(sorting_router)
router.include_router(benchmark_router)
router.include_router(graph_router)
router.include_router(algorithms_router)


@router.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "version": "3.0.0"}

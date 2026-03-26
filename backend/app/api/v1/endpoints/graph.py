from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.algorithms.graph import (
    dijkstra, astar, bfs, dfs,
    bellman_ford, floyd_warshall, prims_mst, topological_sort,
)

router = APIRouter(tags=["graph"])


class GraphRequest(BaseModel):
    algorithm: str
    graph: dict
    start: Optional[str] = None
    end: Optional[str] = None


class AStarRequest(BaseModel):
    grid: list[list[int]]
    start: list[int]
    end: list[int]


@router.post("/graph")
def run_graph(req: GraphRequest):
    match req.algorithm:
        case "dijkstra":         return dijkstra(req.graph, req.start, req.end)
        case "bfs":              return bfs(req.graph, req.start, req.end)
        case "dfs":              return dfs(req.graph, req.start)
        case "bellman_ford":     return bellman_ford(req.graph, req.start)
        case "floyd_warshall":   return floyd_warshall(req.graph)
        case "prims_mst":        return prims_mst(req.graph)
        case "topological_sort": return topological_sort(req.graph)
        case _:
            raise HTTPException(404, f"Graph algorithm '{req.algorithm}' not found")


@router.post("/graph/astar")
def run_astar(req: AStarRequest):
    return astar(req.grid, tuple(req.start), tuple(req.end))

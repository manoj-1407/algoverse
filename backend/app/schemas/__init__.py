from pydantic import BaseModel
from typing import Optional


class SortStepSchema(BaseModel):
    array: list[int]
    action: str
    highlighted: list[int]


class SortResponse(BaseModel):
    algorithm: str
    sorted: list[int]
    time_ms: float
    memory_kb: float
    comparisons: int
    swaps: int
    steps: list[SortStepSchema]
    avg_complexity: str
    worst_complexity: str
    space_complexity: str
    stable: bool
    category: str
    cached: bool = False


class BenchmarkPoint(BaseModel):
    size: int
    time_ms: float
    comparisons: int
    memory_kb: float


class BenchmarkResponse(BaseModel):
    run_id: int
    pattern: str
    sizes: list[int]
    results: dict[str, list[BenchmarkPoint]]


class CompareEntry(BaseModel):
    algorithm: str
    time_ms: float
    comparisons: int
    swaps: int
    memory_kb: float
    complexity: str
    space: str
    rank: int


class CompareResponse(BaseModel):
    input_size: int
    pattern: str
    winner: Optional[str]
    results: list[CompareEntry]


class LeaderEntry(BaseModel):
    algorithm: str
    avg_time_ms: float
    best_time_ms: float
    total_runs: int
    avg_comparisons: int


class AlgorithmMeta(BaseModel):
    key: str
    avg: str
    worst: str
    space: str
    stable: bool
    category: str


class AlgorithmRegistry(BaseModel):
    sorting: list[AlgorithmMeta]
    graph: list[str]
    dynamic_programming: list[str]
    backtracking: list[str]
    string: list[str]
    mathematical: list[str]
    total: int


class HealthResponse(BaseModel):
    status: str
    version: str

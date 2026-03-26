from .sorting import router as sorting_router
from .benchmark import router as benchmark_router
from .graph import router as graph_router
from .algorithms import router as algorithms_router

__all__ = ["sorting_router", "benchmark_router", "graph_router", "algorithms_router"]

import heapq
import time
import tracemalloc
from collections import deque
from typing import Any, Optional


def dijkstra(graph: dict, start: str, end: Optional[str] = None) -> dict[str, Any]:
    dist = {n: float("inf") for n in graph}
    dist[start] = 0
    prev = {n: None for n in graph}
    visited = []
    pq = [(0, start)]
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        visited.append(u)
        for v, w in graph.get(u, {}).items():
            comparisons += 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
                heapq.heappush(pq, (dist[v], v))
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    path = []
    if end and dist.get(end, float("inf")) != float("inf"):
        node = end
        while node:
            path.insert(0, node)
            node = prev[node]
    return {
        "algorithm": "Dijkstra", "visited_order": visited, "path": path,
        "distances": {k: (v if v != float("inf") else -1) for k, v in dist.items()},
        "comparisons": comparisons, "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O((V+E) log V)", "space": "O(V)"},
    }


def astar(grid: list[list[int]], start: tuple, end: tuple) -> dict[str, Any]:
    def h(a, b): return abs(a[0] - b[0]) + abs(a[1] - b[1])
    rows, cols = len(grid), len(grid[0])
    open_set = [(h(start, end), 0, start)]
    g = {start: 0}
    prev = {}
    visited = []
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    while open_set:
        _, cost, cur = heapq.heappop(open_set)
        if cur in visited:
            continue
        visited.append(list(cur))
        if cur == end:
            break
        r, c = cur
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                comparisons += 1
                ng = cost + 1
                if ng < g.get((nr, nc), float("inf")):
                    g[(nr, nc)] = ng
                    prev[(nr, nc)] = cur
                    heapq.heappush(open_set, (ng + h((nr, nc), end), ng, (nr, nc)))
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    path = []
    node = end
    while node in prev:
        path.insert(0, list(node))
        node = prev[node]
    if path or start == end:
        path.insert(0, list(start))
    return {
        "algorithm": "A*", "visited": visited, "path": path,
        "comparisons": comparisons, "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(E log V)", "space": "O(V)"},
    }


def bfs(graph: dict, start: str, end: Optional[str] = None) -> dict[str, Any]:
    visited_set, visited_order = set(), []
    queue = deque([start])
    prev = {start: None}
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    while queue:
        node = queue.popleft()
        if node in visited_set:
            continue
        visited_set.add(node)
        visited_order.append(node)
        for nb in graph.get(node, []):
            comparisons += 1
            if nb not in visited_set:
                queue.append(nb)
            if nb not in prev:
                prev[nb] = node
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    path = []
    if end and end in prev:
        node = end
        while node:
            path.insert(0, node)
            node = prev[node]
    return {
        "algorithm": "BFS", "visited_order": visited_order, "path": path,
        "comparisons": comparisons, "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(V+E)", "space": "O(V)"},
    }


def dfs(graph: dict, start: str) -> dict[str, Any]:
    visited_set, visited_order, comparisons = set(), [], [0]

    def _dfs(node):
        visited_set.add(node)
        visited_order.append(node)
        for nb in graph.get(node, []):
            comparisons[0] += 1
            if nb not in visited_set:
                _dfs(nb)

    tracemalloc.start()
    t0 = time.perf_counter()
    _dfs(start)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "DFS", "visited_order": visited_order,
        "comparisons": comparisons[0], "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(V+E)", "space": "O(V)"},
    }


def bellman_ford(graph: dict, start: str) -> dict[str, Any]:
    nodes = set(graph.keys()) | {v for nb in graph.values() for v in nb}
    dist = {n: float("inf") for n in nodes}
    dist[start] = 0
    prev = {n: None for n in nodes}
    edges = [(u, v, w) for u, nb in graph.items() for v, w in nb.items()]
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    for _ in range(len(nodes) - 1):
        for u, v, w in edges:
            comparisons += 1
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
    negative_cycle = any(dist[u] + w < dist[v] for u, v, w in edges)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Bellman-Ford",
        "distances": {k: (v if v != float("inf") else -1) for k, v in dist.items()},
        "negative_cycle": negative_cycle, "comparisons": comparisons,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(VE)", "space": "O(V)"},
    }


def floyd_warshall(graph: dict) -> dict[str, Any]:
    """
    BUG FIX: original signature was floyd_warshall(matrix: list[list[float]]).
    The endpoint always passed req.graph (a dict), so the API call always crashed.
    Now accepts {u: {v: weight}} adjacency dict — same format as every other algo —
    builds the distance matrix internally, runs the O(V³) DP.
    """
    nodes = sorted(set(graph.keys()) | {v for nb in graph.values() for v in nb})
    n = len(nodes)
    idx = {node: i for i, node in enumerate(nodes)}
    INF = float("inf")

    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, neighbors in graph.items():
        for v, w in neighbors.items():
            dist[idx[u]][idx[v]] = w

    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    for k in range(n):
        for i in range(n):
            for j in range(n):
                comparisons += 1
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    result_matrix = [
        [dist[i][j] if dist[i][j] != INF else -1 for j in range(n)]
        for i in range(n)
    ]
    return {
        "algorithm": "Floyd-Warshall",
        "nodes": nodes,
        "matrix": result_matrix,
        "comparisons": comparisons,
        "time_ms": round(ms, 4),
        "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(V³)", "space": "O(V²)"},
    }


def prims_mst(graph: dict) -> dict[str, Any]:
    if not graph:
        return {"edges": [], "total_weight": 0}
    start = next(iter(graph))
    visited = {start}
    pq = [(w, start, v) for v, w in graph.get(start, {}).items()]
    heapq.heapify(pq)
    mst_edges = []
    total = 0
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    while pq and len(visited) < len(graph):
        w, u, v = heapq.heappop(pq)
        comparisons += 1
        if v in visited:
            continue
        visited.add(v)
        mst_edges.append({"from": u, "to": v, "weight": w})
        total += w
        for nb, nw in graph.get(v, {}).items():
            if nb not in visited:
                heapq.heappush(pq, (nw, v, nb))
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Prim's MST", "edges": mst_edges, "total_weight": total,
        "comparisons": comparisons, "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(E log V)", "space": "O(V)"},
    }


def topological_sort(graph: dict) -> dict[str, Any]:
    in_degree = {n: 0 for n in graph}
    for n in graph:
        for nb in graph.get(n, []):
            in_degree[nb] = in_degree.get(nb, 0) + 1
    queue = deque([n for n, d in in_degree.items() if d == 0])
    order = []
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph.get(node, []):
            comparisons += 1
            in_degree[nb] -= 1
            if in_degree[nb] == 0:
                queue.append(nb)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    has_cycle = len(order) != len(graph)
    return {
        "algorithm": "Topological Sort (Kahn's)", "order": order,
        "has_cycle": has_cycle, "comparisons": comparisons,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(V+E)", "space": "O(V)"},
    }


GRAPH_REGISTRY = {
    "dijkstra": dijkstra, "astar": astar, "bfs": bfs, "dfs": dfs,
    "bellman_ford": bellman_ford, "floyd_warshall": floyd_warshall,
    "prims_mst": prims_mst, "topological_sort": topological_sort,
}

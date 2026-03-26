import time
import tracemalloc
import math
from typing import Any


# ── Backtracking ──────────────────────────────────────────────────────────────

def n_queens(n: int) -> dict[str, Any]:
    solutions = []
    board = [-1] * n
    def is_safe(row, col):
        for r in range(row):
            if board[r] == col or abs(board[r] - col) == abs(r - row):
                return False
        return True
    def solve(row):
        if row == n:
            solutions.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row] = col
                solve(row + 1)
                board[row] = -1
    tracemalloc.start()
    t0 = time.perf_counter()
    solve(0)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "N-Queens", "n": n, "total_solutions": len(solutions),
        "solutions": solutions[:10],  # return first 10
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(n!)", "space": "O(n)"},
    }


def sudoku_solver(board: list[list[int]]) -> dict[str, Any]:
    """Solve 9x9 sudoku. 0 = empty."""
    board = [row[:] for row in board]
    steps = []
    def is_valid(r, c, num):
        if num in board[r]: return False
        if num in [board[i][c] for i in range(9)]: return False
        br, bc = (r // 3) * 3, (c // 3) * 3
        for i in range(3):
            for j in range(3):
                if board[br+i][bc+j] == num: return False
        return True
    def solve():
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    for num in range(1, 10):
                        if is_valid(r, c, num):
                            board[r][c] = num
                            steps.append((r, c, num))
                            if solve(): return True
                            board[r][c] = 0
                    return False
        return True
    tracemalloc.start()
    t0 = time.perf_counter()
    solved = solve()
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Sudoku Solver", "solved": solved, "board": board,
        "steps": len(steps), "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(9^m) m=empty cells", "space": "O(m)"},
    }


def maze_solver(maze: list[list[int]], start: list, end: list) -> dict[str, Any]:
    """Solve maze with DFS backtracking. 0=path, 1=wall."""
    rows, cols = len(maze), len(maze[0])
    path = []
    visited = [[False]*cols for _ in range(rows)]
    def solve(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols: return False
        if maze[r][c] == 1 or visited[r][c]: return False
        visited[r][c] = True
        path.append([r, c])
        if [r, c] == end: return True
        for dr, dc in [(0,1),(1,0),(0,-1),(-1,0)]:
            if solve(r+dr, c+dc): return True
        path.pop()
        return False
    tracemalloc.start()
    t0 = time.perf_counter()
    found = solve(start[0], start[1])
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Maze Solver", "solved": found, "path": path,
        "path_length": len(path), "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(rows × cols)", "space": "O(rows × cols)"},
    }


# ── String Algorithms ─────────────────────────────────────────────────────────

def kmp_search(text: str, pattern: str) -> dict[str, Any]:
    def build_lps(p):
        lps = [0] * len(p)
        l, i = 0, 1
        while i < len(p):
            if p[i] == p[l]:
                l += 1
                lps[i] = l
                i += 1
            elif l:
                l = lps[l-1]
            else:
                lps[i] = 0
                i += 1
        return lps
    tracemalloc.start()
    t0 = time.perf_counter()
    lps = build_lps(pattern)
    matches = []
    i = j = 0
    comparisons = 0
    while i < len(text):
        comparisons += 1
        if text[i] == pattern[j]:
            i += 1
            j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j-1]
        elif i < len(text) and text[i] != pattern[j]:
            if j:
                j = lps[j-1]
            else:
                i += 1
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "KMP", "text": text, "pattern": pattern, "matches": matches,
        "count": len(matches), "lps_table": lps, "comparisons": comparisons,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(n+m)", "space": "O(m)"},
    }


def rabin_karp(text: str, pattern: str, base: int = 256, mod: int = 101) -> dict[str, Any]:
    n, m = len(text), len(pattern)
    h = pow(base, m-1, mod)
    pt = ph = 0
    for i in range(m):
        ph = (base * ph + ord(pattern[i])) % mod
        pt = (base * pt + ord(text[i])) % mod
    matches = []
    comparisons = 0
    tracemalloc.start()
    t0 = time.perf_counter()
    for i in range(n - m + 1):
        comparisons += 1
        if ph == pt:
            if text[i:i+m] == pattern:
                matches.append(i)
        if i < n - m:
            pt = (base * (pt - ord(text[i]) * h) + ord(text[i+m])) % mod
            if pt < 0: pt += mod
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Rabin-Karp", "text": text, "pattern": pattern,
        "matches": matches, "count": len(matches), "comparisons": comparisons,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(nm) worst, O(n+m) avg", "space": "O(1)"},
    }


# ── Mathematical Algorithms ───────────────────────────────────────────────────

def sieve_of_eratosthenes(limit: int) -> dict[str, Any]:
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    steps = []
    tracemalloc.start()
    t0 = time.perf_counter()
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            for j in range(i*i, limit+1, i):
                sieve[j] = False
                if len(steps) < 200:
                    steps.append(j)
    primes = [i for i in range(limit+1) if sieve[i]]
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Sieve of Eratosthenes", "limit": limit,
        "primes": primes[:100], "count": len(primes),
        "crossed_off_sample": steps[:50], "time_ms": round(ms, 4),
        "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(n log log n)", "space": "O(n)"},
    }


def huffman_coding(text: str) -> dict[str, Any]:
    """Build Huffman tree and return codes."""
    from collections import Counter
    import heapq
    freq = Counter(text)
    heap = [[f, [ch, ""]] for ch, f in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        lo = heapq.heappop(heap)
        hi = heapq.heappop(heap)
        for pair in lo[1:]: pair[1] = '0' + pair[1]
        for pair in hi[1:]: pair[1] = '1' + pair[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])
    codes = {}
    if heap:
        for pair in heap[0][1:]:
            codes[pair[0]] = pair[1]
    encoded_len = sum(len(codes[c]) * freq[c] for c in freq)
    original_len = len(text) * 8
    return {
        "algorithm": "Huffman Coding", "text": text[:50],
        "codes": codes, "frequency": dict(freq),
        "original_bits": original_len, "encoded_bits": encoded_len,
        "compression_ratio": round(encoded_len / original_len, 3) if original_len else 0,
        "complexity": {"time": "O(n log n)", "space": "O(n)"},
    }


def gcd_lcm(a: int, b: int) -> dict[str, Any]:
    steps = []
    x, y = a, b
    tracemalloc.start()
    t0 = time.perf_counter()
    while y:
        steps.append({"a": x, "b": y, "remainder": x % y})
        x, y = y, x % y
    gcd_val = x
    lcm_val = (a * b) // gcd_val if gcd_val else 0
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Euclidean GCD + LCM", "a": a, "b": b,
        "gcd": gcd_val, "lcm": lcm_val, "steps": steps,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(log min(a,b))", "space": "O(1)"},
    }


def fast_exponentiation(base: int, exp: int, mod: int = 10**9+7) -> dict[str, Any]:
    steps = []
    result = 1
    b, e = base, exp
    tracemalloc.start()
    t0 = time.perf_counter()
    while e > 0:
        if e % 2 == 1:
            result = (result * b) % mod
            steps.append({"exp_bit": 1, "result": result, "base": b})
        b = (b * b) % mod
        e //= 2
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Fast Exponentiation", "base": base, "exponent": exp, "mod": mod,
        "result": result, "steps": steps,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(log n)", "space": "O(1)"},
    }


BACKTRACKING_REGISTRY = {"n_queens": n_queens, "sudoku": sudoku_solver, "maze": maze_solver}
STRING_REGISTRY = {"kmp": kmp_search, "rabin_karp": rabin_karp}
MATH_REGISTRY = {
    "sieve": sieve_of_eratosthenes, "huffman": huffman_coding,
    "gcd_lcm": gcd_lcm, "fast_exp": fast_exponentiation,
}

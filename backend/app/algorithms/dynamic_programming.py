import time
import tracemalloc
from typing import Any


def fibonacci_all_methods(n: int) -> dict[str, Any]:
    """Compare recursive, memoized, bottom-up, matrix for Fibonacci."""
    results = {}

    # Bottom-up DP
    tracemalloc.start()
    t0 = time.perf_counter()
    if n <= 1:
        dp = [0, 1][:n + 1]
    else:
        dp = [0] * (n + 1)
        dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    results["bottom_up"] = {"value": dp[n], "table": dp[:min(n + 1, 21)], "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2)}

    # Memoized
    memo = {}
    def fib_memo(k):
        if k in memo: return memo[k]
        if k <= 1: return k
        memo[k] = fib_memo(k - 1) + fib_memo(k - 2)
        return memo[k]
    tracemalloc.start()
    t0 = time.perf_counter()
    val = fib_memo(n)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    results["memoized"] = {"value": val, "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2)}

    return {"n": n, "answer": dp[n], "methods": results, "algorithm": "Fibonacci", "complexity": {"time": "O(n)", "space": "O(n)"}}


def lcs(s1: str, s2: str) -> dict[str, Any]:
    """Longest Common Subsequence with full DP table."""
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    tracemalloc.start()
    t0 = time.perf_counter()
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    # Backtrack
    seq = []
    i, j = m, n
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            seq.insert(0, s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "LCS", "s1": s1, "s2": s2, "lcs": "".join(seq),
        "length": dp[m][n], "table": dp,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(mn)", "space": "O(mn)"},
    }


def edit_distance(s1: str, s2: str) -> dict[str, Any]:
    """Levenshtein edit distance with operations table."""
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    ops = [[""] * (n + 1) for _ in range(m + 1)]
    tracemalloc.start()
    t0 = time.perf_counter()
    for i in range(m + 1):
        dp[i][0] = i
        ops[i][0] = "delete"
    for j in range(n + 1):
        dp[0][j] = j
        ops[0][j] = "insert"
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
                ops[i][j] = "match"
            else:
                choices = {"replace": dp[i-1][j-1], "delete": dp[i-1][j], "insert": dp[i][j-1]}
                best = min(choices, key=choices.get)
                dp[i][j] = choices[best] + 1
                ops[i][j] = best
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "Edit Distance", "s1": s1, "s2": s2,
        "distance": dp[m][n], "table": dp, "operations": ops,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(mn)", "space": "O(mn)"},
    }


def knapsack_01(weights: list[int], values: list[int], capacity: int) -> dict[str, Any]:
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    tracemalloc.start()
    t0 = time.perf_counter()
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
    # Backtrack selected items
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(i - 1)
            w -= weights[i - 1]
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "0/1 Knapsack", "max_value": dp[n][capacity],
        "selected_items": selected, "table": [row[:min(capacity+1,21)] for row in dp],
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(nW)", "space": "O(nW)"},
    }


def coin_change(coins: list[int], amount: int) -> dict[str, Any]:
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    coin_used = [0] * (amount + 1)
    tracemalloc.start()
    t0 = time.perf_counter()
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a and dp[a - coin] + 1 < dp[a]:
                dp[a] = dp[a - coin] + 1
                coin_used[a] = coin
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    # Reconstruct
    path = []
    a = amount
    while a > 0 and coin_used[a]:
        path.append(coin_used[a])
        a -= coin_used[a]
    return {
        "algorithm": "Coin Change", "coins": coins, "amount": amount,
        "min_coins": dp[amount] if dp[amount] != float("inf") else -1,
        "coins_used": path, "table": [x if x != float("inf") else -1 for x in dp],
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(amount × coins)", "space": "O(amount)"},
    }


def lis(arr: list[int]) -> dict[str, Any]:
    """Longest Increasing Subsequence with O(n²) DP."""
    n = len(arr)
    dp = [1] * n
    prev = [-1] * n
    tracemalloc.start()
    t0 = time.perf_counter()
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j
    length = max(dp)
    idx = dp.index(length)
    seq = []
    while idx != -1:
        seq.insert(0, arr[idx])
        idx = prev[idx]
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "algorithm": "LIS", "array": arr, "length": length, "sequence": seq, "dp_table": dp,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(n²)", "space": "O(n)"},
    }


def matrix_chain(dims: list[int]) -> dict[str, Any]:
    """Matrix Chain Multiplication."""
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    split = [[0] * n for _ in range(n)]
    tracemalloc.start()
    t0 = time.perf_counter()
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float("inf")
            for k in range(i, j):
                cost = dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1]
                if cost < dp[i][j]:
                    dp[i][j] = cost
                    split[i][j] = k
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    def build_parens(i, j):
        if i == j: return f"M{i+1}"
        k = split[i][j]
        return f"({build_parens(i,k)} × {build_parens(k+1,j)})"
    return {
        "algorithm": "Matrix Chain Multiplication", "dimensions": dims,
        "min_operations": dp[0][n-1], "optimal_parenthesization": build_parens(0, n-1),
        "table": dp,
        "time_ms": round(ms, 4), "memory_kb": round(peak / 1024, 2),
        "complexity": {"time": "O(n³)", "space": "O(n²)"},
    }


DP_REGISTRY = {
    "fibonacci": fibonacci_all_methods,
    "lcs": lcs,
    "edit_distance": edit_distance,
    "knapsack": knapsack_01,
    "coin_change": coin_change,
    "lis": lis,
    "matrix_chain": matrix_chain,
}

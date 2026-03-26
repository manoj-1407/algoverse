import time
import tracemalloc
import random
from typing import Any


def _step(arr, action, indices, steps, extra=None):
    s = {"array": arr[:], "action": action, "highlighted": indices}
    if extra:
        s.update(extra)
    steps.append(s)


def _run(arr: list, fn, track: bool) -> dict:
    arr = arr[:]
    steps, comparisons, swaps = [], [0], [0]
    tracemalloc.start()
    t0 = time.perf_counter()
    fn(arr, steps, comparisons, swaps, track)
    ms = (time.perf_counter() - t0) * 1000
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return {
        "sorted": arr, "time_ms": round(ms, 4),
        "memory_kb": round(peak / 1024, 2),
        "comparisons": comparisons[0], "swaps": swaps[0],
        "steps": steps if track else [],
    }


def _quicksort_fn(arr, steps, comparisons, swaps, track):
    def partition(lo, hi):
        pivot = arr[hi]
        i = lo - 1
        for j in range(lo, hi):
            comparisons[0] += 1
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                swaps[0] += 1
                if track:
                    _step(arr, "swap", [i, j], steps)
        arr[i + 1], arr[hi] = arr[hi], arr[i + 1]
        swaps[0] += 1
        if track:
            _step(arr, "pivot", [i + 1], steps)
        return i + 1

    def qs(lo, hi):
        if lo < hi:
            pi = partition(lo, hi)
            qs(lo, pi - 1)
            qs(pi + 1, hi)
    qs(0, len(arr) - 1)


def _mergesort_fn(arr, steps, comparisons, swaps, track):
    def merge(l, r, off):
        res, i, j = [], 0, 0
        while i < len(l) and j < len(r):
            comparisons[0] += 1
            if l[i] <= r[j]:
                res.append(l[i])
                i += 1
            else:
                res.append(r[j])
                j += 1
        res += l[i:] + r[j:]
        swaps[0] += 1
        for k, v in enumerate(res):
            arr[off + k] = v
        if track:
            _step(arr, "merge", list(range(off, off + len(res))), steps)
        return res

    def ms(sub, off):
        if len(sub) <= 1:
            return sub
        mid = len(sub) // 2
        return merge(ms(sub[:mid], off), ms(sub[mid:], off + mid), off)
    ms(arr[:], 0)


def _heapsort_fn(arr, steps, comparisons, swaps, track):
    n = len(arr)

    def heapify(n, i):
        largest = i
        l, r = 2 * i + 1, 2 * i + 2
        comparisons[0] += 1
        if l < n and arr[l] > arr[largest]:
            largest = l
        comparisons[0] += 1
        if r < n and arr[r] > arr[largest]:
            largest = r
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            swaps[0] += 1
            if track:
                _step(arr, "heapify", [i, largest], steps)
            heapify(n, largest)

    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        swaps[0] += 1
        if track:
            _step(arr, "extract", [0, i], steps)
        heapify(i, 0)


def _bubblesort_fn(arr, steps, comparisons, swaps, track):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            comparisons[0] += 1
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps[0] += 1
                if track:
                    _step(arr, "swap", [j, j + 1], steps)


def _insertionsort_fn(arr, steps, comparisons, swaps, track):
    # BUG FIX: count every comparison, including the one that exits the while.
    # Previously comparisons[0] was inside the body so the final (false) check
    # that terminates the loop was never counted — understating comparisons.
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0:
            comparisons[0] += 1
            if arr[j] <= key:
                break
            arr[j + 1] = arr[j]
            swaps[0] += 1
            if track:
                _step(arr, "shift", [j, j + 1], steps)
            j -= 1
        arr[j + 1] = key


def _selectionsort_fn(arr, steps, comparisons, swaps, track):
    n = len(arr)
    for i in range(n):
        mi = i
        for j in range(i + 1, n):
            comparisons[0] += 1
            if arr[j] < arr[mi]:
                mi = j
        if mi != i:
            arr[i], arr[mi] = arr[mi], arr[i]
            swaps[0] += 1
            if track:
                _step(arr, "swap", [i, mi], steps)


def _shellsort_fn(arr, steps, comparisons, swaps, track):
    # BUG FIX: same pattern as insertionsort — count the exiting comparison too.
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap:
                comparisons[0] += 1
                if arr[j - gap] <= temp:
                    break
                arr[j] = arr[j - gap]
                swaps[0] += 1
                if track:
                    _step(arr, "shift", [j, j - gap], steps)
                j -= gap
            arr[j] = temp
        gap //= 2


def _countingsort_fn(arr, steps, comparisons, swaps, track):
    if not arr:
        return
    mn, mx = min(arr), max(arr)
    rng = mx - mn + 1
    count = [0] * rng
    out = [0] * len(arr)
    for v in arr:
        count[v - mn] += 1
        comparisons[0] += 1
    for i in range(1, rng):
        count[i] += count[i - 1]
    for v in reversed(arr):
        out[count[v - mn] - 1] = v
        count[v - mn] -= 1
        swaps[0] += 1
    for i, v in enumerate(out):
        arr[i] = v
        if track and i % max(1, len(arr) // 20) == 0:
            _step(arr, "place", [i], steps)


def _radixsort_fn(arr, steps, comparisons, swaps, track):
    if not arr:
        return
    mx = max(arr)
    exp = 1
    while mx // exp > 0:
        n = len(arr)
        out = [0] * n
        count = [0] * 10
        for v in arr:
            count[(v // exp) % 10] += 1
            comparisons[0] += 1
        for i in range(1, 10):
            count[i] += count[i - 1]
        for v in reversed(arr):
            out[count[(v // exp) % 10] - 1] = v
            count[(v // exp) % 10] -= 1
            swaps[0] += 1
        for i, v in enumerate(out):
            arr[i] = v
        if track:
            _step(arr, "radix_pass", list(range(len(arr))), steps, {"exp": exp})
        exp *= 10


def _cocktailsort_fn(arr, steps, comparisons, swaps, track):
    n = len(arr)
    swapped = True
    start = 0
    end = n - 1
    while swapped:
        swapped = False
        for i in range(start, end):
            comparisons[0] += 1
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swaps[0] += 1
                swapped = True
                if track:
                    _step(arr, "swap", [i, i + 1], steps)
        if not swapped:
            break
        swapped = False
        end -= 1
        for i in range(end - 1, start - 1, -1):
            comparisons[0] += 1
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swaps[0] += 1
                swapped = True
                if track:
                    _step(arr, "swap", [i, i + 1], steps)
        start += 1


def _gnomesort_fn(arr, steps, comparisons, swaps, track):
    # BUG FIX: the original only incremented comparisons[0] in the else (swap)
    # branch, so every forward step was free — completely wrong count.
    n = len(arr)
    i = 0
    while i < n:
        if i == 0:
            i += 1
        else:
            comparisons[0] += 1          # always count when we evaluate arr[i] vs arr[i-1]
            if arr[i] >= arr[i - 1]:
                i += 1
            else:
                arr[i], arr[i - 1] = arr[i - 1], arr[i]
                swaps[0] += 1
                if track:
                    _step(arr, "swap", [i, i - 1], steps)
                i -= 1


def _timsort_fn(arr, steps, comparisons, swaps, track):
    RUN = 32
    n = len(arr)
    for i in range(0, n, RUN):
        end = min(i + RUN, n)
        sub = arr[i:end]
        sub.sort()
        arr[i:end] = sub
        comparisons[0] += len(sub) * 3
        swaps[0] += len(sub)
        if track:
            _step(arr, "tim_run", list(range(i, end)), steps)
    size = RUN
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(left + size, n)
            right = min(left + 2 * size, n)
            if mid < right:
                l, r = arr[left:mid], arr[mid:right]
                merged = []
                ii = jj = 0
                while ii < len(l) and jj < len(r):
                    comparisons[0] += 1
                    if l[ii] <= r[jj]:
                        merged.append(l[ii])
                        ii += 1
                    else:
                        merged.append(r[jj])
                        jj += 1
                        swaps[0] += 1
                merged += l[ii:] + r[jj:]
                arr[left:right] = merged
                if track:
                    _step(arr, "tim_merge", list(range(left, right)), steps)
        size *= 2


# ── Registry ──────────────────────────────────────────────────────────────────
# Tuple: (fn, avg_complexity, worst_complexity, space_complexity, stable, category)
#
# FIXES applied:
#   insertionsort avg was "O(n)"  → corrected to "O(n²)"  (O(n) is *best* case)
#   gnomesort     avg was "O(n)"  → corrected to "O(n²)"  (O(n) is *best* case)
#   timsort       avg was "O(n)"  → corrected to "O(n log n)" (O(n) is *best* case)
SORTING_REGISTRY: dict[str, tuple] = {
    "quicksort":     (_quicksort_fn,     "O(n log n)", "O(n²)",       "O(log n)", False, "Divide & Conquer"),
    "mergesort":     (_mergesort_fn,     "O(n log n)", "O(n log n)",  "O(n)",     True,  "Divide & Conquer"),
    "heapsort":      (_heapsort_fn,      "O(n log n)", "O(n log n)",  "O(1)",     False, "Selection"),
    "bubblesort":    (_bubblesort_fn,    "O(n²)",      "O(n²)",       "O(1)",     True,  "Exchange"),
    "insertionsort": (_insertionsort_fn, "O(n²)",      "O(n²)",       "O(1)",     True,  "Insertion"),
    "selectionsort": (_selectionsort_fn, "O(n²)",      "O(n²)",       "O(1)",     False, "Selection"),
    "shellsort":     (_shellsort_fn,     "O(n log n)", "O(n²)",       "O(1)",     False, "Insertion"),
    "countingsort":  (_countingsort_fn,  "O(n+k)",     "O(n+k)",      "O(k)",     True,  "Non-comparison"),
    "radixsort":     (_radixsort_fn,     "O(nk)",      "O(nk)",       "O(n+k)",   True,  "Non-comparison"),
    "cocktailsort":  (_cocktailsort_fn,  "O(n²)",      "O(n²)",       "O(1)",     True,  "Exchange"),
    "gnomesort":     (_gnomesort_fn,     "O(n²)",      "O(n²)",       "O(1)",     True,  "Exchange"),
    "timsort":       (_timsort_fn,       "O(n log n)", "O(n log n)",  "O(n)",     True,  "Hybrid"),
}


def run_sort(name: str, arr: list[int], track: bool = False) -> dict[str, Any]:
    if name not in SORTING_REGISTRY:
        raise ValueError(f"Unknown algorithm: {name}")
    fn, avg, worst, space, stable, cat = SORTING_REGISTRY[name]
    result = _run(arr, fn, track)
    result.update({
        "algorithm": name, "avg_complexity": avg, "worst_complexity": worst,
        "space_complexity": space, "stable": stable, "category": cat,
    })
    return result


def generate_dataset(size: int, pattern: str = "random") -> list[int]:
    if pattern == "random":
        return random.sample(range(size * 10), size)
    elif pattern == "sorted":
        return list(range(size))
    elif pattern == "reverse":
        return list(range(size, 0, -1))
    elif pattern == "nearly_sorted":
        arr = list(range(size))
        for _ in range(max(1, size // 20)):
            i, j = random.randint(0, size - 1), random.randint(0, size - 1)
            arr[i], arr[j] = arr[j], arr[i]
        return arr
    elif pattern == "duplicates":
        return [random.randint(0, size // 5) for _ in range(size)]
    elif pattern == "pipe_organ":
        return list(range(size // 2)) + list(range(size // 2, 0, -1))
    else:
        return generate_dataset(size, "random")

// ── Algorithm colors ──────────────────────────────────────────────────────────
export const ALGO_COLORS: Record<string, string> = {
  quicksort: "#6366f1", mergesort: "#8b5cf6", heapsort: "#10b981",
  bubblesort: "#f59e0b", insertionsort: "#ef4444", selectionsort: "#06b6d4",
  shellsort: "#ec4899", countingsort: "#14b8a6", radixsort: "#f97316",
  cocktailsort: "#a78bfa", gnomesort: "#34d399", timsort: "#60a5fa",
};

export const PATTERNS = ["random","sorted","reverse","nearly_sorted","duplicates","pipe_organ"] as const;
export const DEFAULT_SIZES = [100, 500, 1000, 2000, 5000];

// ── Sorting types ─────────────────────────────────────────────────────────────
export interface SortStep { array: number[]; action: string; highlighted: number[]; }
export interface SortResult {
  sorted: number[]; time_ms: number; memory_kb: number;
  comparisons: number; swaps: number; steps: SortStep[];
  algorithm: string; avg_complexity: string; worst_complexity: string;
  space_complexity: string; stable: boolean; category: string; cached?: boolean;
}

export interface BenchmarkPoint { size: number; time_ms: number; comparisons: number; memory_kb: number; }
export interface BenchmarkResult { run_id: number; pattern: string; sizes: number[]; results: Record<string, BenchmarkPoint[]>; }

export interface CompareEntry {
  algorithm: string; time_ms: number; comparisons: number;
  swaps: number; memory_kb: number; complexity: string; space: string; rank: number;
}
export interface CompareResult { input_size: number; pattern: string; winner: string; results: CompareEntry[]; }

export interface AlgorithmMeta {
  key: string; avg: string; worst: string; space: string; stable: boolean; category: string;
}
export interface AlgorithmRegistry {
  sorting: AlgorithmMeta[];
  graph: string[]; dynamic_programming: string[];
  backtracking: string[]; string: string[]; mathematical: string[];
  total: number;
}

export interface LeaderEntry {
  algorithm: string; avg_time_ms: number; best_time_ms: number;
  total_runs: number; avg_comparisons: number;
}

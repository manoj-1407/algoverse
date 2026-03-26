import axios from "axios";
import type { SortResult, BenchmarkResult, CompareResult, AlgorithmRegistry, LeaderEntry } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const http = axios.create({ baseURL: `${BASE}/api/v2`, timeout: 60000 });

export const api = {
  // Meta
  algorithms: () => http.get<AlgorithmRegistry>("/algorithms"),
  dataset: (size: number, pattern: string) => http.get(`/dataset?size=${size}&pattern=${pattern}`),

  // Sorting
  sort: (algorithm: string, data: number[], track_steps = false) =>
    http.post<SortResult>("/sort", { algorithm, data, track_steps }),
  sortBySize: (algorithm: string, size: number, pattern: string, track_steps = false) =>
    http.post<SortResult>("/sort", { algorithm, size, pattern, track_steps }),

  // Benchmark
  benchmark: (algorithms: string[], sizes: number[], pattern: string, runs_per_size = 3) =>
    http.post<BenchmarkResult>("/benchmark", { algorithms, sizes, pattern, runs_per_size }),
  compare: (algorithms: string[], size: number, pattern: string) =>
    http.post<CompareResult>("/compare", { algorithms, size, pattern }),
  leaderboard: () => http.get<LeaderEntry[]>("/leaderboard"),

  // Graph
  graph: (algorithm: string, graph: object, start?: string, end?: string) =>
    http.post("/graph", { algorithm, graph, start, end }),
  astar: (grid: number[][], start: number[], end: number[]) =>
    http.post("/graph/astar", { grid, start, end }),

  // DP
  dp: (algorithm: string, params: object) => http.post("/dp", { algorithm, params }),

  // Backtracking
  backtrack: (algorithm: string, params: object) => http.post("/backtrack", { algorithm, params }),

  // String
  string: (algorithm: string, text: string, pattern?: string) =>
    http.post("/string", { algorithm, text, pattern }),

  // Math
  math: (algorithm: string, params: object) => http.post("/math", { algorithm, params }),
};

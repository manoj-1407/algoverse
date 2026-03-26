import { useEffect, useState } from "react";
import { RefreshCw, Trophy, Play } from "lucide-react";
import { api } from "../utils/api";
import { ALGO_COLORS } from "../types";
import type { LeaderEntry } from "../types";
import GraphNetworkViz from "../components/visualizers/GraphNetworkViz";
import DPTableHeatmap from "../components/visualizers/DPTableHeatmap";
import { QueensBoard, MazeGrid, SudokuGrid } from "../components/visualizers/BoardViz";

// ── Leaderboard ───────────────────────────────────────────────────────────────
export function Leaderboard() {
  const [data, setData] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setData((await api.leaderboard()).data); } catch { setData([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const maxTime = Math.max(...data.map(d=>d.avg_time_ms), 0.001);

  return (
    <div className="p-6 max-w-4xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Global Leaderboard</h1>
          <p className="text-[#475569] text-sm">Aggregated rankings from PostgreSQL benchmark_results table. Cached in Redis (60s TTL).</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-xs"><RefreshCw size={13} className={loading?"animate-spin":""}/>Refresh</button>
      </div>
      {loading ? (
        <div className="card flex items-center justify-center h-64"><RefreshCw size={20} className="animate-spin text-indigo-400"/></div>
      ) : data.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 gap-3">
          <Trophy size={40} className="text-[#1a1a2e]"/>
          <p className="text-[#475569] font-mono text-sm">No benchmark data yet.</p>
          <p className="text-[#2a2a4e] text-xs">Run the Benchmark Engine and results will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((entry, i) => {
            const color = ALGO_COLORS[entry.algorithm] || "#888";
            return (
              <div key={entry.algorithm} className="card hover:border-[#2a2a4e] transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="text-2xl w-8 text-center font-bold">{["🥇","🥈","🥉"][i] || `${i+1}`}</div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow:`0 0 8px ${color}` }}/>
                  <div className="w-32 font-mono text-sm capitalize font-semibold" style={{ color }}>{entry.algorithm}</div>
                  <div className="flex-1 h-6 bg-[#020209] rounded-lg overflow-hidden border border-[#1a1a2e]">
                    <div className="h-full rounded-lg transition-all duration-700"
                      style={{ width:`${(entry.avg_time_ms/maxTime)*100}%`, background:color, opacity:0.65 }}/>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-right ml-4">
                    <div><div className="label text-[9px]">Avg Time</div><div className="font-mono text-sm text-emerald-400 font-semibold">{entry.avg_time_ms}ms</div></div>
                    <div><div className="label text-[9px]">Best Time</div><div className="font-mono text-sm text-blue-400 font-semibold">{entry.best_time_ms}ms</div></div>
                    <div><div className="label text-[9px]">Total Runs</div><div className="font-mono text-sm text-[#94a3b8]">{entry.total_runs}</div></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ── Graph Lab ─────────────────────────────────────────────────────────────────
const GRAPH_ALGOS = ["dijkstra","bfs","dfs","bellman_ford","prims_mst","topological_sort"];
const WEIGHTED_ALGOS = ["dijkstra","bellman_ford","prims_mst","floyd_warshall"];
const SAMPLE_GRAPHS: Record<string,object> = {
  dijkstra:         {"A":{"B":4,"C":2},"B":{"D":3,"E":1},"C":{"B":1,"D":5},"D":{},"E":{"D":2}},
  bfs:              {"A":["B","C"],"B":["D","E"],"C":["F"],"D":[],"E":[],"F":[]},
  dfs:              {"A":["B","C"],"B":["D","E"],"C":["F"],"D":[],"E":[],"F":[]},
  bellman_ford:     {"A":{"B":4,"C":2},"B":{"D":3},"C":{"B":-1,"D":5},"D":{}},
  prims_mst:        {"A":{"B":2,"C":3},"B":{"A":2,"C":1,"D":4},"C":{"A":3,"B":1,"D":5},"D":{"B":4,"C":5}},
  topological_sort: {"A":["C","D"],"B":["D","E"],"C":["F"],"D":["F"],"E":["F"],"F":[]},
};

export function GraphLab() {
  const [algo, setAlgo]       = useState("dijkstra");
  const [result, setResult]   = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [graphInput, setGraphInput] = useState(JSON.stringify(SAMPLE_GRAPHS.dijkstra, null, 2));
  const [animStep, setAnimStep] = useState(0);

  const isWeighted = WEIGHTED_ALGOS.includes(algo);

  const run = async () => {
    setLoading(true); setAnimStep(0);
    try {
      const graph = JSON.parse(graphInput);
      const res = await api.graph(algo, graph, "A", "D");
      setResult(res.data);
      // Animate visited order
      if (res.data.visited_order?.length) {
        let i = 0;
        const t = setInterval(() => {
          setAnimStep(i++);
          if (i >= res.data.visited_order.length) clearInterval(t);
        }, 250);
      }
    } catch (e: any) {
      setResult({ error: e.response?.data?.detail || e.message });
    } finally { setLoading(false); }
  };

  const graph = (() => { try { return JSON.parse(graphInput); } catch { return {}; } })();

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Graph Lab</h1>
        <p className="text-[#475569] text-sm">Dijkstra · A* · BFS · DFS · Bellman-Ford · Floyd-Warshall · Prim's MST · Topological Sort — with live D3 network visualization.</p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <div className="space-y-4">
          <div className="card">
            <div className="label mb-3">Algorithm</div>
            {GRAPH_ALGOS.map(a => (
              <button key={a} onClick={() => { setAlgo(a); setGraphInput(JSON.stringify(SAMPLE_GRAPHS[a] || SAMPLE_GRAPHS.dijkstra, null, 2)); setResult(null); }}
                className={`chip w-full text-left mb-1.5 text-[11px] ${a===algo?"chip-on":"chip-off"}`}>
                {a.replace(/_/g," ")}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="label mb-3">Graph (JSON)</div>
            <textarea className="input font-mono text-[10px] h-44 resize-none" value={graphInput} onChange={e => setGraphInput(e.target.value)}/>
            <p className="text-[9px] text-[#475569] mt-1">Weighted: {"{"}"A":{"{"}B":4{"}"}{"}"}. Unweighted: {"{"}"A":["B","C"]{"}"}</p>
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={13} className="animate-spin"/>Running</> : <><Play size={13}/>Run</>}
          </button>
          {result && !result.error && (
            <div className="card space-y-2">
              {result.time_ms !== undefined && <div><span className="label text-[9px]">Time </span><span className="font-mono text-xs text-emerald-400">{result.time_ms}ms</span></div>}
              {result.comparisons !== undefined && <div><span className="label text-[9px]">Comparisons </span><span className="font-mono text-xs text-amber-400">{result.comparisons}</span></div>}
              {result.path?.length > 0 && <div><span className="label text-[9px]">Path </span><span className="font-mono text-[10px] text-indigo-300">{result.path.join(" → ")}</span></div>}
              {result.total_weight && <div><span className="label text-[9px]">MST Weight </span><span className="font-mono text-xs text-violet-400">{result.total_weight}</span></div>}
              {result.complexity && (
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px]">time: {result.complexity.time}</span>
                  <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[9px]">space: {result.complexity.space}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Graph visualization */}
        <div className="col-span-3 space-y-4">
          <GraphNetworkViz
            graph={graph}
            visitedOrder={result?.visited_order || result?.order || []}
            path={result?.path || []}
            mstEdges={result?.edges || []}
            weighted={isWeighted}
            animStep={animStep}
          />
          {result?.error && (
            <div className="card"><p className="text-red-400 text-xs font-mono">{result.error}</p></div>
          )}
          {result && !result.error && result.distances && (
            <div className="card">
              <div className="label mb-3">Shortest Distances from A</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.distances).map(([node, dist]) => (
                  <div key={node} className="bg-[#020209] rounded-lg px-3 py-2 border border-[#1a1a2e] text-center">
                    <div className="font-mono text-sm font-bold text-indigo-300">{node}</div>
                    <div className="font-mono text-xs text-emerald-400">{dist === -1 ? "∞" : String(dist)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── DP Lab ────────────────────────────────────────────────────────────────────
const DP_CONFIGS: Record<string,{desc:string;params:object}> = {
  fibonacci:    { desc: "Bottom-up vs memoized Fibonacci comparison", params: { n: 15 } },
  lcs:          { desc: "Longest Common Subsequence — full DP table", params: { s1:"ABCBDAB", s2:"BDCAB" } },
  edit_distance:{ desc: "Levenshtein Edit Distance with operations", params: { s1:"kitten", s2:"sitting" } },
  knapsack:     { desc: "0/1 Knapsack with item backtracking", params: { weights:[1,3,4,5], values:[1,4,5,7], capacity:7 } },
  coin_change:  { desc: "Minimum coins with reconstruction", params: { coins:[1,5,6,9], amount:11 } },
  lis:          { desc: "Longest Increasing Subsequence", params: { array:[10,9,2,5,3,7,101,18] } },
  matrix_chain: { desc: "Optimal matrix multiplication order", params: { dims:[40,20,30,10,30] } },
};

export function DPLab() {
  const [algo, setAlgo]     = useState("lcs");
  const [params, setParams] = useState(JSON.stringify(DP_CONFIGS.lcs.params, null, 2));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try { setResult((await api.dp(algo, JSON.parse(params))).data); }
    catch (e: any) { setResult({ error: e.response?.data?.detail || e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Dynamic Programming Lab</h1>
        <p className="text-[#475569] text-sm">7 DP algorithms with full table visualization. Heatmap shows value magnitude — darker = smaller, brighter = larger.</p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <div className="space-y-4">
          <div className="card">
            <div className="label mb-3">Algorithm</div>
            {Object.entries(DP_CONFIGS).map(([key,{desc}]) => (
              <button key={key} onClick={() => { setAlgo(key); setParams(JSON.stringify(DP_CONFIGS[key].params, null, 2)); setResult(null); }}
                className={`chip w-full text-left mb-1.5 ${key===algo?"chip-on":"chip-off"}`}>
                <div className="font-mono text-[11px]">{key.replace(/_/g," ")}</div>
                <div className="text-[9px] opacity-50 mt-0.5 leading-tight">{desc}</div>
              </button>
            ))}
          </div>
          <div className="card">
            <div className="label mb-2">Parameters (JSON)</div>
            <textarea className="input font-mono text-[10px] h-36 resize-none" value={params} onChange={e => setParams(e.target.value)}/>
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={13} className="animate-spin"/>Running</> : <><Play size={13}/>Run</>}
          </button>
          {result?.complexity && (
            <div className="card space-y-2">
              <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] block">time: {result.complexity.time}</span>
              <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[9px] block">space: {result.complexity.space}</span>
            </div>
          )}
        </div>

        <div className="col-span-3 space-y-4">
          {result?.error && <div className="card"><p className="text-red-400 text-xs font-mono">{result.error}</p></div>}

          {result && !result.error && (
            <>
              {/* Key result badge */}
              <div className="card flex flex-wrap gap-3 items-center">
                {result.length    !== undefined && <div><span className="label text-[9px]">Length </span><span className="font-mono text-2xl font-black text-indigo-300">{result.length}</span></div>}
                {result.lcs       !== undefined && <div><span className="label text-[9px]">LCS </span><span className="font-mono text-sm text-emerald-400">"{result.lcs}"</span></div>}
                {result.distance  !== undefined && <div><span className="label text-[9px]">Distance </span><span className="font-mono text-2xl font-black text-indigo-300">{result.distance}</span></div>}
                {result.max_value !== undefined && <div><span className="label text-[9px]">Max Value </span><span className="font-mono text-2xl font-black text-indigo-300">{result.max_value}</span></div>}
                {result.min_coins !== undefined && <div><span className="label text-[9px]">Min Coins </span><span className="font-mono text-2xl font-black text-indigo-300">{result.min_coins}</span>{result.coins_used && <span className="font-mono text-sm text-[#94a3b8] ml-2">[{result.coins_used.join(", ")}]</span>}</div>}
                {result.min_operations !== undefined && <div><span className="label text-[9px]">Min Ops </span><span className="font-mono text-2xl font-black text-indigo-300">{result.min_operations}</span></div>}
                {result.optimal_parenthesization && <div className="font-mono text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">{result.optimal_parenthesization}</div>}
                {result.sequence?.length > 0 && <div><span className="label text-[9px]">Sequence </span><span className="font-mono text-sm text-emerald-400">[{result.sequence.join(", ")}]</span></div>}
                {result.selected_items?.length > 0 && <div><span className="label text-[9px]">Items </span><span className="font-mono text-sm text-amber-400">#{result.selected_items.join(", #")}</span></div>}
              </div>

              {/* DP table heatmap */}
              {result.table && (
                <div className="card overflow-auto">
                  <DPTableHeatmap
                    table={result.table}
                    rowLabels={result.s1 ? ["", ...result.s1.split("")] : undefined}
                    colLabels={result.s2 ? ["", ...result.s2.split("")] : undefined}
                    title={`DP Table — ${algo.replace(/_/g," ")}`}
                    maxDisplay={14}
                  />
                </div>
              )}

              {/* Fibonacci method comparison */}
              {result.methods && (
                <div className="card">
                  <div className="label mb-3">Method comparison for n={result.n} → answer: {result.answer}</div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.methods).map(([method, data]: [string, any]) => (
                      <div key={method} className="bg-[#020209] rounded-xl p-3 border border-[#1a1a2e]">
                        <div className="font-mono text-xs font-semibold text-indigo-300 mb-1">{method}</div>
                        <div className="font-mono text-xs text-emerald-400">{data.time_ms}ms · {data.memory_kb}KB</div>
                        {data.table && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {data.table.map((v: number, i: number) => (
                              <span key={i} className="font-mono text-[9px] text-[#475569]">{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!result && (
            <div className="card flex items-center justify-center" style={{ minHeight: 300 }}>
              <div className="text-center"><Brain size={40} className="text-[#1a1a2e] mx-auto mb-3" /><div className="font-mono text-sm text-[#2a2a4e]">Select algorithm and Run →</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Brain({ size, className }: { size: number; className: string }) {
  return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>;
}


// ── Backtracking Lab ──────────────────────────────────────────────────────────
const BT_CONFIGS: Record<string,{desc:string;params:object}> = {
  n_queens: { desc: "N queens on N×N board, no conflicts", params: { n: 8 } },
  sudoku:   { desc: "Solve 9×9 sudoku (0 = empty cell)", params: { board: [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]] } },
  maze:     { desc: "DFS pathfinder through 0/1 maze", params: { maze:[[0,0,0,0,0],[1,1,0,1,0],[0,0,0,1,0],[0,1,1,0,0],[0,0,0,0,0]], start:[0,0], end:[4,4] } },
};

export function BacktrackLab() {
  const [algo, setAlgo]     = useState("n_queens");
  const [params, setParams] = useState(JSON.stringify(BT_CONFIGS.n_queens.params, null, 2));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [solutionIdx, setSolIdx] = useState(0);

  const run = async () => {
    setLoading(true); setSolIdx(0);
    try { setResult((await api.backtrack(algo, JSON.parse(params))).data); }
    catch (e: any) { setResult({ error: e.response?.data?.detail || e.message }); }
    finally { setLoading(false); }
  };

  const parsedParams = (() => { try { return JSON.parse(params); } catch { return {}; } })();

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Backtracking Lab</h1>
        <p className="text-[#475569] text-sm">N-Queens with chess board · Sudoku with 9×9 grid · Maze with visual pathfinding grid.</p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <div className="space-y-4">
          <div className="card">
            <div className="label mb-3">Problem</div>
            {Object.entries(BT_CONFIGS).map(([key,{desc}]) => (
              <button key={key} onClick={() => { setAlgo(key); setParams(JSON.stringify(BT_CONFIGS[key].params, null, 2)); setResult(null); }}
                className={`chip w-full text-left mb-1.5 ${key===algo?"chip-on":"chip-off"}`}>
                <div className="font-mono text-[11px]">{key.replace(/_/g," ")}</div>
                <div className="text-[9px] opacity-50 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
          <div className="card">
            <div className="label mb-2">Parameters (JSON)</div>
            <textarea className="input font-mono text-[10px] h-44 resize-none" value={params} onChange={e => setParams(e.target.value)}/>
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={13} className="animate-spin"/>Solving</> : <><Play size={13}/>Solve</>}
          </button>
          {result && !result.error && (
            <div className="card space-y-1.5">
              {result.total_solutions !== undefined && <div><span className="label text-[9px]">Solutions </span><span className="font-mono text-lg font-black text-indigo-300">{result.total_solutions}</span></div>}
              {result.solved !== undefined && <div className="badge" style={{ background: result.solved?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", color: result.solved?"#10b981":"#ef4444", border:`1px solid ${result.solved?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"}`}}>{result.solved ? "✓ Solved" : "✗ No solution"}</div>}
              {result.path_length && <div><span className="label text-[9px]">Path length </span><span className="font-mono text-sm text-emerald-400">{result.path_length}</span></div>}
              <div><span className="label text-[9px]">Time </span><span className="font-mono text-xs text-[#94a3b8]">{result.time_ms}ms</span></div>
            </div>
          )}
        </div>

        {/* Visual output */}
        <div className="col-span-3 space-y-4">
          {result?.error && <div className="card"><p className="text-red-400 text-xs font-mono">{result.error}</p></div>}

          {result && !result.error && algo === "n_queens" && result.solutions?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="label">Solution {solutionIdx + 1} of {Math.min(result.solutions.length, 10)}</div>
                <div className="flex gap-2">
                  <button onClick={() => setSolIdx(i => Math.max(0, i-1))} disabled={solutionIdx===0} className="btn-ghost p-1.5 text-xs">←</button>
                  <button onClick={() => setSolIdx(i => Math.min(result.solutions.length-1, i+1))} disabled={solutionIdx>=result.solutions.length-1} className="btn-ghost p-1.5 text-xs">→</button>
                </div>
              </div>
              <div className="flex justify-center">
                <QueensBoard solution={result.solutions[solutionIdx]} n={result.n} />
              </div>
              <p className="text-center text-[11px] text-[#475569] mt-3 font-mono">
                Queen positions: [{result.solutions[solutionIdx].join(", ")}] (column per row)
              </p>
            </div>
          )}

          {result && !result.error && algo === "sudoku" && result.board && (
            <div className="card">
              <div className="label mb-4">Solved Board</div>
              <div className="flex justify-center">
                <SudokuGrid board={result.board} />
              </div>
              <p className="text-center text-[11px] text-[#475569] mt-3">{result.steps} backtracks · {result.time_ms}ms</p>
            </div>
          )}

          {result && !result.error && algo === "maze" && (
            <div className="card">
              <div className="label mb-4">Maze Solution — {result.solved ? `path length: ${result.path_length}` : "No solution found"}</div>
              <div className="flex justify-center">
                <MazeGrid
                  maze={parsedParams.maze || []}
                  path={result.path || []}
                  start={parsedParams.start || [0,0]}
                  end={parsedParams.end}
                />
              </div>
              {result.path?.length > 0 && (
                <p className="text-center text-[11px] text-[#475569] mt-3 font-mono">
                  {result.path.map((p: number[]) => `[${p}]`).join(" → ")}
                </p>
              )}
            </div>
          )}

          {!result && (
            <div className="card flex items-center justify-center" style={{ minHeight: 300 }}>
              <div className="text-center text-[#2a2a4e] font-mono text-sm">Select a problem and Solve →</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── String Lab ────────────────────────────────────────────────────────────────
export function StringLab() {
  const [algo, setAlgo]   = useState("kmp");
  const [text, setText]   = useState("AABAACAADAABAABA");
  const [pattern, setPat] = useState("AABA");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try { setResult((await api.string(algo, text, pattern)).data); }
    catch (e: any) { setResult({ error: e.response?.data?.detail || e.message }); }
    finally { setLoading(false); }
  };

  const matchSet = new Set<number>(result?.matches || []);

  return (
    <div className="p-6 max-w-5xl mx-auto fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">String Lab</h1>
        <p className="text-[#475569] text-sm">KMP with LPS table · Rabin-Karp with rolling hash. Matches highlighted inline.</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="space-y-4">
          <div className="card">
            <div className="label mb-3">Algorithm</div>
            {["kmp","rabin_karp"].map(a => (
              <button key={a} onClick={() => setAlgo(a)} className={`chip w-full text-left mb-1.5 ${a===algo?"chip-on":"chip-off"}`}>{a.replace(/_/g," ")}</button>
            ))}
          </div>
          <div className="card space-y-3">
            <div>
              <div className="label mb-1.5">Text</div>
              <input className="input font-mono text-xs" value={text} onChange={e => setText(e.target.value)} placeholder="Search text..."/>
            </div>
            <div>
              <div className="label mb-1.5">Pattern</div>
              <input className="input font-mono text-xs" value={pattern} onChange={e => setPat(e.target.value)} placeholder="Pattern..."/>
            </div>
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={13} className="animate-spin"/>Searching</> : <><Play size={13}/>Search</>}
          </button>
          {result && !result.error && (
            <div className="card space-y-2">
              <div><span className="label text-[9px]">Matches </span><span className="font-mono text-xl font-black text-indigo-300">{result.count}</span></div>
              <div><span className="label text-[9px]">Comparisons </span><span className="font-mono text-sm text-amber-400">{result.comparisons}</span></div>
              <div><span className="label text-[9px]">Time </span><span className="font-mono text-xs text-emerald-400">{result.time_ms}ms</span></div>
              <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px]">time: {result.complexity?.time}</span>
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          {result && !result.error && (
            <>
              <div className="card">
                <div className="label mb-3">Text with matches highlighted</div>
                <div className="font-mono text-sm leading-relaxed break-all bg-[#020209] rounded-xl p-4 border border-[#1a1a2e]">
                  {text.split("").map((ch, i) => {
                    const isMatchStart = matchSet.has(i);
                    const isInMatch = Array.from(matchSet).some(m => i >= m && i < m + pattern.length);
                    return (
                      <span key={i} className="transition-colors duration-200"
                        style={{
                          background: isInMatch ? "rgba(99,102,241,0.25)" : "transparent",
                          color: isMatchStart ? "#818cf8" : isInMatch ? "#c4b5fd" : "#475569",
                          borderBottom: isMatchStart ? "2px solid #6366f1" : undefined,
                          borderRadius: isMatchStart ? "2px 0 0 0" : undefined,
                        }}>
                        {ch}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.matches.map((m: number) => (
                    <span key={m} className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">idx {m}</span>
                  ))}
                </div>
              </div>

              {result.lps_table && (
                <div className="card">
                  <div className="label mb-3">KMP — LPS (Failure Function) Table</div>
                  <div className="overflow-x-auto">
                    <table className="text-xs font-mono">
                      <thead>
                        <tr>
                          <th className="text-[#475569] font-normal pr-2">i</th>
                          {pattern.split("").map((ch, i) => <th key={i} className="w-8 text-center text-[#475569] font-normal pb-1">{i}</th>)}
                        </tr>
                        <tr>
                          <th className="text-[#475569] font-normal pr-2">ch</th>
                          {pattern.split("").map((ch, i) => <th key={i} className="w-8 text-center text-indigo-300 pb-1">{ch}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-[#475569] pr-2">lps</td>
                          {result.lps_table.map((v: number, i: number) => (
                            <td key={i} className="w-8 h-8 text-center border border-[#1a1a2e] rounded"
                              style={{ background: v > 0 ? `rgba(99,102,241,${v/pattern.length * 0.5 + 0.1})` : "#0a0a14", color: v > 0 ? "#c4b5fd" : "#475569" }}>
                              {v}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
          {!result && (
            <div className="card flex items-center justify-center" style={{ minHeight: 200 }}>
              <div className="text-[#2a2a4e] font-mono text-sm">Run to see highlighted matches →</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Math Lab ──────────────────────────────────────────────────────────────────
const MATH_CONFIGS: Record<string,{desc:string;params:object}> = {
  sieve:    { desc: "Primes up to N — Sieve of Eratosthenes", params: { limit: 100 } },
  huffman:  { desc: "Optimal prefix-free compression codes",  params: { text: "hello world this is huffman coding" } },
  gcd_lcm:  { desc: "Euclidean GCD & LCM with step table",    params: { a: 48, b: 18 } },
  fast_exp: { desc: "Fast exponentiation by squaring",        params: { base: 2, exp: 10, mod: 1000000007 } },
};

export function MathLab() {
  const [algo, setAlgo]     = useState("sieve");
  const [params, setParams] = useState(JSON.stringify(MATH_CONFIGS.sieve.params, null, 2));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try { setResult((await api.math(algo, JSON.parse(params))).data); }
    catch (e: any) { setResult({ error: e.response?.data?.detail || e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Math Lab</h1>
        <p className="text-[#475569] text-sm">Sieve of Eratosthenes · Huffman Coding · Euclidean GCD/LCM · Fast Exponentiation</p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <div className="space-y-4">
          <div className="card">
            <div className="label mb-3">Algorithm</div>
            {Object.entries(MATH_CONFIGS).map(([key,{desc}]) => (
              <button key={key} onClick={() => { setAlgo(key); setParams(JSON.stringify(MATH_CONFIGS[key].params, null, 2)); setResult(null); }}
                className={`chip w-full text-left mb-1.5 ${key===algo?"chip-on":"chip-off"}`}>
                <div className="font-mono text-[11px]">{key.replace(/_/g," ")}</div>
                <div className="text-[9px] opacity-50 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
          <div className="card">
            <div className="label mb-2">Parameters</div>
            <textarea className="input font-mono text-[10px] h-32 resize-none" value={params} onChange={e => setParams(e.target.value)}/>
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={13} className="animate-spin"/>Computing</> : <><Play size={13}/>Compute</>}
          </button>
          {result?.complexity && (
            <div className="card space-y-1.5">
              <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] block">time: {result.complexity.time}</span>
              <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[9px] block">space: {result.complexity.space}</span>
            </div>
          )}
        </div>

        <div className="col-span-3 space-y-4">
          {result?.error && <div className="card"><p className="text-red-400 text-xs font-mono">{result.error}</p></div>}

          {/* Sieve visual */}
          {result && algo === "sieve" && result.primes && (
            <div className="card">
              <div className="label mb-3">{result.count} primes up to {result.limit}</div>
              <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                {result.primes.map((p: number) => (
                  <span key={p} className="font-mono text-[11px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 rounded px-1.5 py-0.5">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Huffman tree codes */}
          {result && algo === "huffman" && result.codes && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="badge bg-green-500/10 text-green-400 border border-green-500/20">Ratio: {result.compression_ratio}</div>
                <div className="text-xs text-[#475569]">{result.original_bits} bits → {result.encoded_bits} bits</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(result.codes).sort(([,a],[,b]) => (a as string).length - (b as string).length).map(([ch, code]) => (
                  <div key={ch} className="flex items-center gap-3 bg-[#020209] rounded-lg px-3 py-2 border border-[#1a1a2e]">
                    <span className="font-mono text-sm text-indigo-300 w-6 text-center font-bold">'{ch === " " ? "·" : ch}'</span>
                    <span className="font-mono text-[10px] text-[#94a3b8]">{code as string}</span>
                    <span className="ml-auto font-mono text-[9px] text-[#475569]">{result.frequency[ch]}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GCD steps table */}
          {result && algo === "gcd_lcm" && (
            <div className="card">
              <div className="flex gap-4 mb-4">
                <div><span className="label text-[9px]">GCD({result.a}, {result.b}) = </span><span className="font-mono text-2xl font-black text-indigo-300">{result.gcd}</span></div>
                <div><span className="label text-[9px]">LCM = </span><span className="font-mono text-2xl font-black text-violet-300">{result.lcm}</span></div>
              </div>
              <div className="label mb-2">Euclidean steps</div>
              <table className="text-xs font-mono">
                <thead><tr className="border-b border-[#1a1a2e]">
                  <th className="text-left pb-2 text-[#475569] pr-6">a</th>
                  <th className="text-left pb-2 text-[#475569] pr-6">b</th>
                  <th className="text-left pb-2 text-[#475569]">remainder</th>
                </tr></thead>
                <tbody>
                  {result.steps?.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-[#1a1a2e]/40">
                      <td className="py-1.5 pr-6 text-[#94a3b8]">{s.a}</td>
                      <td className="py-1.5 pr-6 text-[#94a3b8]">{s.b}</td>
                      <td className="py-1.5 text-amber-400">{s.remainder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Fast exp steps */}
          {result && algo === "fast_exp" && (
            <div className="card">
              <div className="mb-4">
                <span className="label text-[9px]">{result.base}^{result.exponent} mod {result.mod} = </span>
                <span className="font-mono text-2xl font-black text-indigo-300">{result.result}</span>
              </div>
              <div className="label mb-2">Binary exponentiation steps</div>
              <table className="text-xs font-mono">
                <thead><tr className="border-b border-[#1a1a2e]">
                  <th className="text-left pb-2 text-[#475569] pr-6">exp bit</th>
                  <th className="text-left pb-2 text-[#475569] pr-6">base²</th>
                  <th className="text-left pb-2 text-[#475569]">result</th>
                </tr></thead>
                <tbody>
                  {result.steps?.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-[#1a1a2e]/40">
                      <td className="py-1.5 pr-6 text-emerald-400">{s.exp_bit}</td>
                      <td className="py-1.5 pr-6 text-[#94a3b8]">{s.base}</td>
                      <td className="py-1.5 text-indigo-300">{s.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!result && (
            <div className="card flex items-center justify-center" style={{ minHeight: 250 }}>
              <div className="text-[#2a2a4e] font-mono text-sm">Select and Compute →</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

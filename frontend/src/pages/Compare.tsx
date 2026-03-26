import { useState } from "react";
import { Play, RefreshCw, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { ALGO_COLORS } from "../types";
import type { CompareResult } from "../types";
import ComplexityRadar from "../components/charts/ComplexityRadar";

const ALL_ALGOS   = ["quicksort","mergesort","heapsort","bubblesort","insertionsort","selectionsort","shellsort","timsort"];
const ALL_PATTERNS = ["random","sorted","reverse","nearly_sorted","duplicates"];
const SIZES       = [100, 500, 1000, 5000, 10000];
const MEDALS      = ["🥇","🥈","🥉","4th","5th","6th","7th","8th"];

export function Compare() {
  const [algos, setAlgos]   = useState(["quicksort","mergesort","heapsort","bubblesort"]);
  const [pat, setPat]       = useState("random");
  const [size, setSize]     = useState(1000);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (a: string) => setAlgos(p => p.includes(a) ? (p.length>2 ? p.filter(x=>x!==a) : p) : [...p,a]);
  const run = async () => { setLoading(true); try { setResult((await api.compare(algos,size,pat)).data); } finally { setLoading(false); } };
  const maxTime  = result ? Math.max(...result.results.map(r=>r.time_ms), 0.001) : 1;
  const maxComps = result ? Math.max(...result.results.map(r=>r.comparisons), 1) : 1;

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Head-to-Head Compare</h1>
        <p className="text-[#475569] text-sm">Same dataset, every algorithm. Fair fight — ranked by execution time.</p>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Config */}
        <div className="col-span-1 space-y-4">
          <div className="card">
            <div className="label mb-3">Competitors</div>
            {ALL_ALGOS.map(a => (
              <button key={a} onClick={() => toggle(a)} className={`chip w-full text-left flex items-center gap-2 mb-1.5 ${algos.includes(a)?"chip-on":"chip-off"}`}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: ALGO_COLORS[a] }} />
                <span className="text-[11px]">{a}</span>
                {algos.includes(a) && <span className="ml-auto text-[9px] text-indigo-400">✓</span>}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="label mb-3">Pattern</div>
            {ALL_PATTERNS.map(p => <button key={p} onClick={() => setPat(p)} className={`chip w-full text-left mb-1.5 text-[11px] ${p===pat?"chip-on":"chip-off"}`}>{p.replace(/_/g," ")}</button>)}
          </div>
          <div className="card">
            <div className="label mb-3">Input Size</div>
            {SIZES.map(s => <button key={s} onClick={() => setSize(s)} className={`chip w-full text-center mb-1.5 text-[11px] ${s===size?"chip-on":"chip-off"}`}>{s.toLocaleString()}</button>)}
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={13} className="animate-spin"/>Racing</> : <><Play size={13}/>Race!</>}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-4 space-y-4">
          {result ? (
            <>
              {/* Winner */}
              <motion-div>
                <div className="card flex items-center gap-4" style={{ borderColor:`${ALGO_COLORS[result.winner]||"#6366f1"}35`, background:`${ALGO_COLORS[result.winner]||"#6366f1"}05` }}>
                  <div className="text-5xl">🥇</div>
                  <div>
                    <div className="label mb-0.5">Winner · n={result.input_size.toLocaleString()} · {result.pattern}</div>
                    <div className="font-display text-2xl font-bold capitalize" style={{ color: ALGO_COLORS[result.winner]||"#6366f1" }}>{result.winner}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-display text-3xl font-black text-white">{result.results[0]?.time_ms}ms</div>
                    <div className="label text-[9px]">execution time</div>
                  </div>
                </div>
              </motion-div>

              {/* Time + Comparisons bars */}
              <div className="grid grid-cols-2 gap-4">
                {([["Execution Time","time_ms","ms"], ["Comparisons","comparisons",""]] as const).map(([label, key, unit]) => (
                  <div key={key} className="card">
                    <div className="label mb-3">{label}</div>
                    {result.results.map((r,i) => {
                      const val = key === "time_ms" ? r.time_ms : r.comparisons;
                      const max = key === "time_ms" ? maxTime : maxComps;
                      return (
                        <div key={r.algorithm} className="flex items-center gap-2 mb-2">
                          <span className="text-sm w-5">{MEDALS[i]}</span>
                          <span className="font-mono text-[10px] w-24 capitalize" style={{ color: ALGO_COLORS[r.algorithm] }}>{r.algorithm}</span>
                          <div className="flex-1 h-5 bg-[#020209] rounded overflow-hidden border border-[#1a1a2e]">
                            <div className="h-full rounded transition-all duration-700" style={{ width:`${(Number(val)/max)*100}%`, background:ALGO_COLORS[r.algorithm], opacity:0.75 }}/>
                          </div>
                          <span className="font-mono text-[10px] w-20 text-right" style={{ color:ALGO_COLORS[r.algorithm] }}>
                            {typeof val === "number" ? val.toLocaleString() : val}{unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Radar */}
              <ComplexityRadar algorithms={algos} />

              {/* Full table */}
              <div className="card overflow-x-auto">
                <div className="label mb-3">Full Statistics</div>
                <table className="w-full text-xs font-mono">
                  <thead><tr className="border-b border-[#1a1a2e]">
                    {["Rank","Algorithm","Time","Comparisons","Swaps","Memory","Avg O","Space"].map(h => <th key={h} className="text-left pb-2 text-[#475569] pr-4">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {result.results.map(r => (
                      <tr key={r.algorithm} className="border-b border-[#1a1a2e]/40 hover:bg-[#0f0f1e] transition-colors">
                        <td className="py-2 pr-4 text-base">{MEDALS[r.rank-1]}</td>
                        <td className="py-2 pr-4 capitalize font-semibold" style={{ color:ALGO_COLORS[r.algorithm] }}>{r.algorithm}</td>
                        <td className="py-2 pr-4 text-emerald-400">{r.time_ms}ms</td>
                        <td className="py-2 pr-4 text-[#94a3b8]">{r.comparisons.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-[#94a3b8]">{r.swaps.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-[#94a3b8]">{r.memory_kb}KB</td>
                        <td className="py-2 pr-4 text-amber-400">{r.complexity}</td>
                        <td className="py-2 pr-4 text-blue-400">{r.space}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="card flex items-center justify-center" style={{ minHeight:320 }}>
              <div className="text-center"><Trophy size={40} className="text-[#1a1a2e] mx-auto mb-3"/><div className="font-mono text-sm text-[#2a2a4e]">Select competitors and Race!</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

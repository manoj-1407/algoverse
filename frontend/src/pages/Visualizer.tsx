import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Shuffle, Volume2, VolumeX, Keyboard, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../utils/api";
import { playTone, playSuccess } from "../utils/sound";
import { ALGO_COLORS } from "../types";
import type { SortResult } from "../types";
import { useAppStore } from "../stores/app";
import AlgoInfoPanel from "../components/ui/AlgoInfoPanel";
import ComplexityRadar from "../components/charts/ComplexityRadar";

const ALGOS    = ["quicksort","mergesort","heapsort","bubblesort","insertionsort","selectionsort","shellsort","countingsort","radixsort","cocktailsort","gnomesort","timsort"];
const PATTERNS = ["random","sorted","reverse","nearly_sorted","duplicates","pipe_organ"];
const SIZES    = [20, 40, 60, 100];

export default function Visualizer() {
  const [algo, setAlgo]         = useState("quicksort");
  const [pattern, setPat]       = useState("random");
  const [size, setSize]         = useState(50);
  const [data, setData]         = useState<number[]>([]);
  const [result, setResult]     = useState<SortResult | null>(null);
  const [step, setStep]         = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [speed, setSpeed]       = useState(70);
  const [loading, setLoading]   = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch]     = useState("");
  const timer = useRef<ReturnType<typeof setInterval>>();
  const { soundEnabled, setSoundEnabled } = useAppStore();

  const filteredAlgos = ALGOS.filter(a => a.includes(search.toLowerCase()));

  const fetchData = useCallback(async () => {
    try {
      const r = await api.dataset(size, pattern);
      setData(r.data.data);
    } catch {
      setData(Array.from({ length: size }, () => Math.floor(Math.random() * size * 10)));
    }
    setResult(null); setStep(0); setPlaying(false);
  }, [size, pattern]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runSort = async () => {
    if (!data.length) return;
    clearInterval(timer.current);
    setLoading(true); setPlaying(false);
    try {
      const r = await api.sort(algo, data, true);
      setResult(r.data); setStep(0);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ": e.preventDefault(); setPlaying(p => !p); break;
        case "ArrowRight": setStep(s => Math.min(s + 1, (result?.steps?.length ?? 1) - 1)); break;
        case "ArrowLeft":  setStep(s => Math.max(0, s - 1)); break;
        case "r": case "R": fetchData(); break;
        case "Enter": runSort(); break;
        case "Escape": setSearch(""); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [result, fetchData]);

  useEffect(() => {
    if (playing && result?.steps?.length) {
      timer.current = setInterval(() => {
        setStep(s => {
          if (s >= result.steps.length - 1) {
            setPlaying(false); clearInterval(timer.current);
            if (soundEnabled) playSuccess();
            return s;
          }
          const ns = s + 1;
          if (soundEnabled && result.steps[ns]?.highlighted?.length) {
            const maxVal = Math.max(...result.sorted);
            const val = result.steps[ns].array[result.steps[ns].highlighted[0]] ?? 0;
            playTone(val, maxVal, result.steps[ns].action);
          }
          return ns;
        });
      }, Math.max(6, 220 - speed * 2.1));
    } else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [playing, result, speed, soundEnabled]);

  const curArr  = result?.steps?.[step]?.array ?? data;
  const hiSet   = new Set(result?.steps?.[step]?.highlighted ?? []);
  const maxVal  = Math.max(...(curArr.length ? curArr : [1]));
  const color   = ALGO_COLORS[algo] || "#6366f1";
  const done    = result && step >= (result.steps?.length ?? 0) - 1;
  const progress = result?.steps?.length ? ((step + 1) / result.steps.length) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--c-text-1)" }}>Sort Visualizer</h1>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Each bar = value. Highlighted = active comparison. Sound pitch = value.
          </p>
        </div>
        <button onClick={() => setShowKeys(k => !k)} className="btn-ghost flex items-center gap-1.5 text-xs">
          <Keyboard size={13} /> Shortcuts
        </button>
      </div>

      <AnimatePresence>
        {showKeys && (
          <motion.div className="card mb-4 grid grid-cols-4 gap-3"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {[["Space","Play / Pause"],["← →","Step back / forward"],["Enter","Run sort"],["R","New dataset"]].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="badge border text-indigo-300 font-mono" style={{ background: "var(--bg-2)", borderColor: "var(--c-border)" }}>{k}</span>
                <span className="text-xs" style={{ color: "var(--c-text-3)" }}>{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-5 gap-5">
        {/* Config sidebar */}
        <div className="col-span-1 space-y-3">
          <div className="card">
            <div className="label mb-2">Algorithm</div>
            {/* Search filter */}
            <div className="relative mb-2">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-3)" }} />
              <input
                type="text"
                placeholder="filter..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-7 py-1.5 text-[11px]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-3)" }}>
                  <X size={10} />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {filteredAlgos.length === 0
                ? <p className="text-[10px] px-2 py-1" style={{ color: "var(--c-text-3)" }}>No match</p>
                : filteredAlgos.map(a => (
                  <button key={a} onClick={() => { setAlgo(a); setResult(null); setStep(0); }}
                    className={`chip w-full text-left flex items-center gap-2 ${a === algo ? "chip-on" : "chip-off"}`}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ALGO_COLORS[a] || "#6366f1" }} />
                    <span className="truncate text-[11px]">{a}</span>
                  </button>
                ))
              }
            </div>
          </div>

          <div className="card">
            <div className="label mb-3">Pattern</div>
            {PATTERNS.map(p => (
              <button key={p} onClick={() => setPat(p)} className={`chip w-full text-left mb-1 ${p === pattern ? "chip-on" : "chip-off"}`}>
                <span className="text-[11px]">{p.replace(/_/g, " ")}</span>
              </button>
            ))}
          </div>

          <div className="card">
            <div className="label mb-2">Size: <span className="text-indigo-400">{size}</span></div>
            <div className="grid grid-cols-4 gap-1">
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`chip text-center text-[10px] ${s === size ? "chip-on" : "chip-off"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="col-span-4 space-y-4">
          {/* Bar chart */}
          <div className="card relative" style={{ height: 300 }}>
            {done && (
              <motion.div className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs">
                  ✓ Sorted in {result?.time_ms}ms · {result?.comparisons.toLocaleString()} comparisons
                </span>
              </motion.div>
            )}
            <div className="flex items-end justify-center gap-px h-full w-full px-1 pb-1">
              {curArr.map((v, i) => {
                const isHi = hiSet.has(i);
                return (
                  <div key={i} className="flex-1 rounded-t sort-bar"
                    style={{
                      height: `${Math.max(2, (v / maxVal) * 96)}%`,
                      background: isHi ? "#f59e0b" : done ? "#10b981" : color,
                      opacity: isHi ? 1 : 0.65,
                      boxShadow: isHi ? "0 0 14px #f59e0b" : done ? "0 0 6px #10b981" : undefined,
                    }} />
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="card">
            <div className="flex items-center flex-wrap gap-3 justify-between">
              <div className="flex gap-2">
                <button onClick={fetchData} className="btn-ghost p-2.5" title="New dataset (R)">
                  <Shuffle size={14} />
                </button>
                <button onClick={runSort} disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading
                    ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Computing</>
                    : <><Play size={14} />Run Sort (Enter)</>
                  }
                </button>
              </div>

              {result?.steps && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost p-2"><SkipBack size={13} /></button>
                  <button onClick={() => setPlaying(p => !p)} className="btn-primary p-2">
                    {playing ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button onClick={() => setStep(s => Math.min((result.steps?.length ?? 1) - 1, s + 1))} className="btn-ghost p-2"><SkipForward size={13} /></button>
                  <span className="label text-[9px] min-w-[72px] text-center">{step + 1} / {result.steps.length}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="btn-ghost p-2">
                  {soundEnabled ? <Volume2 size={14} className="text-indigo-400" /> : <VolumeX size={14} />}
                </button>
                <div className="flex items-center gap-2">
                  <span className="label text-[9px]">Speed</span>
                  <input type="range" min={10} max={100} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-20 accent-indigo-500" />
                </div>
              </div>
            </div>

            {result?.steps && (
              <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "var(--c-border)" }}>
                <motion.div className="h-full rounded-full" style={{ background: color }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.05 }} />
              </div>
            )}
            {result?.steps?.[step] && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <span className="badge border text-[10px]" style={{ background: "var(--bg-2)", borderColor: "var(--c-border)", color: "var(--c-text-3)" }}>
                  action: <span className="text-indigo-300 ml-1">{result.steps[step].action}</span>
                </span>
              </div>
            )}
          </div>

          {/* Metrics */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="card">
                  <div className="label mb-3">
                    Execution Results{result.cached && <span className="ml-2 text-cyan-400">· cached</span>}
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {[
                      { k: "Time",        v: `${result.time_ms}ms`,               c: "#10b981" },
                      { k: "Memory",      v: `${result.memory_kb}KB`,             c: "#06b6d4" },
                      { k: "Comparisons", v: result.comparisons.toLocaleString(), c: "#f59e0b" },
                      { k: "Swaps",       v: result.swaps.toLocaleString(),        c: "#8b5cf6" },
                    ].map(({ k, v, c }) => (
                      <div key={k} className="rounded-xl p-3 border" style={{ background: "var(--bg-0)", borderColor: "var(--c-border)" }}>
                        <div className="label text-[9px] mb-1">{k}</div>
                        <div className="font-mono text-sm font-bold" style={{ color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">avg: {result.avg_complexity}</span>
                    <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20">worst: {result.worst_complexity}</span>
                    <span className="badge bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">space: {result.space_complexity}</span>
                    <span className={`badge border ${result.stable ? "bg-green-500/10 text-green-400 border-green-500/20" : "border text-[#475569]"}`}
                      style={!result.stable ? { background: "var(--bg-2)", borderColor: "var(--c-border)" } : {}}>
                      {result.stable ? "✓ stable" : "unstable"}
                    </span>
                    <span className="badge border" style={{ background: "var(--bg-2)", borderColor: "var(--c-border)", color: "var(--c-text-3)" }}>
                      {result.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ComplexityRadar algorithms={[algo]} />
                  <AlgoInfoPanel algorithm={algo} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && <AlgoInfoPanel algorithm={algo} />}
        </div>
      </div>
    </div>
  );
}

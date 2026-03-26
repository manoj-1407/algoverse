import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Swords, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../utils/api";
import { ALGO_COLORS } from "../types";
import { playTone } from "../utils/sound";
import { useAppStore } from "../stores/app";

const ALGOS = ["quicksort","mergesort","heapsort","bubblesort","insertionsort","selectionsort","shellsort","timsort"];

export default function BattleMode() {
  const [algo1, setAlgo1] = useState("quicksort");
  const [algo2, setAlgo2] = useState("bubblesort");
  const [size, setSize]   = useState(60);
  const [result1, setResult1] = useState<any>(null);
  const [result2, setResult2] = useState<any>(null);
  const [step1, setStep1] = useState(0);
  const [step2, setStep2] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [winner, setWinner]   = useState<1|2|null>(null);
  const [speed, setSpeed]     = useState(70);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const { soundEnabled } = useAppStore();

  const runBattle = async () => {
    setLoading(true); setPlaying(false); setWinner(null);
    clearInterval(timer.current);
    setStep1(0); setStep2(0);
    try {
      const dataRes = await api.dataset(size, "random");
      const data = dataRes.data.data;
      const [r1, r2] = await Promise.all([
        api.sort(algo1, data, true),
        api.sort(algo2, data, true),
      ]);
      setResult1(r1.data); setResult2(r2.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!playing || !result1 || !result2) return;
    const maxSteps = Math.max(result1.steps?.length ?? 0, result2.steps?.length ?? 0);
    timer.current = setInterval(() => {
      setStep1(s => Math.min(s + 1, (result1.steps?.length ?? 1) - 1));
      setStep2(s => Math.min(s + 1, (result2.steps?.length ?? 1) - 1));

      const s1done = step1 >= (result1.steps?.length ?? 1) - 1;
      const s2done = step2 >= (result2.steps?.length ?? 1) - 1;
      if (s1done && s2done) {
        setPlaying(false);
        clearInterval(timer.current);
        setWinner(result1.time_ms <= result2.time_ms ? 1 : 2);
      }
      if (soundEnabled) {
        const curStep = result1.steps?.[step1];
        if (curStep?.highlighted?.length) {
          const val = curStep.array[curStep.highlighted[0]] ?? 0;
          playTone(val, Math.max(...result1.sorted), curStep.action);
        }
      }
    }, Math.max(6, 220 - speed * 2.1));
    return () => clearInterval(timer.current);
  }, [playing, result1, result2, speed, soundEnabled, step1, step2]);

  const renderBars = (result: any, step: number, primary: string) => {
    if (!result) return (
      <div className="h-full flex items-center justify-center text-[#2a2a4e] font-mono text-sm">
        Press Battle to start
      </div>
    );
    const curArr = result.steps?.[step]?.array ?? result.sorted;
    const hiSet  = new Set(result.steps?.[step]?.highlighted ?? []);
    const maxVal = Math.max(...curArr, 1);
    const done   = step >= (result.steps?.length ?? 1) - 1;
    return (
      <div className="flex items-end justify-center gap-px h-full px-2 pb-1">
        {curArr.map((v: number, i: number) => {
          const isHi = hiSet.has(i);
          return (
            <div key={i} className="flex-1 rounded-t sort-bar"
              style={{
                height: `${Math.max(2,(v/maxVal)*95)}%`,
                background: isHi ? "#f59e0b" : done ? "#10b981" : primary,
                opacity: isHi ? 1 : 0.65,
                boxShadow: isHi ? "0 0 10px #f59e0b" : undefined,
              }} />
          );
        })}
      </div>
    );
  };

  const prog1 = result1?.steps?.length ? ((step1+1)/result1.steps.length)*100 : 0;
  const prog2 = result2?.steps?.length ? ((step2+1)/result2.steps.length)*100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Swords size={22} className="text-pink-400" /> Battle Mode
          </h1>
          <p className="text-[#475569] text-sm">Two algorithms. One dataset. May the best one win.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="label text-[9px]">Speed</span>
          <input type="range" min={10} max={100} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-20 accent-pink-500" />
          <span className="label text-[9px]">Size: {size}</span>
          <input type="range" min={20} max={100} value={size} onChange={e => setSize(+e.target.value)} className="w-20 accent-pink-500" />
        </div>
      </div>

      {/* Algorithm selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: "Fighter 1", algo: algo1, setAlgo: setAlgo1, color: "#6366f1", side: 1 },
          { label: "Fighter 2", algo: algo2, setAlgo: setAlgo2, color: "#ec4899", side: 2 },
        ].map(({ label, algo, setAlgo, color }) => (
          <div key={label} className="card">
            <div className="label mb-2">{label}</div>
            <div className="flex flex-wrap gap-1.5">
              {ALGOS.map(a => (
                <button key={a} onClick={() => setAlgo(a)}
                  className={`chip text-xs ${a === algo ? "chip-on" : "chip-off"}`}
                  style={a === algo ? { borderColor: `${color}60`, color } : {}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Arena */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          { label: algo1, result: result1, step: step1, prog: prog1, color: ALGO_COLORS[algo1]||"#6366f1", time: result1?.time_ms },
          { label: algo2, result: result2, step: step2, prog: prog2, color: ALGO_COLORS[algo2]||"#ec4899", time: result2?.time_ms },
        ].map(({ label, result, step, prog, color, time }, i) => (
          <div key={i} className="card" style={{ borderColor: winner === i+1 ? `${color}50` : undefined }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="font-mono text-sm font-semibold" style={{ color }}>{label}</span>
                {winner === i+1 && <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px]">🏆 Winner!</span>}
              </div>
              {time && <span className="font-mono text-xs text-[#94a3b8]">{time}ms</span>}
            </div>
            <div style={{ height: 200 }}>{renderBars(result, step, color)}</div>
            <div className="mt-2 h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: color }}
                animate={{ width: `${prog}%` }} transition={{ duration: 0.05 }} />
            </div>
            {result && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { l: "Time", v: `${result.time_ms}ms` },
                  { l: "Comps", v: result.comparisons.toLocaleString() },
                  { l: "Swaps", v: result.swaps.toLocaleString() },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-[#020209] rounded-lg p-2 text-center border border-[#1a1a2e]">
                    <div className="label text-[8px]">{l}</div>
                    <div className="font-mono text-xs font-semibold" style={{ color }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* VS bar */}
      <div className="card mb-4 flex items-center gap-4">
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#1a1a2e]">
          <motion.div className="h-full rounded-full" style={{ background: ALGO_COLORS[algo1]||"#6366f1" }}
            animate={{ width: result1 && result2 ? `${(result2.time_ms/(result1.time_ms+result2.time_ms))*100}%` : "50%" }}
            transition={{ duration: 0.5 }} />
        </div>
        <span className="font-display text-lg font-bold text-white">VS</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#1a1a2e]">
          <motion.div className="h-full rounded-full ml-auto" style={{ background: ALGO_COLORS[algo2]||"#ec4899" }}
            animate={{ width: result1 && result2 ? `${(result1.time_ms/(result1.time_ms+result2.time_ms))*100}%` : "50%" }}
            transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={runBattle} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Loading</> : <><Swords size={14}/>New Battle</>}
        </button>
        {result1 && (
          <>
            <button onClick={() => setPlaying(p => !p)} className="btn-ghost flex items-center gap-2">
              {playing ? <><Pause size={14}/>Pause</> : <><Play size={14}/>Play</>}
            </button>
            <button onClick={() => { setStep1(0); setStep2(0); setPlaying(false); setWinner(null); }} className="btn-ghost flex items-center gap-2">
              <RotateCcw size={14}/>Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

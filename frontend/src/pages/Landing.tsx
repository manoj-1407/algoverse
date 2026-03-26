import { Suspense, lazy, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Play, Swords, BarChart3, Network, Brain, Puzzle, Hash, Type, Trophy, Volume2, Zap, Star, GitBranch } from "lucide-react";
import { api } from "../utils/api";

const Scene = lazy(() => import("../components/three/Scene"));

// Animated counter
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const FEATURES = [
  { icon: Play,     color:"#6366f1", title:"Sort Visualizer",   desc:"12 algorithms animated with Web Audio synthesis", to:"/visualizer" },
  { icon: Swords,   color:"#ec4899", title:"Battle Mode",       desc:"Two algorithms racing on identical data",          to:"/battle" },
  { icon: BarChart3,color:"#10b981", title:"Benchmark Engine",  desc:"D3 curves persisted to PostgreSQL",                to:"/benchmark" },
  { icon: Network,  color:"#06b6d4", title:"Graph Lab",         desc:"Dijkstra, A*, BFS, DFS, MST + D3 visualizer",     to:"/graph" },
  { icon: Brain,    color:"#8b5cf6", title:"DP Lab",            desc:"7 problems with DP table heatmaps",               to:"/dp" },
  { icon: Puzzle,   color:"#f59e0b", title:"Backtrack Lab",     desc:"N-Queens board, Maze grid, Sudoku solver",         to:"/backtrack" },
  { icon: Type,     color:"#ef4444", title:"String Lab",        desc:"KMP & Rabin-Karp with match highlighting",         to:"/string" },
  { icon: Hash,     color:"#14b8a6", title:"Math Lab",          desc:"Sieve, Huffman tree, GCD, Fast Exp",              to:"/math" },
];

const ALGO_TICKER = [
  "QuickSort","MergeSort","Dijkstra","A* Search","N-Queens","Huffman Coding",
  "Bellman-Ford","0/1 Knapsack","KMP Search","Prim's MST","Matrix Chain","Sudoku Solver",
  "RadixSort","Edit Distance","Sieve of Eratosthenes","Topological Sort",
];

export default function Landing() {
  const [tick, setTick] = useState(0);
  const [total, setTotal] = useState(34);

  useEffect(() => {
    api.algorithms().then(r => setTotal(r.data.total)).catch(() => {});
    const t = setInterval(() => setTick(v => (v + 1) % ALGO_TICKER.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0" style={{ background: "#020209" }} />}>
          <Scene />
        </Suspense>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1]" style={{
        background: "radial-gradient(ellipse 90% 70% at 50% 35%, transparent 0%, rgba(2,2,9,0.75) 55%, #020209 80%)"
      }} />

      {/* Hero */}
      <div className="relative z-[2] flex flex-col items-center justify-center min-h-screen px-6 text-center pt-10 pb-20">
        {/* Badge row */}
        <motion.div className="flex flex-wrap gap-2 justify-center mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Zap size={11} /> {total}+ Algorithms
          </span>
          <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <Volume2 size={11} /> Web Audio Synthesis
          </span>
          <span className="badge bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Star size={11} /> 3D Particle Universe
          </span>
          <span className="badge bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <GitBranch size={11} /> FastAPI + PostgreSQL + Redis
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <h1 className="font-display text-6xl md:text-8xl font-black text-white mb-3 leading-[0.92] tracking-tight">
            The Computational
            <br />
            <span className="gradient-text">Universe</span>
          </h1>
        </motion.div>

        {/* Rotating algo */}
        <motion.div className="h-8 mb-5 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <motion.p key={tick}
            className="font-mono text-lg text-indigo-300"
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}>
            Now visualizing: <span className="text-white font-bold">{ALGO_TICKER[tick]}</span>
          </motion.p>
        </motion.div>

        <motion.p className="text-[#64748b] text-lg max-w-2xl mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Every algorithm. Visualized in 3D. Heard through sound synthesis. Benchmarked against real data.
          Not a tutorial — a full-stack engineering platform.
        </motion.p>

        {/* CTA */}
        <motion.div className="flex flex-wrap gap-3 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Link to="/visualizer" className="btn-primary flex items-center gap-2 text-base px-7 py-3.5 glow-indigo">
            <Play size={17} /> Start Visualizing
          </Link>
          <Link to="/battle" className="btn-ghost flex items-center gap-2 text-base px-7 py-3.5">
            <Swords size={17} className="text-pink-400" /> Battle Mode
          </Link>
          <Link to="/graph" className="btn-ghost flex items-center gap-2 text-base px-7 py-3.5">
            <Network size={17} className="text-cyan-400" /> Graph Lab
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-3 md:grid-cols-6 gap-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {[
            { v: total,  s: "+", l: "Algorithms" },
            { v: 12,     s: "",  l: "Sorting" },
            { v: 8,      s: "",  l: "Graph" },
            { v: 7,      s: "",  l: "DP" },
            { v: 7,      s: "",  l: "Algorithm Labs" },
            { v: 6,      s: "",  l: "Input Patterns" },
          ].map(({ v, s, l }) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl font-black text-white"><Counter target={v} suffix={s} /></div>
              <div className="label text-[11px] mt-0.5">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Feature grid */}
      <div className="relative z-[2] px-8 pb-24 max-w-6xl mx-auto">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-white mb-2">Everything in one platform</h2>
          <p className="text-[#475569] text-sm">Seven labs. One unified design. Zero login required.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc, to }, i) => (
            <motion.div key={to}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={to}
                className="card hover:bg-[#0f0f1e] transition-all duration-250 group block h-full cursor-pointer"
                style={{ borderColor: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}30`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-250 group-hover:scale-110"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <div className="font-display font-bold text-sm text-white mb-1">{title}</div>
                <div className="text-[11px] text-[#475569] leading-relaxed">{desc}</div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}>
                  Open lab <ArrowRight size={11} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack footer strip */}
      <div className="relative z-[2] border-t border-[#0f0f1e] py-6 px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-x-8 gap-y-2 justify-center">
          {["FastAPI","PostgreSQL","Redis","React 18","Three.js","D3.js","Framer Motion","Docker","Nginx","GitHub Actions"].map(t => (
            <span key={t} className="font-mono text-[11px] text-[#2a2a4e]">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

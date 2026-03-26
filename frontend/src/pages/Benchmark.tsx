import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Play, RefreshCw, BarChart2, Download, FileJson } from "lucide-react";
import { api } from "../utils/api";
import { ALGO_COLORS, DEFAULT_SIZES } from "../types";
import type { BenchmarkResult } from "../types";

const ALL_ALGOS    = ["quicksort","mergesort","heapsort","bubblesort","insertionsort","selectionsort","shellsort","timsort"];
const ALL_PATTERNS = ["random","sorted","reverse","nearly_sorted","duplicates","pipe_organ"];

function D3Chart({ data }: { data: BenchmarkResult }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const W = svgRef.current.clientWidth || 600, H = 300;
    const m = { top: 20, right: 120, bottom: 50, left: 68 };
    const w = W - m.left - m.right, h = H - m.top - m.bottom;
    const g = svg.attr("viewBox", `0 0 ${W} ${H}`).append("g").attr("transform", `translate(${m.left},${m.top})`);
    const all = Object.values(data.results).flat();

    // Adapt grid/axis color to theme
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const gridColor  = isDark ? "#1a1a2e" : "#e2e8f0";
    const labelColor = isDark ? "#475569" : "#94a3b8";
    const dotStroke  = isDark ? "#020209" : "#ffffff";

    const x = d3.scaleLinear().domain([0, d3.max(all, d => d.size) || 1]).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(all, d => d.time_ms) || 1]).range([h, 0]).nice();

    g.append("g").call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(() => ""))
      .call(a => { a.select(".domain").remove(); a.selectAll("line").attr("stroke", gridColor).attr("stroke-dasharray", "3,5"); });
    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => d3.format(".0s")(d as number)))
      .call(a => a.selectAll("text,line,path").attr("stroke", labelColor).attr("fill", labelColor).attr("font-size", "11").attr("font-family", "JetBrains Mono,monospace"));
    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}ms`))
      .call(a => a.selectAll("text,line,path").attr("stroke", labelColor).attr("fill", labelColor).attr("font-size", "11").attr("font-family", "JetBrains Mono,monospace"));
    g.select(".domain").remove();
    g.append("text").attr("x", w / 2).attr("y", h + 42).attr("text-anchor", "middle").attr("fill", labelColor).attr("font-size", 11).attr("font-family", "JetBrains Mono,monospace").text("Input Size (n)");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -56).attr("text-anchor", "middle").attr("fill", labelColor).attr("font-size", 11).attr("font-family", "JetBrains Mono,monospace").text("Time (ms)");

    const line = d3.line<{ size: number; time_ms: number }>().x(d => x(d.size)).y(d => y(d.time_ms)).curve(d3.curveMonotoneX);
    Object.entries(data.results).forEach(([algo, pts]) => {
      const c = ALGO_COLORS[algo] || "#888";
      g.append("path").datum(pts).attr("fill", "none").attr("stroke", c).attr("stroke-width", 2.5).attr("opacity", 0.9).attr("d", line);
      g.selectAll(`.dot-${algo}`).data(pts).enter().append("circle")
        .attr("cx", d => x(d.size)).attr("cy", d => y(d.time_ms)).attr("r", 5)
        .attr("fill", c).attr("stroke", dotStroke).attr("stroke-width", 2);
      const last = pts[pts.length - 1];
      if (last) g.append("text").attr("x", x(last.size) + 8).attr("y", y(last.time_ms) + 4)
        .attr("font-size", 10).attr("font-family", "JetBrains Mono,monospace").attr("fill", c).text(algo);
    });
  }, [data]);
  return <svg ref={svgRef} className="w-full" style={{ height: 300 }} />;
}

// ── Export helpers ──────────────────────────────────────────────────────────
function exportCSV(result: BenchmarkResult) {
  const header = ["algorithm", ...DEFAULT_SIZES.map(s => `n=${s}`)];
  const rows = Object.entries(result.results).map(([algo, pts]) =>
    [algo, ...pts.map(p => p.time_ms)].join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `algoverse-benchmark-${result.pattern}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(result: BenchmarkResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `algoverse-benchmark-${result.pattern}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Benchmark() {
  const [algos, setAlgos]   = useState(["quicksort","mergesort","heapsort"]);
  const [pat, setPat]       = useState("random");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (a: string) =>
    setAlgos(p => p.includes(a) ? (p.length > 1 ? p.filter(x => x !== a) : p) : [...p, a]);

  const run = async () => {
    setLoading(true);
    try { setResult((await api.benchmark(algos, DEFAULT_SIZES, pat, 3)).data); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--c-text-1)" }}>Benchmark Engine</h1>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Runtime complexity curves averaged over 3 runs per input size. Persisted to PostgreSQL.
          </p>
        </div>
        {result && (
          <div className="flex gap-2">
            <button onClick={() => exportCSV(result)} className="btn-ghost flex items-center gap-1.5 text-xs">
              <Download size={12} /> CSV
            </button>
            <button onClick={() => exportJSON(result)} className="btn-ghost flex items-center gap-1.5 text-xs">
              <FileJson size={12} /> JSON
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-1 space-y-4">
          <div className="card">
            <div className="label mb-3">Algorithms</div>
            {ALL_ALGOS.map(a => (
              <button key={a} onClick={() => toggle(a)} className={`chip w-full text-left flex items-center gap-2 mb-1.5 ${algos.includes(a) ? "chip-on" : "chip-off"}`}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ALGO_COLORS[a] }} />
                {a}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="label mb-3">Pattern</div>
            {ALL_PATTERNS.map(p => (
              <button key={p} onClick={() => setPat(p)} className={`chip w-full text-left mb-1.5 ${p === pat ? "chip-on" : "chip-off"}`}>
                {p.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <button onClick={run} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading
              ? <><RefreshCw size={13} className="animate-spin" />Running</>
              : <><Play size={13} />Run Benchmark</>
            }
          </button>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="card">
            {result
              ? <D3Chart data={result} />
              : (
                <div className="h-64 flex items-center justify-center font-mono text-sm" style={{ color: "var(--c-text-4)" }}>
                  {loading
                    ? <span className="flex gap-2 items-center text-indigo-400"><RefreshCw size={14} className="animate-spin" />Benchmarking…</span>
                    : "Configure and Run →"
                  }
                </div>
              )}
          </div>

          {result && (
            <div className="card overflow-x-auto">
              <div className="label mb-3">
                Raw Data (avg ms)
                <span className="ml-2 text-indigo-400 normal-case">run #{result.run_id} · {result.pattern}</span>
              </div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--c-border)" }}>
                    <th className="text-left pb-2 pr-4" style={{ color: "var(--c-text-3)" }}>Algorithm</th>
                    {DEFAULT_SIZES.map(s => (
                      <th key={s} className="text-right pb-2 pr-3" style={{ color: "var(--c-text-3)" }}>
                        n={s.toLocaleString()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.results).map(([algo, pts]) => (
                    <tr key={algo} className="border-b" style={{ borderColor: "var(--c-border)" }}>
                      <td className="py-2 pr-4 font-semibold" style={{ color: ALGO_COLORS[algo] }}>{algo}</td>
                      {pts.map(p => (
                        <td key={p.size} className="text-right py-2 pr-3" style={{ color: "var(--c-text-2)" }}>
                          {p.time_ms}ms
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Comparison summary */}
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: "var(--c-border)" }}>
                {Object.entries(result.results)
                  .map(([algo, pts]) => ({ algo, avg: pts.reduce((s, p) => s + p.time_ms, 0) / pts.length }))
                  .sort((a, b) => a.avg - b.avg)
                  .map((item, i) => (
                    <span key={item.algo} className="badge" style={{
                      background: i === 0 ? "rgba(16,185,129,.12)" : "var(--bg-2)",
                      border: `1px solid ${i === 0 ? "rgba(16,185,129,.3)" : "var(--c-border)"}`,
                      color: i === 0 ? "#34d399" : "var(--c-text-2)",
                    }}>
                      {i === 0 ? "🏆 " : `#${i + 1} `}{item.algo} · {item.avg.toFixed(2)}ms avg
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

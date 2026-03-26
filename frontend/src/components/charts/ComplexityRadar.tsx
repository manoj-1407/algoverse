import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ALGO_COLORS } from "../../types";

// Score each algorithm 0-10 on 5 axes (higher = better)
const SCORES: Record<string, number[]> = {
  // axes: [Speed, Memory, Stability, Worst-case, Simplicity]
  quicksort:     [9, 8, 2, 4, 6],
  mergesort:     [8, 5, 10, 9, 7],
  heapsort:      [7, 10, 2, 9, 5],
  bubblesort:    [1, 10, 10, 1, 10],
  insertionsort: [3, 10, 10, 2, 9],
  selectionsort: [2, 10, 2, 2, 9],
  shellsort:     [7, 10, 2, 6, 6],
  countingsort:  [10, 6, 10, 10, 7],
  radixsort:     [9, 5, 10, 9, 6],
  cocktailsort:  [2, 10, 10, 2, 8],
  gnomesort:     [1, 10, 10, 1, 10],
  timsort:       [9, 6, 10, 9, 5],
};
const AXES = ["Speed", "Memory\nEfficiency", "Stability", "Worst-case\nGuarantee", "Simplicity"];

interface Props {
  algorithms: string[];
}

export default function ComplexityRadar({ algorithms }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || algorithms.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = 320, H = 300;
    const cx = W / 2, cy = H / 2;
    const R = 100;
    const n = AXES.length;
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    // Draw concentric polygons (grid)
    for (let level = 1; level <= 5; level++) {
      const r = (R * level) / 5;
      const points = Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
      });
      svg.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("fill", "none")
        .attr("stroke", level === 5 ? "#2a2a4e" : "#1a1a2e")
        .attr("stroke-width", 0.8);
    }

    // Draw axis lines and labels
    AXES.forEach((axis, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const x = cx + R * Math.cos(angle);
      const y = cy + R * Math.sin(angle);
      svg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", x).attr("y2", y)
        .attr("stroke", "#1a1a2e").attr("stroke-width", 0.8);

      const lx = cx + (R + 18) * Math.cos(angle);
      const ly = cy + (R + 18) * Math.sin(angle);
      axis.split("\n").forEach((part, pi) => {
        svg.append("text")
          .attr("x", lx).attr("y", ly + pi * 10)
          .attr("text-anchor", "middle").attr("dominant-baseline", "central")
          .attr("font-size", 8).attr("font-family", "JetBrains Mono, monospace")
          .attr("fill", "#475569")
          .text(part);
      });
    });

    // Draw each algorithm's polygon
    algorithms.forEach((algo) => {
      const scores = SCORES[algo];
      if (!scores) return;
      const color = ALGO_COLORS[algo] || "#6366f1";
      const points = scores.map((score, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const r = (score / 10) * R;
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
      });
      svg.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("fill", color).attr("fill-opacity", 0.12)
        .attr("stroke", color).attr("stroke-width", 1.5).attr("stroke-opacity", 0.8);
      points.forEach(([px, py]) => {
        svg.append("circle").attr("cx", px).attr("cy", py).attr("r", 3)
          .attr("fill", color).attr("stroke", "#020209").attr("stroke-width", 1.5);
      });
    });

    // Legend
    const legendY = H - 16 - algorithms.length * 14;
    algorithms.forEach((algo, i) => {
      const color = ALGO_COLORS[algo] || "#6366f1";
      svg.append("circle").attr("cx", 12).attr("cy", legendY + i * 14).attr("r", 4).attr("fill", color);
      svg.append("text").attr("x", 20).attr("y", legendY + i * 14 + 4)
        .attr("font-size", 8).attr("font-family", "JetBrains Mono, monospace")
        .attr("fill", color).text(algo);
    });
  }, [algorithms]);

  return (
    <div className="card">
      <div className="label mb-2">Algorithm Profile Radar</div>
      <svg ref={svgRef} className="w-full" style={{ height: 300 }} />
    </div>
  );
}

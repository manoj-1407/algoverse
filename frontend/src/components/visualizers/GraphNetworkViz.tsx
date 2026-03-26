import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface GraphVizProps {
  graph: Record<string, Record<string, number> | string[]>;
  visitedOrder?: string[];
  path?: string[];
  mstEdges?: { from: string; to: string; weight: number }[];
  weighted?: boolean;
  animating?: boolean;
  animStep?: number;
}

export default function GraphNetworkViz({
  graph, visitedOrder = [], path = [], mstEdges = [], weighted = true, animStep = 9999
}: GraphVizProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !graph || Object.keys(graph).length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const W = svgRef.current.clientWidth || 520;
    const H = 340;
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    // Build node + edge data
    const nodeSet = new Set<string>();
    const edges: { source: string; target: string; weight: number }[] = [];

    Object.entries(graph).forEach(([u, neighbors]) => {
      nodeSet.add(u);
      if (typeof neighbors === "object" && !Array.isArray(neighbors)) {
        Object.entries(neighbors as Record<string, number>).forEach(([v, w]) => {
          nodeSet.add(v);
          edges.push({ source: u, target: v, weight: w });
        });
      } else if (Array.isArray(neighbors)) {
        (neighbors as string[]).forEach(v => {
          nodeSet.add(v);
          edges.push({ source: u, target: v, weight: 1 });
        });
      }
    });

    const nodes = Array.from(nodeSet).map(id => ({ id }));
    const visitedSet = new Set(visitedOrder.slice(0, animStep + 1));
    const pathSet   = new Set(path);
    const mstSet    = new Set(mstEdges.map(e => `${e.from}-${e.to}`));

    // D3 force simulation
    const sim = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(edges as any).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(28))
      .stop();

    // Run simulation
    for (let i = 0; i < 300; i++) sim.tick();

    const defs = svg.append("defs");
    defs.append("marker").attr("id","arrow").attr("markerWidth",8).attr("markerHeight",6)
      .attr("refX",18).attr("refY",3).attr("orient","auto")
      .append("polygon").attr("points","0 0, 8 3, 0 6").attr("fill","#2a2a4e");

    // Draw edges
    const link = svg.append("g").selectAll("line")
      .data(edges).enter().append("line")
      .attr("x1", (d:any) => d.source.x).attr("y1", (d:any) => d.source.y)
      .attr("x2", (d:any) => d.target.x).attr("y2", (d:any) => d.target.y)
      .attr("stroke", (d:any) => {
        const key = `${d.source.id}-${d.target.id}`;
        if (mstSet.has(key)) return "#10b981";
        if (path.length > 1 && pathSet.has(d.source.id) && pathSet.has(d.target.id)) return "#f59e0b";
        return "#1e1e3a";
      })
      .attr("stroke-width", (d:any) => {
        const key = `${d.source.id}-${d.target.id}`;
        return mstSet.has(key) ? 3 : 1.5;
      })
      .attr("stroke-opacity", 0.85)
      .attr("marker-end", "url(#arrow)");

    // Edge weight labels
    if (weighted) {
      svg.append("g").selectAll("text")
        .data(edges.filter(e => e.weight !== 1)).enter().append("text")
        .attr("x", (d:any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d:any) => (d.source.y + d.target.y) / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", 9).attr("font-family", "JetBrains Mono, monospace")
        .attr("fill", "#4a4a6a")
        .text((d:any) => d.weight);
    }

    // Draw nodes
    const node = svg.append("g").selectAll("g")
      .data(nodes).enter().append("g")
      .attr("transform", (d:any) => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 18)
      .attr("fill", (d:any) => {
        if (path.includes(d.id) && path.length > 1) return "#f59e0b";
        if (visitedSet.has(d.id)) return "#6366f1";
        return "#0f0f1e";
      })
      .attr("stroke", (d:any) => {
        if (path.includes(d.id) && path.length > 1) return "#f59e0b";
        if (visitedSet.has(d.id)) return "#818cf8";
        return "#1e1e3a";
      })
      .attr("stroke-width", 2)
      .style("filter", (d:any) => visitedSet.has(d.id) ? "drop-shadow(0 0 6px rgba(99,102,241,0.8))" : "none");

    node.append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em")
      .attr("font-size", 11).attr("font-family", "JetBrains Mono, monospace")
      .attr("font-weight", "600")
      .attr("fill", (d:any) => visitedSet.has(d.id) || path.includes(d.id) ? "#fff" : "#475569")
      .text((d:any) => d.id);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(8, ${H - 60})`);
    const items = [
      { color: "#0f0f1e", stroke: "#1e1e3a", label: "Unvisited" },
      { color: "#6366f1", stroke: "#818cf8", label: "Visited" },
      { color: "#f59e0b", stroke: "#f59e0b", label: "Path" },
    ];
    items.forEach(({ color, stroke, label }, i) => {
      legend.append("circle").attr("cx", 8).attr("cy", i * 17).attr("r", 6)
        .attr("fill", color).attr("stroke", stroke).attr("stroke-width", 1.5);
      legend.append("text").attr("x", 18).attr("y", i * 17 + 4)
        .attr("font-size", 9).attr("font-family", "JetBrains Mono, monospace")
        .attr("fill", "#475569").text(label);
    });
  }, [graph, visitedOrder, path, mstEdges, animStep, weighted]);

  return <svg ref={svgRef} className="w-full rounded-xl" style={{ height: 340, background: "#020209" }} />;
}

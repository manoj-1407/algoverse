import { useMemo } from "react";

interface DPTableProps {
  table: (number | string)[][];
  rowLabels?: string[];
  colLabels?: string[];
  highlightCell?: [number, number];
  title?: string;
  maxDisplay?: number;
}

export default function DPTableHeatmap({
  table, rowLabels = [], colLabels = [], title, maxDisplay = 12
}: DPTableProps) {
  if (!table || table.length === 0) return null;

  const rows = table.slice(0, maxDisplay);
  const cols = Math.min(table[0]?.length ?? 0, maxDisplay);

  const flatNums = rows.flatMap(r => r.slice(0, cols)).map(v => Number(v)).filter(v => isFinite(v) && v >= 0);
  const maxVal = Math.max(...flatNums, 1);

  const getColor = (val: number | string) => {
    const n = Number(val);
    if (!isFinite(n) || n < 0) return "rgba(30,30,60,0.5)";
    const ratio = n / maxVal;
    if (ratio === 0) return "rgba(15,15,30,0.9)";
    if (ratio < 0.25) return `rgba(99,102,241,${0.15 + ratio * 0.6})`;
    if (ratio < 0.6)  return `rgba(139,92,246,${0.3 + ratio * 0.4})`;
    return `rgba(16,185,129,${0.4 + ratio * 0.5})`;
  };

  const fmt = (v: number | string) => {
    const n = Number(v);
    if (!isFinite(n)) return "∞";
    if (n < 0) return String(v);
    if (n > 9999) return `${(n/1000).toFixed(1)}k`;
    return String(v);
  };

  return (
    <div className="overflow-auto">
      {title && <div className="label mb-2">{title}</div>}
      <div className="inline-block min-w-full">
        <table className="text-[9px] font-mono border-collapse">
          {colLabels.length > 0 && (
            <thead>
              <tr>
                <th className="w-6 h-6" />
                {colLabels.slice(0, cols).map((l, j) => (
                  <th key={j} className="w-8 h-6 text-center text-[#475569] font-normal pb-1">{l}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {rowLabels[i] !== undefined && (
                  <td className="pr-2 text-[#475569] text-right w-6">{rowLabels[i]}</td>
                )}
                {row.slice(0, cols).map((val, j) => (
                  <td key={j}
                    className="w-8 h-7 text-center border border-[#0a0a14] transition-colors duration-300"
                    style={{ background: getColor(val) }}
                  >
                    <span style={{ color: Number(val) > maxVal * 0.4 ? "#fff" : "#94a3b8" }}>
                      {fmt(val)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {(table.length > maxDisplay || (table[0]?.length ?? 0) > maxDisplay) && (
          <div className="text-[9px] text-[#475569] mt-1 font-mono">
            Showing {maxDisplay}×{maxDisplay} of {table.length}×{table[0]?.length} table
          </div>
        )}
      </div>
    </div>
  );
}

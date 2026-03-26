// N-Queens chess board
interface QueensBoardProps {
  solution: number[];
  n: number;
}
export function QueensBoard({ solution, n }: QueensBoardProps) {
  const size = Math.min(320, 36 * n);
  const cellSize = size / n;
  return (
    <div className="inline-block rounded-xl overflow-hidden border border-[#1a1a2e]">
      {Array.from({ length: n }, (_, row) => (
        <div key={row} className="flex">
          {Array.from({ length: n }, (_, col) => {
            const isLight = (row + col) % 2 === 0;
            const hasQueen = solution[row] === col;
            return (
              <div key={col}
                className="flex items-center justify-center font-bold transition-all duration-300"
                style={{
                  width: cellSize, height: cellSize,
                  background: hasQueen ? "#6366f1" : isLight ? "#1a1a30" : "#0d0d1f",
                  boxShadow: hasQueen ? "inset 0 0 12px rgba(99,102,241,0.6)" : undefined,
                  fontSize: cellSize * 0.55,
                }}
              >
                {hasQueen && <span style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}>♛</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}


// Maze grid visualizer
interface MazeGridProps {
  maze: number[][];
  path?: number[][];
  start?: number[];
  end?: number[];
}
export function MazeGrid({ maze, path = [], start = [0,0], end }: MazeGridProps) {
  if (!maze?.length) return null;
  const pathSet = new Set(path.map(([r,c]) => `${r},${c}`));
  const rows = maze.length;
  const cols = maze[0]?.length ?? 0;
  const maxDim = Math.max(rows, cols);
  const cellSize = Math.min(40, Math.floor(300 / maxDim));

  return (
    <div className="inline-block rounded-xl overflow-hidden border border-[#1a1a2e]">
      {maze.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => {
            const isPath  = pathSet.has(`${r},${c}`);
            const isStart = r === start[0] && c === start[1];
            const isEnd   = end && r === end[0] && c === end[1];
            const isWall  = cell === 1;
            const bg = isWall  ? "#0a0a14"
              : isEnd   ? "#10b981"
              : isStart ? "#6366f1"
              : isPath  ? "#8b5cf6"
              : "#1a1a2e";
            return (
              <div key={c} className="flex items-center justify-center transition-colors duration-200"
                style={{ width: cellSize, height: cellSize, background: bg,
                  border: "1px solid #0d0d1e",
                  boxShadow: (isStart||isEnd) ? "0 0 8px rgba(99,102,241,0.7)" : undefined,
                }}>
                <span className="text-[8px] font-mono" style={{ color: isWall?"#0d0d1e": isPath?"#e2e8f0":"#2a2a4e" }}>
                  {isStart ? "S" : isEnd ? "E" : isWall ? "█" : ""}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}


// Sudoku board
interface SudokuProps { board: number[][]; }
export function SudokuGrid({ board }: SudokuProps) {
  if (!board?.length) return null;
  return (
    <div className="inline-block rounded-xl overflow-hidden border-2 border-[#6366f1]/40">
      {board.map((row, r) => (
        <div key={r} className="flex" style={{ borderBottom: r % 3 === 2 && r < 8 ? "2px solid rgba(99,102,241,0.3)" : "1px solid #0d0d1e" }}>
          {row.map((val, c) => (
            <div key={c}
              className="w-8 h-8 flex items-center justify-center font-mono text-sm font-semibold"
              style={{
                borderRight: c % 3 === 2 && c < 8 ? "2px solid rgba(99,102,241,0.3)" : "1px solid #0d0d1e",
                background: val === 0 ? "#0a0a14" : (r + c) % 2 === 0 ? "#0f0f1e" : "#0a0a14",
                color: val === 0 ? "#1a1a2e" : "#e2e8f0",
              }}
            >
              {val || "·"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

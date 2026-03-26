import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Landing     from "./pages/Landing";
import Visualizer  from "./pages/Visualizer";
import BattleMode  from "./pages/BattleMode";
import Benchmark   from "./pages/Benchmark";
import { Compare } from "./pages/Compare";
import { Leaderboard, GraphLab, DPLab, BacktrackLab, StringLab, MathLab } from "./pages/Labs";

export default function App() {
  return (
    <Routes>
      {/* Full-screen landing with 3D */}
      <Route path="/" element={<Landing />} />

      {/* App shell with sidebar */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/visualizer"  element={<Visualizer />} />
            <Route path="/battle"      element={<BattleMode />} />
            <Route path="/benchmark"   element={<Benchmark />} />
            <Route path="/compare"     element={<Compare />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/graph"       element={<GraphLab />} />
            <Route path="/dp"          element={<DPLab />} />
            <Route path="/backtrack"   element={<BacktrackLab />} />
            <Route path="/string"      element={<StringLab />} />
            <Route path="/math"        element={<MathLab />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

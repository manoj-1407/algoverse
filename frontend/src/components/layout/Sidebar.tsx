import { NavLink } from "react-router-dom";
import {
  Atom, Play, BarChart2, GitCompare, Trophy, Network,
  Brain, Puzzle, Type, Hash, Volume2, VolumeX, Swords,
  FlaskConical, Globe, Sun, Moon, Monitor,
} from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "../../stores/app";
import type { Theme } from "../../stores/app";

const NAV = [
  { to: "/",            icon: Globe,       label: "Universe",      group: "explore" },
  { to: "/visualizer",  icon: Play,        label: "Visualizer",    group: "explore" },
  { to: "/battle",      icon: Swords,      label: "Battle Mode",   group: "explore" },
  { to: "/benchmark",   icon: BarChart2,   label: "Benchmark",     group: "analyze" },
  { to: "/compare",     icon: GitCompare,  label: "Compare",       group: "analyze" },
  { to: "/leaderboard", icon: Trophy,      label: "Leaderboard",   group: "analyze" },
  { to: "/graph",       icon: Network,     label: "Graph Lab",     group: "labs"    },
  { to: "/dp",          icon: Brain,       label: "DP Lab",        group: "labs"    },
  { to: "/backtrack",   icon: Puzzle,      label: "Backtrack Lab", group: "labs"    },
  { to: "/string",      icon: Type,        label: "String Lab",    group: "labs"    },
  { to: "/math",        icon: Hash,        label: "Math Lab",      group: "labs"    },
];

const GROUPS: Record<string, string> = { explore: "Explore", analyze: "Analyze", labs: "Algorithm Labs" };

const THEMES: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "dark",   icon: Moon,    label: "Dark"   },
  { value: "light",  icon: Sun,     label: "Light"  },
  { value: "system", icon: Monitor, label: "System" },
];

export default function Sidebar() {
  const { soundEnabled, setSoundEnabled, theme, setTheme } = useAppStore();

  const grouped = NAV.reduce((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {} as Record<string, typeof NAV>);

  return (
    <aside
      className="w-52 flex-shrink-0 flex flex-col border-r"
      style={{ background: "var(--bg-0)", borderColor: "var(--c-border)", transition: "background 0.25s ease" }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: "var(--c-border)" }}>
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center glow-indigo flex-shrink-0">
            <Atom size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm leading-none" style={{ color: "var(--c-text-1)" }}>
              Algoverse
            </div>
            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">v3.0 · 34+ algos</div>
          </div>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div className="label px-2 mb-1.5">{GROUPS[group]}</div>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to} to={to} end={to === "/"}
                  className={({ isActive }) =>
                    clsx("nav-link", isActive ? "nav-link-active" : "nav-link-inactive")
                  }
                >
                  <Icon size={14} />
                  <span className="text-xs">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 pb-4 pt-3 border-t space-y-2" style={{ borderColor: "var(--c-border)" }}>
        {/* Theme toggle */}
        <div>
          <div className="label mb-1.5 px-1">Theme</div>
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--c-border)" }}>
            {THEMES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className="flex-1 flex items-center justify-center py-2 transition-all duration-150"
                style={{
                  background: theme === value ? "rgba(99,102,241,0.15)" : "transparent",
                  color: theme === value ? "#a5b4fc" : "var(--c-text-3)",
                  borderRight: value !== "system" ? `1px solid var(--c-border)` : undefined,
                }}
              >
                <Icon size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
          style={{ color: "var(--c-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {soundEnabled
            ? <Volume2 size={13} className="text-indigo-400" />
            : <VolumeX size={13} />
          }
          Sound {soundEnabled ? "On" : "Off"}
        </button>
      </div>
    </aside>
  );
}

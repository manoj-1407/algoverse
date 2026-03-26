export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"',"monospace"],
        display: ['"Syne"',"sans-serif"],
        body: ['"Inter"',"sans-serif"],
      },
      colors: {
        av: {
          bg:      "#020209",
          surface: "#0a0a14",
          s2:      "#0f0f1e",
          border:  "#1a1a2e",
          accent:  "#6366f1",
          violet:  "#8b5cf6",
          cyan:    "#06b6d4",
          green:   "#10b981",
          amber:   "#f59e0b",
          red:     "#ef4444",
          pink:    "#ec4899",
          text:    "#e2e8f0",
          muted:   "#475569",
        }
      }
    }
  },
  plugins: [],
};

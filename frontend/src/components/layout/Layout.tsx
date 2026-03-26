import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAppStore } from "../../stores/app";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();

  // Apply data-theme to <html> whenever theme changes (including system preference)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.setAttribute("data-theme", mq.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) =>
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-0)", transition: "background 0.25s ease" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto grid-bg">{children}</main>
    </div>
  );
}

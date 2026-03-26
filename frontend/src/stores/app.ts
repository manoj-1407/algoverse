import { create } from "zustand";

export type Theme = "dark" | "light" | "system";

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

interface AppStore {
  soundEnabled: boolean;
  theme: Theme;
  setSoundEnabled: (v: boolean) => void;
  setTheme: (t: Theme) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  soundEnabled: load("av_sound", true),
  theme:        load<Theme>("av_theme", "dark"),
  setSoundEnabled: (soundEnabled) => { save("av_sound", soundEnabled); set({ soundEnabled }); },
  setTheme:        (theme)        => { save("av_theme", theme);        set({ theme }); },
}));

import { useState, useCallback, useEffect } from 'react';
import { C } from '../config/constants.js';

// ══════════════════════════════════════════════════════════════
// useTheme — 3 Modlu Tema Motoru
// ──────────────────────────────────────────────────────────────
// 1. data-theme attribute → CSS variable overrides tetikler
// 2. C nesnesini mutasyona ugratir → inline style'lar guncellenir
// 3. localStorage'da kalici
// ══════════════════════════════════════════════════════════════

const THEME_KEY = "atolye_theme";

// ── Tema bazli C nesne degerleri ──
const THEME_C_VALUES = {
  dark: {
    bg: "#060608", s1: "#0A0A0D", s2: "#0D0D11", s3: "#111115", s4: "#161619",
    border: "rgba(255,255,255,.055)", borderHi: "rgba(255,255,255,.1)",
    text: "#EDE8DF", sub: "rgba(237,232,223,.48)", muted: "rgba(237,232,223,.24)",
    cyan: "#E8914A", mint: "#3DB88A", coral: "#DC3C3C", gold: "#C8872A",
    lav: "#7C5CBF", sky: "#3E7BD4", orange: "#D46B2A",
  },
  parasut: {
    bg: "#F4F5F7", s1: "#ECEDF0", s2: "#E4E5E9", s3: "#DBDCE1", s4: "#D0D1D7",
    border: "#E2E4E8", borderHi: "#C8CAD0",
    text: "#2A2B2F", sub: "rgba(42,43,47,.58)", muted: "#878C93",
    cyan: "#E96458", mint: "#48C7A6", coral: "#DC3C3C", gold: "#D4920A",
    lav: "#7C5CBF", sky: "#3E7BD4", orange: "#E96458",
  },
  "nordic-light": {
    bg: "#F8FAFC", s1: "#EFF2F5", s2: "#E5E9EE", s3: "#D8DDE4", s4: "#CBD2DA",
    border: "#E2E8F0", borderHi: "#CBD5E1",
    text: "#0F172A", sub: "rgba(15,23,42,.55)", muted: "#64748B",
    cyan: "#3B82F6", mint: "#10B981", coral: "#EF4444", gold: "#F59E0B",
    lav: "#8B5CF6", sky: "#0EA5E9", orange: "#F97316",
  },
};

// ── Tema meta (UI icin) ──
export const THEME_OPTIONS = [
  { id: "dark", label: "Koyu", icon: "🌙" },
  { id: "parasut", label: "Parasut", icon: "☀️" },
  { id: "nordic-light", label: "Nordic", icon: "❄️" },
];

// ── Temayi uygula ──
function applyTheme(id) {
  // 1. data-theme attribute → CSS vars tetikle
  document.documentElement.setAttribute("data-theme", id);

  // 2. C nesnesini mutasyona ugrat → inline style'lar guncellenir
  const vals = THEME_C_VALUES[id];
  if (vals) {
    Object.assign(C, vals);
  }
}

// ── Hook ──
export function useTheme() {
  const [themeId, setThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved && THEME_C_VALUES[saved] ? saved : "dark";
    } catch {
      return "dark";
    }
  });

  // Ilk mount
  useEffect(() => {
    applyTheme(themeId);
  }, []);

  const switchTheme = useCallback((newId) => {
    if (!THEME_C_VALUES[newId]) return;
    applyTheme(newId);
    setThemeId(newId);
    try { localStorage.setItem(THEME_KEY, newId); } catch {}
  }, []);

  return { themeId, switchTheme };
}

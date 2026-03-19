// ══════════════════════════════════════════════════════════════════
// ATÖLYE OS — 8 MODLU TEMA MOTORU
// ──────────────────────────────────────────────────────────────────
// Her tema C nesnesinin tüm özelliklerini barındırır.
// applyTheme() çağrıldığında C nesnesi yerinde mutasyona uğrar
// ve CSS custom properties güncellenir → anında tema değişimi.
// ══════════════════════════════════════════════════════════════════

import { C } from './constants.js';

// ── 8 Efsanevi Tema ─────────────────────────────────────────────

export const THEMES = {
  // ─────────────────────────────────────────────────────
  // 1. NEO-ENDÜSTRİ — Mevcut Atölye koyu modu
  // ─────────────────────────────────────────────────────
  "neo-endustri": {
    id: "neo-endustri",
    label: "Neo-Endüstri",
    icon: "🏭",
    preview: ["#060608", "#E8914A"],
    colors: {
      bg: "#060608", s1: "#0A0A0D", s2: "#0D0D11", s3: "#111115", s4: "#161619",
      border: "rgba(255,255,255,.055)", borderHi: "rgba(255,255,255,.1)",
      text: "#EDE8DF", sub: "rgba(237,232,223,.48)", muted: "rgba(237,232,223,.24)",
      cyan: "#E8914A", mint: "#3DB88A", coral: "#DC3C3C", gold: "#C8872A",
      lav: "#7C5CBF", sky: "#3E7BD4", orange: "#D46B2A",
    },
  },

  // ─────────────────────────────────────────────────────
  // 2. İSKANDİNAV — Ferah beyaz, buz mavisi + çam yeşili
  // ─────────────────────────────────────────────────────
  "iskandinav": {
    id: "iskandinav",
    label: "İskandinav",
    icon: "❄️",
    preview: ["#F5F7FA", "#2E86AB"],
    colors: {
      bg: "#F5F7FA", s1: "#EBEEF2", s2: "#E0E4E8", s3: "#D4D8DE", s4: "#C8CCD4",
      border: "rgba(0,0,0,.08)", borderHi: "rgba(0,0,0,.14)",
      text: "#1A2332", sub: "rgba(26,35,50,.55)", muted: "rgba(26,35,50,.3)",
      cyan: "#2E86AB", mint: "#2D9B6E", coral: "#C44536", gold: "#B8860B",
      lav: "#6B5CA5", sky: "#4A90D9", orange: "#D4722A",
    },
  },

  // ─────────────────────────────────────────────────────
  // 3. TERRA — Sıcak ahşap/mobilya tonu
  // ─────────────────────────────────────────────────────
  "terra": {
    id: "terra",
    label: "Terra",
    icon: "🪵",
    preview: ["#1A0F0A", "#C9A84C"],
    colors: {
      bg: "#1A0F0A", s1: "#231510", s2: "#2C1B14", s3: "#362218", s4: "#40291D",
      border: "rgba(205,165,120,.12)", borderHi: "rgba(205,165,120,.2)",
      text: "#E8D5C0", sub: "rgba(232,213,192,.52)", muted: "rgba(232,213,192,.28)",
      cyan: "#C9A84C", mint: "#7BA05B", coral: "#A63D2F", gold: "#D4A437",
      lav: "#8B6C9C", sky: "#5E8BAE", orange: "#B8652A",
    },
  },

  // ─────────────────────────────────────────────────────
  // 4. CYBERPUNK — Neon pembe + elektrik mavisi
  // ─────────────────────────────────────────────────────
  "cyberpunk": {
    id: "cyberpunk",
    label: "Cyberpunk",
    icon: "⚡",
    preview: ["#0A0618", "#FF2E97"],
    colors: {
      bg: "#0A0618", s1: "#0F0B22", s2: "#14102C", s3: "#1A1538", s4: "#201B42",
      border: "rgba(160,100,255,.1)", borderHi: "rgba(160,100,255,.18)",
      text: "#E8E0FF", sub: "rgba(232,224,255,.5)", muted: "rgba(232,224,255,.25)",
      cyan: "#FF2E97", mint: "#00F5A0", coral: "#FF4757", gold: "#FFD32A",
      lav: "#A855F7", sky: "#00D4FF", orange: "#FF6B35",
    },
  },

  // ─────────────────────────────────────────────────────
  // 5. KURUMSAL FİNANS — Profesyonel lacivert
  // ─────────────────────────────────────────────────────
  "kurumsal": {
    id: "kurumsal",
    label: "Kurumsal",
    icon: "🏢",
    preview: ["#0C1220", "#3B82F6"],
    colors: {
      bg: "#0C1220", s1: "#111828", s2: "#151E30", s3: "#1A2538", s4: "#1F2C42",
      border: "rgba(148,163,184,.12)", borderHi: "rgba(148,163,184,.2)",
      text: "#E2E8F0", sub: "rgba(226,232,240,.5)", muted: "rgba(226,232,240,.28)",
      cyan: "#3B82F6", mint: "#10B981", coral: "#EF4444", gold: "#F59E0B",
      lav: "#8B5CF6", sky: "#0EA5E9", orange: "#F97316",
    },
  },

  // ─────────────────────────────────────────────────────
  // 6. BLUEPRINT CAD — Mühendislik çizim tahtası
  // ─────────────────────────────────────────────────────
  "blueprint": {
    id: "blueprint",
    label: "Blueprint",
    icon: "📐",
    preview: ["#041A2F", "#FFD600"],
    colors: {
      bg: "#041A2F", s1: "#062240", s2: "#082A4A", s3: "#0A3255", s4: "#0D3B60",
      border: "rgba(100,180,255,.12)", borderHi: "rgba(100,180,255,.2)",
      text: "#E0F0FF", sub: "rgba(224,240,255,.5)", muted: "rgba(224,240,255,.28)",
      cyan: "#FFD600", mint: "#00E676", coral: "#FF5252", gold: "#FFAB00",
      lav: "#B388FF", sky: "#40C4FF", orange: "#FF9100",
    },
  },

  // ─────────────────────────────────────────────────────
  // 7. MONOKROM — Japon minimalizmi, saf siyah-beyaz
  // ─────────────────────────────────────────────────────
  "monokrom": {
    id: "monokrom",
    label: "Monokrom",
    icon: "◑",
    preview: ["#080808", "#A0A0A0"],
    colors: {
      bg: "#080808", s1: "#101010", s2: "#181818", s3: "#202020", s4: "#282828",
      border: "rgba(255,255,255,.08)", borderHi: "rgba(255,255,255,.14)",
      text: "#E0E0E0", sub: "rgba(224,224,224,.45)", muted: "rgba(224,224,224,.22)",
      cyan: "#B0B0B0", mint: "#8A8A8A", coral: "#A0A0A0", gold: "#909090",
      lav: "#959595", sky: "#7A7A7A", orange: "#999999",
    },
  },

  // ─────────────────────────────────────────────────────
  // 8. ORMAN / EKO — Sürdürülebilir yeşil
  // ─────────────────────────────────────────────────────
  "orman": {
    id: "orman",
    label: "Orman",
    icon: "🌲",
    preview: ["#0A1A12", "#4ADE80"],
    colors: {
      bg: "#0A1A12", s1: "#0E2218", s2: "#122A1E", s3: "#163224", s4: "#1A3A2A",
      border: "rgba(120,200,150,.1)", borderHi: "rgba(120,200,150,.18)",
      text: "#D8EEE0", sub: "rgba(216,238,224,.5)", muted: "rgba(216,238,224,.28)",
      cyan: "#4ADE80", mint: "#34D399", coral: "#F87171", gold: "#FBBF24",
      lav: "#A78BFA", sky: "#60A5FA", orange: "#FB923C",
    },
  },
};

// ── Tema listesi (UI icin) ──
export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME = "neo-endustri";

// ── Tema uygula: C nesnesini mutasyona ugratir + CSS vars gunceller ──
export function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  // C nesnesinin tum color property'lerini degistir
  Object.assign(C, theme.colors);

  // CSS custom properties (index.css veya :root icin)
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([k, v]) => {
    root.style.setProperty(`--c-${k}`, v);
  });

  // Light mode class (iskandinav icin)
  if (themeId === "iskandinav") {
    root.classList.add("light-theme");
  } else {
    root.classList.remove("light-theme");
  }
}

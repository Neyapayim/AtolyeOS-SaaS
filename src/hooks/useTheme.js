import { useState, useCallback, useEffect } from 'react';
import { THEMES, DEFAULT_THEME, applyTheme } from '../config/themes.js';

// ══════════════════════════════════════════════════════════════════
// useTheme — Tema yonetim hook'u
// ──────────────────────────────────────────────────────────────────
// Secili temayi localStorage'da saklar (Firestore sync gereksiz —
// tema tercihi cihaza ozeldir, buluta tasimaya gerek yok).
// applyTheme() cagirildiginda C nesnesi mutasyona ugrar ve
// hook'un dondurdugu re-render tum UI'i gunceller.
// ══════════════════════════════════════════════════════════════════

const THEME_STORAGE_KEY = "atolye_theme";

export function useTheme() {
  const [themeId, setThemeId] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved && THEMES[saved] ? saved : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  // Ilk mount'ta temayi uygula
  useEffect(() => {
    applyTheme(themeId);
  }, []);

  // Tema degistir
  const switchTheme = useCallback((newId) => {
    if (!THEMES[newId]) return;
    applyTheme(newId);
    setThemeId(newId);
    try { localStorage.setItem(THEME_STORAGE_KEY, newId); } catch {}
  }, []);

  return { themeId, switchTheme };
}

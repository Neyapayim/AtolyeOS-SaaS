import { useState, useCallback } from "react";

/**
 * useStored: localStorage ile senkronize state hook'u.
 * key: localStorage anahtarı ("atolye_" prefix'i otomatik eklenir)
 * init: varsayılan değer
 *
 * NOT: Firebase geçişinde bu hook useFirestore ile değiştirilecek.
 */
export function useStored(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem("atolye_" + key);
      return s ? JSON.parse(s) : init;
    } catch {
      return init;
    }
  });

  const set = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try {
        localStorage.setItem("atolye_" + key, JSON.stringify(next));
      } catch { /* localStorage full veya hata */ }
      return next;
    });
  }, [key]);

  return [val, set];
}

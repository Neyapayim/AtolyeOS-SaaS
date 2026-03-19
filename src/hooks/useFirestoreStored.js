import { useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, isConfigured } from '../config/firebase.js';

// ══════════════════════════════════════════════════════════════════
// useFirestoreStored — Hybrid localStorage + Firestore Hook
// ──────────────────────────────────────────────────────────────────
// Drop-in replacement for useStored. Same API: [val, set]
//
// Katman 1: React state (anlik UI)
// Katman 2: localStorage (anlik persistence, offline)
// Katman 3: Firestore (bulut, 500ms debounce)
//
// Ilk yukleme: localStorage'dan oku (sifir gecikme)
// Auth hazir: Firestore'dan oku, yoksa localStorage'i migrate et
// Yazma: state + localStorage (anlik) + Firestore (debounced)
// ══════════════════════════════════════════════════════════════════

// ── Module-level uid tracking (repolar icin) ──
let _currentUid = null;
export const getFirestoreUid = () => _currentUid;

// ── Debounce timers (key bazli) ──
const _debounceTimers = {};

// ── Firestore doc yolu ──
const docPath = (uid, key) => doc(db, "users", uid, "data", key);

export function useFirestoreStored(key, init) {
  const fullKey = "atolye_" + key;

  // Auth state — ProtectedRoute garanti eder ama demo modda null olabilir
  const uid = isConfigured ? auth.currentUser?.uid : null;

  // uid'yi module-level'a yaz (repolar icin)
  useEffect(() => { _currentUid = uid; }, [uid]);

  // Local write flag — mount'tan sonra yerel degisiklik olduysa cloud overwrite'i engeller
  const localWriteRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // ── Katman 1: State — localStorage'dan anlik init ──
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(fullKey);
      return s ? JSON.parse(s) : init;
    } catch {
      return init;
    }
  });

  // ── Katman 3: Firestore senkronizasyonu (uid hazir oldugunda) ──
  useEffect(() => {
    if (!uid || !db) return;
    localWriteRef.current = false;

    const ref = docPath(uid, key);
    getDoc(ref)
      .then(snap => {
        if (!mountedRef.current) return;

        if (snap.exists()) {
          // ── Cloud'da veri var ──
          if (!localWriteRef.current) {
            // Kullanici mount'tan beri yerel degisiklik yapmadiysa → cloud veriyi al
            const cloudData = snap.data().payload;
            setVal(cloudData);
            try { localStorage.setItem(fullKey, JSON.stringify(cloudData)); } catch {}
          } else {
            // Kullanici mount sonrasi yerel degisiklik yapti → yerel veriyi cloud'a bas
            try {
              const localStr = localStorage.getItem(fullKey);
              if (localStr) {
                setDoc(ref, { payload: JSON.parse(localStr), updatedAt: new Date().toISOString() }).catch(() => {});
              }
            } catch {}
          }
        } else {
          // ── Cloud bos → MIGRATION: localStorage verisini Firestore'a aktar ──
          try {
            const localStr = localStorage.getItem(fullKey);
            const localData = localStr ? JSON.parse(localStr) : init;
            // Sadece anlamli veri varsa migrate et (bos array/object degil)
            const hasData = Array.isArray(localData) ? localData.length > 0 : (localData && typeof localData === 'object' && Object.keys(localData).length > 0);
            if (hasData || localStr) {
              setDoc(ref, { payload: localData, updatedAt: new Date().toISOString() }).catch(() => {});
            }
          } catch {}
        }
      })
      .catch(err => {
        // Firestore okuma hatasi — localStorage ile devam et (offline mode)
        if (import.meta.env.DEV) console.warn(`[Firestore] ${key} okuma hatasi:`, err?.message);
      });
  }, [uid, key, fullKey]);

  // ── Setter: 3 katmanli yazma ──
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;

      // Katman 2: localStorage (anlik)
      try { localStorage.setItem(fullKey, JSON.stringify(next)); } catch {}

      // Katman 3: Firestore (debounced 500ms)
      localWriteRef.current = true;
      if (uid && db) {
        if (_debounceTimers[fullKey]) clearTimeout(_debounceTimers[fullKey]);
        _debounceTimers[fullKey] = setTimeout(() => {
          setDoc(docPath(uid, key), {
            payload: next,
            updatedAt: new Date().toISOString(),
          }).catch(err => {
            if (import.meta.env.DEV) console.warn(`[Firestore] ${key} yazma hatasi:`, err?.message);
          });
        }, 500);
      }

      return next;
    });
  }, [fullKey, uid, key]);

  return [val, set];
}

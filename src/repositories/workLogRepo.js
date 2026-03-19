// ── WORKLOG REPOSITORY ────────────────────────────────────────
// Aşama bazlı çalışma süresi kayıtları.
// Katman: localStorage (anlik) + Firestore (async sync)

import { doc, setDoc } from 'firebase/firestore';
import { db, isConfigured } from '../config/firebase.js';
import { getFirestoreUid } from '../hooks/useFirestoreStored.js';

const WORKLOG_KEY = "atolye_workLogs";

// Firestore'a async sync
const syncToCloud = (liste) => {
  if (!isConfigured || !db) return;
  const uid = getFirestoreUid();
  if (!uid) return;
  setDoc(doc(db, "users", uid, "data", "workLogs"), {
    payload: liste,
    updatedAt: new Date().toISOString(),
  }).catch(() => {});
};

export const workLogRepo = {
  getAll: () => {
    try { return JSON.parse(localStorage.getItem(WORKLOG_KEY)||"[]"); }
    catch { return []; }
  },
  ac: (ueId, asamaId, asamaAd, calisanAd, planlananSure) => {
    const liste = workLogRepo.getAll();
    const mevcutIdx = liste.findIndex(w=>w.uretimEmriId===ueId&&w.asamaId===asamaId&&w.durum==="devam");
    if(mevcutIdx>=0) return liste[mevcutIdx]; // Zaten açık
    const log = {
      id: "wl-" + Date.now() + "-" + Math.random().toString(36).slice(2,6),
      uretimEmriId: ueId,
      asamaId, asamaAd, calisanAd: calisanAd||"—",
      basladiAt: new Date().toISOString(),
      bittiAt: null,
      planlananSure: planlananSure||0, // saniye
      gerceklesenSure: null,
      durum: "devam",
      not: "", sorun: "",
    };
    liste.push(log);
    try { localStorage.setItem(WORKLOG_KEY, JSON.stringify(liste)); } catch(e){ if(import.meta.env.DEV) console.warn('[workLog] localStorage yazma hatası:', e?.message); }
    syncToCloud(liste);
    return log;
  },
  kapat: (ueId, asamaId) => {
    if(!ueId || !asamaId) return null;
    const liste = workLogRepo.getAll();
    const idx = liste.findIndex(w=>w.uretimEmriId===ueId&&w.asamaId===asamaId&&w.durum==="devam");
    if(idx<0) return null;
    const log = liste[idx];
    const bittiAt = new Date().toISOString();
    const gerceklesenSure = Math.floor((new Date(bittiAt)-new Date(log.basladiAt))/1000);
    liste[idx] = { ...log, bittiAt, gerceklesenSure, durum:"bitti" };
    try { localStorage.setItem(WORKLOG_KEY, JSON.stringify(liste)); } catch(e){ if(import.meta.env.DEV) console.warn('[workLog] localStorage yazma hatası:', e?.message); }
    syncToCloud(liste);
    return liste[idx];
  },
  byUE: (ueId) => workLogRepo.getAll().filter(w=>w.uretimEmriId===ueId),
};

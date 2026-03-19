// ── STOK HAREKETİ REPOSITORY ──────────────────────────────────
// Append-only stok geçmişi. Hiçbir zaman silinmez.

const STOK_HAREKET_KEY = "atolye_stokHareketleri";

export const stokHareketiRepo = {
  getAll: () => {
    try { return JSON.parse(localStorage.getItem(STOK_HAREKET_KEY)||"[]"); }
    catch { return []; }
  },
  ekle: (hareket) => {
    const liste = stokHareketiRepo.getAll();
    const yeni = {
      id: "sh-" + Date.now() + "-" + Math.random().toString(36).slice(2,6),
      createdAt: new Date().toISOString(),
      ...hareket,
    };
    liste.push(yeni);
    try { localStorage.setItem(STOK_HAREKET_KEY, JSON.stringify(liste)); } catch(e){ if(import.meta.env.DEV) console.warn('[stokHareket] localStorage yazma hatası:', e?.message); }
    return yeni;
  },
  byStokId: (stokId) => stokHareketiRepo.getAll().filter(h=>h.stokId===stokId),
  byReferenceId: (refId) => stokHareketiRepo.getAll().filter(h=>h.referenceId===refId),
};

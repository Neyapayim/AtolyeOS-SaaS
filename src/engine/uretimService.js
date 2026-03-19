// ── ÜRETİM SERVICE ────────────────────────────────────────────
// Üretim tamamlandığında stok düşme + hareket kaydı.

import { bomMalzemeListesi } from './malzemeEngine.js';
import { stokHareketiRepo } from '../repositories/stokHareketiRepo.js';

/**
 * uretimTamamlaService:
 * 1. Üretim emrini bul
 * 2. BOM'dan tüm ham madde tüketimini hesapla (YM stok düşürme DAHİL)
 * 3. YM stoklarını düş
 * 4. Ham madde stoklarını düş
 * 5. Bitmiş ürün stokunu artır
 * 6. StockMovement kayıtlarını yaz
 * 7. UE durumunu tamamlandi yap
 */
export const uretimTamamlaService = (ueId, { uretimEmirleri, hamMaddeler, yarimamulList, urunler, setUretimEmirleri, setHamMaddeler, setUrunler, setYM }) => {
  const ue = uretimEmirleri.find(e=>e.id===ueId);
  if(!ue) return { uyarilar:[], hatalar:["Üretim emri bulunamadı"] };
  if(ue.durum==="tamamlandi") return { uyarilar:["Üretim emri zaten tamamlandı"], hatalar:[] };

  const urun = urunler.find(u=>u.id===ue.urunId);
  if(!urun) return { uyarilar:[], hatalar:["Ürün bulunamadı"] };

  const uyarilar = [];
  const adet = ue.adet||1;

  // 1. YM stok tüketimini hesapla
  const ymTuketim = {};
  const ymTuketimHesapla = (bom, carpan=1, depth=0) => {
    if(depth > 8) return;
    (bom||[]).forEach(b => {
      if(b.tip==="yarimamul") {
        const ym = yarimamulList.find(x=>x.id===b.kalemId);
        if(!ym) return;
        const ymGereken = (b.miktar||1) * carpan * adet;
        const ymStok = ym.miktar || 0;
        const onceki = ymTuketim[ym.id] || 0;
        const kalanStok = Math.max(0, ymStok - onceki);
        const stokKullanim = Math.min(ymGereken, kalanStok);
        const uretilecek = Math.max(0, ymGereken - stokKullanim);
        ymTuketim[ym.id] = onceki + stokKullanim;
        if(uretilecek > 0 && ym.bom?.length) {
          ymTuketimHesapla(ym.bom, uretilecek / adet, depth+1);
        }
      }
    });
  };
  ymTuketimHesapla(urun.bom);

  // 2. Ham madde tüketimini hesapla
  const malzemeliste = bomMalzemeListesi(urun, adet, hamMaddeler, yarimamulList, urunler);

  // 3. YM stoklarını düş
  if(setYM && Object.keys(ymTuketim).length > 0) {
    const yeniYM = yarimamulList.map(ym => {
      const tuketilen = ymTuketim[ym.id];
      if(!tuketilen || tuketilen <= 0) return ym;
      const yeniMiktar = Math.round(((ym.miktar||0) - tuketilen) * 1e10) / 1e10;
      if(yeniMiktar < 0) {
        uyarilar.push(`\⚠ YM ${ym.ad}: stok yetersiz (${Number(ym.miktar||0).toFixed(1)} var, ${Number(tuketilen).toFixed(1)} kullanıldı)`);
      }
      stokHareketiRepo.ekle({
        stokTipi: "yarimamul", stokId: ym.id,
        hareketTipi: "uretim_tuketimi", miktar: -tuketilen,
        birim: "adet", oncekiBakiye: ym.miktar||0,
        sonrakiBakiye: Math.max(0, yeniMiktar),
        kaynakModul: "uretim", referenceType: "uretim_emri",
        referenceId: ueId, note: `${ue.urunAd} - ${adet} adet üretim (YM tüketimi)`,
      });
      return { ...ym, miktar: Math.max(0, yeniMiktar) };
    });
    setYM(yeniYM);
  }

  // 4. Ham madde stoklarını düş
  const yeniHamMaddeler = hamMaddeler.map(hm => {
    const tuketim = malzemeliste.find(m=>m.id===hm.id);
    if(!tuketim || tuketim.gereken<=0) return hm;
    const yeniMiktar = Math.round(((hm.miktar||0) - tuketim.gereken) * 1e10) / 1e10;
    if(yeniMiktar < 0) {
      uyarilar.push(`\⚠ ${hm.ad}: stok yetersiz (${Number(hm.miktar||0).toFixed(3)} var, ${Number(tuketim.gereken).toFixed(3)} gerekli)`);
    }
    stokHareketiRepo.ekle({
      stokTipi: "hammadde", stokId: hm.id,
      hareketTipi: "uretim_tuketimi", miktar: -(tuketim.gereken),
      birim: hm.birim, oncekiBakiye: hm.miktar||0,
      sonrakiBakiye: Math.max(0, yeniMiktar),
      kaynakModul: "uretim", referenceType: "uretim_emri",
      referenceId: ueId, note: `${ue.urunAd} - ${adet} adet üretim`,
    });
    return { ...hm, miktar: Math.max(0, yeniMiktar) };
  });

  // 5. Bitmiş ürün stokunu artır
  const yeniUrunler = urunler.map(u => {
    if(u.id !== ue.urunId) return u;
    const eskiStok = u.stok||0;
    const yeniStok = eskiStok + adet;
    stokHareketiRepo.ekle({
      stokTipi: "urun", stokId: u.id,
      hareketTipi: "bitirmis_urun_giris", miktar: adet,
      birim: "adet", oncekiBakiye: eskiStok, sonrakiBakiye: yeniStok,
      kaynakModul: "uretim", referenceType: "uretim_emri",
      referenceId: ueId, note: `${ue.urunAd} üretim tamamlandı`,
    });
    return { ...u, stok: yeniStok };
  });

  // 6. State güncelle
  setHamMaddeler(yeniHamMaddeler);
  setUrunler(yeniUrunler);
  setUretimEmirleri(prev => prev.map(e => e.id===ueId
    ? { ...e, durum:"tamamlandi", tamamlanmaTarihi:new Date().toISOString() }
    : e
  ));

  return { uyarilar, hatalar:[] };
};

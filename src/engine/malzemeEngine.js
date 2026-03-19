// ── MALZEME ENGINE ────────────────────────────────────────────
// TEK kaynak: eksik malzeme ve tedarik miktarı hesapları burada.

import { bomMiktarToStokBirimi } from './birimEngine.js';

/**
 * bomMalzemeListesi:
 * Bir ürünün BOM'undan gereken tüm ham maddeleri listeler.
 * YM stoğu varsa düşer, sadece üretilecek kısım için alt BOM'a iner.
 *
 * _sharedYmStok: Opsiyonel. Çoklu ürün hesaplarında YM stoğunu
 * ürünler arasında PAYLAŞTIRMAK için dışarıdan geçirilir.
 */
export const bomMalzemeListesi = (urun, adet, allHam, allYM, allUrun, _sharedYmStok) => {
  if(!urun?.bom || !adet) return [];
  const liste = [];
  const ymStokKullanim = _sharedYmStok || {};

  const hmEkle = (hm, bomMiktar, bomBirim, carpan) => {
    const stokMiktar = bomMiktarToStokBirimi(hm, bomMiktar||0, bomBirim||hm.birim);
    const gereken = stokMiktar * adet * carpan;
    const mevcut = hm.miktar||0;
    const var2 = liste.find(x=>x.id===hm.id);
    if(var2) {
      var2.gereken = Math.round((var2.gereken + gereken) * 1e10) / 1e10;
      var2.eksik = Math.max(0, Math.round((var2.gereken - var2.mevcut) * 1e10) / 1e10);
      var2.yeterli = var2.eksik === 0;
    } else {
      const eksik = Math.max(0, Math.round((gereken - mevcut) * 1e10) / 1e10);
      liste.push({ id:hm.id, ad:hm.ad, birim:hm.birim, gereken, mevcut, eksik, yeterli:eksik===0 });
    }
  };

  const ymIn = (ym, bomMiktar, carpan, depth) => {
    const ymBom = ym.bom || [];
    if(ymBom.length === 0) return;
    const ymGereken = Math.round((bomMiktar||1) * carpan * adet * 1e10) / 1e10;
    const ymStok = ym.miktar || 0;
    const onceki = ymStokKullanim[ym.id] || 0;
    const kalan = Math.max(0, ymStok - onceki);
    const stokK = Math.min(ymGereken, kalan);
    const uretilecek = Math.max(0, ymGereken - stokK);
    ymStokKullanim[ym.id] = onceki + stokK;
    if(uretilecek > 0) {
      topla(ymBom, Math.round((uretilecek / adet) * 1e10) / 1e10, depth+1);
    }
  };

  const topla = (bom, carpan=1, depth=0) => {
    if(depth > 8) return;
    (bom||[]).forEach(b => {
      if(b.tip==="hizmet") return;
      const hm = (allHam||[]).find(x=>x.id===b.kalemId);
      const ym = (allYM||[]).find(x=>x.id===b.kalemId);
      const ur = (allUrun||[]).find(x=>x.id===b.kalemId);

      if(hm) {
        hmEkle(hm, b.miktar, b.birim, carpan);
      } else if(ym || ur) {
        const hedef = ym || ur;
        if(hedef.bom?.length) {
          ymIn(hedef, b.miktar, carpan, depth);
        }
      }
    });
  };

  topla(urun.bom);
  return liste;
};

/**
 * eksikMalzemeleriHesapla:
 * Bir üretim emri için güncel stoka göre eksik malzemeleri hesaplar.
 */
export const eksikMalzemeleriHesapla = (ue, allHam, allYM, allUrun) => {
  if(!ue?.urunId) return [];
  const urun = (allUrun||[]).find(x=>x.id===ue.urunId);
  if(!urun) return [];
  const liste = bomMalzemeListesi(urun, ue.adet||1, allHam, allYM, allUrun);
  return liste
    .filter(m=>!m.yeterli)
    .map(m => ({
      ...m,
      tedarikDurum: (ue.eksikMalzemeler||[]).find(x=>x.id===m.id)?.tedarikDurum,
      siparisVerildi: (ue.eksikMalzemeler||[]).find(x=>x.id===m.id)?.siparisVerildi,
      geldiAt: (ue.eksikMalzemeler||[]).find(x=>x.id===m.id)?.geldiAt,
    }));
};

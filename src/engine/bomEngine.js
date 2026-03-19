// ── BOM ENGINE ────────────────────────────────────────────────
// TEK kaynak: tüm BOM maliyet hesapları burada.

import { boyUzunlukCmDuzelt, uzunlukBirimiToCm } from './birimEngine.js';

export const _netFiyat = (liste, iskonto) => (liste||0) * (1 - ((iskonto||0)/100));

/**
 * _bomKalemMaliyet: Tek bir BOM kaleminin maliyetini hesaplar (KDV dahil).
 */
export const _bomKalemMaliyet = (kalem, bomMiktar, bomBirim, allHam=[], allYM=[], allHiz=[], depth=0, firePct=0) => {
  if(!kalem || !bomMiktar || (depth||0) > 8) return 0;
  const efektifMiktar = bomMiktar * (1 + ((firePct||0)/100));

  // YM: rekürsif BOM hesabı
  if(kalem.bom !== undefined && !kalem.listeFiyat && !kalem.birimFiyat) {
    const birimMaliyet = _ymBirimMaliyet(kalem, allHam, allYM, allHiz, depth);
    return birimMaliyet * efektifMiktar;
  }

  const listeNet = _netFiyat(kalem.listeFiyat || kalem.birimFiyat || 0, kalem.iskonto || 0);
  if(!listeNet) return 0;
  const net = listeNet * (1 + ((kalem.kdv||0)/100));

  if(kalem.birimGrup==="adet" || kalem.tip==="ic" || kalem.tip==="fason" || !kalem.birimGrup) {
    return net * efektifMiktar;
  }
  if(kalem.birimGrup==="uzunluk") {
    const boyUzunlukCm = boyUzunlukCmDuzelt(kalem.boyUzunluk);
    const miktarCm = efektifMiktar * uzunlukBirimiToCm(bomBirim, boyUzunlukCm || 100);
    if(kalem.birim==="cm") return miktarCm * net;
    if(kalem.birim==="mm") return (miktarCm * 10) * net;
    return (miktarCm / 100) * net;
  }
  if(kalem.birimGrup==="alan") {
    const toCm2 = { cm2:1, m2:10000 };
    const hamCm2 = toCm2[kalem.birim] ?? 1;
    const bomCm2 = toCm2[bomBirim] ?? 1;
    return (net / hamCm2) * efektifMiktar * bomCm2;
  }
  if(kalem.birimGrup==="hacim") {
    const toCm3 = { cm3:1, lt:1000, m3:1000000 };
    const hamCm3 = toCm3[kalem.birim] ?? 1;
    const bomCm3 = toCm3[bomBirim] ?? 1;
    return (net / hamCm3) * efektifMiktar * bomCm3;
  }
  if(kalem.birimGrup==="agirlik") {
    const toGr = { gr:1, kg:1000 };
    const hamGr = toGr[kalem.birim] ?? 1;
    const bomGr = toGr[bomBirim] ?? 1;
    return (net / hamGr) * efektifMiktar * bomGr;
  }
  return net * efektifMiktar;
};

export const _ymBirimMaliyet = (ym, allHam=[], allYM=[], allHiz=[], depth=0) => {
  if(!ym || depth > 8) return 0;
  return (ym.bom||[]).reduce((s,b) => {
    const kalem = allHam.find(x=>x.id===b.kalemId) || allYM.find(x=>x.id===b.kalemId) || allHiz.find(x=>x.id===b.kalemId);
    if(!kalem) return s;
    return s + _bomKalemMaliyet(kalem, b.miktar, b.birim, allHam, allYM, allHiz, depth+1, b.fireTahmini||0);
  }, 0);
};

// Public alias'lar
export const netFiyat = _netFiyat;
export const ymBirimMaliyet = _ymBirimMaliyet;
export const bomKalemMaliyet = _bomKalemMaliyet;

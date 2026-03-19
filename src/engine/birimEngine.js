// ── BİRİM ENGINE ──────────────────────────────────────────────
// TEK kaynak: tüm birim dönüşümleri burada.
// Başka hiçbir yerde birim hesabı yapılmaz.

// ── ZAMAN YARDIMCILARI ────────────────────────────────────────
// Tüm süreler: SANİYE (integer). "Dk" hiçbir yerde kullanılmaz.
export const snGoster = (sn) => {
  if(!sn||sn<=0) return "—";
  const dk = Math.floor(sn/60), s = sn%60;
  return dk>0 ? `${dk}dk${s>0?" "+s+"sn":""}` : `${s}sn`;
};
export const snToStr = snGoster; // alias

/**
 * boyUzunlukuDuzelt: Ham madde kayıtlarında boyUzunluk cm cinsinden.
 * Kullanıcı yanlışlıkla mt girebilir (6 yerine 600 yazacakken 6 yazar).
 * <10 ise mt sanıp ×100 yapar.
 */
export const boyUzunlukCmDuzelt = (v) => {
  const n = Number(v)||0;
  if(n<=0) return 0;
  return n < 10 ? n * 100 : n; // 6 → 600, 600 → 600
};

/**
 * birimToCm: Herhangi bir uzunluk birimini cm'e çevirir.
 * boyUzunlukCm: ham maddenin 1 boy kaç cm olduğu.
 */
export const uzunlukBirimiToCm = (birim, boyUzunlukCm) => {
  const map = { mm: 0.1, cm: 1, mt: 100, boy: boyUzunlukCm || 1 };
  return map[birim] ?? 1;
};

/**
 * bomMiktarToStokBirimi:
 * BOM'da girilen miktarı ham maddenin STOK birimine çevirir.
 * Örnek: BOM=25cm, stok birimi=boy, boyUzunluk=600cm → 25/600 = 0.0417 boy
 * Bu fonksiyon TEK kaynak — tedarik ve malzeme kontrol buradan beslenir.
 */
export const bomMiktarToStokBirimi = (hm, bomMiktar, bomBirim) => {
  if(!hm || !bomMiktar) return 0;
  const grup = hm.birimGrup;
  if(!grup || grup==="adet") return bomMiktar;

  if(grup==="uzunluk") {
    const boyUzunlukCm = boyUzunlukCmDuzelt(hm.boyUzunluk);
    const miktarCm = bomMiktar * uzunlukBirimiToCm(bomBirim, boyUzunlukCm||1);
    if(hm.birim==="mt")  return miktarCm / 100;
    if(hm.birim==="cm")  return miktarCm;
    if(hm.birim==="mm")  return miktarCm * 10;
    if(hm.birim==="boy") {
      if(!boyUzunlukCm) return bomMiktar;
      return miktarCm / boyUzunlukCm;
    }
    return miktarCm / 100; // fallback: mt gibi
  }
  if(grup==="alan") {
    const toCm2 = { cm2:1, m2:10000 };
    const miktarCm2 = bomMiktar * (toCm2[bomBirim]??1);
    if(hm.birim==="m2")  return miktarCm2 / 10000;
    return miktarCm2;
  }
  if(grup==="hacim") {
    const toCm3 = { cm3:1, lt:1000, m3:1000000 };
    const miktarCm3 = bomMiktar * (toCm3[bomBirim]??1);
    if(hm.birim==="m3")  return miktarCm3 / 1000000;
    if(hm.birim==="lt")  return miktarCm3 / 1000;
    return miktarCm3;
  }
  if(grup==="agirlik") {
    const toGr = { gr:1, kg:1000 };
    const miktarGr = bomMiktar * (toGr[bomBirim]??1);
    if(hm.birim==="kg") return miktarGr / 1000;
    return miktarGr;
  }
  return bomMiktar;
};

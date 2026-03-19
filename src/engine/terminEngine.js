// ── TERMİN ENGINE ─────────────────────────────────────────────

export const ekleIsGunuEngine = (baslangic, gun) => {
  const t = new Date(baslangic);
  let eklenen=0, guvenlik=0;
  while(eklenen<gun && guvenlik<500) {
    t.setDate(t.getDate()+1); guvenlik++;
    const g=t.getDay();
    if(g!==0&&g!==6) eklenen++;
  }
  return t;
};

export const isGunuFarkiEngine = (baslangic, bitis) => {
  const a=new Date(baslangic), b=new Date(bitis);
  if(isNaN(a.getTime())||isNaN(b.getTime())||b<=a) return 0;
  let sayi=0, guvenlik=0; const t=new Date(a);
  while(t<b && guvenlik<500){ t.setDate(t.getDate()+1); guvenlik++; const g=t.getDay(); if(g!==0&&g!==6) sayi++; }
  return sayi;
};

export const terminHesaplaEngine = (asamalar, adet, baslangic=new Date()) => {
  const guvAdet = Math.max(1, adet||1);
  const toplamSn = (asamalar||[]).reduce((s,a) => {
    if(a.fason) return s;
    return s + ((a.sureDk||a.sureAdet||0) * guvAdet);
  }, 0);
  const fasonGun = (asamalar||[]).some(a=>a.fason) ? 2 : 0;
  const vardiyaSn = 28800; // 8 saat
  const atolyeGun = toplamSn>0 ? Math.ceil(toplamSn/vardiyaSn) : 0;
  const toplamGun = atolyeGun + fasonGun;
  const termin = toplamGun>0 ? ekleIsGunuEngine(baslangic, toplamGun) : new Date(baslangic);
  return { toplamGun, atolyeGun, fasonGun, termin, toplamSn };
};

// ── TOKENS ───────────────────────────────────────────────────────────────────
export const C = {
  // Pure deep backgrounds
  bg:  "#060608",
  s1:  "#0A0A0D",
  s2:  "#0D0D11",
  s3:  "#111115",
  s4:  "#161619",

  // Borders
  border:   "rgba(255,255,255,.055)",
  borderHi: "rgba(255,255,255,.1)",

  // Text
  text:  "#EDE8DF",
  sub:   "rgba(237,232,223,.48)",
  muted: "rgba(237,232,223,.24)",

  // Accent
  cyan:   "#E8914A",   // primary amber-orange
  mint:   "#3DB88A",   // muted green
  coral:  "#DC3C3C",   // danger
  gold:   "#C8872A",   // deeper amber
  lav:    "#7C5CBF",   // fason violet
  sky:    "#3E7BD4",   // info
  orange: "#D46B2A",   // deep orange
};

export const F  = "'Montserrat', sans-serif";
export const FB = "'Inter', sans-serif";

// ── HELPERS ──────────────────────────────────────────────────────────────────
export const uid  = () => Math.random().toString(36).slice(2,9);
export const r4   = n  => Math.round(n*10000)/10000;
export const fmt  = (n,d=2) => (n==null||isNaN(n)) ? "—" : n.toLocaleString("tr-TR",{minimumFractionDigits:d,maximumFractionDigits:d});
export const fmtK = n  => n>=1000 ? fmt(n/1000,1)+"k" : fmt(n,0);

export function calcRow(row, listeFiyat) {
  const birim = row.priceMode==="liste" ? (listeFiyat||0)*(1-row.discount/100) : (row.manualPrice||0)*(1-row.discount/100);
  const matrah=r4(birim*row.qty), kdv=r4(matrah*row.kdv/100);
  return { birim:r4(birim), matrah, kdv, total:r4(matrah+kdv) };
}

// ── INITIAL STATE SABITLERI ─────────────────────────────────────────────────
export const INIT_ISTASYONLAR = [
  {id:"is1", ad:"Kesim Masası",    tip:"ic",    kapasite:"8 saat/gün",  calisan:"Fatma H.",  durum:"aktif",  notlar:""},
  {id:"is2", ad:"Dikiş Atölyesi",  tip:"ic",    kapasite:"8 saat/gün",  calisan:"Fatma H.",  durum:"aktif",  notlar:""},
  {id:"is3", ad:"Hazırlık",        tip:"ic",    kapasite:"8 saat/gün",  calisan:"Mehmet",    durum:"aktif",  notlar:""},
  {id:"is4", ad:"Döşeme Tezgahı",  tip:"ic",    kapasite:"8 saat/gün",  calisan:"Ahmet Usta",durum:"aktif",  notlar:""},
  {id:"is5", ad:"Montaj",          tip:"ic",    kapasite:"4 saat/gün",  calisan:"Ahmet Usta",durum:"aktif",  notlar:""},
  {id:"is6", ad:"Paketleme",       tip:"ic",    kapasite:"4 saat/gün",  calisan:"Mehmet",    durum:"aktif",  notlar:""},
  {id:"is7", ad:"Statik Boya",     tip:"fason", kapasite:"Parti bazlı", calisan:"—",         durum:"fason",  notlar:"Ortalama 2 gün bekleme"},
  {id:"is8", ad:"Kaynak Atölyesi", tip:"fason", kapasite:"Parti bazlı", calisan:"—",         durum:"fason",  notlar:""},
];

export const INIT_CALISANLAR = [
  {id:"c1", ad:"Ahmet Usta", rol:"Döşemeci Usta",   tel:"0532 xxx xx xx", durum:"aktif", istasyon:"Döşeme Tezgahı / Montaj"},
  {id:"c2", ad:"Fatma H.",   rol:"Dikişçi / Kesimci",tel:"0535 xxx xx xx", durum:"aktif", istasyon:"Kesim Masası / Dikiş"},
  {id:"c3", ad:"Mehmet",     rol:"Hazırlık / Depo",  tel:"0541 xxx xx xx", durum:"aktif", istasyon:"Hazırlık / Paketleme"},
];

export const INIT_FASON = [
  {id:"f1", ad:"Boya Atölyesi A",  tip:"Elektrostatik Boya", tel:"", adres:"", sureGun:2, birimFiyat:50,  kdv:20, notlar:""},
  {id:"f2", ad:"Metal Lazer B",    tip:"Lazer Kesim / Kaynak",tel:"", adres:"", sureGun:3, birimFiyat:51,  kdv:20, notlar:"Profil işçiliği 30\₺ + lazer 21\₺"},
];

export const INIT_URUNLER = [];
export const INIT_RECETELER = {};
export const INIT_MALIYET = {};
export const INIT_PARAMS = {targetSaleKdvDahil:0, saleKdv:10, gelirVergisi:30};
export const INIT_SIPARISLER = [];
export const INIT_HAM_MADDE = [];
export const INIT_YARI_MAMUL = [];
export const INIT_HIZMET = [];
export const INIT_URUN_BOM = [];
export const INIT_STOK = [];

// ── BİRİM GRUPLARI ────────────────────────────────────────────────────────────
export const BIRIM_GRUPLARI = {
  uzunluk:{label:"Uzunluk",birimler:[{id:"mm",label:"mm",base:1},{id:"cm",label:"cm",base:10},{id:"mt",label:"mt",base:1000},{id:"boy",label:"boy",base:null,custom:true}]},
  alan:   {label:"Alan",   birimler:[{id:"cm2",label:"cm\²",base:1},{id:"m2",label:"m\²",base:10000}]},
  hacim:  {label:"Hacim",  birimler:[{id:"cm3",label:"cm\³",base:1},{id:"lt",label:"litre",base:1000},{id:"m3",label:"m\³",base:1000000}]},
  agirlik:{label:"Ağırlık",birimler:[{id:"gr",label:"gr",base:1},{id:"kg",label:"kg",base:1000}]},
  adet:   {label:"Adet",   birimler:[{id:"adet",label:"adet",base:1},{id:"takim",label:"takım",base:1},{id:"set",label:"set",base:1},{id:"plaka",label:"plaka",base:1},{id:"rulo",label:"rulo",base:1},{id:"top",label:"top",base:1},{id:"kutu",label:"kutu",base:1}]},
};
export const TUM_BIRIMLER = Object.entries(BIRIM_GRUPLARI).flatMap(([g,grp])=>grp.birimler.map(b=>({...b,grup:g})));

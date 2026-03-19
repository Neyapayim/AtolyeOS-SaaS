import { useState, useEffect, useCallback, useMemo } from 'react';
import { C, F, FB, uid } from './config/constants.js';
import { THEME_LIST } from './config/themes.js';
import { useTheme } from './hooks/useTheme.js';
import {
  INIT_SIPARISLER, INIT_HAM_MADDE, INIT_YARI_MAMUL, INIT_HIZMET,
  INIT_URUNLER, INIT_ISTASYONLAR, INIT_CALISANLAR, INIT_FASON,
} from './config/constants.js';
import { useFirestoreStored as useStored } from './hooks/useFirestoreStored.js';
import { stokHareketiRepo } from './repositories/stokHareketiRepo.js';
import { workLogRepo } from './repositories/workLogRepo.js';
import {
  uretimTamamlaService, bomMalzemeListesi, eksikMalzemeleriHesapla,
  hesaplaRezervasyon, siparisKalemAnalizleri, topluUEOlustur,
} from './engine/index.js';
import {
  DashboardPage, AtolyePage, SiparislerPage, UrunlerPage, StokPage,
  TedarikPage, MusterilerPage, SevkiyatPage, FasonTakipPage,
  IstasyonlarPage, CalisanlarPage, FasonFirmalarPage, AyarlarPage,
  MaliyetPage,
} from './pages/index.js';
import { ModalDispatch } from './modals/index.js';

const NAV_ITEMS = [
  { section: "ANA", items: [
    { id: "dashboard", label: "Genel Bakış", icon: "◈" },
  ]},
  { section: "TİCARET", items: [
    { id: "musteriler", label: "Müşteriler", icon: "👥" },
    { id: "siparisler", label: "Siparişler", icon: "📋" },
    { id: "sevkiyat", label: "Sevkiyat", icon: "🚚" },
  ]},
  { section: "ÜRETİM", items: [
    { id: "atolye", label: "Atölye", icon: "🏭" },
    { id: "fason_takip", label: "Fason Takip", icon: "🔗" },
  ]},
  { section: "MALZEME", items: [
    { id: "tedarik", label: "Tedarik", icon: "🛒" },
    { id: "stok", label: "Stok & Depo", icon: "📦" },
    { id: "urunler", label: "Ürün Listesi", icon: "🏷\️" },
  ]},
  { section: "TANIM", items: [
    { id: "istasyonlar", label: "İstasyonlar", icon: "⚙\️" },
    { id: "calisanlar", label: "Çalışanlar", icon: "👤" },
    { id: "fason", label: "Fason Firmalar", icon: "🏭" },
    { id: "genel", label: "Genel Ayarlar", icon: "🔧" },
  ]},
];

export default function AppMain() {
  const { themeId, switchTheme } = useTheme();
  const [tab, setTab] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  // Data states
  const [siparisler, setSiparisler] = useStored("siparisler", INIT_SIPARISLER);
  const [hamMaddeler, setHamMaddeler] = useStored("hamMadde", INIT_HAM_MADDE);
  const [yarimamulList, setYM] = useStored("yarimamul", INIT_YARI_MAMUL);
  const [hizmetler, setHizmetler] = useStored("hizmetler", INIT_HIZMET);
  const [urunler, setUrunler] = useStored("urunler", INIT_URUNLER);
  const [istasyonlar, setIstasyonlar] = useStored("istasyonlar", INIT_ISTASYONLAR);
  const [calisanlar, setCalisanlar] = useStored("calisanlar", INIT_CALISANLAR);
  const [fasonFirmalar, setFasonFirmalar] = useStored("fason", INIT_FASON);
  const [uretimEmirleri, setUretimEmirleri] = useStored("uretimEmirleri", []);
  const [musteriler, setMusteriler] = useStored("musteriler", []);
  const [tedarikSiparisleri, setTedarikSiparisleri] = useStored("tedarikSiparisleri", []);
  const [sevkiyatlar, setSevkiyatlar] = useStored("sevkiyatlar", []);
  const [fasonIsler, setFasonIsler] = useStored("fasonIsler", []);
  const [nakliyeKayitlari, setNakliyeKayitlari] = useStored("nakliyeKayitlari", []);
  const [genelAyar, setGenelAyar] = useStored("genelAyar", { firmaAd: "Atölye OS", vergNo: "", tel: "", adres: "", notlar: "" });

  const [modal, setModal] = useState(null);
  const [aktifUE, setAktifUE] = useState(null);
  const [expSiparis, setExpSiparis] = useState(null);

  // Maliyet workspace state'leri (eski app.jsx'ten)
  const [aktifUrun, setAktifUrun] = useState(null);
  const [malTab, setMalTab] = useState("ozet");
  const [malParams, setMalParams] = useStored("malParams", { targetSaleKdvDahil: 0, saleKdv: 10, gelirVergisi: 30 });

  // ── Veri migrasyon: miktar → stok (tek seferlik) ──
  useEffect(() => {
    const fix = urunler.some(u => u.miktar !== undefined && u.stok === undefined);
    if (fix) {
      setUrunler(p => p.map(u =>
        u.miktar !== undefined && u.stok === undefined
          ? { ...u, stok: u.miktar }
          : u
      ));
    }
  }, []);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTime(prev => prev.getMinutes() !== now.getMinutes() ? now : prev);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm2 = String(time.getMinutes()).padStart(2, "0");

  // Shared data objesi
  const data = {
    siparisler, hamMaddeler, yarimamulList, hizmetler, urunler,
    istasyonlar, calisanlar, fasonFirmalar, uretimEmirleri, musteriler,
    tedarikSiparisleri, sevkiyatlar, fasonIsler, nakliyeKayitlari, genelAyar,
  };

  const setters = {
    setSiparisler, setHamMaddeler, setYM, setHizmetler, setUrunler,
    setIstasyonlar, setCalisanlar, setFasonFirmalar, setUretimEmirleri,
    setMusteriler, setTedarikSiparisleri, setSevkiyatlar, setFasonIsler,
    setGenelAyar, setNakliyeKayitlari,
  };

  const stokAlarmSayi = hamMaddeler.filter(h => (h.miktar || 0) <= (h.minStok || 0)).length;

  // ── Tedarik Sipariş kaydet handler ──
  const onTedarikKaydet = useCallback((siparis) => {
    setTedarikSiparisleri(p => [...p, siparis]);
  }, []);

  // ── Tedarik Giriş (teslim alma) handler ──
  const onTedarikGirisKaydet = useCallback((result) => {
    const { gelenMiktar, yonlendirme, fasonFirmaId, fasonFirmaAd, nakliyeKaydi, faturaNo, vadeGun, ilgiliSiparisId } = result;
    // Stok güncelle (depoya gidenler)
    if (yonlendirme === "depo" && result.hamMaddeId) {
      setHamMaddeler(p => p.map(h => h.id === result.hamMaddeId
        ? { ...h, miktar: (h.miktar || 0) + gelenMiktar }
        : h
      ));
      stokHareketiRepo.ekle({
        tip: "giris", kaynak: "tedarik", kalemId: result.hamMaddeId,
        miktar: gelenMiktar, tarih: new Date().toISOString(),
        aciklama: `Tedarik teslim alındı${faturaNo ? ' - Fatura: ' + faturaNo : ''}`,
      });
    }
    // Nakliye kaydı
    if (nakliyeKaydi) {
      setNakliyeKayitlari(p => [...p, nakliyeKaydi]);
    }
    // Tedarik siparişi durumunu güncelle
    if (ilgiliSiparisId) {
      const yeniDurum = yonlendirme === "fason" ? "fasona_gonderildi" : "teslim_alindi";
      setTedarikSiparisleri(p => p.map(ts => ts.id === ilgiliSiparisId
        ? { ...ts, durum: yeniDurum, teslimAlindiAt: new Date().toISOString(), faturaNo }
        : ts
      ));
    }
  }, []);

  // ── Sevkiyat kaydet handler ──
  const onSevkiyatKaydet = useCallback((sevk) => {
    setSevkiyatlar(p => {
      const exists = p.find(s => s.id === sevk.id);
      return exists ? p.map(s => s.id === sevk.id ? sevk : s) : [...p, sevk];
    });
  }, []);

  // Sayfa render
  const renderPage = () => {
    switch (tab) {
      case "dashboard":
        return <DashboardPage data={data} setTab={setTab} setters={setters} setModal={setModal}
          aktifUE={aktifUE} setAktifUE={setAktifUE}
          onNewUE={() => setModal({ type: "yeniUretimEmri", data: {} })} />;
      case "atolye":
        return <AtolyePage data={data} setters={setters} setModal={setModal} setTab={setTab}
          aktifUE={aktifUE} setAktifUE={setAktifUE} />;
      case "siparisler":
        return <SiparislerPage data={data} setters={setters} setModal={setModal} setTab={setTab}
          aktifUE={aktifUE} setAktifUE={setAktifUE}
          expSiparis={expSiparis} setExpSiparis={setExpSiparis}
          onNewSiparis={() => setModal({ type: "yeniSiparis", data: {} })} />;
      case "urunler":
        return <UrunlerPage data={data} setModal={setModal} setTab={setTab}
          onNewUrun={() => setModal({ type: "yeniUrunBom", data: {} })}
          onEditUrun={u => setModal({ type: "duzenleUrunBom", data: u })}
          onOtomatikKod={() => setModal({ type: "otomatikKod", data: {} })}
          onDetayUrun={u => { setAktifUrun(u.id); setTab("maliyet"); setMalTab("ozet"); }} />;
      case "maliyet":
        return <MaliyetPage data={data} setters={setters} setTab={setTab} setModal={setModal}
          aktifUrun={aktifUrun} malTab={malTab} setMalTab={setMalTab}
          malParams={malParams} setMalParams={setMalParams} />;
      case "stok":
        return <StokPage data={data} setters={setters} setModal={setModal} setTab={setTab}
          onNewHM={() => setModal({ type: "yeniStokKalem", data: { tip: "hammadde" } })}
          onNewYM={() => setModal({ type: "yeniYM", data: {} })}
          onNewFasonHizmet={() => setModal({ type: "yeniFasonHizmet", data: {} })}
          onNewIscilikHizmet={() => setModal({ type: "yeniIscilikHizmet", data: {} })}
          onEditHam={k => setModal({ type: "duzenleHam", data: k })}
          onEditYM={ym => setModal({ type: "duzenleYM", data: ym })}
          onEditFasonHizmet={hz => setModal({ type: "duzenleFasonHizmet", data: hz })}
          onEditIscilikHizmet={hz => setModal({ type: "duzenleIscilikHizmet", data: hz })}
          onCopyHam={k => setModal({ type: "yeniHam", data: { ...k, id: null, kod: (k.kod || "") + "-K", ad: (k.ad || "") + " - Kopya", miktar: 0, _kopya: true } })}
          onCopyYM={ym => setModal({ type: "yeniYM", data: { ...ym, id: null, kod: (ym.kod || "") + "-K", ad: (ym.ad || "") + " - Kopya", miktar: 0, _kopya: true, bom: (ym.bom || []).map(b => ({ ...b, id: uid() })) } })}
          onCopyUrun={ur => setModal({ type: "yeniUrunBom", data: { ...ur, id: null, kod: (ur.kod || "") + "-K", ad: (ur.ad || "") + " - Kopya", stok: 0, _kopya: true, bom: (ur.bom || []).map(b => ({ ...b, id: uid() })) } })} />;
      case "tedarik":
        return <TedarikPage data={data} setters={setters} setModal={setModal} />;
      case "musteriler":
        return <MusterilerPage data={data} setModal={setModal}
          onNewMusteri={() => setModal({ type: "yeniMusteri", data: {} })}
          onOpenMusteri={m => setModal({ type: "musteriDetay", data: m })}
          onNewSiparis={m => setModal({ type: "yeniSiparis", data: { musteriId: m.id, musteriAd: m.ad } })} />;
      case "sevkiyat":
        return <SevkiyatPage data={data} setters={setters} setModal={setModal}
          onNewSevkiyat={() => setModal({ type: "yeniSevkiyat", data: {} })}
          onOpenSevkiyat={s => setModal({ type: "sevkiyatDuzenle", data: s })} />;
      case "fason_takip":
        return <FasonTakipPage data={data} setters={setters} setModal={setModal} />;
      case "istasyonlar":
        return <IstasyonlarPage data={data}
          onNewIstasyon={() => setModal({ type: "yeniIstasyon", data: {} })}
          onEditIstasyon={is => setModal({ type: "istasyonDuzenle", data: is })} />;
      case "calisanlar":
        return <CalisanlarPage data={data}
          onNewCalisan={() => setModal({ type: "yeniCalisan", data: {} })}
          onEditCalisan={c => setModal({ type: "calisanDuzenle", data: c })} />;
      case "fason":
        return <FasonFirmalarPage data={data}
          onNewFason={() => setModal({ type: "yeniFason", data: {} })}
          onEditFason={f => setModal({ type: "fasonDuzenle", data: f })} />;
      case "genel":
        return <AyarlarPage genelAyar={genelAyar} setGenelAyar={setGenelAyar} />;
      default:
        return (
          <div style={{
            textAlign: "center", padding: 80, color: C.muted, fontSize: 14,
            background: C.s2, borderRadius: 14, border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛠\️</div>
            Bu sayfa yakında eklenecek
          </div>
        );
    }
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: C.bg, fontFamily: FB,
      opacity: mounted ? 1 : 0, transition: "opacity .5s"
    }}>
      {/* Ambient Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: C.bg }} />
        <div style={{
          position: "absolute", width: 800, height: 320, borderRadius: "50%",
          bottom: "-8%", left: "50%", transform: "translateX(-50%)",
          background: `radial-gradient(ellipse, ${C.cyan}1A 0%, ${C.cyan}0A 40%, transparent 70%)`,
          animation: "orb3 35s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          top: "-20%", left: "-10%",
          background: `radial-gradient(circle, ${C.cyan}12 0%, transparent 55%)`,
          animation: "orb1 28s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,0.55) 100%)"
        }} />
      </div>

      {/* Sidebar */}
      <aside style={{
        width: 236, position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50,
        background: `${C.bg}D9`,
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        boxShadow: `1px 0 0 ${C.border}, 4px 0 40px rgba(0,0,0,0.4)`
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: "${C.cyan}1E", border: "1px solid ${C.cyan}38",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              boxShadow: "0 0 24px ${C.cyan}2E", animation: "float 6s ease-in-out infinite"
            }}>🏭</div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, fontFamily: F, letterSpacing: -.2,
                backgroundImage: `linear-gradient(135deg, ${C.text} 40%, ${C.cyan})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>Atölye OS</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.8, textTransform: "uppercase", marginTop: 1 }}>
                {genelAyar.firmaAd || "Mobilya Atölyesi"}
              </div>
            </div>
          </div>
          {/* Saat */}
          <div style={{
            background: `${C.s2}`, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "9px 13px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: 21, fontWeight: 700, color: C.text, fontFamily: F, letterSpacing: 3 }}>
              {hh}<span style={{ color: "${C.cyan}80", animation: "blink 1s step-end infinite" }}>:</span>{mm2}
            </span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.cyan, fontWeight: 500, letterSpacing: .3 }}>
                {time.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>
                {time.toLocaleDateString("tr-TR", { weekday: "long" })}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{
          padding: "10px 10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5,
          borderBottom: `1px solid ${C.border}`
        }}>
          {[
            { n: uretimEmirleri.filter(e => e.durum === "uretimde").length, l: "Üretimde", col: C.cyan },
            { n: uretimEmirleri.filter(e => e.durum === "bloke" || e.durum === "bekliyor").length, l: "Bekliyor", col: C.gold },
            { n: stokAlarmSayi, l: "Stok\⚠", col: C.coral },
          ].map((k, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.025)", border: `1px solid ${k.col}18`,
              borderRadius: 9, padding: "7px 0", textAlign: "center",
            }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: k.col, fontFamily: F }}>{k.n}</div>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: .5, textTransform: "uppercase" }}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {NAV_ITEMS.map((sec, si) => (
            <div key={si} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 9, fontWeight: 600, color: "${C.cyan}59", letterSpacing: 2,
                textTransform: "uppercase", padding: "0 10px", marginBottom: 4
              }}>{sec.section}</div>
              {sec.items.map(item => {
                const active = tab === item.id || (item.id === "urunler" && tab === "maliyet");
                return (
                  <button key={item.id} className="nav-item" onClick={() => setTab(item.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: active ? "${C.cyan}12" : "transparent",
                    color: active ? C.cyan : C.muted,
                    fontWeight: active ? 500 : 400, fontSize: 13, marginBottom: 1,
                    transition: "all .18s", textAlign: "left", fontFamily: FB,
                    borderLeft: `2px solid ${active ? "${C.cyan}B3" : "transparent"}`,
                  }}>
                    <span style={{ fontSize: 12, width: 16, textAlign: "center", flexShrink: 0, opacity: active ? 1 : .6 }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Tema Secici */}
        <div style={{
          padding: "10px 12px", borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 6, paddingLeft: 2,
          }}>Tema</div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4,
          }}>
            {THEME_LIST.map(t => {
              const isActive = themeId === t.id;
              return (
                <button key={t.id} onClick={() => switchTheme(t.id)} title={t.label}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: 8, border: "none",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    outline: isActive ? `2px solid ${t.colors.cyan}` : "2px solid transparent",
                    outlineOffset: 1, transition: "all .2s",
                    background: t.preview[0],
                  }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                    background: `linear-gradient(135deg, ${t.preview[1]}, ${t.preview[1]}88)`,
                    borderRadius: "0 0 6px 6px",
                  }} />
                  <span style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)", fontSize: 11,
                    filter: isActive ? "none" : "grayscale(.5)", opacity: isActive ? 1 : .6,
                  }}>
                    {t.icon}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{
            fontSize: 9, color: C.muted, textAlign: "center", marginTop: 4,
            opacity: .6,
          }}>
            {THEME_LIST.find(t => t.id === themeId)?.label || ""}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 236, flex: 1, padding: "28px 32px", position: "relative", zIndex: 10, minHeight: "100vh" }}>
        {renderPage()}
      </main>

      {/* Modals */}
      {modal && <ModalDispatch modal={modal} setModal={setModal} {...data} {...setters}
        aktifUE={aktifUE} setAktifUE={setAktifUE}
        urunBomList={urunler} setUrunBomList={setUrunler}
        onTedarikKaydet={onTedarikKaydet}
        onTedarikGirisKaydet={onTedarikGirisKaydet}
        onSevkiyatKaydet={onSevkiyatKaydet}
        setTab={setTab}
      />}
    </div>
  );
}

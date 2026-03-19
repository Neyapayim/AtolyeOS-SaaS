import { useState } from 'react';
import { C, F, FB, fmt } from '../config/constants.js';
import { PageHeader, SilButonu, Badge, Btn, AramaInput } from '../components/index.js';
import { siparisKalemAnalizleri, bomMalzemeListesi } from '../engine/index.js';

/* ── Durum meta ─────────────────────────────────────────── */
const DURUM_META = {
  bekliyor:    { label: "Bekliyor",        col: C.gold,  icon: "⏳" },
  hazir:       { label: "Sevkiyata Hazır", col: C.mint,  icon: "✅" },
  uretimde:    { label: "Üretimde",        col: C.cyan,  icon: "🏭" },
  bloke:       { label: "Bloke",           col: C.coral, icon: "🔴" },
  sevk_edildi: { label: "Sevk Edildi",     col: C.sky,   icon: "🚚" },
  tamamlandi:  { label: "Tamamlandı",      col: "#888",  icon: "✔" },
  iptal:       { label: "İptal",           col: "#555",  icon: "✕" },
};
const dm = k => DURUM_META[k] || { label: k, col: C.muted, icon: "?" };

const DURUM_TABS = [
  ["all",         "Tümü",       C.text],
  ["bekliyor",    "⏳ Bekliyor", C.gold],
  ["hazir",       "✅ Hazır",    C.mint],
  ["uretimde",    "🏭 Üretimde", C.cyan],
  ["bloke",       "🔴 Bloke",    C.coral],
  ["sevk_edildi", "🚚 Sevk",     C.sky],
  ["tamamlandi",  "✔ Tamam",    "#888"],
  ["iptal",       "✕ İptal",    "#555"],
];

/* ================================================================ */
export default function SiparislerPage({
  data, setters, setModal, setTab, aktifUE, setAktifUE,
  expSiparis, setExpSiparis, onNewSiparis,
}) {
  const {
    siparisler = [], musteriler = [], urunler = [],
    hamMaddeler = [], yarimamulList = [], uretimEmirleri = [],
    hizmetler = [],
  } = data || {};
  const { setSiparisler } = setters || {};

  const [filtre, setFiltre] = useState("");
  const [durumFiltre, setDurumFiltre] = useState("all");

  /* ── Filtreleme ─────────────────────────────────────────── */
  const filtrelenmis = siparisler.filter(sp => {
    // Durum filtresi
    if (durumFiltre !== "all" && sp.durum !== durumFiltre) return false;
    // Metin filtresi
    if (!filtre) return true;
    const q = filtre.toLowerCase();
    return (sp.musteri || "").toLowerCase().includes(q)
      || (sp.siparisAdi || "").toLowerCase().includes(q)
      || (sp.id || "").toLowerCase().includes(q);
  });

  const aktifSayisi = siparisler.filter(s => s.durum !== "tamamlandi" && s.durum !== "iptal").length;

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      {/* Header */}
      <PageHeader
        title="Siparişler"
        sub={`${aktifSayisi} aktif sipariş`}
        action={<Btn variant="primary" onClick={onNewSiparis}>+ Yeni Sipariş</Btn>}
      />

      {/* Durum filtre tabları */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {DURUM_TABS.map(([k, l, c]) => {
          const n = k === "all" ? siparisler.length : siparisler.filter(s => s.durum === k).length;
          if (n === 0 && k !== "all") return null;
          const isActive = durumFiltre === k;
          return (
            <div key={k} onClick={() => setDurumFiltre(k)} style={{
              background: isActive ? c + "18" : c + "0C",
              border: "1px solid " + (isActive ? c + "50" : c + "20"),
              borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4,
              cursor: "pointer", transition: "all .15s",
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{n}</span>
              <span style={{ fontSize: 10, color: isActive ? c : C.muted }}>{l}</span>
            </div>
          );
        })}
      </div>

      {/* Arama */}
      <div style={{ marginBottom: 18 }}>
        <AramaInput value={filtre} onChange={setFiltre} placeholder="Sipariş veya müşteri ara..." />
      </div>

      {/* Sipariş listesi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtrelenmis.map((sp, i) => (
          <SiparisRow
            key={sp.id}
            sp={sp}
            index={i}
            isExp={expSiparis === sp.id}
            setExpSiparis={setExpSiparis}
            urunler={urunler}
            hamMaddeler={hamMaddeler}
            yarimamulList={yarimamulList}
            uretimEmirleri={uretimEmirleri}
            siparisler={siparisler}
            setSiparisler={setSiparisler}
            setModal={setModal}
            setTab={setTab}
            setAktifUE={setAktifUE}
          />
        ))}

        {/* Boş durum */}
        {siparisler.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Henüz sipariş yok</div>
            <Btn variant="primary" onClick={onNewSiparis}>+ İlk Siparişi Oluştur</Btn>
          </div>
        )}

        {/* Filtre sonucu boş */}
        {siparisler.length > 0 && filtrelenmis.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>
            Eşleşen sipariş bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Sipariş satır bileşeni
   ================================================================ */
function SiparisRow({
  sp, index, isExp, setExpSiparis,
  urunler, hamMaddeler, yarimamulList, uretimEmirleri,
  siparisler, setSiparisler, setModal, setTab, setAktifUE,
}) {
  const d = dm(sp.durum);
  const kalemler = sp.kalemler || [];

  /* Alt müşteri gruplama */
  const altGrp = {};
  kalemler.forEach(k => {
    const key = k.altMusteriAd || "—";
    if (!altGrp[key]) altGrp[key] = [];
    altGrp[key].push(k);
  });

  /* Güncel stok analizi */
  const uGrp = {};
  const gecerliKalemler = kalemler.filter(k => k.urunId && k.adet > 0);
  const guncelAnalizler = siparisKalemAnalizleri(
    gecerliKalemler, siparisler, sp.id, urunler, hamMaddeler, yarimamulList
  );
  gecerliKalemler.forEach((k, ki) => {
    const a = guncelAnalizler?.[ki];
    if (!k.urunId) return;
    if (!uGrp[k.urunId]) uGrp[k.urunId] = { id: k.urunId, a: 0, s: 0, u: 0 };
    uGrp[k.urunId].a += (k.adet || 0);
    uGrp[k.urunId].s += (a?.stokKarsilanan || 0);
    uGrp[k.urunId].u += (a?.uretilecek || 0);
  });

  const spUEler = uretimEmirleri.filter(e => e.sipNo === sp.id);

  /* Toplam adet */
  const toplamAdet = kalemler.reduce((s, k) => s + (k.adet || 0), 0);

  return (
    <div style={{
      borderRadius: 16, overflow: "hidden", transition: "all .25s",
      border: "1px solid " + (isExp ? d.col + "40" : "rgba(255,255,255,.04)"),
      background: isExp ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.015)",
      animation: `fade-up .3s ${index * .04}s ease both`,
    }}>
      {/* Üst renk çizgisi */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${d.col},${d.col}60,transparent)` }} />

      {/* Ana satır — tıklanabilir */}
      <div
        style={{
          padding: "16px 20px", cursor: "pointer",
          display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start",
        }}
        onClick={() => setExpSiparis(isExp ? null : sp.id)}
      >
        <div style={{ minWidth: 0 }}>
          {/* ID + Badge + Termin */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: d.col, fontFamily: F, letterSpacing: .5 }}>
              {sp.id}
            </span>
            <div style={{ height: 12, width: 1, background: C.border }} />
            <Badge label={d.label} color={d.col} small />
            {sp.termin && (
              <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>
                📅 {sp.termin}
              </span>
            )}
          </div>

          {/* Sipariş adı */}
          <div style={{
            fontSize: 16, fontWeight: 800, color: C.text,
            fontFamily: F, letterSpacing: -.3, marginBottom: 2,
          }}>
            {sp.siparisAdi || sp.urun || "Sipariş"}
          </div>

          {/* Müşteri + alt müşteri sayısı */}
          <div style={{ fontSize: 12, color: C.sub, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{sp.musteri}</span>
            {Object.keys(altGrp).filter(k => k !== "—").length > 0 && (
              <span style={{
                fontSize: 9, background: C.lav + "12", color: C.lav,
                borderRadius: 4, padding: "1px 6px",
              }}>
                {Object.keys(altGrp).filter(k => k !== "—").length} alt müşteri
              </span>
            )}
          </div>

          {/* Ürün grupları — mini kartlar */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {Object.values(uGrp).map(ug => {
              const ur = urunler.find(x => x.id === ug.id);
              const pB = ug.a > 0 ? Math.round((ug.s / ug.a) * 100) : 0;
              return (
                <div key={ug.id} style={{
                  background: "rgba(255,255,255,.03)", borderRadius: 8,
                  padding: "6px 10px", border: "1px solid " + C.border,
                  minWidth: 120, flex: "0 1 auto",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: C.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120,
                    }}>{ur?.ad || "?"}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.text, fontFamily: F, marginLeft: 8 }}>
                      {ug.a}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: C.border, marginBottom: 3 }}>
                    <div style={{
                      height: "100%", borderRadius: 2, width: pB + "%",
                      background: pB === 100 ? C.mint : C.gold, transition: "width .3s",
                    }} />
                  </div>
                  <div style={{ display: "flex", gap: 6, fontSize: 8 }}>
                    {ug.s > 0 && <span style={{ color: C.mint }}>✓stok {ug.s}</span>}
                    {ug.u > 0 && <span style={{ color: C.gold }}>🏭üretim {ug.u}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ taraf — toplam adet */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: F }}>{toplamAdet}</div>
          <div style={{ fontSize: 8, color: C.muted }}>toplam</div>
        </div>
      </div>

      {/* ── Genişletilmiş alan ── */}
      {isExp && (
        <ExpandedSection
          sp={sp}
          d={d}
          uGrp={uGrp}
          altGrp={altGrp}
          spUEler={spUEler}
          urunler={urunler}
          hamMaddeler={hamMaddeler}
          yarimamulList={yarimamulList}
          setSiparisler={setSiparisler}
          setModal={setModal}
          setTab={setTab}
          setAktifUE={setAktifUE}
        />
      )}
    </div>
  );
}

/* ================================================================
   Genişletilmiş detay alanı
   ================================================================ */
function ExpandedSection({
  sp, d, uGrp, altGrp, spUEler,
  urunler, hamMaddeler, yarimamulList,
  setSiparisler, setModal, setTab, setAktifUE,
}) {
  const stktOlanlar = Object.values(uGrp).filter(ug => ug.s > 0);
  const eksikOlanlar = Object.values(uGrp).filter(ug => ug.u > 0);

  /* Eksik ham maddeler hesapla */
  const eksikHMMap = {};
  const sipYmStok = {};
  eksikOlanlar.forEach(ug => {
    const ur = urunler.find(x => x.id === ug.id);
    if (!ur) return;
    const ml = bomMalzemeListesi(ur, ug.u, hamMaddeler, yarimamulList, urunler, sipYmStok);
    ml.forEach(m => {
      if (!eksikHMMap[m.id]) {
        eksikHMMap[m.id] = { ...m, gereken: 0, kaynakUrunler: [] };
      }
      eksikHMMap[m.id].gereken += m.gereken;
      eksikHMMap[m.id].eksik = Math.max(0, eksikHMMap[m.id].gereken - eksikHMMap[m.id].mevcut);
      eksikHMMap[m.id].yeterli = eksikHMMap[m.id].eksik === 0;
      eksikHMMap[m.id].kaynakUrunler.push(ur.ad);
    });
  });
  const eksikHMler = Object.values(eksikHMMap).filter(m => !m.yeterli);

  return (
    <div onClick={e => e.stopPropagation()}>
      {/* ── STOKTA OLANLAR ── */}
      {stktOlanlar.length > 0 && (
        <div style={{ borderTop: "1px solid " + C.border, padding: "12px 20px", background: C.mint + "06" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.mint, letterSpacing: .5, marginBottom: 8 }}>
            ✅ STOKTAN KARŞILANAN ({stktOlanlar.length} ürün)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 6 }}>
            {stktOlanlar.map(ug => {
              const ur = urunler.find(x => x.id === ug.id);
              return (
                <div key={ug.id} style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid " + C.mint + "20", borderRadius: 9, padding: "8px 12px",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                    {ur?.ad || "?"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: C.mint }}>✓ {ug.s} adet stoktan</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.mint, fontFamily: F }}>{ug.s}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ÜRETİME GÖNDERİLECEKLER ── */}
      {eksikOlanlar.length > 0 && (
        <div style={{ borderTop: "1px solid " + C.border, padding: "12px 20px", background: C.gold + "06" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: .5 }}>
              🏭 ÜRETİLECEK ({eksikOlanlar.length} ürün)
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 6 }}>
            {eksikOlanlar.map(ug => {
              const ur = urunler.find(x => x.id === ug.id);
              return (
                <div key={ug.id} style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid " + C.gold + "25", borderRadius: 9, padding: "8px 12px",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                    {ur?.ad || "?"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: C.gold }}>🏭 {ug.u} adet üretim</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: F }}>{ug.u}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Eksik ham maddeler */}
          {eksikHMler.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.coral, letterSpacing: .5, marginBottom: 4 }}>
                ⚠ EKSİK HAM MADDELER ({eksikHMler.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {eksikHMler.slice(0, 6).map(m => (
                  <span key={m.id} style={{
                    fontSize: 9, background: C.coral + "0C", border: "1px solid " + C.coral + "20",
                    borderRadius: 5, padding: "2px 7px", color: C.coral,
                  }}>
                    {m.ad}: -{fmt(m.eksik)} {m.birim}
                  </span>
                ))}
                {eksikHMler.length > 6 && (
                  <span style={{ fontSize: 9, color: C.muted }}>+{eksikHMler.length - 6} daha</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Alt müşteri detay ── */}
      {Object.keys(altGrp).length > 1 && (
        <div style={{ borderTop: "1px solid " + C.border, padding: "10px 20px", background: "rgba(0,0,0,.1)" }}>
          {Object.entries(altGrp).map(([altAd, alts], gi) => (
            <div key={altAd} style={{ marginBottom: gi < Object.keys(altGrp).length - 1 ? 8 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                {altAd !== "—" && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, background: C.lav + "15",
                    color: C.lav, borderRadius: 5, padding: "2px 8px",
                  }}>🏪 {altAd}</span>
                )}
                {altAd === "—" && (
                  <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Genel</span>
                )}
                <span style={{ fontSize: 9, color: C.muted }}>
                  {alts.reduce((s, k) => s + (k.adet || 0), 0)} adet
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {alts.map((k, ki) => {
                  const ur = urunler.find(x => x.id === k.urunId);
                  return (
                    <span key={ki} style={{
                      fontSize: 10, background: "rgba(255,255,255,.03)",
                      border: "1px solid " + C.border, borderRadius: 6,
                      padding: "3px 8px", color: C.sub,
                    }}>
                      {ur?.ad || "?"} ×{k.adet}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notlar */}
      {sp.notlar && (
        <div style={{ padding: "8px 20px", fontSize: 12, color: C.sub, borderTop: "1px solid " + C.border }}>
          📝 {sp.notlar}
        </div>
      )}

      {/* ── Üretim emirleri ── */}
      {spUEler.length > 0 && (
        <div style={{ borderTop: "1px solid " + C.border, padding: "10px 20px", background: "rgba(0,0,0,.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.mint, marginBottom: 6 }}>
            ✓ Üretim Emirleri ({spUEler.length})
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {spUEler.map(ue => (
              <span
                key={ue.id}
                onClick={() => { setTab("atolye"); setAktifUE(ue.id); }}
                style={{
                  fontSize: 10, color: C.mint, background: C.mint + "10",
                  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                  border: "1px solid " + C.mint + "20",
                }}
              >
                {ue.kod} — {ue.urunAd} ({ue.adet})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Butonlar ── */}
      <div style={{
        display: "flex", gap: 8, padding: "12px 20px 16px", flexWrap: "wrap",
        borderTop: "1px solid " + C.border, background: "rgba(0,0,0,.1)",
      }}>
        <button
          onClick={() => setModal({ type: "siparisDuzenle", data: sp })}
          style={{
            background: C.sky + "10", border: "1px solid " + C.sky + "22",
            borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600,
            color: C.sky, cursor: "pointer",
          }}
        >✏️ Düzenle</button>

        <button
          onClick={() => setModal({ type: "siparisDurum", data: sp })}
          style={{
            background: d.col + "12", border: "1px solid " + d.col + "25",
            borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600,
            color: d.col, cursor: "pointer",
          }}
        >Durum</button>

        {/* Toplu Üretime Gönder — sadece UE yoksa, tamamlanmamış/iptal olmamışsa ve üretilecek varsa */}
        {spUEler.length === 0
          && sp.durum !== "tamamlandi"
          && sp.durum !== "iptal"
          && sp.durum !== "sevk_edildi"
          && eksikOlanlar.length > 0 && (
          <button
            onClick={() => setModal({ type: "topluUEOnizleme", data: sp })}
            style={{
              background: `linear-gradient(135deg,${C.cyan}30,${C.gold}20)`,
              border: "1px solid " + C.cyan + "40",
              borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700,
              color: C.cyan, cursor: "pointer",
            }}
          >
            🏭 Toplu Üretime Gönder ({eksikOlanlar.reduce((s, u) => s + u.u, 0)} adet)
          </button>
        )}

        {/* Sevkiyat — sadece hazır durumda */}
        {sp.durum === "hazir" && (
          <button
            onClick={() => setSiparisler(p => p.map(s => s.id === sp.id ? { ...s, durum: "sevk_edildi" } : s))}
            style={{
              background: C.sky + "12", border: "1px solid " + C.sky + "25",
              borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600,
              color: C.sky, cursor: "pointer",
            }}
          >🚚 Sevkiyat</button>
        )}

        {/* Sil — SilButonu ile güvenli silme */}
        <div style={{ marginLeft: "auto" }}>
          <SilButonu
            isim={sp.siparisAdi || sp.id}
            onDelete={() => setSiparisler(p => p.filter(x => x.id !== sp.id))}
          />
        </div>
      </div>
    </div>
  );
}

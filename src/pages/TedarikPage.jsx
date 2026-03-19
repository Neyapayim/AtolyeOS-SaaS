import { useState } from 'react';
import { C, F, FB, fmt, uid } from '../config/constants.js';
import { PageHeader } from '../components/index.js';
import { stokHareketiRepo } from '../repositories/stokHareketiRepo.js';

const DURUM_RENK = {
  siparis_bekliyor: { label: "Siparis Bekliyor", col: C.coral, ikon: "⚠" },
  siparis_verildi:  { label: "Siparis Verildi", col: C.sky, ikon: "🛒" },
  yolda:            { label: "Yolda", col: "#E8914A", ikon: "🚚" },
  fasona_gonderildi:{ label: "Fasonda", col: C.lav, ikon: "🏭" },
  fasonda:          { label: "Fasonda", col: C.lav, ikon: "🏭" },
  teslim_alindi:    { label: "Teslim Alindi", col: C.mint, ikon: "✅" },
  fasondan_geldi:   { label: "Fasondan Geldi", col: C.mint, ikon: "✅" },
};

export default function TedarikPage({ data, setters, setModal }) {
  const { tedarikSiparisleri = [], hamMaddeler = [] } = data || {};
  const { setTedarikSiparisleri, setHamMaddeler } = setters || {};
  const [gorMode, setGorMode] = useState("toplu");

  // ── Durum kategorileri ──
  const bekleyenler = tedarikSiparisleri.filter(ts => ts.durum === "siparis_bekliyor");
  const siparisVerilenler = tedarikSiparisleri.filter(ts => ts.durum === "siparis_verildi");
  const yoldakiler = tedarikSiparisleri.filter(ts => ts.durum === "yolda");
  const fasondakiler = tedarikSiparisleri.filter(ts => ts.durum === "fasona_gonderildi" || ts.durum === "fasonda");
  const tamamlananlar = tedarikSiparisleri.filter(ts => ts.durum === "teslim_alindi" || ts.durum === "fasondan_geldi");

  // ── Toplam kalem sayilari ──
  const bekleyenKalem = bekleyenler.reduce((s, ts) => (ts.kalemler || []).length + s, 0);
  const siparisKalem = siparisVerilenler.reduce((s, ts) => (ts.kalemler || []).length + s, 0);
  const yoldaKalem = yoldakiler.reduce((s, ts) => (ts.kalemler || []).length + s, 0);
  const fasonKalem = fasondakiler.reduce((s, ts) => (ts.kalemler || []).length + s, 0);
  const tamamKalem = tamamlananlar.reduce((s, ts) => (ts.kalemler || []).length + s, 0);

  // ── Tedarikci bazli gruplama (bekleyenler) ──
  const tedGrupBekleyen = {};
  bekleyenler.forEach(ts => {
    const ted = ts.tedarikci || "Belirtilmemis";
    if (!tedGrupBekleyen[ted]) tedGrupBekleyen[ted] = { tedarikci: ted, siparisler: [], kalemler: [] };
    tedGrupBekleyen[ted].siparisler.push(ts);
    (ts.kalemler || []).forEach(k => tedGrupBekleyen[ted].kalemler.push({ ...k, tsId: ts.id, sipNo: ts.kaynakSipNo || "" }));
  });
  const tedGrupListe = Object.values(tedGrupBekleyen);

  // ── Urun bazli gruplama (bekleyenler - UE kaynagina gore) ──
  const urunGrup = {};
  bekleyenler.forEach(ts => {
    const ueId = ts.kaynakUEId || ts.kaynakSipNo || "genel";
    const label = ts.kaynakUEAd || ts.kaynakSipNo || "Genel";
    if (!urunGrup[ueId]) urunGrup[ueId] = { label, kalemler: [] };
    (ts.kalemler || []).forEach(k => urunGrup[ueId].kalemler.push({ ...k, tsId: ts.id, tedarikci: ts.tedarikci }));
  });

  // ── Siparis bazli gruplama ──
  const sipGrup = {};
  bekleyenler.forEach(ts => {
    const sNo = ts.kaynakSipNo || "Belirtilmemis";
    if (!sipGrup[sNo]) sipGrup[sNo] = { sipNo: sNo, siparisler: [], kalemler: [] };
    sipGrup[sNo].siparisler.push(ts);
    (ts.kalemler || []).forEach(k => sipGrup[sNo].kalemler.push({ ...k, tsId: ts.id, tedarikci: ts.tedarikci }));
  });

  // ── Durum gecis helper ──
  const durumGecis = (tsId, yeniDurum, ekBilgi = {}) => {
    setTedarikSiparisleri?.(p => p.map(ts => {
      if (ts.id !== tsId) return ts;
      const now = new Date().toISOString();
      return {
        ...ts, durum: yeniDurum,
        ...(yeniDurum === "siparis_verildi" ? { siparisVerildiAt: now } : {}),
        ...(yeniDurum === "yolda" ? { yoldaAt: now } : {}),
        ...(yeniDurum === "teslim_alindi" ? { teslimAlindiAt: now } : {}),
        ...ekBilgi
      };
    }));
  };

  // ── Teslim al + stok guncelle ──
  const teslimAl = (ts) => {
    (ts.kalemler || []).forEach(k => {
      setHamMaddeler?.(p => p.map(hm => {
        if (hm.id !== k.hamMaddeId) return hm;
        const yeniMiktar = (hm.miktar || 0) + (k.miktar || 0);
        stokHareketiRepo.ekle({
          stokTipi: "hammadde", stokId: hm.id, hareketTipi: "satin_alma_girisi",
          miktar: k.miktar, birim: k.birim || hm.birim,
          oncekiBakiye: hm.miktar || 0, sonrakiBakiye: yeniMiktar,
          kaynakModul: "tedarik", note: "Tedarik teslim: " + hm.ad,
        });
        return { ...hm, miktar: yeniMiktar };
      }));
    });
    durumGecis(ts.id, "teslim_alindi");
  };

  // ── Kalem satir render helper ──
  const KalemSatir = ({ k, compact }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: compact ? "4px 0" : "6px 0", borderBottom: "1px solid " + C.border + "40", fontSize: compact ? 10 : 11
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: C.text, fontWeight: 600 }}>{k.ad}</span>
        {k.sipNo && <span style={{ color: C.muted, marginLeft: 6, fontSize: 8 }}>({k.sipNo})</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
        <span style={{ color: C.coral, fontWeight: 700 }}>
          {fmt(k.miktar, 1)} <span style={{ fontWeight: 400, color: C.muted, fontSize: 9 }}>{k.birim}</span>
        </span>
        {k.birimFiyat > 0 && (
          <span style={{ color: C.muted, fontSize: 9 }}>~{fmt(k.birimFiyat * k.miktar)}₺</span>
        )}
      </div>
    </div>
  );

  // ── Tedarik siparis karti (siparis verildi / yolda / bekleyen) ──
  const SiparisKart = ({ ts, aksiyon, aksiyonLabel, aksiyonRenk, aksiyonIkon, borderRenk }) => {
    const topTutar = (ts.kalemler || []).reduce((s, k) => (k.birimFiyat || 0) * (k.miktar || 0) + s, 0);
    return (
      <div style={{
        background: "rgba(255,255,255,0.025)", border: "1px solid " + borderRenk + "25",
        borderLeft: "3px solid " + borderRenk, borderRadius: 10, padding: "12px 16px", marginBottom: 8,
        animation: "fade-up .3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: borderRenk,
                background: borderRenk + "12", borderRadius: 4, padding: "2px 6px"
              }}>{ts.id?.slice(0, 12)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{ts.tedarikci || "—"}</span>
              {ts.kaynakSipNo && (
                <span style={{
                  fontSize: 9, color: C.lav, background: C.lav + "10",
                  borderRadius: 3, padding: "1px 5px"
                }}>{ts.kaynakSipNo}</span>
              )}
            </div>
            {(ts.kalemler || []).map((k, ki) => (
              <div key={ki} style={{
                fontSize: 11, color: C.sub, marginBottom: 2,
                paddingLeft: 8, borderLeft: "2px solid " + C.border
              }}>
                {k.ad} — <strong style={{ color: C.text }}>{fmt(k.miktar, 1)} {k.birim}</strong>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, fontSize: 9, color: C.muted, marginTop: 4, flexWrap: "wrap" }}>
              {ts.beklenenTeslimAt && (() => {
                const gun = Math.ceil((new Date(ts.beklenenTeslimAt) - Date.now()) / 86400000);
                return (
                  <span style={{ color: gun < 0 ? C.coral : C.cyan }}>
                    📅 Beklenen: {new Date(ts.beklenenTeslimAt).toLocaleDateString("tr-TR")}
                    {gun < 0 ? ` (${Math.abs(gun)} gun gecikti!)` : ` (${gun} gun)`}
                  </span>
                );
              })()}
              {ts.siparisVerildiAt && <span>🛒 {new Date(ts.siparisVerildiAt).toLocaleDateString("tr-TR")}</span>}
              {topTutar > 0 && <span>💰 ~{fmt(topTutar)}₺</span>}
              {ts.nakliyeci && <span>🚚 {ts.nakliyeci}</span>}
            </div>
          </div>
          {aksiyon && (
            <button onClick={() => aksiyon(ts)} style={{
              background: aksiyonRenk + "15", border: "1px solid " + aksiyonRenk + "30",
              borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700,
              color: aksiyonRenk, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {aksiyonIkon} {aksiyonLabel}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Dashboard KPI kartlari ──
  const ozetKartlar = [
    { l: "Siparis Bekliyor", v: bekleyenler.length, c: C.coral, ikon: "⚠", id: "bekleyen" },
    { l: "Siparis Verildi", v: siparisVerilenler.length, c: C.sky, ikon: "🛒", id: "siparis" },
    { l: "Yolda", v: yoldakiler.length, c: "#E8914A", ikon: "🚚", id: "yolda" },
    { l: "Fasonda", v: fasondakiler.length, c: C.lav, ikon: "🏭", id: "fasonda" },
    { l: "Teslim Alindi", v: tamamlananlar.length, c: C.mint, ikon: "✅", id: "tamam" },
  ];

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader title="Tedarik Yönetimi"
        sub={bekleyenKalem > 0 ? bekleyenKalem + " kalem siparis bekliyor" : "Tüm malzemeler temin edildi"}
        action={null} />

      {/* ── GORUNUM TOGGLE ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["toplu", "📦 Toplu Görünüm"], ["urun_bazli", "🏭 Ürün Bazli"], ["siparis_bazli", "📋 Siparis Bazli"]].map(([k, l]) => (
          <button key={k} onClick={() => setGorMode(k)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 11,
              fontWeight: gorMode === k ? 700 : 400,
              background: gorMode === k ? C.cyan + "12" : "rgba(255,255,255,.03)",
              border: "1px solid " + (gorMode === k ? C.cyan + "40" : C.border),
              color: gorMode === k ? C.cyan : C.muted,
              cursor: "pointer", transition: "all .15s"
            }}>{l}</button>
        ))}
      </div>

      {/* ── DASHBOARD KARTLARI ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {ozetKartlar.map(k => (
          <button key={k.id} onClick={() => {
            const el = document.getElementById("tedarik-" + k.id);
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }} style={{
            background: k.c + "0C", border: "1px solid " + k.c + "20",
            borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", transition: "all .15s", minWidth: 100,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = k.c + "18"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = k.c + "0C"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <span style={{ fontSize: 22 }}>{k.ikon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, fontFamily: F, lineHeight: 1 }}>{k.v}</div>
              <div style={{ fontSize: 9, color: C.muted, whiteSpace: "nowrap" }}>{k.l}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── BOS DURUM ── */}
      {tedarikSiparisleri.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, color: C.sub, fontWeight: 600 }}>Tedarik bekleyen malzeme yok</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Atölyeden "Tedarige Gönder" butonuyla malzeme gönderildiginde burada görünecek</div>
        </div>
      )}

      {/* ═══════════ TOPLU GORUNUM ═══════════ */}
      {gorMode === "toplu" && (
        <>
          {/* Siparis Bekliyor */}
          {bekleyenler.length > 0 && (
            <div id="tedarik-bekleyen" style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
                paddingBottom: 8, borderBottom: "2px solid " + C.coral + "30"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚠</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.coral, letterSpacing: .5, textTransform: "uppercase" }}>
                    Siparis Bekliyor
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>— {bekleyenKalem} kalem, {tedGrupListe.length} tedarikçi</span>
                </div>
                {bekleyenler.length > 1 && (
                  <button onClick={() => bekleyenler.forEach(ts => durumGecis(ts.id, "siparis_verildi"))}
                    style={{
                      background: C.cyan + "12", border: "1px solid " + C.cyan + "25",
                      borderRadius: 9, padding: "7px 14px", fontSize: 11, fontWeight: 700,
                      color: C.cyan, cursor: "pointer",
                    }}>
                    🛒 Tümüne Siparis Ver ({bekleyenler.length})
                  </button>
                )}
              </div>

              {tedGrupListe.map((grup, gi) => {
                const isBelrsz = grup.tedarikci === "Belirtilmemis";
                const gRenk = isBelrsz ? C.muted : C.sky;
                const gIkon = isBelrsz ? "❓" : "📦";
                return (
                  <div key={gi} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid " + gRenk + "20",
                    borderRadius: 14, overflow: "hidden", marginBottom: 10,
                    animation: "fade-up .3s " + gi * .06 + "s ease both",
                  }}>
                    <div style={{
                      padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: gRenk + "08", borderBottom: "1px solid " + gRenk + "15",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{gIkon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{grup.tedarikci}</div>
                          <div style={{ fontSize: 10, color: C.muted }}>{grup.kalemler.length} kalem</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => grup.siparisler.forEach(ts => durumGecis(ts.id, "siparis_verildi"))}
                          style={{
                            background: C.cyan + "15", border: "1px solid " + C.cyan + "30",
                            borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700,
                            color: C.cyan, cursor: "pointer",
                          }}>📞 Siparis Ver</button>
                      </div>
                    </div>
                    <div style={{ padding: "8px 16px" }}>
                      {grup.kalemler.map((k, ki) => (
                        <KalemSatir key={ki} k={k} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Siparis Verildi */}
          {siparisVerilenler.length > 0 && (
            <div id="tedarik-siparis" style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                paddingBottom: 8, borderBottom: "2px solid " + C.sky + "30"
              }}>
                <span style={{ fontSize: 16 }}>🛒</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.sky, letterSpacing: .5, textTransform: "uppercase" }}>
                  Siparis Verildi
                </span>
              </div>
              {siparisVerilenler.map(ts => (
                <SiparisKart key={ts.id} ts={ts} borderRenk={C.sky}
                  aksiyon={(t) => durumGecis(t.id, "yolda")}
                  aksiyonLabel="Yolda" aksiyonIkon="🚚" aksiyonRenk="#E8914A" />
              ))}
            </div>
          )}

          {/* Yolda */}
          {yoldakiler.length > 0 && (
            <div id="tedarik-yolda" style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                paddingBottom: 8, borderBottom: "2px solid rgba(232,145,74,.3)"
              }}>
                <span style={{ fontSize: 16 }}>🚚</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#E8914A", letterSpacing: .5, textTransform: "uppercase" }}>
                  Yolda / Nakliyede
                </span>
              </div>
              {yoldakiler.map(ts => (
                <SiparisKart key={ts.id} ts={ts} borderRenk="#E8914A"
                  aksiyon={(t) => teslimAl(t)}
                  aksiyonLabel="Teslim Al" aksiyonIkon="📥" aksiyonRenk={C.mint} />
              ))}
            </div>
          )}

          {/* Fasonda */}
          {fasondakiler.length > 0 && (
            <div id="tedarik-fasonda" style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                paddingBottom: 8, borderBottom: "2px solid " + C.lav + "30"
              }}>
                <span style={{ fontSize: 16 }}>🏭</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.lav, letterSpacing: .5, textTransform: "uppercase" }}>Fasonda</span>
              </div>
              {fasondakiler.map(ts => (
                <div key={ts.id} style={{
                  background: C.lav + "06", border: "1px solid " + C.lav + "20",
                  borderLeft: "3px solid " + C.lav, borderRadius: 10, padding: "12px 16px", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                        🏭 {ts.fasonYonlendirme?.fasonFirmaAd || ts.tedarikci || "Fason"}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                        {(ts.kalemler || []).map(k => k.ad).join(", ")}
                        {ts.fasonYonlendirme?.gonderimAt && (
                          <span> · Gönderildi: {new Date(ts.fasonYonlendirme.gonderimAt).toLocaleDateString("tr-TR")}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => teslimAl(ts)} style={{
                      background: C.mint + "15", border: "1px solid " + C.mint + "30",
                      borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 700,
                      color: C.mint, cursor: "pointer",
                    }}>✅ Geri Geldi</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tamamlandi */}
          {tamamlananlar.length > 0 && (
            <div id="tedarik-tamam" style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                paddingBottom: 8, borderBottom: "2px solid " + C.mint + "30"
              }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.mint, letterSpacing: .5, textTransform: "uppercase" }}>Teslim Alindi</span>
              </div>
              {tamamlananlar.map(ts => (
                <div key={ts.id} style={{
                  background: C.mint + "04", border: "1px solid " + C.mint + "18",
                  borderLeft: "3px solid " + C.mint, borderRadius: 10, padding: "10px 16px", marginBottom: 6,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                        {ts.tedarikci || "—"} · Teslim: {ts.teslimAlindiAt ? new Date(ts.teslimAlindiAt).toLocaleDateString("tr-TR") : "—"}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                        {(ts.kalemler || []).map(k => fmt(k.miktar, 1) + " " + k.birim + " " + k.ad).join(" · ")}
                        {ts.faturaNo && <span> · 🧾 {ts.faturaNo}</span>}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, color: C.mint, padding: "4px 8px",
                      background: C.mint + "10", borderRadius: 6,
                    }}>✓ Stoka Eklendi</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════ URUN BAZLI GORUNUM ═══════════ */}
      {gorMode === "urun_bazli" && (
        <>
          {bekleyenler.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>
              Siparis bekleyen malzeme yok
            </div>
          )}
          {Object.entries(urunGrup).map(([key, grp], gi) => (
            <div key={key} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid " + C.cyan + "20",
              borderRadius: 14, overflow: "hidden", marginBottom: 10,
              animation: "fade-up .3s " + gi * .06 + "s ease both",
            }}>
              <div style={{
                padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: C.cyan + "08", borderBottom: "1px solid " + C.cyan + "15",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🏭</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{grp.label}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{grp.kalemler.length} kalem</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "8px 16px" }}>
                {grp.kalemler.map((k, ki) => (
                  <KalemSatir key={ki} k={k} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ═══════════ SIPARIS BAZLI GORUNUM ═══════════ */}
      {gorMode === "siparis_bazli" && (
        <>
          {bekleyenler.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>
              Siparis bekleyen malzeme yok
            </div>
          )}
          {Object.entries(sipGrup).map(([sNo, grp], gi) => (
            <div key={sNo} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid " + C.lav + "20",
              borderRadius: 14, overflow: "hidden", marginBottom: 10,
              animation: "fade-up .3s " + gi * .06 + "s ease both",
            }}>
              <div style={{
                padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: C.lav + "08", borderBottom: "1px solid " + C.lav + "15",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📋</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{grp.sipNo}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{grp.kalemler.length} kalem · {grp.siparisler.length} tedarik emri</div>
                  </div>
                </div>
                <button onClick={() => grp.siparisler.forEach(ts => durumGecis(ts.id, "siparis_verildi"))}
                  style={{
                    background: C.cyan + "15", border: "1px solid " + C.cyan + "30",
                    borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700,
                    color: C.cyan, cursor: "pointer",
                  }}>📞 Siparis Ver</button>
              </div>
              <div style={{ padding: "8px 16px" }}>
                {grp.kalemler.map((k, ki) => (
                  <div key={ki} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0",
                    borderBottom: ki < grp.kalemler.length - 1 ? "1px solid " + C.border + "40" : "none",
                    fontSize: 11,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>{k.ad}</span>
                      {k.tedarikci && <span style={{ color: C.muted, marginLeft: 6, fontSize: 8 }}>📦 {k.tedarikci}</span>}
                    </div>
                    <span style={{ color: C.coral, fontWeight: 700 }}>
                      {fmt(k.miktar, 1)} <span style={{ fontWeight: 400, color: C.muted, fontSize: 9 }}>{k.birim}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

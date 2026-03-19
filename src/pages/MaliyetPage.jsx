import { useState, useMemo, useEffect } from 'react';
import { C, F, FB, fmt } from '../config/constants.js';
import { Btn } from '../components/index.js';
import { _bomKalemMaliyet, _ymBirimMaliyet, bomKalemMaliyet, snGoster } from '../engine/index.js';
import AkisHaritasiCanvas from '../components/AkisHaritasiCanvas.jsx';

/* ══════════════════════════════════════════════════════════════════
   YM Detay Satırı — rekürsif iç bileşen gösterimi
   ══════════════════════════════════════════════════════════════════ */
function YmDetaySatir({ b, indent = 0, hamMaddeler, yarimamulList, hizmetler }) {
  const [acik, setAcik] = useState(false);
  const isYM = b.tip === "yarimamul";
  const ym = isYM ? yarimamulList.find(x => x.id === b.kalemId) : null;
  const detay = isYM && ym?.bom ? ym.bom.map(b2 => {
    const k2 = [...hamMaddeler, ...yarimamulList, ...hizmetler].find(x => x.id === b2.kalemId);
    const m = k2 ? _bomKalemMaliyet(k2, b2.miktar, b2.birim, hamMaddeler, yarimamulList, hizmetler, 0, b2.fireTahmini || 0) : 0;
    return { ...b2, kalem: k2, maliyet: m };
  }) : [];
  const pl = 28 + indent * 16;

  return (
    <>
      <div onClick={() => isYM && setAcik(a => !a)}
        style={{
          padding: `6px 16px 6px ${pl}px`, display: "flex", justifyContent: "space-between",
          alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.04)",
          cursor: isYM ? "pointer" : "default", fontSize: 11,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
          {isYM && <span style={{ fontSize: 9, color: C.cyan }}>{acik ? "▾" : "▸"}</span>}
          <span style={{ color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {b.kalem?.ad || "?"}
          </span>
          <span style={{ color: C.muted, fontSize: 9, flexShrink: 0 }}>{b.miktar} {b.birim}</span>
        </div>
        <span style={{ color: C.sub, fontWeight: 600, flexShrink: 0 }}>{fmt(b.maliyet || 0)}₺</span>
      </div>
      {isYM && acik && detay.map((d, di) => (
        <YmDetaySatir key={di} b={d} indent={indent + 1}
          hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} />
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Özet Grup Kartı — açılır/kapanır, YM expansion destekli
   ══════════════════════════════════════════════════════════════════ */
function OzetGrupKart({ baslik, renk, ikon, satirlar, toplam, genelToplam, ymDetayFn, hamMaddeler, yarimamulList, hizmetler }) {
  const [acik, setAcik] = useState(true);
  const [acikYM, setAcikYM] = useState({});

  return (
    <div style={{
      background: "rgba(255,255,255,.025)", border: `1px solid ${renk}25`,
      borderRadius: 14, overflow: "hidden", marginBottom: 10,
    }}>
      <div onClick={() => setAcik(a => !a)}
        style={{
          background: `${renk}0E`, padding: "10px 16px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
          borderBottom: acik && satirlar.length > 0 ? `1px solid ${renk}20` : "none",
          cursor: "pointer", userSelect: "none",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>{ikon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: renk, fontFamily: F }}>{baslik}</span>
          <span style={{ fontSize: 10, color: C.muted }}>{satirlar.length} kalem</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: renk, fontFamily: F }}>{fmt(toplam)}₺</span>
          <span style={{
            fontSize: 11, color: C.muted,
            transform: acik ? "rotate(0)" : "rotate(-90deg)", display: "inline-block", transition: "transform .2s",
          }}>▾</span>
        </div>
      </div>
      {acik && satirlar.map((b, i) => {
        const isYM = b.tip === "yarimamul";
        const detay = isYM && ymDetayFn ? ymDetayFn(b) : [];
        const ymAcik = acikYM[b.id || i];
        return (
          <div key={b.id || i}>
            <div onClick={() => isYM && setAcikYM(p => ({ ...p, [b.id || i]: !p[b.id || i] }))}
              style={{
                padding: "9px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,.06)",
                cursor: isYM ? "pointer" : "default",
                background: ymAcik ? `${renk}06` : "transparent", transition: "background .15s",
              }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {isYM && <span style={{ fontSize: 10, color: renk, opacity: .7, minWidth: 10 }}>{ymAcik ? "▾" : "▸"}</span>}
                  <div style={{
                    fontSize: 12, color: C.text, fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{b.kalem?.ad || "?"}</div>
                </div>
                <div style={{ fontSize: 10, color: C.muted, paddingLeft: isYM ? 16 : 0, marginTop: 2 }}>
                  {b.miktar} {b.birim}
                  {(b.kalem?.tip === "ic") && (() => {
                    const sn = b.kalem?.sureDkAdet || 0;
                    if (!sn) return null;
                    return <span style={{ marginLeft: 6 }}>· {snGoster(sn)}</span>;
                  })()}
                  {isYM && detay.length > 0 && <span style={{ marginLeft: 6, color: renk }}>· {detay.length} bilesen</span>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: renk }}>{fmt(b.maliyet || 0)}₺</div>
                <div style={{ fontSize: 9, color: C.muted }}>
                  %{genelToplam > 0 ? ((b.maliyet || 0) / genelToplam * 100).toFixed(1) : 0}
                </div>
              </div>
            </div>
            {isYM && ymAcik && (
              <div style={{ background: "rgba(0,0,0,.18)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                {detay.length === 0 ? (
                  <div style={{ padding: "8px 28px", fontSize: 11, color: C.muted }}>Bu yari mamul icin BOM tanimli degil</div>
                ) : detay.map((d, di) => (
                  <YmDetaySatir key={di} b={d} indent={0}
                    hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} />
                ))}
                <div style={{
                  padding: "5px 16px", display: "flex", justifyContent: "flex-end", fontSize: 10,
                  color: C.muted, borderTop: "1px solid rgba(255,255,255,.04)",
                }}>
                  Ic toplam: <strong style={{ color: renk, marginLeft: 4 }}>
                    {fmt(detay.reduce((s, d) => s + (d.maliyet || 0), 0))}₺
                  </strong>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MALİYET PAGE — Ürün Detay / Maliyet Workspace
   ──────────────────────────────────────────────────────────────────
   Eski app.jsx tab==="maliyet" bölümünün %100 orijinal restorasyonu.
   Alt sekmeler: akis · ozet · kartlar · analiz · kdv
   ══════════════════════════════════════════════════════════════════ */
export default function MaliyetPage({
  data, setters, setTab, setModal,
  aktifUrun, malTab, setMalTab, malParams, setMalParams,
}) {
  const { urunler = [], hamMaddeler = [], yarimamulList = [], hizmetler = [] } = data || {};
  const { setUrunler } = setters || {};

  /* ── Aktif ürün ── */
  const u = urunler.find(x => x.id === aktifUrun) || urunler[0] || null;

  /* ── aktifUrun değiştiğinde malParams'ı senkronize et ── */
  useEffect(() => {
    if (u && malParams._lastUrunId !== u.id) {
      setMalParams(p => ({
        ...p,
        targetSaleKdvDahil: u.satisKdvDahil || 0,
        saleKdv: u.satisKdv ?? 10,
        _lastUrunId: u.id,
      }));
    }
  }, [u?.id]);

  /* ── BOM → zenginleştirilmiş hesaplama (memoized) ── */
  const tumKalemler = useMemo(
    () => [...hamMaddeler, ...yarimamulList, ...hizmetler],
    [hamMaddeler, yarimamulList, hizmetler]
  );

  const bomZengin = useMemo(() => {
    if (!u?.bom) return [];
    return u.bom.map(b => {
      const kalem = tumKalemler.find(x => x.id === b.kalemId) || null;
      if (!kalem) return { ...b, kalem: null, matrah: 0, kdvTutar: 0, kdvDahil: 0, maliyet: 0 };
      const kdvDahil = _bomKalemMaliyet(kalem, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetler, 0, b.fireTahmini || 0);
      const kdvOran = (kalem.kdv || 0) / 100;
      const matrah = kdvDahil / (1 + kdvOran);
      const kdvTutar = kdvDahil - matrah;
      return {
        ...b, kalem, matrah, kdvTutar, kdvDahil, maliyet: kdvDahil,
        kategori: b.tip === "hammadde" ? "Ham Madde"
          : b.tip === "yarimamul" ? "Yari Mamul"
            : kalem.tip === "fason" ? "Fason Iscilik" : "Ic Iscilik",
        renk: b.tip === "hammadde" ? C.sky
          : b.tip === "yarimamul" ? C.cyan
            : kalem.tip === "fason" ? C.lav : C.gold,
      };
    });
  }, [u?.id, u?.bom, tumKalemler, hamMaddeler, yarimamulList, hizmetler]);

  /* ── Toplamlar ── */
  const totMatrah = bomZengin.reduce((s, b) => s + b.matrah, 0);
  const totKdv = bomZengin.reduce((s, b) => s + b.kdvTutar, 0);
  const totKdvDahil = bomZengin.reduce((s, b) => s + b.kdvDahil, 0);

  /* ── Satış & Kar hesapları ── */
  const hedefSatisKdvDahil = malParams.targetSaleKdvDahil ?? u?.satisKdvDahil ?? 0;
  const hedefSatisKdv = malParams.saleKdv ?? u?.satisKdv ?? 10;
  const saleNet = hedefSatisKdvDahil / (1 + hedefSatisKdv / 100);
  const brutKar = saleNet - totMatrah;
  const brutPct = saleNet > 0 ? (brutKar / saleNet) * 100 : 0;
  const vergi = brutKar > 0 ? brutKar * (malParams.gelirVergisi ?? 30) / 100 : 0;
  const netKar = brutKar - vergi;
  const netPct = saleNet > 0 ? (netKar / saleNet) * 100 : 0;

  /* ── YM detay fonksiyonu ── */
  const ymDetayFn = (b) => {
    const ymK = yarimamulList.find(x => x.id === b.kalemId);
    if (!ymK?.bom?.length) return [];
    return ymK.bom.map(b2 => {
      const k2 = tumKalemler.find(x => x.id === b2.kalemId);
      const m = k2 ? _bomKalemMaliyet(k2, b2.miktar, b2.birim, hamMaddeler, yarimamulList, hizmetler, 0, b2.fireTahmini || 0) : 0;
      return { ...b2, kalem: k2, maliyet: m };
    });
  };

  if (!u) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: C.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
        Henuz urun yok. Urun listesine donun.
        <div style={{ marginTop: 16 }}>
          <Btn onClick={() => setTab("urunler")}>← Urunler</Btn>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ animation: "fade-up .35s ease" }}>

      {/* ─────────────── HEADER ─────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        {/* Sol: Geri + Ürün bilgisi */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Btn onClick={() => setTab("urunler")}>← Urunler</Btn>
          <div>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{u.kod} · {u.kategori}</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: F, letterSpacing: -1, margin: 0 }}>{u.ad}</h1>
          </div>
        </div>

        {/* Sag: Metrik kutulari */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Maliyet + KDV Dahil — salt okunur */}
          {[
            ["Maliyet", `${fmt(totMatrah)} ₺`, C.coral],
            ["KDV Dahil", `${fmt(totKdvDahil)} ₺`, C.gold],
          ].map(([l, v, c]) => (
            <div key={l} style={{
              background: `${c}0D`, border: `1px solid ${c}22`, borderRadius: 10,
              padding: "7px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 1 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c, fontFamily: F }}>{v}</div>
            </div>
          ))}

          {/* Satis fiyati — cift yonlu editable */}
          <div style={{
            background: `${C.cyan}0D`, border: `1px solid ${C.cyan}30`, borderRadius: 10,
            padding: "6px 10px", minWidth: 130,
          }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>
              Satis Fiyati (KDV %{u.satisKdv ?? 10})
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontSize: 8, color: C.muted }}>KDV Dahil</div>
                <input type="number" step={1} min={0}
                  value={malParams.targetSaleKdvDahil ?? u.satisKdvDahil ?? 0}
                  onChange={e => {
                    const kdvDahil = parseFloat(e.target.value) || 0;
                    setMalParams(p => ({ ...p, targetSaleKdvDahil: kdvDahil }));
                    setUrunler(prev => prev.map(x => x.id === u.id ? { ...x, satisKdvDahil: kdvDahil } : x));
                  }}
                  className="inp" style={{
                    width: 75, background: "rgba(255,255,255,.06)", border: `1px solid ${C.cyan}40`,
                    borderRadius: 6, padding: "3px 7px", fontSize: 13, fontWeight: 800, color: C.cyan, textAlign: "right",
                  }} />
              </div>
              <div style={{ color: C.muted, fontSize: 10, alignSelf: "flex-end", paddingBottom: 3 }}>⇄</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontSize: 8, color: C.muted }}>KDV Haric</div>
                <input type="number" step={1} min={0}
                  value={Math.round(((malParams.targetSaleKdvDahil ?? u.satisKdvDahil ?? 0) / (1 + (u.satisKdv ?? 10) / 100)) * 100) / 100}
                  onChange={e => {
                    const net = parseFloat(e.target.value) || 0;
                    const kdvDahil = Math.round(net * (1 + (u.satisKdv ?? 10) / 100) * 100) / 100;
                    setMalParams(p => ({ ...p, targetSaleKdvDahil: kdvDahil }));
                    setUrunler(prev => prev.map(x => x.id === u.id ? { ...x, satisKdvDahil: kdvDahil } : x));
                  }}
                  className="inp" style={{
                    width: 75, background: "rgba(255,255,255,.04)", border: `1px solid ${C.cyan}25`,
                    borderRadius: 6, padding: "3px 7px", fontSize: 12, fontWeight: 600, color: C.sub, textAlign: "right",
                  }} />
              </div>
            </div>
          </div>

          {/* Net Kar + Marj */}
          {[
            ["Net Kar", `${fmt(netKar)} ₺`, netKar > 0 ? C.mint : C.coral],
            ["Net Marj", `%${fmt(netPct, 1)}`, netPct > 15 ? C.mint : C.gold],
          ].map(([l, v, c]) => (
            <div key={l} style={{
              background: `${c}0D`, border: `1px solid ${c}22`, borderRadius: 10,
              padding: "7px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 1 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c, fontFamily: F }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────── ALT SEKMELER ─────────────── */}
      <div style={{
        display: "flex", gap: 3, marginBottom: 18, background: "rgba(255,255,255,0.02)", padding: 3,
        borderRadius: 11, width: "fit-content", border: `1px solid ${C.border}`,
      }}>
        {[
          ["akis",    "🔗 Uretim Akis Haritasi"],
          ["ozet",    "📊 Uretim Ozeti"],
          ["kartlar", "💰 Maliyet Kartlari"],
          ["analiz",  "📈 Kar Analizi"],
          ["kdv",     "🧾 KDV Ozeti"],
        ].map(([id, lbl]) => (
          <button key={id} onClick={() => setMalTab(id)} style={{
            padding: "7px 15px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: FB,
            background: malTab === id ? C.s3 : "transparent",
            color: malTab === id ? C.text : C.muted,
            fontSize: 12, fontWeight: malTab === id ? 600 : 400, transition: "all .15s",
            boxShadow: malTab === id ? `0 2px 6px rgba(0,0,0,.3), inset 0 1px 0 ${C.borderHi}` : "none",
          }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ═══════════════ AKIŞ SEKMESİ — React Flow Gorsel Tuval ═══════════════ */}
      {malTab === "akis" && (
        <AkisHaritasiCanvas
          urun={u} setUrunler={setUrunler}
          hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler}
        />
      )}

      {/* ═══════════════ ÖZET SEKMESİ ═══════════════ */}
      {malTab === "ozet" && (() => {
        const bomRows = u.bom || [];
        const allKalemler = tumKalemler;

        // Ust BOM'u zenginlestir
        const zenginBom = bomRows.map(b => {
          const kalem = allKalemler.find(x => x.id === b.kalemId) || null;
          const maliyet = kalem
            ? _bomKalemMaliyet(kalem, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetler, 0, b.fireTahmini || 0)
            : 0;
          return { ...b, kalem, maliyet };
        });

        const hamGrup = zenginBom.filter(b => b.tip === "hammadde");
        const ymGrup = zenginBom.filter(b => b.tip === "yarimamul");
        const fasonGrup = zenginBom.filter(b => b.tip === "hizmet" && b.kalem?.tip === "fason");
        const icGrup = zenginBom.filter(b => b.tip === "hizmet" && b.kalem?.tip === "ic");

        // YM ici hizmetleri rekursif topla
        const ymHizmetleriTopla = (ymBom, carpan = 1, derinlik = 0) => {
          if (derinlik > 8 || !ymBom?.length) return [];
          return ymBom.flatMap(b2 => {
            const k2 = allKalemler.find(x => x.id === b2.kalemId) || null;
            if (b2.tip === "hizmet") {
              const m1 = k2 ? _bomKalemMaliyet(k2, b2.miktar, b2.birim, hamMaddeler, yarimamulList, hizmetler) : 0;
              return [{ ...b2, kalem: k2, maliyet: m1 * carpan }];
            }
            if (b2.tip === "yarimamul") {
              const ym2 = yarimamulList.find(x => x.id === b2.kalemId);
              return ymHizmetleriTopla(ym2?.bom || [], (b2.miktar || 1) * carpan, derinlik + 1);
            }
            return [];
          });
        };

        const ymHizmetler = ymGrup.flatMap(b => {
          const ymK = yarimamulList.find(x => x.id === b.kalemId);
          return ymHizmetleriTopla(ymK?.bom || [], b.miktar || 1);
        });

        const tumFasonlar = [...fasonGrup, ...ymHizmetler.filter(b => b.kalem?.tip === "fason")];
        const tumIcIsci = [...icGrup, ...ymHizmetler.filter(b => b.kalem?.tip === "ic")];

        const genelToplam = zenginBom.reduce((s, b) => s + (b.maliyet || 0), 0);
        const toplamMal = [...hamGrup, ...ymGrup].reduce((s, b) => s + (b.maliyet || 0), 0);
        const toplamFasonGoster = tumFasonlar.reduce((s, b) => s + (b.maliyet || 0), 0);
        const toplamIsciGoster = tumIcIsci.reduce((s, b) => s + (b.maliyet || 0), 0);

        // Iscilik sureleri — her "ic" hizmetin sureDkAdet (saniye) × miktar
        const tumSureler = [...icGrup, ...ymHizmetler.filter(b => b.kalem?.tip === "ic")]
          .map(b => (b.kalem?.sureDkAdet || 0) * (b.miktar || 1));
        const toplamSn = tumSureler.reduce((s, v) => s + v, 0);
        const darbogazSn = tumSureler.length > 0 ? Math.max(...tumSureler) : 0;
        // 28800 sn = 8 saat vardiya
        const gunlukKapasite = toplamSn > 0 ? Math.floor(28800 / toplamSn) : null;

        if (zenginBom.length === 0) {
          return (
            <div style={{
              textAlign: "center", padding: 60, color: C.muted, fontSize: 14,
              background: C.s2, borderRadius: 14, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: .5 }}>📋</div>
              Bu urun icin BOM tanimlanmamis.
              <div style={{ marginTop: 12 }}>
                <Btn onClick={() => setModal({ type: "duzenleUrunBom", data: u })}>BOM Duzenle</Btn>
              </div>
            </div>
          );
        }

        return (
          <div>
            {/* ── Ust Metrik Kutulari (Orijinal %100 Klon) ── */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 10, marginBottom: 20,
            }}>
              {[
                { l: "Toplam Maliyet", v: `${fmt(genelToplam)}₺`, c: C.coral, ikon: "💰" },
                { l: "Malzeme+YM", v: `${fmt(toplamMal)}₺`, c: C.sky, ikon: "🏗️",
                  alt: genelToplam > 0 ? `%${fmt(toplamMal / genelToplam * 100, 1)}` : undefined },
                { l: "Fason", v: `${fmt(toplamFasonGoster)}₺`, c: C.lav, ikon: "🏭",
                  alt: genelToplam > 0 ? `%${fmt(toplamFasonGoster / genelToplam * 100, 1)}` : undefined },
                { l: "Ic Iscilik", v: `${fmt(toplamIsciGoster)}₺`, c: C.gold, ikon: "👤",
                  alt: genelToplam > 0 ? `%${fmt(toplamIsciGoster / genelToplam * 100, 1)}` : undefined },
                ...(toplamSn > 0 ? [{
                  l: "Toplam Iscilik Suresi", v: snGoster(toplamSn), c: C.mint, ikon: "⏱️",
                  alt: `${fmt(toplamSn / 3600, 2)} saat / urun`,
                }] : []),
                ...(gunlukKapasite ? [{
                  l: "Gunluk Kapasite", v: `${gunlukKapasite} adet`, c: C.cyan, ikon: "📈",
                  alt: `8 saat vardiya · darbogaz: ${snGoster(darbogazSn)}`,
                }] : []),
              ].map((m, i) => (
                <div key={i} style={{
                  background: `${m.c}0C`, border: `1px solid ${m.c}25`, borderRadius: 12,
                  padding: "12px 14px",
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{m.ikon}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{m.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: m.c, fontFamily: F, letterSpacing: "-.5px" }}>{m.v}</div>
                  {m.alt && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{m.alt}</div>}
                </div>
              ))}
            </div>

            {/* ── Maliyet Dagilim Cubugu (Orijinal %100 Klon) ── */}
            {genelToplam > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Maliyet Dagilimi</div>
                <div style={{ display: "flex", height: 8, borderRadius: 6, overflow: "hidden", gap: 1 }}>
                  {[[toplamMal, C.sky, "Malzeme"], [toplamFasonGoster, C.lav, "Fason"], [toplamIsciGoster, C.gold, "Iscilik"]].map(([v, c, l]) =>
                    v > 0 && <div key={l} title={`${l}: ${fmt(v)}₺`} style={{ flex: v, background: c }} />
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
                  {[[toplamMal, C.sky, "🏗️ Malzeme"], [toplamFasonGoster, C.lav, "🏭 Fason"], [toplamIsciGoster, C.gold, "👤 Iscilik"]].map(([v, c, l]) =>
                    v > 0 && <span key={l} style={{ fontSize: 10, color: c }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: c, marginRight: 3 }} />
                      {l} {fmt(v)}₺
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Grup Kartlari ── */}
            {hamGrup.length > 0 && (
              <OzetGrupKart baslik="Ham Maddeler" renk={C.sky} ikon="🧱"
                satirlar={hamGrup} toplam={hamGrup.reduce((s, b) => s + (b.maliyet || 0), 0)}
                genelToplam={genelToplam} ymDetayFn={null}
                hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} />
            )}
            {ymGrup.length > 0 && (
              <OzetGrupKart baslik="Yari Mamuller" renk={C.cyan} ikon="⚙️"
                satirlar={ymGrup} toplam={ymGrup.reduce((s, b) => s + (b.maliyet || 0), 0)}
                genelToplam={genelToplam} ymDetayFn={ymDetayFn}
                hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} />
            )}
            {tumFasonlar.length > 0 && (
              <OzetGrupKart baslik="Fason Iscilik" renk={C.lav} ikon="🏭"
                satirlar={tumFasonlar} toplam={toplamFasonGoster}
                genelToplam={genelToplam} ymDetayFn={null}
                hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} />
            )}
            {tumIcIsci.length > 0 && (
              <OzetGrupKart baslik="Ic Iscilik" renk={C.gold} ikon="👤"
                satirlar={tumIcIsci} toplam={toplamIsciGoster}
                genelToplam={genelToplam} ymDetayFn={null}
                hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} hizmetler={hizmetler} />
            )}
          </div>
        );
      })()}

      {/* ═══════════════ KARTLAR SEKMESİ ═══════════════ */}
      {malTab === "kartlar" && (() => {
        if (bomZengin.length === 0) {
          return (
            <div style={{
              textAlign: "center", padding: 60, color: C.muted, fontSize: 14,
              background: C.s2, borderRadius: 14, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: .5 }}>📋</div>
              BOM tanimlanmamis — maliyet karti olusturulamaz.
              <div style={{ marginTop: 12 }}>
                <Btn onClick={() => setModal({ type: "duzenleUrunBom", data: u })}>BOM Duzenle</Btn>
              </div>
            </div>
          );
        }

        const gruplar = [
          { id: "yarimamul", label: "Yari Mamuller", ikon: "⚙️", renk: C.cyan, satirlar: bomZengin.filter(b => b.tip === "yarimamul") },
          { id: "hammadde", label: "Ham Maddeler", ikon: "🧱", renk: C.sky, satirlar: bomZengin.filter(b => b.tip === "hammadde") },
          { id: "fason", label: "Fason Iscilik", ikon: "🏭", renk: C.lav, satirlar: bomZengin.filter(b => b.tip === "hizmet" && b.kalem?.tip === "fason") },
          { id: "ic", label: "Ic Iscilik", ikon: "👤", renk: C.gold, satirlar: bomZengin.filter(b => b.tip === "hizmet" && b.kalem?.tip === "ic") },
        ].filter(g => g.satirlar.length > 0);

        return (
          <div>
            {/* Satis parametresi */}
            <div style={{
              display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "10px 16px", marginBottom: 16,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>
                Satis Parametresi
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 11, color: C.sub }}>Hedef Satis (KDV dahil):</span>
                <input type="number" step={1} min={0}
                  value={malParams.targetSaleKdvDahil ?? u.satisKdvDahil ?? 0}
                  onChange={e => setMalParams(p => ({ ...p, targetSaleKdvDahil: parseFloat(e.target.value) || 0 }))}
                  className="inp" style={{
                    width: 90, background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: "3px 7px", fontSize: 12, color: C.text, textAlign: "right",
                  }} />
                <span style={{ fontSize: 11, color: C.muted }}>₺</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 11, color: C.sub }}>Satis KDV %:</span>
                <input type="number" step={1} min={0}
                  value={malParams.saleKdv ?? u.satisKdv ?? 10}
                  onChange={e => setMalParams(p => ({ ...p, saleKdv: parseFloat(e.target.value) || 0 }))}
                  className="inp" style={{
                    width: 55, background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: "3px 7px", fontSize: 12, color: C.text, textAlign: "right",
                  }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 11, color: C.sub }}>Gelir Vergisi %:</span>
                <input type="number" step={1} min={0}
                  value={malParams.gelirVergisi ?? 30}
                  onChange={e => setMalParams(p => ({ ...p, gelirVergisi: parseFloat(e.target.value) || 0 }))}
                  className="inp" style={{
                    width: 55, background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: "3px 7px", fontSize: 12, color: C.text, textAlign: "right",
                  }} />
              </div>
              <button onClick={() => setModal({ type: "duzenleUrunBom", data: u })}
                style={{
                  marginLeft: "auto", background: `${C.cyan}10`, border: `1px solid ${C.cyan}25`,
                  borderRadius: 8, padding: "5px 12px", fontSize: 11, color: C.cyan, cursor: "pointer",
                }}>
                BOM Duzenle
              </button>
            </div>

            {/* Grup kartlari */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 12, marginBottom: 14 }}>
              {gruplar.map(g => {
                const gToplam = g.satirlar.reduce((s, b) => s + b.kdvDahil, 0);
                const gMatrah = g.satirlar.reduce((s, b) => s + b.matrah, 0);
                const gKdv = g.satirlar.reduce((s, b) => s + b.kdvTutar, 0);
                return (
                  <div key={g.id} style={{
                    background: "rgba(255,255,255,.025)",
                    border: `1px solid ${g.renk}25`, borderRadius: 14, overflow: "hidden",
                  }}>
                    <div style={{
                      background: `${g.renk}0E`, padding: "10px 16px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: `1px solid ${g.renk}20`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{g.ikon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: g.renk, fontFamily: F }}>{g.label}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>{g.satirlar.length} kalem</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: g.renk, fontFamily: F }}>{fmt(gToplam)}₺</div>
                        <div style={{ fontSize: 9, color: C.muted }}>KDV dahil · Matrah: {fmt(gMatrah)}₺</div>
                      </div>
                    </div>
                    {g.satirlar.map((b, i) => (
                      <div key={i} style={{
                        padding: "9px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderBottom: i < g.satirlar.length - 1 ? `1px solid ${C.border}` : "none",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12, color: C.text, fontWeight: 500,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{b.kalem?.ad || "?"}</div>
                          <div style={{ fontSize: 10, color: C.muted }}>
                            {b.miktar} {b.birim}
                            {b.kalem?.kod && <span style={{ marginLeft: 6, opacity: .6 }}>{b.kalem.kod}</span>}
                            {b.kalem?.tip === "ic" && b.kalem?.sureDkAdet > 0 &&
                              <span style={{ marginLeft: 6 }}>· {snGoster(b.kalem.sureDkAdet)}</span>
                            }
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: g.renk }}>{fmt(b.kdvDahil)}₺</div>
                          <div style={{ fontSize: 9, color: C.muted }}>
                            KDV %{b.kalem?.kdv || 0} · Matrah: {fmt(b.matrah)}₺
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{
                      padding: "7px 16px", background: `${g.renk}06`,
                      display: "flex", justifyContent: "flex-end", gap: 16,
                      borderTop: `1px solid ${g.renk}15`,
                    }}>
                      {[["Matrah", gMatrah], ["KDV", gKdv], ["KDV Dahil", gToplam]].map(([l, v]) => (
                        <div key={l} style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 9, color: C.muted }}>{l}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: g.renk }}>{fmt(v)}₺</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Genel toplam */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderHi}`,
              borderRadius: 14, padding: "14px 20px",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 1 }}>
                  GENEL TOPLAM
                </div>
                <div style={{ fontSize: 11, color: C.sub }}>{bomZengin.length} kalem</div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[["Matrah", totMatrah, C.coral], ["KDV", totKdv, C.gold], ["KDV Dahil", totKdvDahil, C.cyan]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: F }}>{fmt(v)}₺</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════ ANALİZ SEKMESİ ═══════════════ */}
      {malTab === "analiz" && (() => {
        const hamMal = bomZengin.filter(b => b.tip === "hammadde").reduce((s, b) => s + b.kdvDahil, 0);
        const ymMal = bomZengin.filter(b => b.tip === "yarimamul").reduce((s, b) => s + b.kdvDahil, 0);
        const fasonMal = bomZengin.filter(b => b.tip === "hizmet" && b.kalem?.tip === "fason").reduce((s, b) => s + b.kdvDahil, 0);
        const icMal = bomZengin.filter(b => b.tip === "hizmet" && b.kalem?.tip === "ic").reduce((s, b) => s + b.kdvDahil, 0);
        const malzemeToplam = hamMal + ymMal;

        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Sol: Satis & Vergi Hesabi */}
            <div style={{
              background: "rgba(255,255,255,.025)", border: `1px solid ${C.border}`,
              borderRadius: 14, padding: 20, overflow: "hidden",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 16 }}>
                Satis & Vergi Hesabi
              </div>
              {[
                ["Satis Fiyati (KDV Dahil)", fmt(hedefSatisKdvDahil) + "₺", C.cyan],
                ["Satis KDV %" + (hedefSatisKdv), `- ${fmt(hedefSatisKdvDahil - saleNet)} ₺`, C.muted],
                ["Satis Net (KDV Haric)", fmt(saleNet) + "₺", C.text],
                [null],
                ["Uretim Maliyeti (Matrah)", `- ${fmt(totMatrah)} ₺`, C.coral],
                ["Brut Kar", fmt(brutKar) + "₺", brutKar > 0 ? C.mint : C.coral],
                ["Brut Marj", `%${fmt(brutPct, 1)}`, brutPct > 15 ? C.mint : C.gold],
                [null],
                [`Gelir Vergisi (%${malParams.gelirVergisi ?? 30})`, `- ${fmt(vergi)} ₺`, C.muted],
                ["Net Kar", fmt(netKar) + "₺", netKar > 0 ? C.mint : C.coral],
                ["Net Marj", `%${fmt(netPct, 1)}`, netPct > 15 ? C.mint : C.gold],
              ].map((row, i) => {
                if (!row[0]) return <div key={i} style={{ height: 1, background: C.border, margin: "8px 0" }} />;
                return (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.03)",
                  }}>
                    <span style={{ fontSize: 11, color: C.sub }}>{row[0]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: row[2], fontFamily: F }}>{row[1]}</span>
                  </div>
                );
              })}
            </div>

            {/* Sag: Maliyet Dagilimi */}
            <div style={{
              background: "rgba(255,255,255,.025)", border: `1px solid ${C.border}`,
              borderRadius: 14, padding: 20, overflow: "hidden",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 16 }}>
                Maliyet Dagilimi
              </div>
              {[
                ["Ham Madde", hamMal, C.sky],
                ["Yari Mamul", ymMal, C.cyan],
                ["Fason Iscilik", fasonMal, C.lav],
                ["Ic Iscilik", icMal, C.gold],
              ].filter(([, v]) => v > 0).map(([l, v, c]) => {
                const pct = totKdvDahil > 0 ? (v / totKdvDahil * 100) : 0;
                return (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: C.sub }}>{l}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: F }}>
                        {fmt(v)}₺ <span style={{ fontSize: 10, color: C.muted }}>(%{pct.toFixed(1)})</span>
                      </span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,.04)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 3, transition: "width .3s" }} />
                    </div>
                  </div>
                );
              })}

              <div style={{
                marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`,
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Toplam Maliyet</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.coral, fontFamily: F }}>{fmt(totKdvDahil)}₺</span>
              </div>

              {totKdvDahil > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>
                    Malzeme vs Iscilik
                  </div>
                  <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${malzemeToplam / totKdvDahil * 100}%`, background: C.sky }} />
                    <div style={{ width: `${(fasonMal + icMal) / totKdvDahil * 100}%`, background: C.lav }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: C.sky }}>Malzeme %{(malzemeToplam / totKdvDahil * 100).toFixed(0)}</span>
                    <span style={{ fontSize: 10, color: C.lav }}>Iscilik %{((fasonMal + icMal) / totKdvDahil * 100).toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══════════════ KDV SEKMESİ ═══════════════ */}
      {malTab === "kdv" && (() => {
        const kdvGruplar = {};
        bomZengin.forEach(b => {
          const oran = b.kalem?.kdv || 0;
          if (!kdvGruplar[oran]) kdvGruplar[oran] = { oran, kalemler: [], matrah: 0, kdvTutar: 0, kdvDahil: 0 };
          kdvGruplar[oran].kalemler.push(b);
          kdvGruplar[oran].matrah += b.matrah;
          kdvGruplar[oran].kdvTutar += b.kdvTutar;
          kdvGruplar[oran].kdvDahil += b.kdvDahil;
        });
        const grupArr = Object.values(kdvGruplar).sort((a, b) => a.oran - b.oran);

        return (
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12,
            }}>
              {grupArr.map(g => (
                <div key={g.oran} style={{
                  background: "rgba(255,255,255,.025)", border: `1px solid ${C.border}`,
                  borderRadius: 14, overflow: "hidden",
                }}>
                  <div style={{
                    background: `${C.gold}0A`, padding: "10px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.gold, fontFamily: F }}>KDV %{g.oran}</span>
                      <span style={{ fontSize: 10, color: C.muted }}>{g.kalemler.length} kalem</span>
                    </div>
                  </div>

                  {g.kalemler.map((b, i) => (
                    <div key={i} style={{
                      padding: "8px 16px", display: "flex", justifyContent: "space-between",
                      alignItems: "center", borderBottom: i < g.kalemler.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, color: C.text, fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{b.kalem?.ad || "?"}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>{b.kategori}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: C.sub }}>Matrah: {fmt(b.matrah)}₺</div>
                        <div style={{ fontSize: 10, color: C.gold }}>KDV: {fmt(b.kdvTutar)}₺</div>
                      </div>
                    </div>
                  ))}

                  <div style={{
                    padding: "8px 16px", background: `${C.gold}06`,
                    display: "flex", justifyContent: "flex-end", gap: 16,
                    borderTop: `1px solid ${C.border}`,
                  }}>
                    {[["Matrah", g.matrah], ["KDV", g.kdvTutar], ["Toplam", g.kdvDahil]].map(([l, v]) => (
                      <div key={l} style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 9, color: C.muted }}>{l}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>{fmt(v)}₺</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Genel KDV toplam */}
            <div style={{
              marginTop: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borderHi}`,
              borderRadius: 14, padding: "14px 20px",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
            }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>
                KDV GENEL OZETI
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[["Matrah", totMatrah, C.coral], ["Toplam KDV", totKdv, C.gold], ["KDV Dahil", totKdvDahil, C.cyan]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: F }}>{fmt(v)}₺</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

import { useState } from 'react';
import { C, F, FB, fmt, uid } from '../config/constants.js';
import { _netFiyat, bomKalemMaliyet, hesaplaRezervasyon, boyUzunlukCmDuzelt, snGoster } from '../engine/index.js';
import { stokHareketiRepo } from '../repositories/stokHareketiRepo.js';
import { PageHeader, AramaInput, SilButonu, Btn, Badge } from '../components/index.js';

export default function StokPage({
  data, setters, setModal, setTab,
  onNewHM, onNewYM, onNewFasonHizmet, onNewIscilikHizmet,
  onEditHam, onEditYM, onEditFasonHizmet, onEditIscilikHizmet,
  onCopyHam, onCopyYM, onCopyUrun,
}) {
  const { hamMaddeler = [], yarimamulList = [], urunler = [], hizmetler = [], uretimEmirleri = [] } = data || {};
  const [stokSekme, setStokSekme] = useState("hammadde");
  const [filtre, setFiltre] = useState("");

  // hizmetlerMerged = hizmetler (aynı referans, orijinal app.jsx ile uyumlu)
  const hizmetlerMerged = hizmetler;

  const fasonlar = hizmetler.filter(x => x.tip === "fason");
  const iscilikler = hizmetlerMerged.filter(x => x.tip === "ic");
  const alarmSayisi = hamMaddeler.filter(x => x.miktar <= x.minStok).length;

  // Header action button
  const headerAction = stokSekme === "urunbom" ? (
    <Btn onClick={() => setTab("urunler")}
      style={{ color: C.cyan, border: `1px solid ${C.cyan}30`, background: `${C.cyan}08` }}>
      → Ürün Listesi'nden Ekle
    </Btn>
  ) : stokSekme === "hareketler" ? null : (
    <Btn variant="primary" onClick={() => {
      if (stokSekme === "hammadde") onNewHM?.();
      else if (stokSekme === "yarimamul") onNewYM?.();
      else if (stokSekme === "fason") onNewFasonHizmet?.();
      else if (stokSekme === "iscilik") onNewIscilikHizmet?.();
    }}>
      + {stokSekme === "hammadde" ? "Ham Madde"
        : stokSekme === "yarimamul" ? "Yarı Mamül"
        : stokSekme === "fason" ? "Fason Hizmet"
        : "İşçilik"} Ekle
    </Btn>
  );

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, fontFamily: F, letterSpacing: -.5, margin: "0 0 3px",
            backgroundImage: `linear-gradient(135deg,${C.text} 50%,${C.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Stok & Depo</h1>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
            {hamMaddeler.length} ham madde · {yarimamulList.length} yarı mamül · {urunler.length} ürün · {fasonlar.length} fason · {iscilikler.length} işçilik
            {alarmSayisi > 0 && <span style={{ color: C.coral, marginLeft: 8 }}>⚠ {alarmSayisi} alarm</span>}
          </p>
        </div>
        {headerAction}
      </div>

      {/* Sekmeler */}
      <div style={{
        display: "flex", gap: 3, marginBottom: 18, background: "rgba(255,255,255,.025)",
        padding: 4, borderRadius: 12, width: "fit-content", border: `1px solid ${C.border}`
      }}>
        {[
          { id: "hammadde", label: "Ham Madde", icon: "🧱", col: C.sky, alarm: alarmSayisi },
          { id: "yarimamul", label: "Yarı Mamül", icon: "⚙️", col: C.cyan, alarm: 0 },
          { id: "urunbom", label: "Ürünler", icon: "📦", col: C.mint, alarm: 0 },
          { id: "fason", label: "Fason", icon: "🏭", col: C.lav, alarm: 0 },
          { id: "iscilik", label: "İşçilik", icon: "👷", col: C.gold, alarm: 0 },
          { id: "hareketler", label: "Stok Geçmişi", icon: "📋", col: C.sub, alarm: 0 },
        ].map(s => {
          const ak = stokSekme === s.id;
          return (
            <button key={s.id} className="tab-b" onClick={() => { setStokSekme(s.id); setFiltre(""); }} style={{
              padding: "8px 14px", borderRadius: 9, border: `1px solid ${ak ? s.col + "40" : "transparent"}`,
              background: ak ? "rgba(255,255,255,.05)" : "transparent",
              color: ak ? s.col : C.muted, fontSize: 12, fontWeight: ak ? 600 : 400,
              cursor: "pointer", fontFamily: FB, transition: "all .18s",
              display: "flex", alignItems: "center", gap: 5
            }}>
              <span style={{ fontSize: 12 }}>{s.icon}</span>{s.label}
              {s.alarm > 0 && <span style={{
                background: C.coral, color: "#fff", borderRadius: 10,
                padding: "0 5px", fontSize: 9, fontWeight: 800
              }}>{s.alarm}</span>}
            </button>
          );
        })}
      </div>

      {/* Arama (hareketler hariç) */}
      {stokSekme !== "hareketler" && (
        <div style={{ marginBottom: 14 }}>
          <AramaInput value={filtre} onChange={setFiltre} placeholder="Stok kalemi ara..." />
        </div>
      )}

      {/* ── HAM MADDE ── */}
      {stokSekme === "hammadde" && <HamMaddeTab
        hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} urunler={urunler}
        uretimEmirleri={uretimEmirleri} filtre={filtre}
        onEditHam={onEditHam} onCopyHam={onCopyHam} />}

      {/* ── YARI MAMÜL ── */}
      {stokSekme === "yarimamul" && <YarimamulTab
        yarimamulList={yarimamulList} hamMaddeler={hamMaddeler}
        hizmetlerMerged={hizmetlerMerged} uretimEmirleri={uretimEmirleri}
        urunler={urunler} filtre={filtre}
        onEditYM={onEditYM} onCopyYM={onCopyYM} />}

      {/* ── ÜRÜNLER (BOM) ── */}
      {stokSekme === "urunbom" && <UrunBomTab
        urunler={urunler} hamMaddeler={hamMaddeler}
        yarimamulList={yarimamulList} hizmetlerMerged={hizmetlerMerged}
        filtre={filtre} setTab={setTab} onCopyUrun={onCopyUrun} />}

      {/* ── FASON ── */}
      {stokSekme === "fason" && <FasonTab
        hizmetler={hizmetler} filtre={filtre}
        onEditFasonHizmet={onEditFasonHizmet} />}

      {/* ── İŞÇİLİK ── */}
      {stokSekme === "iscilik" && <IscilikTab
        hizmetler={hizmetler} hizmetlerMerged={hizmetlerMerged} filtre={filtre}
        onEditIscilikHizmet={onEditIscilikHizmet} />}

      {/* ── STOK HAREKETLERİ ── */}
      {stokSekme === "hareketler" && <HareketlerTab
        hamMaddeler={hamMaddeler} yarimamulList={yarimamulList} urunler={urunler} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   HAM MADDE TAB
   ════════════════════════════════════════════════════════════════ */
function HamMaddeTab({ hamMaddeler, yarimamulList, urunler, uretimEmirleri, filtre, onEditHam, onCopyHam }) {
  const q = filtre.toLowerCase();
  const filtered = hamMaddeler.filter(k => !q || (k.ad || "").toLowerCase().includes(q) || (k.kod || "").toLowerCase().includes(q));
  const _rz = hesaplaRezervasyon(uretimEmirleri, urunler, hamMaddeler, yarimamulList);

  return (
    <div>
      {/* Özet istatistikler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { l: "Toplam", v: hamMaddeler.length, c: C.sky },
          { l: "Kritik", v: hamMaddeler.filter(x => x.miktar <= x.minStok).length, c: C.coral },
          { l: "Düşük", v: hamMaddeler.filter(x => x.miktar <= x.minStok * 1.5 && x.miktar > x.minStok).length, c: C.gold },
          { l: "Normal", v: hamMaddeler.filter(x => x.miktar > x.minStok * 1.5).length, c: C.mint },
        ].map((k, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,.03)", border: `1px solid ${k.c}18`,
            borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: k.c, fontFamily: F }}>{k.v}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{k.l}</span>
          </div>
        ))}
      </div>

      {/* Kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10 }}>
        {filtered.map((k, i) => {
          const alarm = k.miktar <= k.minStok;
          const dusuk = k.miktar <= k.minStok * 1.5 && !alarm;
          const col = alarm ? C.coral : dusuk ? C.gold : C.mint;
          const lbl = alarm ? "KRİTİK" : dusuk ? "DÜŞÜK" : "NORMAL";
          const netMtKart = _netFiyat(k.listeFiyat, k.iskonto);
          const net = netMtKart * (1 + (k.kdv || 0) / 100);
          const boyUzHm2 = boyUzunlukCmDuzelt(k.boyUzunluk);
          const birimGoster = k.birim === "boy"
            ? (boyUzHm2 ? `boy (${boyUzHm2}cm)` : "boy ⚠ uzunluk girilmeli!")
            : k.birim;
          const tlMtGoster = k.birimGrup === "uzunluk" && k.listeFiyat > 0
            ? fmt(_netFiyat(k.listeFiyat, k.iskonto || 0) * (1 + (k.kdv || 0) / 100), 2) + "₺/mt"
            : null;
          const pct = Math.min(100, k.minStok > 0 ? (k.miktar / (k.minStok * 2)) * 100 : 100);

          return (
            <div key={k.id} className="card" onClick={() => onEditHam?.(k)}
              style={{
                background: "rgba(255,255,255,.03)", backdropFilter: "blur(12px)",
                border: `1px solid ${col === C.mint ? C.border : col + "28"}`, borderRadius: 16,
                overflow: "hidden", transition: "all .22s", cursor: "pointer",
                animation: `fade-up .3s ${i * .03}s ease both`
              }}>
              <div style={{ height: 2, background: `linear-gradient(90deg,${col},${col}00)` }} />
              <div style={{ padding: "13px 15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{k.kod} · {k.kategori}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>{k.ad}</div>
                    {k.tedarikci && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>📦 {k.tedarikci}</div>}
                    {/* Tedarik bilgi badge'leri */}
                    {(k.sevkiyatYontemi || k.fasona_gider_mi) && (
                      <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
                        {k.sevkiyatYontemi && k.sevkiyatYontemi !== "tedarikci_getirir" && (
                          <span style={{ fontSize: 8, background: "rgba(232,145,74,.1)", color: "#E8914A", borderRadius: 3, padding: "1px 5px" }}>
                            {k.sevkiyatYontemi === "ben_alirim" ? "🏃 Ben" : ""}
                            {k.sevkiyatYontemi === "nakliye" ? "🚚 Nakliye" : ""}
                            {k.sevkiyatYontemi === "kargo" ? "📦 Kargo" : ""}
                          </span>
                        )}
                        {k.fasona_gider_mi && <span style={{ fontSize: 8, background: `${C.lav}12`, color: C.lav, borderRadius: 3, padding: "1px 5px" }}>🏭 Fasona</span>}
                        {k.tahminiTeslimGun > 0 && <span style={{ fontSize: 8, background: "rgba(255,255,255,.05)", color: C.muted, borderRadius: 3, padding: "1px 5px" }}>⏱ {k.tahminiTeslimGun}g</span>}
                      </div>
                    )}
                  </div>
                  <Badge label={lbl} color={col} small />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 22, fontWeight: 800, color: col, fontFamily: F,
                    textShadow: `0 0 14px ${col}40`
                  }}>{k.miktar}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{k.birim}</span>
                  {k.birim === "boy" && k.boyUzunluk && <span style={{ fontSize: 9, color: C.muted }}>({k.boyUzunluk}cm)</span>}
                </div>
                {/* Rezervasyon */}
                {(() => {
                  const hr = _rz.hammadde[k.id] || 0;
                  const kul = Math.max(0, (k.miktar || 0) - hr);
                  return hr > 0 ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 9, color: "#E8914A", background: "rgba(232,145,74,.12)", borderRadius: 4, padding: "1px 6px" }}>🔒 Rezerve: {Number(hr).toFixed(1)} {k.birim}</span>
                      <span style={{ fontSize: 9, color: C.mint }}>Kullanılabilir: {Number(kul).toFixed(1)}</span>
                    </div>
                  ) : null;
                })()}
                <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>Min: {k.minStok} {k.birim}</div>
                <div style={{ background: "rgba(255,255,255,.05)", borderRadius: 3, height: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", background: col, borderRadius: 3,
                    animation: "bar-in 1s ease", boxShadow: `0 0 6px ${col}60`
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, color: C.muted, textDecoration: "line-through" }}>
                      {fmt(k.listeFiyat)}₺/mt (KDV hariç)
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.cyan }}>
                      {fmt(net)}₺/mt
                      {k.iskonto > 0 && <span style={{ fontSize: 9, color: C.mint }}> (-{k.iskonto}%+KDV{k.kdv}%)</span>}
                      {!k.iskonto && k.kdv > 0 && <span style={{ fontSize: 9, color: C.mint }}> (KDV %{k.kdv} dahil)</span>}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onCopyHam?.(k); }}
                    title="Kopyasını oluştur"
                    style={{
                      background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`, borderRadius: 7,
                      width: 26, height: 26, fontSize: 13, cursor: "pointer", color: C.muted,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", flexShrink: 0
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,145,74,.15)"; e.currentTarget.style.color = C.cyan; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = C.muted; }}>
                    📋
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: C.muted, fontSize: 13, padding: "32px", textAlign: "center", gridColumn: "1/-1" }}>
            Kayıt bulunamadı
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   YARI MAMÜL TAB
   ════════════════════════════════════════════════════════════════ */
function YarimamulTab({ yarimamulList, hamMaddeler, hizmetlerMerged, uretimEmirleri, urunler, filtre, onEditYM, onCopyYM }) {
  const q = filtre.toLowerCase();
  const filtered = yarimamulList.filter(ym => !q || (ym.ad || "").toLowerCase().includes(q) || (ym.kod || "").toLowerCase().includes(q));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {filtered.map((ym, i) => {
        const alarm = ym.miktar <= ym.minStok;
        const col = alarm ? C.coral : C.cyan;
        const liste = [...hamMaddeler, ...yarimamulList, ...hizmetlerMerged];
        const malBom = ym.bom?.reduce((s, b) => {
          const k = liste.find(x => x.id === b.kalemId);
          if (!k) return s;
          return s + bomKalemMaliyet(k, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetlerMerged);
        }, 0) || 0;
        const bomAdlari = (ym.bom || []).slice(0, 3).map(b => {
          const k = liste.find(x => x.id === b.kalemId);
          return k?.ad || "?";
        });
        return (
          <div key={ym.id} className="card" onClick={() => onEditYM?.(ym)}
            style={{
              background: "rgba(255,255,255,.03)", backdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderLeft: `3px solid ${col}40`,
              borderRadius: 14, cursor: "pointer", transition: "all .2s",
              animation: `fade-up .25s ${i * .04}s ease both`
            }}>
            <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, color: C.muted }}>{ym.kod}</span>
                  <Badge label={alarm ? "KRİTİK" : "YM"} color={col} small />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: F, marginBottom: 4 }}>{ym.ad}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {bomAdlari.map((ad, bi) => {
                    const b = ym.bom[bi];
                    const tc = b.tip === "hammadde" ? C.sky : b.tip === "yarimamul" ? C.cyan : C.lav;
                    return (
                      <span key={bi} style={{
                        background: `${tc}0D`, border: `1px solid ${tc}1A`,
                        borderRadius: 6, padding: "2px 7px", fontSize: 10, color: tc
                      }}>
                        {ad.length > 16 ? ad.slice(0, 16) + "…" : ad} ×{b.miktar}{b.birim}
                      </span>
                    );
                  })}
                  {(ym.bom?.length || 0) > 3 && <span style={{ fontSize: 10, color: C.muted }}>+{ym.bom.length - 3}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: col, fontFamily: F }}>{ym.miktar}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{ym.birim}</div>
                {/* Rezervasyon */}
                {(() => {
                  const rz = hesaplaRezervasyon(uretimEmirleri, urunler, hamMaddeler, yarimamulList);
                  const yr = rz.yarimamul[ym.id] || 0;
                  const kul = Math.max(0, (ym.miktar || 0) - yr);
                  return yr > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                      <span style={{ fontSize: 8, color: "#E8914A", background: "rgba(232,145,74,.12)", borderRadius: 3, padding: "1px 5px" }}>🔒 {Number(yr).toFixed(0)}</span>
                      <span style={{ fontSize: 8, color: C.mint }}>Kul: {Number(kul).toFixed(0)}</span>
                    </div>
                  ) : null;
                })()}
                {malBom > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: C.cyan, marginTop: 3 }}>{fmt(malBom)}₺/adet</div>}
                <button onClick={e => { e.stopPropagation(); onCopyYM?.(ym); }}
                  title="Kopyasını oluştur"
                  style={{
                    background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`, borderRadius: 7,
                    width: 26, height: 26, fontSize: 13, cursor: "pointer", color: C.muted,
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,202,183,.15)"; e.currentTarget.style.color = C.cyan; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = C.muted; }}>
                  📋
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: "32px", textAlign: "center" }}>
        {yarimamulList.length === 0 ? "Henüz yarı mamül tanımlanmadı" : "Kayıt bulunamadı"}
      </div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ÜRÜNLER / BOM TAB
   ════════════════════════════════════════════════════════════════ */
function UrunBomTab({ urunler, hamMaddeler, yarimamulList, hizmetlerMerged, filtre, setTab, onCopyUrun }) {
  const q = filtre.toLowerCase();
  const filtered = urunler.filter(ur => !q || (ur.ad || "").toLowerCase().includes(q) || (ur.kod || "").toLowerCase().includes(q));
  const liste = [...hamMaddeler, ...yarimamulList, ...hizmetlerMerged];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
      {filtered.map((ur, i) => {
        const malBom = ur.bom?.reduce((s, b) => {
          const k = liste.find(x => x.id === b.kalemId);
          if (!k) return s;
          return s + bomKalemMaliyet(k, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetlerMerged);
        }, 0) || 0;
        const urSaleNet = ur.satisKdvDahil / (1 + (ur.satisKdv ?? 10) / 100);
        const kar = urSaleNet - malBom;
        const marj = urSaleNet > 0 ? (kar / urSaleNet) * 100 : 0;
        return (
          <div key={ur.id} className="card" onClick={() => setTab("urunler")}
            style={{
              background: "rgba(255,255,255,.03)", backdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderTop: `2px solid ${C.mint}40`,
              borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all .22s",
              animation: `fade-up .3s ${i * .05}s ease both`
            }}>
            <div style={{ padding: "14px 15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{ur.kod} · {ur.kategori}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: F }}>{ur.ad}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.cyan, fontFamily: F }}>{ur.satisKdvDahil}₺</div>
                  <div style={{ fontSize: 9, color: C.muted }}>KDV dahil</div>
                </div>
              </div>
              {malBom > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: C.coral }}>Maliyet: {fmt(malBom)}₺</span>
                  <span style={{ fontSize: 11, color: kar > 0 ? C.mint : C.coral }}>Kâr: {fmt(kar)}₺</span>
                  <span style={{ fontSize: 11, color: marj > 20 ? C.mint : marj > 10 ? C.gold : C.coral }}>%{fmt(marj, 1)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flex: 1 }}>
                  {(ur.bom || []).slice(0, 3).map(b => {
                    const k = liste.find(x => x.id === b.kalemId);
                    const tc = b.tip === "hammadde" ? C.sky : b.tip === "yarimamul" ? C.cyan : C.lav;
                    return (
                      <span key={b.id} style={{
                        background: `${tc}0D`, border: `1px solid ${tc}1A`,
                        borderRadius: 6, padding: "2px 7px", fontSize: 10, color: tc
                      }}>
                        {(k?.ad || "?").slice(0, 14)}
                      </span>
                    );
                  })}
                  {(ur.bom?.length || 0) > 3 && <span style={{ fontSize: 10, color: C.muted }}>+{ur.bom.length - 3}</span>}
                </div>
                <button onClick={e => { e.stopPropagation(); onCopyUrun?.(ur); }}
                  title="Kopyasını oluştur"
                  style={{
                    background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`, borderRadius: 7,
                    width: 26, height: 26, fontSize: 13, cursor: "pointer", color: C.muted,
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s",
                    flexShrink: 0, marginLeft: 6
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,211,153,.15)"; e.currentTarget.style.color = C.mint; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = C.muted; }}>
                  📋
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div style={{ color: C.muted, fontSize: 13, padding: "32px", textAlign: "center", gridColumn: "1/-1" }}>
          {urunler.length === 0 ? "Henüz ürün tanımlanmadı" : "Kayıt bulunamadı"}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FASON TAB
   ════════════════════════════════════════════════════════════════ */
function FasonTab({ hizmetler, filtre, onEditFasonHizmet }) {
  const fasonlar = hizmetler.filter(x => x.tip === "fason");
  const q = filtre.toLowerCase();
  const filtered = fasonlar.filter(hz => !q || (hz.ad || "").toLowerCase().includes(q) || (hz.kod || "").toLowerCase().includes(q) || (hz.firma || "").toLowerCase().includes(q));

  return (
    <div>
      {/* Özet */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { l: "Toplam Fason", v: fasonlar.length, c: C.lav },
          { l: "Ortalama Süre", v: fmt(fasonlar.reduce((s, x) => s + (x.sureGun || 0), 0) / Math.max(fasonlar.length, 1), 1) + " gün", c: C.gold },
          { l: "Firma Sayısı", v: [...new Set(fasonlar.filter(x => x.firma).map(x => x.firma))].length, c: C.cyan },
        ].map((k, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,.03)", border: `1px solid ${k.c}18`,
            borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: k.c, fontFamily: F }}>{k.v}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{k.l}</span>
          </div>
        ))}
      </div>

      {/* Kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
        {filtered.map((hz, i) => (
          <div key={hz.id} className="card" onClick={() => onEditFasonHizmet?.(hz)}
            style={{
              background: "rgba(255,255,255,.03)", backdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.lav}50`,
              borderRadius: 14, cursor: "pointer", transition: "all .22s",
              animation: `fade-up .3s ${i * .04}s ease both`
            }}>
            <div style={{ padding: "14px 15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{hz.kod}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F }}>{hz.ad}</div>
                </div>
                <Badge label="Fason" color={C.lav} small />
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
                background: "rgba(124,92,191,.07)", borderRadius: 8, padding: "7px 10px"
              }}>
                <span style={{ fontSize: 15 }}>🏭</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{hz.firma || "—"}</div>
                  {hz.tel && <div style={{ fontSize: 10, color: C.muted }}>{hz.tel}</div>}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.lav, fontFamily: F }}>{fmt(hz.birimFiyat)}₺</span>
                  <span style={{ fontSize: 10, color: C.muted }}>/{hz.birim}</span>
                </div>
                <span style={{
                  fontSize: 10, color: C.muted, background: "rgba(255,255,255,.04)",
                  border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 7px"
                }}>KDV %{hz.kdv}</span>
              </div>
              {hz.sureGun > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.gold }}>
                  <span>⏱</span><span>{hz.sureGun} gün bekleme</span>
                </div>
              )}
              {hz.notlar && <div style={{ fontSize: 10, color: C.muted, marginTop: 6, borderTop: `1px solid ${C.border}`, paddingTop: 6 }}>📝 {hz.notlar}</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: C.muted, fontSize: 13, padding: "32px", textAlign: "center", gridColumn: "1/-1" }}>
            {fasonlar.length === 0 ? "Henüz fason hizmet tanımlanmadı" : "Kayıt bulunamadı"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   İŞÇİLİK TAB
   ════════════════════════════════════════════════════════════════ */
function IscilikTab({ hizmetler, hizmetlerMerged, filtre, onEditIscilikHizmet }) {
  const iscilikler = hizmetlerMerged.filter(x => x.tip === "ic");
  const q = filtre.toLowerCase();
  const filtered = iscilikler.filter(hz => !q || (hz.ad || "").toLowerCase().includes(q) || (hz.kod || "").toLowerCase().includes(q));

  return (
    <div>
      {/* Özet */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { l: "Toplam İşlem", v: iscilikler.length, c: C.gold },
          {
            l: "Toplam Süre", c: C.cyan,
            v: (() => {
              const sn = iscilikler.reduce((s, x) => s + (x.sureDkAdet || 0), 0);
              return sn >= 60
                ? Math.floor(sn / 60) + "dk " + (sn % 60 > 0 ? sn % 60 + "sn" : "") + "/ürün"
                : sn + "sn/ürün";
            })()
          },
          { l: "Toplam Maliyet", v: fmt(iscilikler.reduce((s, x) => s + (x.birimFiyat || 0), 0)) + "₺/ürün", c: C.mint },
        ].map((k, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,.03)", border: `1px solid ${k.c}18`,
            borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: k.c, fontFamily: F }}>{k.v}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{k.l}</span>
          </div>
        ))}
      </div>

      {/* Kartlar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((hz, i) => {
          const saatUcret = hz.sureDkAdet > 0 ? ((hz.birimFiyat || 0) / (hz.sureDkAdet / 3600)) : null;
          return (
            <div key={hz.id} className="card" onClick={() => onEditIscilikHizmet?.(hz)}
              style={{
                background: "rgba(255,255,255,.03)", backdropFilter: "blur(12px)",
                border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}50`,
                borderRadius: 14, cursor: "pointer", transition: "all .22s",
                animation: `fade-up .25s ${i * .04}s ease both`
              }}>
              <div style={{ padding: "13px 16px", display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: C.muted }}>{hz.kod}</span>
                    <Badge label="İç İşçilik" color={C.gold} small />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 4 }}>{hz.ad}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {hz.istasyon && (
                      <span style={{
                        background: "rgba(232,145,74,.1)", border: "1px solid rgba(232,145,74,.2)",
                        borderRadius: 6, padding: "2px 8px", fontSize: 10, color: C.cyan
                      }}>
                        ⚙ {hz.istasyon}
                      </span>
                    )}
                    {hz.calisan && (
                      <span style={{
                        background: "rgba(61,184,138,.08)", border: "1px solid rgba(61,184,138,.2)",
                        borderRadius: 6, padding: "2px 8px", fontSize: 10, color: C.mint
                      }}>
                        👤 {hz.calisan}
                      </span>
                    )}
                  </div>
                </div>
                {hz.sureDkAdet > 0 && (
                  <div style={{
                    textAlign: "center", background: "rgba(255,255,255,.04)",
                    border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", minWidth: 70
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: F }}>
                      {hz.sureDkAdet >= 60
                        ? Math.floor(hz.sureDkAdet / 60) + "dk" + (hz.sureDkAdet % 60 > 0 ? " " + hz.sureDkAdet % 60 + "sn" : "")
                        : hz.sureDkAdet + "sn"}
                    </div>
                    <div style={{ fontSize: 9, color: C.muted }}>süre/adet</div>
                  </div>
                )}
                {saatUcret && (
                  <div style={{
                    textAlign: "center", background: "rgba(255,255,255,.04)",
                    border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", minWidth: 80
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.sub, fontFamily: F }}>{fmt(saatUcret)}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>₺/saat</div>
                  </div>
                )}
                <div style={{
                  textAlign: "center", background: `${C.gold}0D`,
                  border: `1px solid ${C.gold}22`, borderRadius: 10, padding: "8px 12px", minWidth: 80
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.gold, fontFamily: F }}>{fmt(hz.birimFiyat)}₺</div>
                  <div style={{ fontSize: 9, color: C.muted }}>/{hz.birim}</div>
                </div>
              </div>
              {hz.notlar && <div style={{ padding: "0 16px 10px", fontSize: 10, color: C.muted }}>📝 {hz.notlar}</div>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: C.muted, fontSize: 13, padding: "32px", textAlign: "center" }}>
            {iscilikler.length === 0 ? "Henüz işçilik tanımlanmadı" : "Kayıt bulunamadı"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STOK HAREKETLERİ TAB
   ════════════════════════════════════════════════════════════════ */
function HareketlerTab({ hamMaddeler, yarimamulList, urunler }) {
  const hareketler = stokHareketiRepo.getAll()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const TIP_RENK = {
    satin_alma_girisi: "#4CAF82",
    uretim_tuketimi: "#E05C5C",
    bitirmis_urun_giris: "#00C2A0",
    sevkiyat_cikis: "#E8914A",
    fasona_gonderim: "#7C5CBF",
    fasondan_donus: "#3E7BD4",
    manuel_duzeltme: "#D4A437",
    fire: "#E05C5C",
  };
  const TIP_LABEL = {
    satin_alma_girisi: "Satın Alma",
    uretim_tuketimi: "Üretim Tüketimi",
    bitirmis_urun_giris: "Ürün Girişi",
    sevkiyat_cikis: "Sevkiyat",
    fasona_gonderim: "Fasona Gönderim",
    fasondan_donus: "Fasondan Dönüş",
    manuel_duzeltme: "Manuel Düzeltme",
    fire: "Fire",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: C.muted }}>{hareketler.length} hareket kaydı</div>
        {hareketler.length === 0 && (
          <div style={{ color: C.muted, fontSize: 12 }}>Henüz kayıt yok. Üretim tamamlandıkça ve tedarik gelince burası dolacak.</div>
        )}
      </div>
      {hareketler.slice(0, 100).map((h, i) => {
        const renk = TIP_RENK[h.hareketTipi] || C.muted;
        const pozitif = h.miktar > 0;
        return (
          <div key={h.id || i} style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${C.border}`, borderLeft: `3px solid ${renk}`,
            borderRadius: 9, padding: "8px 12px", marginBottom: 6
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 9, background: `${renk}15`, color: renk,
                    borderRadius: 4, padding: "1px 6px", fontWeight: 700
                  }}>
                    {TIP_LABEL[h.hareketTipi] || h.hareketTipi}
                  </span>
                  <span style={{ fontSize: 10, color: C.muted }}>
                    {h.stokTipi === "hammadde" ? "HM" : h.stokTipi === "yarimamul" ? "YM" : "ÜRÜN"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.text, marginBottom: 1 }}>
                  {h.stokTipi === "hammadde"
                    ? hamMaddeler.find(x => x.id === h.stokId)?.ad || h.stokId
                    : h.stokTipi === "yarimamul"
                    ? yarimamulList.find(x => x.id === h.stokId)?.ad || h.stokId
                    : h.stokTipi === "urun"
                    ? urunler.find(x => x.id === h.stokId)?.ad || h.stokId
                    : h.stokId}
                </div>
                {h.note && <div style={{ fontSize: 9, color: C.muted }}>{h.note}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: pozitif ? C.mint : C.coral }}>
                  {pozitif ? "+" : ""}{fmt(h.miktar)} {h.birim}
                </div>
                <div style={{ fontSize: 9, color: C.muted }}>
                  {h.oncekiBakiye != null ? `${fmt(h.oncekiBakiye)} → ${fmt(h.sonrakiBakiye)}` : ""}{" "}
                  {h.birim}
                </div>
                <div style={{ fontSize: 9, color: C.muted }}>
                  {h.createdAt ? new Date(h.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

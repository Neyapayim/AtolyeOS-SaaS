import { useState } from 'react';
import { C, F, FB, fmt } from '../config/constants.js';
import { PageHeader, Btn, Badge, AramaInput } from '../components/index.js';
import { bomKalemMaliyet } from '../engine/index.js';

export default function UrunlerPage({ data, setModal, setTab, onNewUrun, onEditUrun, onOtomatikKod, onDetayUrun }) {
  const { urunler = [], hamMaddeler = [], yarimamulList = [], hizmetler = [] } = data || {};
  const [filtre, setFiltre] = useState("");

  const filtrelenmis = urunler.filter(u => {
    if (!filtre) return true;
    const q = filtre.toLowerCase();
    return (u.ad || "").toLowerCase().includes(q) || (u.kod || "").toLowerCase().includes(q);
  });

  /* BOM maliyet hesaplama */
  const urunMaliyet = (urun) => {
    if (!urun?.bom?.length) return 0;
    return (urun.bom || []).reduce((s, b) => {
      const k = [...hamMaddeler, ...yarimamulList, ...hizmetler].find(x => x.id === b.kalemId);
      if (!k) return s;
      return s + bomKalemMaliyet(k, b.miktar, b.birim, hamMaddeler, yarimamulList, hizmetler, 0, b.fireTahmini || 0);
    }, 0);
  };

  /* ── Kart tiklama → Maliyet sayfasina git (MUTLAK) ── */
  const kartTiklandi = (urun) => {
    if (typeof onDetayUrun === "function") {
      onDetayUrun(urun);
    }
  };

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      {/* Header */}
      <PageHeader title="Urun Listesi" sub="Maliyet ve uretim receteleri"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => onOtomatikKod?.()}
              style={{ background: "rgba(139,92,246,.12)", border: "1px solid rgba(139,92,246,.3)", color: "#a78bfa" }}>
              Kodlari Otomatik Olustur
            </Btn>
            <Btn variant="primary" onClick={() => onNewUrun?.()}>+ Yeni Urun</Btn>
          </div>
        } />

      {/* Arama */}
      <div style={{ marginBottom: 18 }}>
        <AramaInput value={filtre} onChange={setFiltre} placeholder="Urun ara (ad veya kod)..." />
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {filtrelenmis.length === 0 ? (
          <div style={{
            gridColumn: "1/-1", textAlign: "center", padding: 60, color: C.muted, fontSize: 14,
            background: C.s2, borderRadius: 14, border: `1px solid ${C.border}`,
          }}>
            {urunler.length === 0 ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>📦</div>
                <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>Henuz urun eklenmemis</div>
                <div style={{ color: C.muted, marginBottom: 16, fontSize: 13 }}>Ilk urununu ekleyerek baslayabilirsin.</div>
                <Btn variant="primary" onClick={() => onNewUrun?.()}>+ Yeni Urun Ekle</Btn>
              </div>
            ) : "Aramayla eslesen urun bulunamadi"}
          </div>
        ) : (
          filtrelenmis.map((u, i) => {
            const bomSayi = (u.bom || []).length;
            const malBom = urunMaliyet(u);
            const satisKdvDahil = u.satisKdvDahil || 0;
            const satisKdvOrani = u.satisKdv ?? 10;
            const netSatis = satisKdvDahil / (1 + satisKdvOrani / 100);
            const kar = netSatis - malBom;
            const marj = netSatis > 0 ? (kar / netSatis) * 100 : 0;

            return (
              <div key={u.id} className="card" style={{
                background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
                cursor: "pointer", transition: "all .22s",
                animation: `fade-up .3s ${i * 0.06}s ease both`,
              }}
                onClick={() => kartTiklandi(u)}>

                {/* Ust dekoratif cizgi */}
                <div style={{ height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.cyan}00)` }} />

                <div style={{ padding: "16px 16px 14px" }}>
                  {/* Baslik satiri + sag ustte edit ikonu */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>
                        {u.kod}{u.kategori ? ` · ${u.kategori}` : ""}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F }}>{u.ad}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {/* Minik edit ikonu — SADECE bu modal acar */}
                      <button
                        onClick={e => { e.stopPropagation(); onEditUrun?.(u); }}
                        title="Urunu Duzenle / BOM"
                        style={{
                          background: "rgba(255,255,255,.05)", border: `1px solid ${C.border}`,
                          borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center",
                          justifyContent: "center", cursor: "pointer", fontSize: 12, color: C.muted,
                          transition: "all .15s", flexShrink: 0,
                        }}>
                        ✏️
                      </button>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.cyan, fontFamily: F }}>
                          {satisKdvDahil > 0 ? `${fmt(satisKdvDahil)} TL` : "-"}
                        </div>
                        <div style={{ fontSize: 10, color: u.aktif !== false ? C.mint : C.muted }}>
                          {u.aktif !== false ? "● Aktif" : "● Pasif"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOM ozet etiketleri */}
                  {bomSayi > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      {(u.bom || []).slice(0, 3).map(b => {
                        const k = [...hamMaddeler, ...yarimamulList, ...hizmetler].find(x => x.id === b.kalemId);
                        const tc = b.tip === "hammadde" ? C.sky : b.tip === "yarimamul" ? C.cyan : C.lav;
                        return k ? (
                          <span key={b.id} style={{
                            background: `${tc}0D`, border: `1px solid ${tc}1A`,
                            borderRadius: 5, padding: "2px 6px", fontSize: 9, color: tc,
                          }}>
                            {k.ad.slice(0, 12)}
                          </span>
                        ) : null;
                      })}
                      {bomSayi > 3 && <span style={{ fontSize: 9, color: C.muted }}>+{bomSayi - 3}</span>}
                    </div>
                  )}

                  {/* Maliyet / Kar / Stok satiri */}
                  {malBom > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.coral }}>Maliyet: {fmt(malBom)} TL</span>
                      {satisKdvDahil > 0 && (
                        <>
                          <span style={{ fontSize: 11, color: C.sub }}>Net: {fmt(netSatis)} TL</span>
                          <span style={{ fontSize: 11, color: kar > 0 ? C.mint : C.coral }}>
                            Kar: {fmt(kar)} TL
                          </span>
                          <span style={{ fontSize: 11, color: marj > 15 ? C.mint : marj > 0 ? C.gold : C.coral, fontWeight: 600 }}>
                            %{marj.toFixed(1)}
                          </span>
                        </>
                      )}
                      <span style={{ fontSize: 11, color: C.muted }}>Stok: {u.stok || 0} adet</span>
                    </div>
                  )}

                  {/* BOM yoksa sadece stok goster */}
                  {malBom === 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>BOM: {bomSayi} kalem</span>
                      <span style={{ fontSize: 11, color: C.muted }}>Stok: {u.stok || 0} adet</span>
                    </div>
                  )}

                  {/* Alt kisim: Maliyet detay yonlendirmesi */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: 8, borderTop: `1px solid ${C.border}`, marginTop: 4,
                  }}>
                    <span style={{ fontSize: 10, color: C.muted }}>
                      {bomSayi > 0 ? `${bomSayi} kalem BOM` : "BOM tanimlanmamis"}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: C.cyan,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      Detay & Maliyet
                      <span style={{ fontSize: 13 }}>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

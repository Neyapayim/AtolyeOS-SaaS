import { useState } from 'react';
import { C, F, FB, fmt } from '../config/constants.js';
import { PageHeader, AramaInput, SilButonu, Badge, Btn } from '../components/index.js';

const TIP_META = {
  bayi:     { label: "Bayi / Distribütör", renk: C.gold, ikon: "🏢", grupBaslik: "Bayi & Distribütörler" },
  direkt:   { label: "Direkt Müşteri",     renk: C.cyan, ikon: "🏪", grupBaslik: "Direkt Müşteriler" },
  kurumsal: { label: "Kurumsal / İhale",   renk: C.mint, ikon: "🏛", grupBaslik: "Kurumsal & İhale" },
};

export default function MusterilerPage({ data, setModal, onNewMusteri, onOpenMusteri, onNewSiparis }) {
  const { musteriler = [], siparisler = [] } = data || {};
  const [ara, setAra] = useState("");

  const q = ara.trim().toLowerCase();
  const filtered = q
    ? musteriler.filter(m =>
        (m.ad || "").toLowerCase().includes(q) ||
        (m.yetkili || "").toLowerCase().includes(q) ||
        (m.tel || "").toLowerCase().includes(q)
      )
    : musteriler;

  const bayiler   = filtered.filter(m => m.tip === "bayi");
  const direktler = filtered.filter(m => m.tip === "direkt");
  const kurumsal  = filtered.filter(m => m.tip === "kurumsal");

  const MusteriKart = ({ m, idx }) => {
    const meta = TIP_META[m.tip] || TIP_META.direkt;
    const siparisSayisi = siparisler.filter(s => s.musteriId === m.id).length;
    const altMusteriSayisi = (m.altMusteriler || []).length;

    return (
      <div style={{
        background: "rgba(255,255,255,0.025)", border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${meta.renk}`, borderRadius: 16, padding: "16px 20px",
        animation: `fade-up .3s ${idx * .04}s ease both`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14 }}>{meta.ikon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F }}>{m.ad}</span>
            </div>
            {m.yetkili && <div style={{ fontSize: 10, color: C.muted }}>{m.yetkili}</div>}
          </div>
          <Badge label={meta.label} color={meta.renk} small />
        </div>

        {/* Contact */}
        <div style={{ display: "flex", gap: 10, fontSize: 10, color: C.muted, flexWrap: "wrap", marginBottom: 8 }}>
          {m.tel && <span>📞 {m.tel}</span>}
          {m.email && <span>✉ {m.email}</span>}
        </div>

        {/* Alt musteriler */}
        {altMusteriSayisi > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {(m.altMusteriler || []).slice(0, 4).map((alt, j) => (
              <span key={j} style={{
                fontSize: 9, background: `${C.lav}12`, border: `1px solid ${C.lav}20`,
                borderRadius: 4, padding: "1px 6px", color: C.lav,
              }}>{alt.ad}</span>
            ))}
            {altMusteriSayisi > 4 && <span style={{ fontSize: 9, color: C.muted }}>+{altMusteriSayisi - 4}</span>}
          </div>
        )}

        {/* Footer: stats + actions */}
        <div style={{
          paddingTop: 8, borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.muted }}>
            <span>{siparisSayisi > 0 ? `📋 ${siparisSayisi} sipariş` : "Sipariş yok"}</span>
            {altMusteriSayisi > 0 && <span>👥 {altMusteriSayisi} alt müşteri</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={(e) => { e.stopPropagation(); onNewSiparis?.(m); }} style={{
              fontSize: 10, background: `${C.mint}12`, border: `1px solid ${C.mint}25`,
              borderRadius: 6, padding: "4px 10px", color: C.mint, cursor: "pointer",
              fontFamily: FB, fontWeight: 600, transition: "all .15s",
            }}>+ Sipariş</button>
            <button onClick={(e) => { e.stopPropagation(); onOpenMusteri?.(m); }} style={{
              fontSize: 10, background: `${C.sky}12`, border: `1px solid ${C.sky}25`,
              borderRadius: 6, padding: "4px 10px", color: C.sky, cursor: "pointer",
              fontFamily: FB, fontWeight: 600, transition: "all .15s",
            }}>Düzenle</button>
          </div>
        </div>
      </div>
    );
  };

  const GrupRender = ({ baslik, ikon, renk, liste }) => {
    if (liste.length === 0) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: renk,
          letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
        }}>
          {ikon} {baslik} — {liste.length}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
          {liste.map((m, i) => <MusteriKart key={m.id} m={m} idx={i} />)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader
        title="Müşteriler"
        sub={`${musteriler.length} müşteri · ${siparisler.length} toplam sipariş`}
        action={<Btn variant="primary" onClick={onNewMusteri}>+ Müşteri Ekle</Btn>}
      />

      {/* Search */}
      {musteriler.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <AramaInput
            value={ara}
            onChange={setAra}
            placeholder="Müşteri adı, yetkili veya telefon ara..."
            style={{ width: "100%", maxWidth: 420 }}
          />
        </div>
      )}

      {/* Empty state */}
      {musteriler.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.sub, fontFamily: F, marginBottom: 8 }}>
            Henüz müşteri eklenmedi
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Sipariş oluşturmak için önce müşteri eklemeniz gerekiyor.
          </div>
          <Btn variant="primary" onClick={onNewMusteri}>+ İlk Müşteriyi Ekle</Btn>
        </div>
      )}

      {/* No search results */}
      {musteriler.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.sub, fontFamily: F }}>
            "{ara}" ile eşleşen müşteri bulunamadı
          </div>
        </div>
      )}

      {/* Grouped sections */}
      <GrupRender baslik="Bayi & Distribütörler" ikon="🏢" renk={C.gold} liste={bayiler} />
      <GrupRender baslik="Direkt Müşteriler" ikon="🏪" renk={C.cyan} liste={direktler} />
      <GrupRender baslik="Kurumsal & İhale" ikon="🏛" renk={C.mint} liste={kurumsal} />
    </div>
  );
}

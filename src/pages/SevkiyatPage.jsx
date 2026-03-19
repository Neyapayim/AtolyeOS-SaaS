import { C, F, FB, fmt } from '../config/constants.js';
import { PageHeader, AramaInput, SilButonu, Badge, Btn } from '../components/index.js';

const DURUM_META = {
  hazirlaniyor: { label: "Hazırlanıyor", renk: C.gold,  ikon: "📦" },
  bekliyor:     { label: "Bekliyor",     renk: C.coral, ikon: "⏳" },
  yolda:        { label: "Yolda",        renk: C.sky,   ikon: "🚚" },
  teslim:       { label: "Teslim Edildi",renk: C.mint,  ikon: "✅" },
};

export default function SevkiyatPage({ data, setters, setModal, onNewSevkiyat, onOpenSevkiyat }) {
  const { sevkiyatlar = [], musteriler = [], siparisler = [] } = data || {};
  const { setSevkiyatlar } = setters || {};

  const hazir  = sevkiyatlar.filter(s => s.durum === "hazirlaniyor" || s.durum === "bekliyor");
  const yolda  = sevkiyatlar.filter(s => s.durum === "yolda");
  const teslim = sevkiyatlar.filter(s => s.durum === "teslim");

  const durumDegistir = (sev, newDurum) => {
    setSevkiyatlar?.(p => p.map(s => s.id === sev.id ? { ...s, durum: newDurum } : s));
  };

  const SevkKart = ({ s }) => {
    const musteri = musteriler.find(m => m.id === s.musteriId);
    const meta = DURUM_META[s.durum] || { label: s.durum, renk: C.muted, ikon: "📦" };
    const kalemSayisi = (s.kalemler || []).length;

    return (
      <div
        onClick={() => onOpenSevkiyat?.(s)}
        style={{
          background: "rgba(255,255,255,0.025)", border: `1px solid ${meta.renk}25`,
          borderLeft: `3px solid ${meta.renk}`, borderRadius: 12, padding: "12px 16px",
          cursor: "pointer", transition: "all .15s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
              {musteri?.ad || s.musteriAd || "Müşteri"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
              {s.nakliyeci && <span>🚚 {s.nakliyeci}</span>}
              {s.planlananTarih && <span>📅 {s.planlananTarih}</span>}
              {kalemSayisi > 0 && <span>📦 {kalemSayisi} kalem</span>}
              {s.sipNo && <span>📋 {s.sipNo}</span>}
            </div>
            {s.adres && (
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>📍 {s.adres}</div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <Badge label={meta.label} color={meta.renk} small />
            {/* Status change buttons */}
            {(s.durum === "hazirlaniyor" || s.durum === "bekliyor") && (
              <button onClick={(e) => { e.stopPropagation(); durumDegistir(s, "yolda"); }} style={{
                fontSize: 10, background: `${C.sky}12`, border: `1px solid ${C.sky}25`,
                borderRadius: 6, padding: "3px 10px", color: C.sky, cursor: "pointer",
                fontFamily: FB, fontWeight: 600,
              }}>🚚 Yola Çıkar</button>
            )}
            {s.durum === "yolda" && (
              <button onClick={(e) => { e.stopPropagation(); durumDegistir(s, "teslim"); }} style={{
                fontSize: 10, background: `${C.mint}12`, border: `1px solid ${C.mint}25`,
                borderRadius: 6, padding: "3px 10px", color: C.mint, cursor: "pointer",
                fontFamily: FB, fontWeight: 600,
              }}>✅ Teslim Edildi</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SutunRender = ({ baslik, ikon, renk, liste }) => (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: renk,
        letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>{ikon}</span>
        {baslik} — {liste.length}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {liste.length === 0 && (
          <div style={{
            background: "rgba(255,255,255,0.015)", border: `1px dashed ${C.border}`,
            borderRadius: 12, padding: "24px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: C.muted }}>Bu durumda sevkiyat yok</div>
          </div>
        )}
        {liste.map(s => <SevkKart key={s.id} s={s} />)}
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader
        title="Sevkiyat"
        sub={`${hazir.length} hazırlanıyor · ${yolda.length} yolda · ${teslim.length} teslim`}
        action={<Btn variant="primary" onClick={onNewSevkiyat}>+ Sevkiyat Planla</Btn>}
      />

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { l: "Hazırlanıyor", v: hazir.length, c: C.gold, ikon: "📦" },
          { l: "Yolda",        v: yolda.length, c: C.sky,  ikon: "🚚" },
          { l: "Teslim Edildi",v: teslim.length,c: C.mint, ikon: "✅" },
        ].map(k => (
          <div key={k.l} style={{
            background: `${k.c}0C`, border: `1px solid ${k.c}20`,
            borderRadius: 9, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>{k.ikon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, fontFamily: F, lineHeight: 1 }}>{k.v}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{k.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sevkiyatlar.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚚</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.sub, fontFamily: F, marginBottom: 8 }}>
            Henüz sevkiyat planlanmadı
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Hazır ürünler için sevkiyat planı oluşturun
          </div>
          <Btn variant="primary" onClick={onNewSevkiyat}>+ Sevkiyat Planla</Btn>
        </div>
      )}

      {/* Status columns */}
      {sevkiyatlar.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <SutunRender baslik="Hazırlanan" ikon="📦" renk={C.gold} liste={hazir} />
          <SutunRender baslik="Yolda" ikon="🚚" renk={C.sky} liste={yolda} />
          <SutunRender baslik="Teslim Edildi" ikon="✅" renk={C.mint} liste={teslim} />
        </div>
      )}
    </div>
  );
}

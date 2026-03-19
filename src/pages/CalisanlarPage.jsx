import { C, F, FB } from '../config/constants.js';
import { PageHeader, Btn, Badge } from '../components/index.js';

export default function CalisanlarPage({ data, onNewCalisan, onEditCalisan }) {
  const { calisanlar = [] } = data || {};

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader title="Çalışanlar" sub={`${calisanlar.length} çalışan`}
        action={<Btn variant="primary" onClick={onNewCalisan}>+ Çalışan Ekle</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
        {calisanlar.map((c, i) => (
          <div key={c.id} className="card" style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
            borderRadius: 16, overflow: "hidden", transition: "all .22s",
            animation: `fade-up .3s ${i * .06}s ease both`,
          }}>
            <div style={{ height: 2, background: `linear-gradient(90deg,${C.cyan},${C.cyan}00)` }} />
            <div style={{ padding: "16px 16px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.cyan}20,${C.lav}20)`,
                  border: `2px solid ${C.cyan}30`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 15, fontWeight: 800, color: C.cyan, fontFamily: F,
                }}>
                  {c.ad.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F }}>{c.ad}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{c.rol}</div>
                </div>
                <Badge label={c.durum === "aktif" ? "Aktif" : "Pasif"} color={c.durum === "aktif" ? C.mint : C.muted} small />
              </div>
              {c.istasyon && <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>⚙\️ {c.istasyon}</div>}
              {c.tel && <div style={{ fontSize: 11, color: C.sub, marginBottom: 10 }}>📱 {c.tel}</div>}
              <button onClick={() => onEditCalisan?.(c)} style={{
                width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "7px", fontSize: 11, color: C.sub, cursor: "pointer",
              }}>Düzenle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

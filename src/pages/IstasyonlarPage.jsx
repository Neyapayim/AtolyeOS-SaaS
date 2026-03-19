import { C, F, FB } from '../config/constants.js';
import { PageHeader, Btn, Badge } from '../components/index.js';

export default function IstasyonlarPage({ data, onNewIstasyon, onEditIstasyon }) {
  const { istasyonlar = [] } = data || {};

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader title="İstasyonlar" sub={`${istasyonlar.length} istasyon`}
        action={<Btn variant="primary" onClick={onNewIstasyon}>+ İstasyon Ekle</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
        {istasyonlar.map((is, i) => {
          const col = is.tip === "fason" ? C.lav : is.durum === "aktif" ? C.mint : C.muted;
          return (
            <div key={is.id} className="card" style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${col === C.mint ? C.border : col + "28"}`,
              borderRadius: 16, overflow: "hidden", transition: "all .22s",
              animation: `fade-up .3s ${i * .05}s ease both`,
            }}>
              <div style={{ height: 2, background: `linear-gradient(90deg,${col},${col}00)` }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 2 }}>{is.ad}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{is.calisan}</div>
                  </div>
                  <Badge label={is.tip === "fason" ? "Fason" : is.durum === "aktif" ? "Aktif" : "Boşta"} color={col} small />
                </div>
                {is.kapasite && <div style={{ fontSize: 11, color: C.sub, marginBottom: 8 }}>\⏱ {is.kapasite}</div>}
                {is.notlar && <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>📝 {is.notlar}</div>}
                <button onClick={() => onEditIstasyon?.(is)} style={{
                  width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "6px", fontSize: 11, color: C.sub, cursor: "pointer",
                }}>Düzenle</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

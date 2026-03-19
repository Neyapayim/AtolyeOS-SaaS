import { C, F, FB, fmt } from '../config/constants.js';
import { PageHeader, Btn, Badge } from '../components/index.js';

export default function FasonFirmalarPage({ data, onNewFason, onEditFason }) {
  const { fasonFirmalar = [] } = data || {};

  return (
    <div style={{ animation: "fade-up .35s ease" }}>
      <PageHeader title="Fason Firmalar" sub={`${fasonFirmalar.length} firma`}
        action={<Btn variant="primary" onClick={onNewFason}>+ Firma Ekle</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
        {fasonFirmalar.map((f, i) => (
          <div key={f.id} className="card" style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.lav}22`,
            borderRadius: 16, overflow: "hidden", transition: "all .22s",
            animation: `fade-up .3s ${i * .07}s ease both`,
          }}>
            <div style={{ height: 2, background: `linear-gradient(90deg,${C.lav},${C.lav}00)` }} />
            <div style={{ padding: "16px 16px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 2 }}>{f.ad}</div>
                  <div style={{ fontSize: 12, color: C.lav }}>{f.tip}</div>
                </div>
                <Badge label="Fason" color={C.lav} small />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 10 }}>
                {[
                  ["Süre", `${f.sureGun} gün`],
                  ["Birim Fiyat", `${f.birimFiyat} \₺`],
                  ["KDV", `%${f.kdv}`],
                  ["Toplam", `${fmt(f.birimFiyat * (1 + f.kdv / 100))} \₺`],
                ].map(([l, v], j) => (
                  <div key={j} style={{
                    background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "7px 10px",
                  }}>
                    <div style={{ fontSize: 9, color: C.muted, marginBottom: 1 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>
              {f.notlar && <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>📝 {f.notlar}</div>}
              <button onClick={() => onEditFason?.(f)} style={{
                width: "100%", background: `${C.lav}10`, border: `1px solid ${C.lav}22`,
                borderRadius: 8, padding: "7px", fontSize: 11, fontWeight: 600, color: C.lav, cursor: "pointer",
              }}>Düzenle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

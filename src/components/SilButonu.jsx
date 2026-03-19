import { useState } from 'react';
import { C } from '../config/constants.js';

export function SilButonu({ onDelete, label = "Sil", isim = "" }) {
  const [adim, setAdim] = useState(0); // 0=normal, 1=emin misin, 2=son onay

  if (adim === 0) return (
    <button onClick={() => setAdim(1)} style={{
      background: "transparent", border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "7px 13px", fontSize: 12, color: C.muted,
      cursor: "pointer", transition: "all .15s"
    }}>
      🗑 {label}
    </button>
  );

  if (adim === 1) return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", animation: "fade-in .15s ease" }}>
      <span style={{ fontSize: 11, color: C.coral, fontWeight: 600 }}>
        {isim ? `"${isim}" silinsin mi?` : "Emin misiniz?"}
      </span>
      <button onClick={() => setAdim(2)} style={{
        background: `${C.coral}18`, border: `1px solid ${C.coral}40`,
        borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
        color: C.coral, cursor: "pointer"
      }}>Evet</button>
      <button onClick={() => setAdim(0)} style={{
        background: "rgba(255,255,255,.05)", border: `1px solid ${C.border}`,
        borderRadius: 7, padding: "5px 10px", fontSize: 11, color: C.muted, cursor: "pointer"
      }}>İptal</button>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", animation: "fade-in .15s ease" }}>
      <span style={{ fontSize: 11, color: C.coral, fontWeight: 700 }}>\⚠ Bu işlem geri alınamaz!</span>
      <button onClick={() => { onDelete(); setAdim(0); }} style={{
        background: `linear-gradient(135deg,${C.coral},#B91C1C)`,
        border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700,
        color: "#fff", cursor: "pointer"
      }}>Kalıcı Sil</button>
      <button onClick={() => setAdim(0)} style={{
        background: "rgba(255,255,255,.05)", border: `1px solid ${C.border}`,
        borderRadius: 7, padding: "5px 10px", fontSize: 11, color: C.muted, cursor: "pointer"
      }}>Vazgeç</button>
    </div>
  );
}

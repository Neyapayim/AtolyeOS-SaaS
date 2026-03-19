import { useState } from 'react';
import { C, F, FB } from '../config/constants.js';
import { PageHeader, Btn } from '../components/index.js';

export default function AyarlarPage({ genelAyar, setGenelAyar }) {
  const ayar = genelAyar || { firmaAd: "", vergNo: "", tel: "", adres: "", notlar: "" };
  const [toast, setToast] = useState(null);

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: .4, display: "block", marginBottom: 5 }}>{label}</span>
      {children}
    </div>
  );

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
    borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FB,
    transition: "all .15s", boxSizing: "border-box",
  };

  return (
    <div style={{ animation: "fade-up .35s ease", maxWidth: 560 }}>
      <PageHeader title="Genel Ayarlar" />
      <div style={{
        background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 22,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 16 }}>Firma Bilgileri</div>
        <Field label="Firma / Atölye Adı">
          <input value={ayar.firmaAd || ""} onChange={e => setGenelAyar?.(p => ({ ...p, firmaAd: e.target.value }))}
            className="inp" style={inputStyle} />
        </Field>
        <Field label="Vergi Numarası">
          <input value={ayar.vergNo || ""} onChange={e => setGenelAyar?.(p => ({ ...p, vergNo: e.target.value }))}
            placeholder="123 456 789 0" className="inp" style={inputStyle} />
        </Field>
        <Field label="Telefon">
          <input value={ayar.tel || ""} onChange={e => setGenelAyar?.(p => ({ ...p, tel: e.target.value }))}
            placeholder="0212 xxx xx xx" className="inp" style={inputStyle} />
        </Field>
        <Field label="Adres">
          <textarea value={ayar.adres || ""} onChange={e => setGenelAyar?.(p => ({ ...p, adres: e.target.value }))}
            placeholder="Atölye adresi..." rows={3}
            style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <Field label="Notlar">
          <textarea value={ayar.notlar || ""} onChange={e => setGenelAyar?.(p => ({ ...p, notlar: e.target.value }))}
            placeholder="Ek notlar..." rows={2}
            style={{ ...inputStyle, resize: "vertical" }} />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={() => { setToast("Ayarlar kaydedildi ✓"); setTimeout(() => setToast(null), 2500); }}
            style={{
              padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer",
              background: C.cyan, color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: F,
            }}>Kaydet</button>
        </div>
      </div>
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 9999,
          background: C.mint, color: "#fff", padding: "12px 24px", borderRadius: 10,
          fontWeight: 600, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,.4)",
          animation: "fade-up .3s ease",
        }}>{toast}</div>
      )}
    </div>
  );
}

import { C } from '../config/constants.js';

export function Field({ label, children, style = {}, hint }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: .4 }}>{label}</span>
        {hint && <span style={{ fontSize: 9, color: C.cyan, opacity: .7 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function TextInp({ value, onChange, placeholder = "", style = {} }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="inp" style={{
      width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
      borderRadius: 9, padding: "9px 12px", fontSize: 13, color: C.text, transition: "all .15s", ...style
    }} />;
}

export function NumInp({ value, onChange, suffix, width = 80, step = 1, min = 0, max, placeholder, style = {} }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", ...style }}>
      <input type="number" step={step} min={min} max={max} value={value ?? ""} className="inp"
        placeholder={placeholder}
        onChange={e => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
        style={{
          width, background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`,
          borderRadius: 9, padding: `8px ${suffix ? 22 : 10}px 8px 10px`, fontSize: 13, color: C.text,
          textAlign: "right", transition: "all .15s"
        }} />
      {suffix && <span style={{ position: "absolute", right: 8, fontSize: 11, color: C.muted, pointerEvents: "none" }}>{suffix}</span>}
    </div>
  );
}

export function Select({ value, onChange, options, style = {} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", background: C.s3 || "#161C2A", border: `1px solid ${C.border}`, borderRadius: 9,
        padding: "9px 12px", fontSize: 13, color: C.text, cursor: "pointer", transition: "all .15s", ...style
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

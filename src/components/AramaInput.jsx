import { C, FB } from '../config/constants.js';

export function AramaInput({ value, onChange, placeholder = "Ara...", style = {} }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", ...style }}>
      <span style={{
        position: "absolute", left: 10, fontSize: 13, color: C.muted, pointerEvents: "none"
      }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="inp"
        style={{
          width: "100%", minWidth: 200,
          background: "rgba(255,255,255,.04)",
          border: `1px solid ${C.border}`,
          borderRadius: 9, padding: "9px 12px 9px 32px",
          fontSize: 13, color: C.text, fontFamily: FB,
          transition: "all .15s",
        }}
      />
    </div>
  );
}

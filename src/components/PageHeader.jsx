import { C, F } from '../config/constants.js';

export function PageHeader({ title, sub, action }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      marginBottom: 24, flexWrap: "wrap", gap: 12
    }}>
      <div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, fontFamily: F, letterSpacing: -.5, margin: "0 0 3px",
          backgroundImage: `linear-gradient(135deg, ${C.text} 50%, ${C.cyan})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>{title}</h1>
        {sub && <p style={{ color: C.muted, fontSize: 13 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

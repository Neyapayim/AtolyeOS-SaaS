import { C, FB } from '../config/constants.js';

export function Btn({ children, onClick, variant = "ghost", color, style = {}, className = "" }) {
  if (variant === "primary") return (
    <button onClick={onClick} className={`btn-p ${className}`} style={{
      background: color
        ? `linear-gradient(135deg,${color},${color}cc)`
        : `linear-gradient(135deg,#F59E0B,#D97706)`,
      border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13,
      color: color ? "#fff" : "#0C0800",
      cursor: "pointer", fontFamily: FB,
      boxShadow: `0 4px 16px ${color || "rgba(245,158,11,0.3)"}`,
      transition: "all .2s", ...style
    }}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} className={`btn-g ${className}`} style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(8px)",
      border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 10,
      padding: "9px 16px", fontWeight: 500, fontSize: 13, color: C.sub, cursor: "pointer", fontFamily: FB,
      transition: "all .2s", ...style
    }}>
      {children}
    </button>
  );
}

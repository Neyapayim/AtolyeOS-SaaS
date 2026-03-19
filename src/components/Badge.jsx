export function Badge({ label, color, small }) {
  return (
    <span style={{
      background: `${color}14`, color, border: `1px solid ${color}28`,
      borderRadius: 100, padding: small ? "1px 8px" : "3px 11px",
      fontSize: small ? 9 : 11, fontWeight: 700,
      whiteSpace: "nowrap", letterSpacing: .2
    }}>{label}</span>
  );
}

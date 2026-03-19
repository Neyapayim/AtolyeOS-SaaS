import { C, F } from '../config/constants.js';

export function Modal({ title, onClose, children, width = 520, footer, maxHeight }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{
          maxWidth: width, maxHeight: maxHeight || "90vh",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
        {/* Başlık */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 0 16px 0", flexShrink: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 16
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: F, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`,
            borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: C.muted, fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>\×</button>
        </div>
        {/* İçerik */}
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0, paddingRight: 4 }}>
          {children}
        </div>
        {/* Footer */}
        {footer && <div style={{
          display: "flex", gap: 8, justifyContent: "flex-end",
          marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, flexShrink: 0
        }}>{footer}</div>}
      </div>
    </div>
  );
}

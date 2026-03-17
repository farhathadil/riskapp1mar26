import React from "react";

export function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          width: "min(760px, 96vw)",
          padding: "24px",
          boxSizing: "border-box",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "var(--color-text-secondary)",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

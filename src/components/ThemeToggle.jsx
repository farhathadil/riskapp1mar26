import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: "0.5px solid var(--color-border-secondary)",
        background: "transparent",
        color: "var(--color-text-primary)",
        cursor: "pointer",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span style={{ fontSize: 14 }}>{isDark ? "☀️" : "🌙"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

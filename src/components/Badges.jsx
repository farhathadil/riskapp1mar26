import React from "react";

import { residualRating } from "../utils/risk.js";

export function RatingBadge({ value }) {
  const { label, color, bg } = residualRating(value);

  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 4,
      }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    "Not Started": { bg: "#F3F4F6", color: "#374151" },
    "In Progress": { bg: "#DBEAFE", color: "#1E40AF" },
    Completed: { bg: "#D1FAE5", color: "#065F46" },
    "On Hold": { bg: "#FEF3C7", color: "#92400E" },
    Cancelled: { bg: "#FEE2E2", color: "#991B1B" },
  };
  const appearance = map[status] || map["Not Started"];

  return (
    <span
      style={{
        background: appearance.bg,
        color: appearance.color,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 4,
      }}
    >
      {status}
    </span>
  );
}

import React from "react";

import { residualRating } from "../utils/risk.js";

function formatResidualRisk(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

export function ResidualRiskChart({ risks }) {
  const chartRisks = [...risks]
    .map((risk) => ({ ...risk, residualRiskValue: parseFloat(risk.residualRisk) || 0 }))
    .sort((left, right) => right.residualRiskValue - left.residualRiskValue);

  const maxValue = Math.max(25, ...chartRisks.map((risk) => risk.residualRiskValue));

  return (
    <div>
      <div style={{ position: "relative", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ maxHeight: 220, overflowY: "auto", padding: "8px 10px" }}>
          {chartRisks.map((risk) => {
            const width = Math.max((risk.residualRiskValue / maxValue) * 100, 2);
            const rating = residualRating(risk.residualRisk);

            return (
              <div
                key={risk.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px minmax(140px, 1fr) 54px",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: "#1E40AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {risk.id}
                </div>
                <div
                  title={risk.risk}
                  style={{
                    position: "relative",
                    height: 18,
                    background: "var(--color-background-secondary)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${width}%`,
                      height: "100%",
                      background: rating.bg,
                      borderRadius: 999,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 8px",
                      fontSize: 10,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {risk.risk}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 10, fontWeight: 700 }}>{formatResidualRisk(risk.residualRiskValue)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

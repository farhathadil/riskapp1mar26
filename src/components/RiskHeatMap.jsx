import React from "react";
import { residualRating } from "../utils/risk.js";
import { RESIDUAL_RISK_STYLES } from "../utils/risk.js";

export function RiskHeatMap({ risks }) {
  const likelihoodOrder = { Rare: 1, Unlikely: 2, Possible: 3, Likely: 4, "Almost Certain": 5 };
  const impactOrder = { "Very Low": 1, Low: 2, Medium: 3, High: 4, "Very High": 5 };

  const likelihoodLabels = ["Almost Certain", "Likely", "Possible", "Unlikely", "Rare"];
  const impactLabels = ["Very Low", "Low", "Medium", "High", "Very High"];

  const heatMapData = {};

  risks.forEach(risk => {
    const likelihood = risk.likelihood;
    const impact = risk.impactLabel;
    const key = `${likelihood}-${impact}`;

    if (!heatMapData[key]) {
      heatMapData[key] = {
        count: 0,
        risks: [],
        residualRisk: 0
      };
    }

    heatMapData[key].count += 1;
    heatMapData[key].risks.push(risk);
    heatMapData[key].residualRisk += parseFloat(risk.residualRisk) || 0;
  });

  Object.keys(heatMapData).forEach(key => {
    const data = heatMapData[key];
    data.avgResidualRisk = (data.residualRisk / data.count).toFixed(2);
  });

  const getBackgroundColor = (count, maxCount) => {
    const intensity = count / maxCount;
    if (intensity <= 0.2) return "#FEF2F2";
    if (intensity <= 0.4) return "#FEE2E2";
    if (intensity <= 0.6) return "#FED7AA";
    if (intensity <= 0.8) return "#FCD34D";
    return "#78716C";
  };

  const getRatingStyle = (residualRisk) => {
    const rating = residualRating(residualRisk);
    return {
      bg: RESIDUAL_RISK_STYLES[rating.label].bg,
      color: RESIDUAL_RISK_STYLES[rating.label].color
    };
  };

  const getCellData = (likelihood, impact) => {
    const key = `${likelihood}-${impact}`;
    return heatMapData[key] || { count: 0, avgResidualRisk: 0, risks: [] };
  };

  const maxCount = Math.max(
    ...Object.values(heatMapData).map(d => d.count),
    1
  );

  return (
    <div style={{ position: "relative", padding: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginLeft: 80, marginBottom: 8 }}>
        {impactLabels.map(impact => (
          <div key={impact} style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", flex: 1, fontWeight: 500 }}>
            {impact}
          </div>
        ))}
      </div>

      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 280,
            marginRight: 10,
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", paddingBottom: 28, fontWeight: 500 }}>ALMOST CERTAIN</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", paddingBottom: 28, fontWeight: 500 }}>LIKELY</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", paddingBottom: 28, fontWeight: 500 }}>POSSIBLE</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", paddingBottom: 28, fontWeight: 500 }}>UNLIKELY</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", paddingBottom: 28, fontWeight: 500 }}>RARE</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: 2, flex: 1 }}>
          {likelihoodLabels.map(likelihood =>
            impactLabels.map(impact => {
              const cellData = getCellData(likelihood, impact);
              const style = getRatingStyle(cellData.avgResidualRisk);
              const bg = cellData.count > 0 ? getBackgroundColor(cellData.count, maxCount) : "var(--color-background-secondary)";
              
              const getTextColor = (bg) => {
                if (bg === "#78716C") return "#ffffff";
                if (bg === "#FCD34D") return "#000000";
                if (bg === "#FED7AA") return "#000000";
                if (bg === "#FEE2E2") return "#000000";
                return "#000000";
              };

              const textColor = getTextColor(bg);

              return (
                <div
                  key={`${likelihood}-${impact}`}
                  style={{
                    background: bg,
                    borderRadius: 6,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 54,
                    cursor: cellData.count > 0 ? "pointer" : "default",
                    border: cellData.count > 0 ? `1px solid ${style.bg}` : "0.5px solid var(--color-border-tertiary)",
                    transition: "transform 0.15s ease",
                  }}
                  title={cellData.count > 0 ? `${cellData.count} risk(s) • Avg residual: ${cellData.avgResidualRisk}` : ""}
                  onMouseEnter={(e) => {
                    if (cellData.count > 0) {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {cellData.count > 0 ? (
                    <>
                      <span style={{ fontSize: 18, fontWeight: 600, color: textColor }}>{cellData.count}</span>
                      <span style={{ fontSize: 11, color: textColor, marginTop: 2 }}>{cellData.avgResidualRisk}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 24, color: "var(--color-border-tertiary)", opacity: 0.3 }}>-</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 12, gap: 20, fontSize: 11, color: "var(--color-text-secondary)" }}>
        <span>Y-Axis: Likelihood</span>
        <span>X-Axis: Impact</span>
        <span>Cell value: Risk count</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
          {["#FEF2F2", "#FEE2E2", "#FED7AA", "#FCD34D", "#78716C"].map((bg, i) => (
            <span key={bg} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  background: bg,
                  borderRadius: 3,
                  border: "1px solid var(--color-border-tertiary)",
                }}
              />
              <span style={{ color: "var(--color-text-secondary)" }}>
                {i === 0 ? "Low" : i === 4 ? "High" : ""}
              </span>
            </span>
          ))}
        </div>
        <span style={{ color: "var(--color-text-secondary)" }}>- Risk Density</span>
      </div>
    </div>
  );
}

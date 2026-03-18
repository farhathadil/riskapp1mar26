import React from "react";

import { RESIDUAL_RISK_STYLES } from "../utils/risk.js";

export function RiskMatrix({ risks }) {
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];
  const likelihoodLabel = { 5: "5 - Almost Certain", 4: "4 - Likely", 3: "3 - Possible", 2: "2 - Unlikely", 1: "1 - Rare" };
  const impactLabel = { 1: "1 - Very Low", 2: "2 - Low", 3: "3 - Medium", 4: "4 - High", 5: "5 - Very High" };
  const countMap = {};

  risks.forEach((risk) => {
    const likelihoodValue = parseInt(risk.likelihoodValue, 10) || 0;
    const impactValue = parseInt(risk.impactValue, 10) || 0;

    if (likelihoodValue && impactValue) {
      countMap[`${likelihoodValue}-${impactValue}`] =
        (countMap[`${likelihoodValue}-${impactValue}`] || 0) + 1;
    }
  });

  function cellColor(likelihoodValue, impactValue) {
    const score = likelihoodValue * impactValue;

    // Keep the matrix bands aligned with residual risk classification.
    if (score >= 20) return RESIDUAL_RISK_STYLES["Very High"].bg;
    if (score >= 11) return RESIDUAL_RISK_STYLES.High.bg;
    if (score >= 7) return RESIDUAL_RISK_STYLES.Moderate.bg;
    if (score >= 4) return RESIDUAL_RISK_STYLES.Low.bg;

    return RESIDUAL_RISK_STYLES["Very Low"].bg;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{
                padding: "4px 8px",
                textAlign: "left",
                color: "var(--color-text-secondary)",
                fontWeight: 400,
              }}
            >
              Likelihood \ Impact
            </th>
            {impacts.map((impactValue) => (
              <th
                key={impactValue}
                style={{
                  padding: "4px 8px",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  fontWeight: 400,
                  minWidth: 70,
                }}
              >
                {impactLabel[impactValue]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {likelihoods.map((likelihoodValue) => (
            <tr key={likelihoodValue}>
              <td
                style={{
                  padding: "4px 8px",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {likelihoodLabel[likelihoodValue]}
              </td>
              {impacts.map((impactValue) => {
                const count = countMap[`${likelihoodValue}-${impactValue}`] || 0;

                return (
                  <td
                    key={impactValue}
                    style={{
                      background: cellColor(likelihoodValue, impactValue),
                      textAlign: "center",
                      padding: "8px 4px",
                      fontWeight: 500,
                      fontSize: 13,
                      border: "2px solid white",
                    }}
                  >
                    {count > 0 ? count : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

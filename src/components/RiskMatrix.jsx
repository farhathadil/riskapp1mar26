import React from "react";

export function RiskMatrix({ risks }) {
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];
  const likelihoodLabel = { 5: "Almost Certain", 4: "Likely", 3: "Possible", 2: "Unlikely", 1: "Rare" };
  const impactLabel = { 1: "Very Low", 2: "Low", 3: "Medium", 4: "High", 5: "Very High" };
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

    if (score >= 20) return "#FCA5A5";
    if (score >= 15) return "#FCD34D";
    if (score >= 10) return "#FDE68A";
    if (score >= 5) return "#BBF7D0";

    return "#D1FAE5";
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

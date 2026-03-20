import React, { useMemo } from "react";
import { residualRating, isOverdue, RESIDUAL_RISK_STYLES } from "../utils/risk.js";
import { STATUSES } from "../data/riskConfig.js";

export function ExecutiveSummary({ risks }) {
  const topRisks = useMemo(() => {
    return [...risks]
      .sort((a, b) => parseFloat(b.residualRisk) - parseFloat(a.residualRisk))
      .slice(0, 5);
  }, [risks]);

  const overdue = useMemo(() => risks.filter(risk => isOverdue(risk)), [risks]);

  const treatmentProgress = useMemo(() => {
    const byStatus = {};
    STATUSES.forEach(status => {
      byStatus[status] = risks.filter(r => r.status === status).length;
    });
    return byStatus;
  }, [risks]);

  const riskVelocity = useMemo(() => {
    const inProgress = risks.filter(r => r.status === "In Progress").length;
    const completed = risks.filter(r => r.status === "Completed").length;
    const notStarted = risks.filter(r => r.status === "Not Started").length;
    return { inProgress, completed, notStarted };
  }, [risks]);

  const highRiskCount = useMemo(() => {
    return risks.filter(r => {
      const rating = residualRating(r.residualRisk).label;
      return rating === "Very High" || rating === "High";
    }).length;
  }, [risks]);

  const controlEffectiveness = useMemo(() => {
    const controlledRisks = risks.filter(r => r.treatmentOption === "Control");
    if (controlledRisks.length === 0) return { avgProgress: 0, effectiveCount: 0 };

    const totalProgress = controlledRisks.reduce((sum, r) => sum + (parseInt(r.progress, 10) || 0), 0);
    const effectiveCount = controlledRisks.filter(r => parseInt(r.progress, 10) >= 80).length;

    return {
      avgProgress: Math.round(totalProgress / controlledRisks.length),
      effectiveCount
    };
  }, [risks]);

  const KPIRow = ({ label, value, color, trend, size = "normal" }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 6,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {trend !== undefined && (
          <span
            style={{
              fontSize: 11,
              color: trend > 0 ? "#991B1B" : trend < 0 ? "#065F46" : "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
        <span
          style={{
            fontSize: size === "large" ? 20 : 16,
            fontWeight: 600,
            color: color || "var(--color-text-primary)",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: { md: "1fr 1fr 1fr" }, gap: 16 }}>
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Risk Overview</div>
          <KPIRow label="Total Risks" value={risks.length} color="#1E40AF" size="large" />
          <KPIRow
            label="High/Very High"
            value={highRiskCount}
            color={RESIDUAL_RISK_STYLES.High.bg}
          />
          <KPIRow
            label="Overdue Actions"
            value={overdue.length}
            color="#7B1D1D"
          />
        </div>

        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Risk Velocity</div>
          <KPIRow
            label="Not Started"
            value={riskVelocity.notStarted}
            color="#64748B"
          />
          <KPIRow
            label="In Progress"
            value={riskVelocity.inProgress}
            color="#3B82F6"
          />
          <KPIRow
            label="Completed"
            value={riskVelocity.completed}
            color="#10B981"
          />
        </div>

        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Treatment Effectiveness</div>
          <KPIRow
            label="Avg Progress"
            value={`${controlEffectiveness.avgProgress}%`}
            color="#1E40AF"
          />
          <KPIRow
            label="Effective Controls"
            value={controlEffectiveness.effectiveCount}
            color="#10B981"
          />
          <KPIRow
            label="Under Treatment"
            value={risks.filter(r => r.treatmentOption === "Control").length}
            color="#F59E0B"
          />
        </div>
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Top 5 High-Risk Items</div>
        {topRisks.length === 0 ? (
          <div style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>No risks registered.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topRisks.map((risk, index) => (
              <div
                key={risk.id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 12px",
                  background: index === 0 ? "#FEF2F2" : "var(--color-background-secondary)",
                  border: index === 0 ? "1px solid #FCA5A5" : "none",
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, color: "#94A3B8", minWidth: 24 }}>#{index + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#1E40AF" }}>{risk.id}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 500,
                        background: RESIDUAL_RISK_STYLES[residualRating(risk.residualRisk).label].bg,
                        color: RESIDUAL_RISK_STYLES[residualRating(risk.residualRisk).label].text,
                      }}
                    >
                      {parseFloat(risk.residualRisk).toFixed(2)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{risk.process}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {risk.risk}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Treatment Status Distribution</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {STATUSES.map(status => {
            const count = treatmentProgress[status] || 0;
            const pct = risks.length ? Math.round((count / risks.length) * 100) : 0;

            return (
              <div key={status} style={{ flex: 1, minWidth: 140 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{status}</span>
                  <span style={{ fontWeight: 500 }}>{count}</span>
                </div>
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background:
                        status === "Completed"
                          ? "#10B981"
                          : status === "In Progress"
                          ? "#3B82F6"
                          : status === "On Hold"
                          ? "#F59E0B"
                          : status === "Cancelled"
                          ? "#64748B"
                          : "#94A3B8",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

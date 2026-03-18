import React, { useEffect, useMemo, useRef, useState } from "react";

import { RatingBadge, StatusBadge } from "./components/Badges.jsx";
import { Modal } from "./components/Modal.jsx";
import { ResidualRiskChart } from "./components/ResidualRiskChart.jsx";
import { RiskForm } from "./components/RiskForm.jsx";
import { PROCESSES, STATUSES, createEmptyRisk } from "./data/riskConfig.js";
import { parseCSV, toCSV } from "./utils/csv.js";
import { RESIDUAL_RISK_STYLES, filterRisks, isOverdue, normalizeRiskRecord, residualRating } from "./utils/risk.js";
import { loadPersistedRisks, persistRisks } from "./utils/storage.js";

export default function App() {
  const [risks, setRisks] = useState(() => loadPersistedRisks());
  const [tab, setTab] = useState("dashboard");
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [filterProcess, setFilterProcess] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRisk, setEditRisk] = useState(null);
  const [newRisk, setNewRisk] = useState(() => createEmptyRisk());
  const fileRef = useRef(null);

  useEffect(() => {
    persistRisks(risks);
  }, [risks]);

  const selectedRisk = selectedRiskId ? risks.find((risk) => risk.id === selectedRiskId) ?? null : null;

  const filteredRisks = useMemo(
    () => filterRisks(risks, { filterProcess, filterStatus, filterRating, search }),
    [risks, filterProcess, filterStatus, filterRating, search]
  );

  const processOptions = useMemo(() => {
    const values = new Set(PROCESSES);
    risks.forEach((risk) => {
      if (risk.process) values.add(risk.process);
    });
    return [...values];
  }, [risks]);

  const byRating = { "Very High": 0, High: 0, Moderate: 0, Low: 0, "Very Low": 0 };
  risks.forEach((risk) => {
    byRating[residualRating(risk.residualRisk).label] += 1;
  });

  const byStatus = {};
  STATUSES.forEach((status) => {
    byStatus[status] = risks.filter((risk) => risk.status === status).length;
  });

  const byProcess = {};
  processOptions.forEach((process) => {
    byProcess[process] = risks.filter((risk) => risk.process === process).length;
  });

  const treatmentRisks = risks.filter((risk) => risk.treatmentOption === "Control");
  const overdue = risks.filter((risk) => isOverdue(risk));

  function downloadCSV() {
    const blob = new Blob([toCSV(risks)], { type: "text/csv" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "risk_register.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function uploadCSV(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const parsed = parseCSV(String(loadEvent.target?.result || ""));
      if (parsed.length > 0) {
        setRisks(parsed);
        setSelectedRiskId(null);
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function saveRisk(risk) {
    const normalized = normalizeRiskRecord(risk);

    if (editRisk) {
      setRisks((current) => current.map((item) => (item.id === editRisk.id ? normalized : item)));
      setEditRisk(null);
      setSelectedRiskId(normalized.id);
    } else {
      const nextRisk = {
        ...normalized,
        id: normalized.id || `NEW-${Date.now()}`,
      };
      setRisks((current) => [...current, nextRisk]);
      setSelectedRiskId(nextRisk.id);
    }

    setShowAddModal(false);
  }

  function deleteRisk(id) {
    setRisks((current) => current.filter((risk) => risk.id !== id));
    if (selectedRiskId === id) setSelectedRiskId(null);
  }

  function updateStatus(id, status) {
    setRisks((current) => current.map((risk) => (risk.id === id ? { ...risk, status } : risk)));
  }

  function updateProgress(id, progress) {
    setRisks((current) => current.map((risk) => (risk.id === id ? { ...risk, progress: String(progress) } : risk)));
  }

  const Tab = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "8px 18px",
        borderRadius: 6,
        border: "none",
        background: tab === id ? "var(--color-background-primary)" : "transparent",
        color: tab === id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        fontWeight: tab === id ? 500 : 400,
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", minHeight: "100vh", padding: "0 0 40px" }}>
      <div
        style={{
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Risk Register</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Support & Service Management - ISO 27001:2022</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={uploadCSV} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Upload CSV
          </button>
          <button
            onClick={downloadCSV}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Download CSV
          </button>
          <button
            onClick={() => {
              setEditRisk(null);
              setNewRisk(createEmptyRisk());
              setShowAddModal(true);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: "#1E40AF",
              color: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            + Add Risk
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "8px 16px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
          display: "flex",
          gap: 4,
        }}
      >
        <Tab id="dashboard" label="Dashboard" />
        <Tab id="register" label={`Risk Register (${risks.length})`} />
        <Tab id="treatment" label="Treatment Tracking" />
      </div>

      <div style={{ padding: "20px" }}>
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total Risks", val: risks.length, color: "#1E40AF" },
                { label: "Very High", val: byRating["Very High"], color: RESIDUAL_RISK_STYLES["Very High"].bg },
                { label: "High", val: byRating.High, color: RESIDUAL_RISK_STYLES.High.bg },
                { label: "Moderate", val: byRating.Moderate, color: RESIDUAL_RISK_STYLES.Moderate.bg },
                { label: "Low", val: byRating.Low, color: RESIDUAL_RISK_STYLES.Low.bg },
                { label: "Very Low", val: byRating["Very Low"], color: RESIDUAL_RISK_STYLES["Very Low"].bg },
                { label: "Overdue", val: overdue.length, color: "#7B1D1D" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "var(--color-background-secondary)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: card.color }}>{card.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Residual risk ranking</div>
                <ResidualRiskChart risks={risks} />
                <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                  {[
                    [RESIDUAL_RISK_STYLES["Very Low"].bg, "Very Low (<3)"],
                    [RESIDUAL_RISK_STYLES.Low.bg, "Low (4-6)"],
                    [RESIDUAL_RISK_STYLES.Moderate.bg, "Moderate (7-10)"],
                    [RESIDUAL_RISK_STYLES.High.bg, "High (11-19)"],
                    [RESIDUAL_RISK_STYLES["Very High"].bg, "Very High (>20)"],
                  ].map(
                    ([bg, label]) => (
                      <span
                        key={label}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-secondary)" }}
                      >
                        <span style={{ width: 10, height: 10, background: bg, display: "inline-block", borderRadius: 2 }} />
                        {label}
                      </span>
                    )
                  )}
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
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Risks by process area</div>
                {processOptions.map((process) => {
                  const count = byProcess[process] || 0;
                  const pct = risks.length ? Math.round((count / risks.length) * 100) : 0;

                  return (
                    <div key={process} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span
                          style={{
                            color: "var(--color-text-secondary)",
                            maxWidth: "70%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {process}
                        </span>
                        <span style={{ fontWeight: 500 }}>{count}</span>
                      </div>
                      <div style={{ background: "var(--color-background-secondary)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#3B82F6", borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Treatment status</div>
                {STATUSES.map((status) => (
                  <div
                    key={status}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <StatusBadge status={status} />
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{byStatus[status]}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Overdue treatment actions ({overdue.length})</div>
                {overdue.length === 0 ? (
                  <div style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>No overdue actions.</div>
                ) : (
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {overdue.map((risk) => (
                      <div key={risk.id} style={{ padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{risk.id}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                          {risk.risk.slice(0, 60)}
                          {risk.risk.length > 60 ? "..." : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 2 }}>Due: {risk.endDate}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "register" && (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <input
                placeholder="Search risks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "7px 10px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 6,
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                }}
              />
              <select
                value={filterProcess}
                onChange={(event) => setFilterProcess(event.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 6,
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="All">All processes</option>
                {processOptions.map((process) => (
                  <option key={process}>{process}</option>
                ))}
              </select>
              <select
                value={filterRating}
                onChange={(event) => setFilterRating(event.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 6,
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="All">All ratings</option>
                {["Very High", "High", "Moderate", "Low", "Very Low"].map((rating) => (
                  <option key={rating}>{rating}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 6,
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="All">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>
              Showing {filteredRisks.length} of {risks.length} risks
            </div>

            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-background-secondary)" }}>
                      {["Risk ID", "Process", "Risk", "Owner", "Likelihood", "Impact", "Inherent", "Residual", "Rating", "Treatment", "Status", "Actions"].map(
                        (heading) => (
                          <th
                            key={heading}
                            style={{
                              padding: "10px 12px",
                              textAlign: "left",
                              fontWeight: 500,
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              whiteSpace: "nowrap",
                              borderBottom: "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRisks.map((risk, index) => (
                      <tr
                        key={risk.id}
                        style={{
                          background: index % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedRiskId(risk.id)}
                      >
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontWeight: 500, color: "#1E40AF" }}>{risk.id}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--color-text-secondary)", maxWidth: 120 }}>{risk.process}</td>
                        <td style={{ padding: "10px 12px", maxWidth: 220 }}>
                          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{risk.risk}</span>
                        </td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: 12 }}>{risk.owner}</td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: 12 }}>{risk.likelihood}</td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: 12 }}>{risk.impactLabel}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 500 }}>{risk.inherentRisk}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 500 }}>{parseFloat(risk.residualRisk).toFixed(2)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <RatingBadge value={risk.residualRisk} />
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12 }}>{risk.treatmentOption}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <StatusBadge status={risk.status} />
                        </td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }} onClick={(event) => event.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditRisk(risk);
                              setNewRisk({ ...risk });
                              setShowAddModal(true);
                            }}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#1E40AF", fontSize: 12, marginRight: 6 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteRisk(risk.id)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", fontSize: 12 }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "treatment" && (
          <div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
              Tracking treatment implementation for {treatmentRisks.length} risks with "Control" option.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {risks
                .filter((risk) => risk.treatmentOption === "Control" || risk.treatmentOption === "Avoid" || risk.treatmentOption === "Transfer")
                .sort((left, right) => parseFloat(right.residualRisk) - parseFloat(left.residualRisk))
                .map((risk) => {
                  const progress = Math.min(100, Math.max(0, parseInt(risk.progress, 10) || 0));
                  const overdueRisk = isOverdue(risk);

                  return (
                    <div
                      key={risk.id}
                      style={{
                        background: "var(--color-background-primary)",
                        border: overdueRisk ? "1px solid #FCA5A5" : "0.5px solid var(--color-border-tertiary)",
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontWeight: 500, color: "#1E40AF", fontSize: 13 }}>{risk.id}</span>
                            <RatingBadge value={risk.residualRisk} />
                            <StatusBadge status={risk.status} />
                            {overdueRisk && (
                              <span
                                style={{
                                  background: "#FEE2E2",
                                  color: "#991B1B",
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontWeight: 500,
                                }}
                              >
                                Overdue
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, marginBottom: 4 }}>{risk.risk}</div>
                          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                            Owner: {risk.owner || "-"} | Responsible: {risk.responsible || "-"}
                          </div>
                        </div>
                      </div>
                      {risk.actionPlan && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-secondary)",
                            background: "var(--color-background-secondary)",
                            borderRadius: 6,
                            padding: "8px 10px",
                            marginBottom: 10,
                          }}
                        >
                          <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Action: </span>
                          {risk.actionPlan.slice(0, 200)}
                          {risk.actionPlan.length > 200 ? "..." : ""}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                            <span style={{ color: "var(--color-text-secondary)" }}>Progress</span>
                            <span style={{ fontWeight: 500 }}>{progress}%</span>
                          </div>
                          <div style={{ background: "var(--color-background-secondary)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${progress}%`,
                                height: "100%",
                                background: progress === 100 ? "#10B981" : progress > 50 ? "#3B82F6" : "#F59E0B",
                                borderRadius: 4,
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={progress}
                          onChange={(event) => updateProgress(risk.id, event.target.value)}
                          style={{ width: 100 }}
                          onClick={(event) => event.stopPropagation()}
                        />
                        <select
                          value={risk.status}
                          onChange={(event) => updateStatus(risk.id, event.target.value)}
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 6,
                            background: "var(--color-background-primary)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                        {risk.endDate && (
                          <span style={{ fontSize: 11, color: overdueRisk ? "#B91C1C" : "var(--color-text-secondary)" }}>Due: {risk.endDate}</span>
                        )}
                      </div>
                      {risk.isoReference && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8 }}>ISO: {risk.isoReference}</div>}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {selectedRisk && !showAddModal && (
        <Modal title={selectedRisk.id} onClose={() => setSelectedRiskId(null)}>
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <RatingBadge value={selectedRisk.residualRisk} />
              <StatusBadge status={selectedRisk.status} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", paddingTop: 2 }}>{selectedRisk.treatmentOption}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{selectedRisk.risk}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>{selectedRisk.impact}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 12 }}>
              {[
                ["Process", selectedRisk.process],
                ["Owner", selectedRisk.owner],
                ["Source", selectedRisk.source],
                ["Likelihood", selectedRisk.likelihood],
                ["Impact", selectedRisk.impactLabel],
                ["Inherent Risk", selectedRisk.inherentRisk],
                ["Control Rating", selectedRisk.controlRating],
                ["Residual Risk", parseFloat(selectedRisk.residualRisk).toFixed(2)],
                ["CIA Impact", [selectedRisk.cia_c && "C", selectedRisk.cia_i && "I", selectedRisk.cia_a && "A"].filter(Boolean).join(", ") || "-"],
                ["ISO Reference", selectedRisk.isoReference],
                ["Start Date", selectedRisk.startDate || "-"],
                ["End Date", selectedRisk.endDate || "-"],
              ].map(([key, value]) => (
                <div key={key}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{key}: </span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            {selectedRisk.existingControl && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Existing controls</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    background: "var(--color-background-secondary)",
                    padding: "8px 10px",
                    borderRadius: 6,
                  }}
                >
                  {selectedRisk.existingControl}
                </div>
              </div>
            )}
            {selectedRisk.actionPlan && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Action plan</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    background: "var(--color-background-secondary)",
                    padding: "8px 10px",
                    borderRadius: 6,
                  }}
                >
                  {selectedRisk.actionPlan}
                </div>
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Responsible: {selectedRisk.responsible || "-"}</div>
          </div>
        </Modal>
      )}

      {showAddModal && (
        <Modal
          title={editRisk ? `Edit: ${editRisk.id}` : "Add new risk"}
          onClose={() => {
            setShowAddModal(false);
            setEditRisk(null);
          }}
        >
          <RiskForm
            risk={editRisk || newRisk}
            onSave={saveRisk}
            onCancel={() => {
              setShowAddModal(false);
              setEditRisk(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

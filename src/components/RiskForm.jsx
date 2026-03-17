import React, { useState } from "react";

import { PROCESSES, STATUSES, TREATMENT_OPTIONS } from "../data/riskConfig.js";

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "7px 10px",
  border: "0.5px solid var(--color-border-secondary)",
  borderRadius: 6,
  background: "var(--color-background-primary)",
  color: "var(--color-text-primary)",
  boxSizing: "border-box",
};

const selectStyle = { ...inputStyle };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function RiskForm({ risk, onSave, onCancel }) {
  const [form, setForm] = useState({ ...risk });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const likelihoodMap = { Rare: "1", Unlikely: "2", Possible: "3", Likely: "4", "Almost Certain": "5" };
  const impactMap = { "Very Low": "1", Low: "2", Medium: "3", High: "4", "Very High": "5" };
  const controlMap = { "No Control": "1", "Adhoc Control": "2", "Defined Control": "3", "Managed Control": "4", "Optimized Control": "5" };

  return (
    <div style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Risk ID">
          <input style={inputStyle} value={form.id} onChange={(event) => set("id", event.target.value)} />
        </Field>
        <Field label="Project Reference">
          <input style={inputStyle} value={form.projectRef} onChange={(event) => set("projectRef", event.target.value)} />
        </Field>
        <Field label="Source">
          <input style={inputStyle} value={form.source} onChange={(event) => set("source", event.target.value)} />
        </Field>
        <Field label="Process / Area">
          <select style={selectStyle} value={form.process} onChange={(event) => set("process", event.target.value)}>
            <option value="">Select...</option>
            {PROCESSES.map((process) => (
              <option key={process}>{process}</option>
            ))}
          </select>
        </Field>
        <Field label="Risk Owner">
          <input style={inputStyle} value={form.owner} onChange={(event) => set("owner", event.target.value)} />
        </Field>
        <Field label="Reported Date">
          <input type="date" style={inputStyle} value={form.reportedDate} onChange={(event) => set("reportedDate", event.target.value)} />
        </Field>
      </div>
      <Field label="Information Security Risk">
        <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.risk} onChange={(event) => set("risk", event.target.value)} />
      </Field>
      <Field label="Impact Description">
        <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.impact} onChange={(event) => set("impact", event.target.value)} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Likelihood">
          <select
            style={selectStyle}
            value={form.likelihood}
            onChange={(event) => {
              set("likelihood", event.target.value);
              set("likelihoodValue", likelihoodMap[event.target.value] || "3");
            }}
          >
            {["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"].map((likelihood) => (
              <option key={likelihood}>{likelihood}</option>
            ))}
          </select>
        </Field>
        <Field label="Impact">
          <select
            style={selectStyle}
            value={form.impactLabel}
            onChange={(event) => {
              set("impactLabel", event.target.value);
              set("impactValue", impactMap[event.target.value] || "3");
            }}
          >
            {["Very Low", "Low", "Medium", "High", "Very High"].map((impact) => (
              <option key={impact}>{impact}</option>
            ))}
          </select>
        </Field>
        <Field label="CIA Impact">
          <div style={{ display: "flex", gap: 8, paddingTop: 6 }}>
            {["C", "I", "A"].map((label) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form[`cia_${label.toLowerCase()}`] === "X"}
                  onChange={(event) => set(`cia_${label.toLowerCase()}`, event.target.checked ? "X" : "")}
                />
                {label}
              </label>
            ))}
          </div>
        </Field>
      </div>
      <Field label="Existing Control Description">
        <textarea
          style={{ ...inputStyle, minHeight: 60 }}
          value={form.existingControl}
          onChange={(event) => set("existingControl", event.target.value)}
        />
      </Field>
      <Field label="Control Rating">
        <select
          style={selectStyle}
          value={form.controlRating}
          onChange={(event) => {
            set("controlRating", event.target.value);
            set("controlRatingValue", controlMap[event.target.value] || "2");
          }}
        >
          {["No Control", "Adhoc Control", "Defined Control", "Managed Control", "Optimized Control"].map((control) => (
            <option key={control}>{control}</option>
          ))}
        </select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Treatment Option">
          <select style={selectStyle} value={form.treatmentOption} onChange={(event) => set("treatmentOption", event.target.value)}>
            {TREATMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ISO 27001:2022 Reference">
          <input style={inputStyle} value={form.isoReference} onChange={(event) => set("isoReference", event.target.value)} />
        </Field>
      </div>
      <Field label="Action Plan">
        <textarea style={{ ...inputStyle, minHeight: 80 }} value={form.actionPlan} onChange={(event) => set("actionPlan", event.target.value)} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Official Responsible">
          <input style={inputStyle} value={form.responsible} onChange={(event) => set("responsible", event.target.value)} />
        </Field>
        <Field label="Start Date">
          <input type="date" style={inputStyle} value={form.startDate} onChange={(event) => set("startDate", event.target.value)} />
        </Field>
        <Field label="Estimated End Date">
          <input type="date" style={inputStyle} value={form.endDate} onChange={(event) => set("endDate", event.target.value)} />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Current Status">
          <select style={selectStyle} value={form.status} onChange={(event) => set("status", event.target.value)}>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field label="Progress (%)">
          <input type="number" min="0" max="100" style={inputStyle} value={form.progress} onChange={(event) => set("progress", event.target.value)} />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <button
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "0.5px solid var(--color-border-secondary)",
            background: "transparent",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: "#1E40AF",
            color: "white",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Save Risk
        </button>
      </div>
    </div>
  );
}

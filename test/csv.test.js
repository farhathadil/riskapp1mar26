import test from "node:test";
import assert from "node:assert/strict";

import { parseCSV, toCSV } from "../src/utils/csv.js";
import { createEmptyRisk } from "../src/data/riskConfig.js";
import { calculateRiskScores } from "../src/utils/risk.js";

function buildRisk(overrides = {}) {
  return calculateRiskScores({
    ...createEmptyRisk(),
    id: "TEST-001",
    process: "Software Support",
    risk: "Quoted, multiline risk",
    impact: "Impact line 1\nImpact line 2",
    existingControl: "Control with comma, quote \"value\", and newline\nsecond line",
    actionPlan: "Plan line 1\nPlan line 2",
    owner: "Owner Name",
    ...overrides,
  });
}

test("CSV round-trip preserves multiline and quoted fields", () => {
  const original = [
    buildRisk(),
    buildRisk({
      id: "TEST-002",
      risk: "Another risk",
      treatmentOption: "Accept",
      owner: "Second Owner",
      reportedDate: "2026-03-17",
    }),
  ];

  const csv = toCSV(original);
  const parsed = parseCSV(csv);

  assert.equal(parsed.length, original.length);
  assert.deepEqual(parsed, original);
});

test("CSV parser supports CRLF input", () => {
  const risk = buildRisk();
  const csv = toCSV([risk]).replace(/\n/g, "\r\n");
  const parsed = parseCSV(csv);

  assert.equal(parsed[0].existingControl, risk.existingControl);
  assert.equal(parsed[0].actionPlan, risk.actionPlan);
});

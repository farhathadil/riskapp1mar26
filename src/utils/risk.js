import { IMPACT_ORDER, LIKELIHOOD_ORDER, RISK_FIELDS } from "../data/riskConfig.js";

export function residualRating(val) {
  const v = parseFloat(val);

  if (v >= 15) return { label: "Critical", color: "#7B1D1D", bg: "#FECACA" };
  if (v >= 10) return { label: "High", color: "#92400E", bg: "#FDE68A" };
  if (v >= 5) return { label: "Medium", color: "#1E3A5F", bg: "#BFDBFE" };

  return { label: "Low", color: "#064E3B", bg: "#A7F3D0" };
}

export function calculateRiskScores(risk) {
  const likelihoodValue = parseInt(risk.likelihoodValue, 10) || LIKELIHOOD_ORDER.Possible;
  const impactValue = parseInt(risk.impactValue, 10) || IMPACT_ORDER.Medium;
  const controlRatingValue = parseInt(risk.controlRatingValue, 10) || 2;
  const inherentRisk = likelihoodValue * impactValue;
  const residualRisk = (inherentRisk / controlRatingValue).toFixed(2);

  return {
    ...risk,
    inherentRisk: String(inherentRisk),
    residualRisk: String(residualRisk),
  };
}

export function normalizeRiskRecord(record) {
  const normalized = {};

  for (const field of RISK_FIELDS) {
    normalized[field] = record?.[field] == null ? "" : String(record[field]);
  }

  return calculateRiskScores({
    ...normalized,
    progress: normalized.progress || "0",
    status: normalized.status || "Not Started",
    treatmentOption: normalized.treatmentOption || "Control",
    likelihood: normalized.likelihood || "Possible",
    likelihoodValue: normalized.likelihoodValue || String(LIKELIHOOD_ORDER.Possible),
    impactLabel: normalized.impactLabel || "Medium",
    impactValue: normalized.impactValue || String(IMPACT_ORDER.Medium),
    controlRating: normalized.controlRating || "Adhoc Control",
    controlRatingValue: normalized.controlRatingValue || "2",
  });
}

export function filterRisks(risks, { filterProcess, filterStatus, filterRating, search }) {
  const term = search.trim().toLowerCase();

  return risks.filter((risk) => {
    if (filterProcess !== "All" && risk.process !== filterProcess) return false;
    if (filterStatus !== "All" && risk.status !== filterStatus) return false;
    if (filterRating !== "All" && residualRating(risk.residualRisk).label !== filterRating) return false;
    if (!term) return true;

    return [risk.risk, risk.id, risk.owner].some((value) => value.toLowerCase().includes(term));
  });
}

export function parseISODate(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function isOverdue(risk, now = new Date()) {
  if (!risk.endDate || risk.status === "Completed" || risk.status === "Cancelled") return false;

  const dueDate = parseISODate(risk.endDate);
  if (!dueDate) return false;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dueDate < today;
}

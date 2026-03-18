import { IMPACT_ORDER, LIKELIHOOD_ORDER, RISK_FIELDS } from "../data/riskConfig.js";

export const RESIDUAL_RISK_STYLES = {
  "Very Low": { color: "#000000", bg: "#A6CE63" },
  Low: { color: "#000000", bg: "#56B05B" },
  Moderate: { color: "#000000", bg: "#FFF95A" },
  High: { color: "#000000", bg: "#F7C64A" },
  "Very High": { color: "#000000", bg: "#F43120" },
};

export function residualRating(val) {
  const v = parseFloat(val);

  // The requested bands leave 3 and 20 unspecified; treat them as inclusive
  // boundary values so every computed residual score maps to a rating.
  if (v >= 20) return { label: "Very High", ...RESIDUAL_RISK_STYLES["Very High"] };
  if (v >= 11) return { label: "High", ...RESIDUAL_RISK_STYLES.High };
  if (v >= 7) return { label: "Moderate", ...RESIDUAL_RISK_STYLES.Moderate };
  if (v >= 4) return { label: "Low", ...RESIDUAL_RISK_STYLES.Low };

  return { label: "Very Low", ...RESIDUAL_RISK_STYLES["Very Low"] };
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

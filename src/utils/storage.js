import { INITIAL_RISKS } from "../data/initialRisks.js";
import { normalizeRiskRecord, residualRating } from "./risk.js";

export const RISK_STORAGE_KEY = "risk-register:risks";
export const RISK_HISTORY_KEY = "risk-register:history";

export function loadPersistedRisks() {
  if (typeof window === "undefined") {
    return INITIAL_RISKS.map(normalizeRiskRecord);
  }

  try {
    const raw = window.localStorage.getItem(RISK_STORAGE_KEY);

    if (!raw) {
      return INITIAL_RISKS.map(normalizeRiskRecord);
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_RISKS.map(normalizeRiskRecord);
    }

    return parsed.map(normalizeRiskRecord);
  } catch {
    return INITIAL_RISKS.map(normalizeRiskRecord);
  }
}

export function persistRisks(risks) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(RISK_STORAGE_KEY, JSON.stringify(risks));
  } catch {
    // Ignore persistence failures and keep the in-memory session usable.
  }
}

export function loadRiskHistory() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RISK_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistRiskHistory(history) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(RISK_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore persistence failures
  }
}

export function logRiskChange(risks, previousRisks = null) {
  if (typeof window === "undefined") return;

  const timestamp = new Date().toISOString();
  const history = loadRiskHistory();

  const snapshot = {
    timestamp,
    riskCount: risks.length,
    byRating: {},
    byStatus: {},
    byResidualRisk: {}
  };

  ["Very High", "High", "Moderate", "Low", "Very Low"].forEach(rating => {
    snapshot.byRating[rating] = risks.filter(r => residualRating(r.residualRisk).label === rating).length;
  });

  STATUSES.forEach(status => {
    snapshot.byStatus[status] = risks.filter(r => r.status === status).length;
  });

  const residualValues = risks.map(r => parseFloat(r.residualRisk));
  snapshot.byResidualRisk = {
    avg: residualValues.length ? (residualValues.reduce((a, b) => a + b, 0) / residualValues.length).toFixed(2) : 0,
    max: residualValues.length ? Math.max(...residualValues).toFixed(2) : 0,
    min: residualValues.length ? Math.min(...residualValues).toFixed(2) : 0
  };

  if (previousRisks) {
    snapshot.riskCountChange = risks.length - previousRisks.length;
    const prevResidual = previousRisks.map(r => parseFloat(r.residualRisk));
    snapshot.avgRiskChange = (snapshot.byResidualRisk.avg - (prevResidual.length ? (prevResidual.reduce((a, b) => a + b, 0) / prevResidual.length).toFixed(2) : 0)).toFixed(2);
  }

  history.push(snapshot);

  const maxHistoryLength = 100;
  if (history.length > maxHistoryLength) {
    history.shift();
  }

  persistRiskHistory(history);
}

import { STATUSES } from "../data/riskConfig.js";

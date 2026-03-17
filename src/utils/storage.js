import { INITIAL_RISKS } from "../data/initialRisks.js";
import { normalizeRiskRecord } from "./risk.js";

export const RISK_STORAGE_KEY = "risk-register:risks";

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

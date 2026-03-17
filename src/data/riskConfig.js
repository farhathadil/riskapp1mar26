export const LIKELIHOOD_ORDER = {
  Rare: 1,
  Unlikely: 2,
  Possible: 3,
  Likely: 4,
  "Almost Certain": 5,
};

export const IMPACT_ORDER = {
  "Very Low": 1,
  Low: 2,
  Medium: 3,
  High: 4,
  "Very High": 5,
};

export const STATUSES = ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"];

export const TREATMENT_OPTIONS = ["Control", "Accept", "Avoid", "Transfer", ""];

export const PROCESSES = [
  "End User Support/Office Equipment",
  "Software Support",
  "Help Desk",
  "IS Governance",
  "Surveillance unit",
];

export const RISK_FIELDS = [
  "id",
  "projectRef",
  "source",
  "process",
  "risk",
  "impact",
  "owner",
  "cia_c",
  "cia_i",
  "cia_a",
  "likelihood",
  "likelihoodValue",
  "impactLabel",
  "impactValue",
  "inherentRisk",
  "existingControl",
  "controlRating",
  "controlRatingValue",
  "reportedDate",
  "residualRisk",
  "treatmentOption",
  "actionPlan",
  "responsible",
  "isoReference",
  "startDate",
  "endDate",
  "status",
  "progress",
  "lastReviewed",
];

export function createEmptyRisk() {
  return {
    id: "",
    projectRef: "PR1108991A",
    source: "External - KPMG",
    process: "",
    risk: "",
    impact: "",
    owner: "",
    cia_c: "",
    cia_i: "",
    cia_a: "",
    likelihood: "Possible",
    likelihoodValue: "3",
    impactLabel: "Medium",
    impactValue: "3",
    inherentRisk: "9",
    existingControl: "",
    controlRating: "Adhoc Control",
    controlRatingValue: "2",
    reportedDate: "",
    residualRisk: "",
    treatmentOption: "Control",
    actionPlan: "",
    responsible: "",
    isoReference: "",
    startDate: "",
    endDate: "",
    status: "Not Started",
    progress: "0",
    lastReviewed: "",
  };
}

import { RISK_FIELDS } from "../data/riskConfig.js";
import { normalizeRiskRecord } from "./risk.js";

export function parseCSV(text) {
  if (!text || !text.trim()) return [];

  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < normalizedText.length; index += 1) {
    const char = normalizedText[index];
    const next = normalizedText[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);

  if (row.length > 1 || row[0] !== "") {
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const [headers, ...dataRows] = rows;

  return dataRows
    .filter((dataRow) => dataRow.some((value) => value !== ""))
    .map((dataRow) => {
      const record = {};

      headers.forEach((header, index) => {
        record[header.trim()] = dataRow[index] ?? "";
      });

      return normalizeRiskRecord(record);
    });
}

export function toCSV(risks) {
  const header = RISK_FIELDS.join(",");
  const rows = risks.map((risk) =>
    RISK_FIELDS.map((field) => escapeCSV(risk[field])).join(",")
  );

  return [header, ...rows].join("\n");
}

function escapeCSV(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

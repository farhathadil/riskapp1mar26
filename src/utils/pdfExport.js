import jsPDF from "jspdf";

export function generatePDFReport(risks, history, title = "Risk Register Report") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const addText = (text, x, y, fontSize = 10, fontWeight = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontWeight === "bold" ? "bold" : "normal");
    doc.text(text, x, y);
  };

  const addSectionHeader = (text) => {
    addText(text, margin, y, 14, "bold");
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  const addKVPair = (key, value, x, y) => {
    addText(`${key}:`, x, y, 10, "bold");
    addText(value, x + 30, y, 10, "normal");
    return y + 7;
  };

  const checkPageBreak = (requiredSpace = 20) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  addText(title, margin, y, 18, "bold");
  y += 6;
  addText(`Generated: ${new Date().toLocaleString()}`, margin, y, 9);
  addText(`ISO 27001:2022 Risk Register`, pageWidth - margin, y, 9, "normal");
  doc.text(`ISO 27001:2022 Risk Register`, { align: "right" });
  y += 15;

  addSectionHeader("Executive Summary");

  const byRating = { "Very High": 0, High: 0, Moderate: 0, Low: 0, "Very Low": 0 };
  risks.forEach(risk => {
    const rating = calculateRating(parseFloat(risk.residualRisk));
    byRating[rating]++;
  });

  y = addKVPair("Total Risks", risks.length.toString(), margin, y);
  y = addKVPair("Very High Risk", byRating["Very High"].toString(), margin, y);
  y = addKVPair("High Risk", byRating.High.toString(), margin, y);
  y = addKVPair("Moderate Risk", byRating.Moderate.toString(), margin, y);
  y = addKVPair("Low Risk", byRating.Low.toString(), margin, y);
  y = addKVPair("Very Low Risk", byRating["Very Low"].toString(), margin, y);

  const byStatus = {};
  ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"].forEach(status => {
    byStatus[status] = risks.filter(r => r.status === status).length;
  });

  y += 5;
  Object.keys(byStatus).forEach(status => {
    y = addKVPair(status, byStatus[status].toString(), margin, y);
  });

  checkPageBreak(50);
  addSectionHeader("Top 10 High-Risk Items");

  const topRisks = [...risks]
    .sort((a, b) => parseFloat(b.residualRisk) - parseFloat(a.residualRisk))
    .slice(0, 10);

  topRisks.forEach(risk => {
    checkPageBreak(25);

    addText(`${risk.id}:`, margin, y, 11, "bold");
    addText(`${risk.process || "N/A"}`, margin + 30, y, 10);
    addText(`Residual Risk: ${parseFloat(risk.residualRisk).toFixed(2)}`, pageWidth - margin, y, 10, "normal");
    y += 6;

    const riskDesc = risk.risk.substring(0, 90);
    addText(riskDesc + (risk.risk.length > 90 ? "..." : ""), margin, y, 9);
    y += 5;

    if (risk.treatmentOption) {
      addText(`Treatment: ${risk.treatmentOption} | Status: ${risk.status}`, margin, y, 9);
      y += 5;
    }

    if (risk.endDate) {
      addText(`Due: ${risk.endDate}`, margin, y, 8, "italic");
      y += 8;
    } else {
      y += 3;
    }
  });

  if (history && history.length > 0) {
    checkPageBreak(100);
    addSectionHeader("Historical Trend Summary");

    const recentHistory = history.slice(-6);
    recentHistory.forEach(snapshot => {
      checkPageBreak(30);

      const date = new Date(snapshot.timestamp).toLocaleDateString();
      addText(`${date}:`, margin, y, 11, "bold");
      addText(`Total: ${snapshot.riskCount}`, margin + 30, y, 10);
      addText(`Avg Risk: ${snapshot.byResidualRisk?.avg || "N/A"}`, pageWidth - margin, y, 10, "normal");
      y += 6;

      const ratingText = [
        snapshot.byRating?.["Very High"] || 0,
        snapshot.byRating?.High || 0,
        snapshot.byRating?.Moderate || 0,
        snapshot.byRating?.Low || 0,
        snapshot.byRating?.["Very Low"] || 0
      ].join(" / ");

      addText(`Ratings: ${ratingText} (VH / H / M / L / VL)`, margin, y, 9);
      y += 8;
    });
  }

  checkPageBreak(30);
  addSectionHeader("Full Risk Register");

  const tableHeaders = ["ID", "Process", "Risk", "Owner", "Residual", "Treatment", "Status"];
  const colWidths = [20, 30, 60, 25, 18, 25, 20];
  const startX = margin;
  const startY = y;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  tableHeaders.forEach((header, i) => {
    const x = startX + colWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
    doc.text(header, x, startY);
  });

  y += 7;
  doc.setDrawColor(180, 180, 180);
  doc.line(startX, y, startX + colWidths.reduce((sum, w) => sum + w, 0), y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  risks.forEach(risk => {
    checkPageBreak(10);

    const cells = [
      risk.id,
      risk.process,
      risk.risk.substring(0, 35) + (risk.risk.length > 35 ? "..." : ""),
      risk.owner,
      parseFloat(risk.residualRisk).toFixed(2),
      risk.treatmentOption,
      risk.status
    ];

    cells.forEach((cell, i) => {
      const x = startX + colWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
      doc.text(cell || "-", x, y, { maxWidth: colWidths[i] });
    });

    y += 6;
  });

  doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

function calculateRating(residualRisk) {
  if (residualRisk > 20) return "Very High";
  if (residualRisk >= 11) return "High";
  if (residualRisk >= 7) return "Moderate";
  if (residualRisk >= 4) return "Low";
  return "Very Low";
}

export function downloadAnalyticsReport(risks, history) {
  generatePDFReport(risks, history, "Risk Analytics Report");
}

export function downloadFullReport(risks, history) {
  generatePDFReport(risks, history, "Complete Risk Register");
}

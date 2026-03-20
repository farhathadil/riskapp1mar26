import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { loadRiskHistory } from "../utils/storage.js";
import { RESIDUAL_RISK_STYLES } from "../utils/risk.js";

export function RiskTrendChart() {
  const history = loadRiskHistory();

  const processData = (history) => {
    const grouped = {};

    history.forEach(snapshot => {
      const date = new Date(snapshot.timestamp);
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      if (!grouped[monthYear]) {
        grouped[monthYear] = { date: monthYear, "Very High": 0, High: 0, Moderate: 0, Low: 0, "Very Low": 0, total: 0 };
      }

      grouped[monthYear]["Very High"] += snapshot.byRating["Very High"] || 0;
      grouped[monthYear].High += snapshot.byRating.High || 0;
      grouped[monthYear].Moderate += snapshot.byRating.Moderate || 0;
      grouped[monthYear].Low += snapshot.byRating.Low || 0;
      grouped[monthYear]["Very Low"] += snapshot.byRating["Very Low"] || 0;
      grouped[monthYear].total += snapshot.riskCount;
    });

    return Object.values(grouped).sort((a, b) => {
      const [aMonth, aYear] = a.date.split(" ");
      const [bMonth, bYear] = b.date.split(" ");
      const dateA = new Date(`${aMonth} 01, 20${aYear}`);
      const dateB = new Date(`${bMonth} 01, 20${bYear}`);
      return dateA - dateB;
    }).slice(-6);
  };

  const data = processData(history);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)", fontSize: 13 }}>
        No historical data available yet. Data will be tracked as risks are modified.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Risk Rating Trend Over Time</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
            <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={11} />
            <YAxis stroke="var(--color-text-secondary)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--color-background-primary)",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Very High" fill={RESIDUAL_RISK_STYLES["Very High"].bg} name="Very High" />
            <Bar dataKey="High" fill={RESIDUAL_RISK_STYLES.High.bg} name="High" />
            <Bar dataKey="Moderate" fill={RESIDUAL_RISK_STYLES.Moderate.bg} name="Moderate" />
            <Bar dataKey="Low" fill={RESIDUAL_RISK_STYLES.Low.bg} name="Low" />
            <Bar dataKey="Very Low" fill={RESIDUAL_RISK_STYLES["Very Low"].bg} name="Very Low" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Total Risk Count Trend</div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
            <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={11} />
            <YAxis stroke="var(--color-text-secondary)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--color-background-primary)",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#1E40AF"
              strokeWidth={2}
              name="Total Risks"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

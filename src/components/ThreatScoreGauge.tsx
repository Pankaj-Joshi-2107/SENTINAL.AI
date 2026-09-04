import React from "react";
import { ThreatBreakdown, RiskLevel } from "../types";
import { ThreatBadge } from "./ThreatBadge";

interface ThreatScoreGaugeProps {
  score: number;
  threatLevel: RiskLevel;
  breakdown: ThreatBreakdown;
  size?: "sm" | "md" | "lg";
  title?: string;
  showBreakdown?: boolean;
}

export const ThreatScoreGauge: React.FC<ThreatScoreGaugeProps> = ({
  score,
  threatLevel,
  breakdown,
  title = "Threat Score",
  showBreakdown = true
}) => {
  const getScoreColor = (val: number) => {
    if (val > 80) return "var(--sev-critical)";
    if (val > 60) return "var(--sev-high)";
    if (val > 30) return "var(--sev-medium)";
    return "var(--sev-low)";
  };

  const barColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const factors = [
    { label: "NLP Risk", weight: "30%", val: breakdown.nlpRisk },
    { label: "Coordination Score", weight: "20%", val: breakdown.coordinationScore },
    { label: "Account Behavior", weight: "20%", val: breakdown.accountBehavior },
    { label: "Content Similarity", weight: "15%", val: breakdown.contentSimilarity },
    { label: "Historical Match", weight: "15%", val: breakdown.historicalSimilarity },
  ];

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 pb-3 mb-4"
        style={{ borderBottom: "1px solid var(--border-muted)" }}
      >
        <div>
          <h4
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h4>
          <span
            className="text-[11px] font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            30% NLP · 20% Coord · 20% Acct · 15% Sim · 15% Hist
          </span>
        </div>
        <ThreatBadge level={threatLevel} size="md" />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge circle */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56" cy="56" r="46"
              style={{ stroke: "var(--bg-elevated)" }}
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="56" cy="56" r="46"
              stroke={getScoreColor(score)}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - score / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold font-mono"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </span>
            <span
              className="text-[10px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              / 100
            </span>
          </div>
        </div>

        {/* Factor breakdown */}
        {showBreakdown && (
          <div className="w-full flex-1 space-y-2.5">
            {factors.map((f, i) => (
              <div key={i} className="text-[12px]">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {f.label}
                    <span
                      className="font-mono ml-1.5"
                      style={{ color: "var(--text-muted)", fontSize: "10px" }}
                    >
                      ({f.weight})
                    </span>
                  </span>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {f.val}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, f.val))}%`,
                      background: barColors[i]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="mt-4 pt-3 flex items-center justify-between text-[11px] font-mono"
        style={{ borderTop: "1px solid var(--border-muted)", color: "var(--text-muted)" }}
      >
        <span>Risk thresholds:</span>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--sev-low)" }}>0–30 Low</span>
          <span>·</span>
          <span style={{ color: "var(--sev-medium)" }}>31–60 Med</span>
          <span>·</span>
          <span style={{ color: "var(--sev-high)" }}>61–80 High</span>
          <span>·</span>
          <span style={{ color: "var(--sev-critical)" }}>81+ Crit</span>
        </div>
      </div>
    </div>
  );
};

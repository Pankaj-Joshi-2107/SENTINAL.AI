import React from "react";
import { RiskLevel } from "../types";

interface ThreatBadgeProps {
  level: RiskLevel | string;
  size?: "sm" | "md" | "lg";
  showScore?: number;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({ level, size = "md", showScore }) => {
  const normLevel = (level || "LOW").toUpperCase();

  let color = "var(--sev-low)";
  let bg = "var(--sev-low-bg)";
  let border = "var(--sev-low-bd)";

  if (normLevel === "CRITICAL") {
    color = "var(--sev-critical)";
    bg = "var(--sev-critical-bg)";
    border = "var(--sev-critical-bd)";
  } else if (normLevel === "HIGH") {
    color = "var(--sev-high)";
    bg = "var(--sev-high-bg)";
    border = "var(--sev-high-bd)";
  } else if (normLevel === "MEDIUM") {
    color = "var(--sev-medium)";
    bg = "var(--sev-medium-bg)";
    border = "var(--sev-medium-bd)";
  }

  const sizeClass =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5"
      : size === "lg"
      ? "text-xs px-3 py-1"
      : "text-[11px] px-2 py-0.5";

  return (
    <span
      id={`threat-badge-${normLevel.toLowerCase()}`}
      className={`inline-flex items-center gap-1 rounded whitespace-nowrap font-mono font-medium ${sizeClass}`}
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span>{normLevel}</span>
      {typeof showScore === "number" && (
        <span className="opacity-75">({showScore})</span>
      )}
    </span>
  );
};

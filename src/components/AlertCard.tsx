import React from "react";
import { ThreatAlert } from "../types";
import { ThreatBadge } from "./ThreatBadge";
import { ArrowRight } from "lucide-react";

interface AlertCardProps {
  alert: ThreatAlert;
  onInvestigate: (route: string, targetId?: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onInvestigate }) => {
  const getSevColor = () => {
    switch (alert.severity) {
      case "CRITICAL": return "var(--sev-critical)";
      case "HIGH": return "var(--sev-high)";
      case "MEDIUM": return "var(--sev-medium)";
      default: return "var(--sev-low)";
    }
  };

  const getSevBg = () => {
    switch (alert.severity) {
      case "CRITICAL": return "var(--sev-critical-bg)";
      case "HIGH": return "var(--sev-high-bg)";
      case "MEDIUM": return "var(--sev-medium-bg)";
      default: return "var(--sev-low-bg)";
    }
  };

  return (
    <div
      id={`alert-card-${alert.id}`}
      className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 group"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.04), 0 2px 8px -2px rgba(0, 0, 0, 0.4)",
        borderLeft: `3px solid ${getSevColor()}`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-active)";
        (e.currentTarget as HTMLElement).style.borderLeftColor = getSevColor();
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -4px rgba(0, 0, 0, 0.6)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.borderLeftColor = getSevColor();
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "inset 0 1px 0 0 rgba(255, 255, 255, 0.04), 0 2px 8px -2px rgba(0, 0, 0, 0.4)";
      }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <ThreatBadge level={alert.severity} size="sm" />
            <h4
              className="text-[13px] font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {alert.title}
            </h4>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {alert.timestamp}
            </span>
          </div>
          <p
            className="text-[12px] leading-relaxed max-w-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            {alert.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => onInvestigate(alert.targetRoute, alert.targetId)}
        className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium transition-all group-hover:translate-x-0.5"
        style={{ color: "var(--accent)" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent-hover)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
      >
        <span>Investigate</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};

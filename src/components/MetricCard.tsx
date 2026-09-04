import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isAdversarial?: boolean;
  };
  accentColor?: string;
  onClick?: () => void;
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor,
  onClick,
  id
}) => {
  const iconColor = accentColor
    ? accentColor.replace("text-[", "").replace("]", "")
    : "var(--accent)";

  return (
    <div
      id={id || `metric-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
      className="p-4 rounded-xl transition-all duration-200 group relative"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-active)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-[12px] font-medium leading-tight"
          style={{ color: "var(--text-secondary)" }}
        >
          {title}
        </span>
        <div
          className="p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: iconColor.startsWith("var") ? iconColor : iconColor.startsWith("#") ? iconColor : "var(--accent)" }}
          />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2.5">
        <div
          className="text-2xl font-bold font-mono tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </div>
        {trend && (
          <span
            className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: trend.isAdversarial
                ? "var(--sev-critical-bg)"
                : trend.isPositive
                ? "var(--sev-low-bg)"
                : "rgba(255, 255, 255, 0.05)",
              color: trend.isAdversarial
                ? "var(--sev-critical)"
                : trend.isPositive
                ? "var(--sev-low)"
                : "var(--text-muted)",
              border: `1px solid ${
                trend.isAdversarial
                  ? "var(--sev-critical-bd)"
                  : trend.isPositive
                  ? "var(--sev-low-bd)"
                  : "var(--border-muted)"
              }`
            }}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          className="mt-1.5 text-[11px] leading-relaxed line-clamp-1"
          style={{ color: "var(--text-muted)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

import React from "react";
import { Search, Sparkles, Activity } from "lucide-react";

interface TopBarProps {
  onOpenSimulation: () => void;
  threatDetected: boolean;
  simulationRunning: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  threatDetected,
  simulationRunning
}) => {
  return (
    <header
      className="px-6 py-2.5 flex items-center justify-between sticky top-0 z-30"
      style={{
        background: "rgba(26, 27, 32, 0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Left: Breadcrumbs & Telemetry Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Intelligence Center
          </span>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span className="font-medium flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <Activity className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            Live Stream
          </span>
        </div>
      </div>

      {/* Center: Command Center Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] transition-all cursor-pointer group"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-active)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          <Search className="w-3.5 h-3.5 transition-colors" style={{ color: "var(--text-muted)" }} />
          <span className="font-normal truncate" style={{ color: "var(--text-muted)" }}>
            Search threats, accounts, hashtags, or IOCs...
          </span>
          <kbd
            className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)"
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Live Telemetry & Threats Indicator */}
      <div className="flex items-center gap-3">
        {simulationRunning ? (
          <span
            className="text-[11px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5 font-medium animate-pulse"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            Simulating Threat...
          </span>
        ) : threatDetected ? (
          <span
            className="text-[11px] font-mono px-3 py-1 rounded-full flex items-center gap-2 font-medium"
            style={{
              background: "var(--sev-critical-bg)",
              color: "var(--sev-critical)",
              border: "1px solid var(--sev-critical-bd)"
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--sev-critical)" }} />
            Threat Detected
          </span>
        ) : null}

        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px]"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "var(--sev-low)" }}
          />
          <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Operational</span>
        </div>
      </div>
    </header>
  );
};

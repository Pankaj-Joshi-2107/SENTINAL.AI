import React from "react";
import { ActiveTab } from "../types";
import {
  LayoutDashboard,
  BarChart3,
  SearchCode,
  TrendingUp,
  Users,
  ShieldAlert,
  Network,
  ShieldCheck,
  AlertOctagon,
  Settings,
  SlidersHorizontal,
  Flame,
  Radio,
  LogOut
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeScenario: "all" | "normal" | "cyberbullying" | "coordinated";
  setActiveScenario: (scenario: "all" | "normal" | "cyberbullying" | "coordinated") => void;
  onOpenSimulation: () => void;
  onOpenCsvImport: () => void;
  threatCount: number;
  onNavigateHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeScenario,
  setActiveScenario,
  onOpenSimulation,
  onOpenCsvImport,
  threatCount,
  onNavigateHome,
}) => {
  const socialItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "social-analytics", label: "Social Analytics", icon: BarChart3 },
    { id: "post-analyzer", label: "Post Analyzer", icon: SearchCode },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "audience", label: "Audience", icon: Users },
  ];

  const threatItems = [
    { id: "campaigns", label: "Campaigns", icon: ShieldAlert },
    { id: "network", label: "Network", icon: Network },
    { id: "cyber-safety", label: "Cyber Safety", icon: ShieldCheck },
    { id: "threat-center", label: "Threat Center", icon: AlertOctagon, count: threatCount },
  ];

  return (
    <aside
      className="w-64 flex flex-col shrink-0 select-none h-screen sticky top-0 z-20"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Brand Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm border border-[var(--border)] flex items-center justify-center"
          style={{ background: "#111215" }}
        >
          <img
            src="/sentinel-shield.png"
            alt="Sentinel AI Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              SENTINEL
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                border: "1px solid var(--accent-border)",
              }}
            >
              AI
            </span>
          </div>
          <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
            Threat Intelligence
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Social Intelligence */}
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Social Intelligence
          </div>
          <nav className="space-y-1">
            {socialItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left group"
                  style={{
                    background: isActive ? "var(--accent-subtle)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    border: `1px solid ${isActive ? "var(--accent-border)" : "transparent"}`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Threat Intelligence */}
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Threat Intelligence
          </div>
          <nav className="space-y-1">
            {threatItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left group"
                  style={{
                    background: isActive ? "var(--accent-subtle)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    border: `1px solid ${isActive ? "var(--accent-border)" : "transparent"}`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === "number" && item.count > 0 && (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: "var(--sev-critical-bg)",
                        color: "var(--sev-critical)",
                        border: "1px solid var(--sev-critical-bd)"
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Data Scenario Selector */}
        <div style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "14px" }}>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-2 flex items-center justify-between"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Data Scenario</span>
            <Radio className="w-3 h-3" style={{ color: "var(--accent)" }} />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "all", label: "All Data" },
              { id: "normal", label: "Normal" },
              { id: "cyberbullying", label: "Bullying" },
              { id: "coordinated", label: "Swarm" }
            ].map((sc) => {
              const isActive = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id as any)}
                  className="text-[11px] py-1.5 px-2 rounded-md text-center font-medium transition-all"
                  style={{
                    background: isActive ? "var(--accent-subtle)" : "var(--bg-elevated)",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
                  }}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div
        className="p-3 space-y-1.5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* Run Threat Simulation — Signature Amber CTA */}
        <button
          id="sidebar-run-threat-simulation"
          onClick={onOpenSimulation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #e5a93c 0%, #d49b2e 100%)",
            color: "var(--accent-text-on)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.filter = "brightness(1.0)";
          }}
        >
          <Flame className="w-4 h-4" />
          <span>Run Threat Simulation</span>
        </button>

        <button
          onClick={onOpenCsvImport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          <span>Import CSV Dataset</span>
        </button>

        <button
          id="nav-item-settings"
          onClick={() => setActiveTab("settings")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors"
          style={{
            background: activeTab === "settings" ? "var(--bg-elevated)" : "transparent",
            color: activeTab === "settings" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onMouseEnter={e => {
            if (activeTab !== "settings") {
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
            }
          }}
          onMouseLeave={e => {
            if (activeTab !== "settings") {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }
          }}
        >
          <Settings className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          <span>Settings & Ethics</span>
        </button>

        {onNavigateHome && (
          <button
            id="nav-item-exit-landing"
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Public Portal</span>
          </button>
        )}

        {/* Live Status Bar */}
        <div
          className="px-2 pt-2 flex items-center gap-2 text-[11px] font-mono"
          style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-muted)" }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "var(--sev-low)" }}
          />
          <span className="truncate">Stream Active</span>
          <span className="ml-auto font-semibold text-[10px]" style={{ color: "var(--text-muted)" }}>v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};

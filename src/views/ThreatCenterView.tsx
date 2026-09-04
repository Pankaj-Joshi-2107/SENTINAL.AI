import React, { useState } from "react";
import { ThreatAlert, Campaign, Account, Post, ActiveTab } from "../types";
import { ThreatBadge } from "../components/ThreatBadge";
import { AlertCard } from "../components/AlertCard";
import { PostCard } from "../components/PostCard";
import {
  AlertOctagon,
  Filter,
  RefreshCw
} from "lucide-react";

interface ThreatCenterViewProps {
  alerts: ThreatAlert[];
  campaigns: Campaign[];
  accounts: Account[];
  posts: Post[];
  onSelectAccount: (username: string) => void;
  onSelectCampaign: (campaignId: string) => void;
  onAnalyzePost: (post: Post) => void;
  onNavigate: (tab: ActiveTab, targetId?: string) => void;
}

type SeverityFilter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const SEVERITY_FILTERS: SeverityFilter[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const ThreatCenterView: React.FC<ThreatCenterViewProps> = ({
  alerts,
  campaigns,
  accounts,
  posts,
  onSelectAccount,
  onSelectCampaign,
  onAnalyzePost,
  onNavigate
}) => {
  const [activeFilter, setActiveFilter] = useState<SeverityFilter>("ALL");

  // Defensive: guard against undefined props during initial renders
  const safeAlerts = alerts ?? [];
  const safeCampaigns = campaigns ?? [];
  const safePosts = posts ?? [];

  const filteredAlerts = activeFilter === "ALL"
    ? safeAlerts
    : safeAlerts.filter((a) => a.severity === activeFilter);

  const criticalCount = safeAlerts.filter((a) => a.severity === "CRITICAL").length;
  const highCount = safeAlerts.filter((a) => a.severity === "HIGH").length;
  const mediumCount = safeAlerts.filter((a) => a.severity === "MEDIUM").length;
  const lowCount = safeAlerts.filter((a) => a.severity === "LOW").length;

  const severityMeta: Record<string, { color: string; count: number }> = {
    ALL: { color: "var(--accent)", count: safeAlerts.length },
    CRITICAL: { color: "var(--sev-critical)", count: criticalCount },
    HIGH: { color: "var(--sev-high)", count: highCount },
    MEDIUM: { color: "var(--sev-medium)", count: mediumCount },
    LOW: { color: "var(--sev-low)", count: lowCount },
  };

  const flaggedPosts = safePosts.filter(
    (p) =>
      (p.toxicityScore || 0) > 50 ||
      (p.cyberbullyingRisk || 0) > 50 ||
      p.scenario === "coordinated" ||
      p.scenario === "cyberbullying"
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Threat Center
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Aggregated alert queue, active campaigns, flagged posts, and escalation workflow.
          </p>
        </div>
        {criticalCount > 0 && (
          <span
            className="text-[11px] font-mono px-2.5 py-1 rounded shrink-0 font-medium"
            style={{
              background: "var(--sev-critical-bg)",
              color: "var(--sev-critical)",
              border: "1px solid var(--sev-critical-bd)"
            }}
          >
            {criticalCount} critical
          </span>
        )}
      </div>

      {/* Severity filter tabs */}
      <div
        className="rounded-lg p-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Filter by severity
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SEVERITY_FILTERS.map((sev) => {
            const meta = severityMeta[sev];
            const isActive = activeFilter === sev;
            return (
              <button
                key={sev}
                id={`threat-filter-${sev.toLowerCase()}`}
                onClick={() => setActiveFilter(sev)}
                className="rounded-md px-3 py-2.5 text-center transition-all"
                style={{
                  background: isActive ? "var(--accent-subtle)" : "var(--bg-elevated)",
                  border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
                }}
              >
                <span
                  className="text-xl font-bold font-mono block"
                  style={{
                    color: isActive ? "var(--accent)" : meta.color,
                  }}
                >
                  {meta.count}
                </span>
                <span
                  className="text-[10px] font-mono font-medium uppercase tracking-wider block mt-0.5"
                  style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
                >
                  {sev}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Queue */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <h3
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <AlertOctagon className="w-4 h-4" style={{ color: "var(--sev-critical)" }} />
            Alert queue
            <span
              className="text-[11px] font-mono font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              ({filteredAlerts.length})
            </span>
          </h3>
          <ThreatBadge level="CRITICAL" size="sm" />
        </div>

        {filteredAlerts.length > 0 ? (
          <div className="space-y-2.5">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onInvestigate={(route, targetId) => onNavigate(route as ActiveTab, targetId)}
              />
            ))}
          </div>
        ) : (
          <div
            className="py-8 text-center text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            No alerts match the selected filter.
            <button
              onClick={() => setActiveFilter("ALL")}
              className="block mx-auto mt-2 flex items-center gap-1 transition-colors"
              style={{ color: "var(--accent)" }}
            >
              <RefreshCw className="w-3 h-3" /> Show all
            </button>
          </div>
        )}
      </div>

      {/* Active Campaigns */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Active campaigns
            <span className="ml-2 text-[11px] font-mono font-normal" style={{ color: "var(--text-muted)" }}>
              ({safeCampaigns.length})
            </span>
          </h3>
          <button
            onClick={() => onNavigate("campaigns")}
            className="text-[12px] font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            View details →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {safeCampaigns.map((camp) => (
            <div
              key={camp.id}
              onClick={() => onSelectCampaign(camp.id)}
              className="p-4 rounded-md transition-colors cursor-pointer"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {camp.name}
                </h4>
                <ThreatBadge level={camp.threatLevel} size="sm" showScore={camp.threatScore} />
              </div>
              <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {camp.description || camp.summary}
              </p>
              <div
                className="mt-3 pt-2.5 flex items-center justify-between text-[10px] font-mono"
                style={{ borderTop: "1px solid var(--border-muted)", color: "var(--text-muted)" }}
              >
                <span>
                  Accounts:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    {(camp.accountsInvolved || camp.accounts || []).length}
                  </strong>
                </span>
                <span>
                  Coord:{" "}
                  <strong style={{ color: "var(--accent)" }}>
                    {camp.coordinationScore}%
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Posts */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Flagged posts requiring review
            <span className="ml-2 text-[11px] font-mono font-normal" style={{ color: "var(--text-muted)" }}>
              ({flaggedPosts.length})
            </span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flaggedPosts.slice(0, 4).map((post) => (
            <PostCard key={post.id} post={post} onAnalyze={onAnalyzePost} onSelectAccount={onSelectAccount} />
          ))}
        </div>
      </div>
    </div>
  );
};

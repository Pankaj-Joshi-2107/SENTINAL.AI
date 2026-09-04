import React from "react";
import { Account, Post } from "../types";
import { MetricCard } from "../components/MetricCard";
import { ThreatBadge } from "../components/ThreatBadge";
import {
  calculateActivityMetrics,
  calculateEngagementRate,
  calculateSentiment
} from "../utils/analytics";
import {
  Users,
  Clock,
  Zap,
  UserCheck,
  ShieldAlert
} from "lucide-react";

interface AudienceViewProps {
  accounts: Account[];
  posts: Post[];
  onSelectAccount: (username: string) => void;
}

export const AudienceView: React.FC<AudienceViewProps> = ({
  accounts,
  posts,
  onSelectAccount
}) => {
  const activity = calculateActivityMetrics(posts);
  const engagement = calculateEngagementRate(posts);
  const sentiment = calculateSentiment(posts);

  const burstAccountsCount = accounts.filter((a) => a.burstActivity).length;
  const highRiskAccounts = accounts.filter((a) => a.riskLevel === "CRITICAL" || a.riskLevel === "HIGH");

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Audience Intelligence
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Behavioral profiling, bot probability, temporal burst detection, and contributor influence.
          </p>
        </div>
        <span
          className="text-[11px] font-mono px-2.5 py-1 rounded shrink-0"
          style={{
            background: "var(--sev-critical-bg)",
            color: "var(--sev-critical)",
            border: "1px solid var(--sev-critical-bd)"
          }}
        >
          {burstAccountsCount} burst nodes
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tracked accounts"
          value={accounts.length}
          subtitle="Identified across ingestion streams"
          icon={Users}
        />
        <MetricCard
          title="Avg engagement rate"
          value={`${engagement.averageEngagementRate}%`}
          subtitle="Over likes, comments, and shares"
          icon={Zap}
        />
        <MetricCard
          title="Peak activity window"
          value={activity.peakActivityTime}
          subtitle={`Posting velocity: ${activity.postingFrequency}`}
          icon={Clock}
        />
        <MetricCard
          title="Anomalous / bot nodes"
          value={burstAccountsCount}
          subtitle={`${highRiskAccounts.length} classified High / Critical`}
          icon={ShieldAlert}
          trend={{ value: "Astroturf detected", isAdversarial: true }}
        />
      </div>

      {/* Behavioral analysis row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Behavior patterns */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Behavior patterns
          </h3>
          <p className="text-[12px] mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Algorithmic analysis identifies two audience clusters:
          </p>
          <ul className="space-y-2 text-[12px]">
            <li
              className="p-2.5 rounded-md flex items-start gap-2"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "var(--sev-low)" }} />
              <div>
                <strong style={{ color: "var(--sev-low)" }}>Organic cohort (60%)</strong>
                <span style={{ color: "var(--text-secondary)" }}>
                  : Natural intervals, diverse topics, organic engagement.
                </span>
              </div>
            </li>
            <li
              className="p-2.5 rounded-md flex items-start gap-2"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "2px solid var(--sev-critical)" }}
            >
              <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "var(--sev-critical)" }} />
              <div>
                <strong style={{ color: "var(--sev-critical)" }}>Coordinated cohort (40%)</strong>
                <span style={{ color: "var(--text-secondary)" }}>
                  : Burst within 5 min, accounts &lt;14 days old, high textual similarity.
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Sentiment split */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Audience sentiment
          </h3>
          <p className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Aggregated sentiment across all identified authors:
          </p>
          <div className="space-y-3 font-mono text-[11px]">
            {[
              { label: "Positive", val: sentiment.positivePercent, color: "var(--sev-low)" },
              { label: "Neutral", val: sentiment.neutralPercent, color: "var(--text-muted)" },
              { label: "Negative", val: sentiment.negativePercent, color: "var(--sev-critical)" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between mb-1" style={{ color: s.color }}>
                  <span>{s.label}</span>
                  <span>{s.val}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.val}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bot probability */}
        <div
          className="rounded-lg p-5 flex flex-col justify-between"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Bot / sockpuppet probability
            </h3>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Synthesizing account age, avatar flags, follower ratio, and synchronized cadence.
            </p>
          </div>
          <div
            className="mt-4 p-4 rounded-md text-center font-mono"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <span className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>
              Adversarial cohort bot probability
            </span>
            <span
              className="text-2xl font-bold block"
              style={{ color: "var(--sev-critical)" }}
            >
              85–94%
            </span>
            <span className="text-[11px] block mt-1" style={{ color: "var(--text-muted)" }}>
              8 accounts flagged for escalation
            </span>
          </div>
        </div>
      </div>

      {/* Account directory */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Tracked account profiles
              <span
                className="ml-2 text-[11px] font-mono font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                ({accounts.length})
              </span>
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Click any account to open the intelligence dossier
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const isBurst = acc.burstActivity;
            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.username)}
                className="p-4 rounded-md transition-colors cursor-pointer"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderLeft: isBurst ? "2px solid var(--sev-critical)" : "1px solid var(--border)",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = isBurst ? "var(--sev-critical)" : "var(--border)";
                  if (isBurst) (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--sev-critical)";
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full font-mono font-semibold text-[11px] flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        color: "var(--accent)",
                      }}
                    >
                      {acc.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-medium text-[13px]" style={{ color: "var(--text-primary)" }}>
                        <span>{acc.displayName}</span>
                        {acc.verified && <UserCheck className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>@{acc.username}</span>
                    </div>
                  </div>
                  <ThreatBadge level={acc.riskLevel} size="sm" showScore={acc.behaviorScore} />
                </div>

                <div
                  className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-2"
                  style={{ borderTop: "1px solid var(--border-muted)", color: "var(--text-muted)" }}
                >
                  <div>Age: <strong style={{ color: "var(--text-primary)" }}>{acc.accountAgeDays}d</strong></div>
                  <div>
                    Bot:{" "}
                    <strong style={{ color: acc.botProbability > 70 ? "var(--sev-critical)" : "var(--sev-low)" }}>
                      {acc.botProbability}%
                    </strong>
                  </div>
                  <div>Followers: <strong style={{ color: "var(--text-primary)" }}>{acc.followerCount}</strong></div>
                  <div>
                    Burst:{" "}
                    <strong style={{ color: isBurst ? "var(--sev-critical)" : "var(--sev-low)" }}>
                      {isBurst ? "Detected" : "Organic"}
                    </strong>
                  </div>
                </div>

                {acc.sharedHashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {acc.sharedHashtags.slice(0, 2).map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--bg-surface)",
                          color: "var(--accent)",
                          border: "1px solid var(--border-muted)",
                        }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

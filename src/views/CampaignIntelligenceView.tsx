import React from "react";
import { Campaign, Account, Post } from "../types";
import { ThreatScoreGauge } from "../components/ThreatScoreGauge";
import { ThreatBadge } from "../components/ThreatBadge";
import {
  Network,
  Repeat,
  History,
  ChevronRight,
} from "lucide-react";

interface CampaignIntelligenceViewProps {
  campaigns: Campaign[];
  accounts: Account[];
  posts: Post[];
  selectedCampaignId?: string | null;
  onSelectCampaign: (id: string) => void;
  onNavigateToNetwork: (campaignId?: string) => void;
  onSelectAccount: (username: string) => void;
}

export const CampaignIntelligenceView: React.FC<CampaignIntelligenceViewProps> = ({
  campaigns,
  accounts,
  posts,
  selectedCampaignId,
  onSelectCampaign,
  onNavigateToNetwork,
  onSelectAccount
}) => {
  const currentCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const accountsList = currentCampaign?.accountsInvolved || currentCampaign?.accounts || [];
  const burstWindow = currentCampaign?.burstWindow || currentCampaign?.timeWindow || "5m window";
  const summaryDesc = currentCampaign?.description || currentCampaign?.summary || "";
  const targetNarrative = currentCampaign?.targetNarrative || "Coordinated Astroturf";

  const coordinationSignals = currentCampaign?.coordinationSignals || {
    timeSynchronicity: currentCampaign?.coordinationBreakdown?.temporalProximity || 94,
    contentSimilarity: currentCampaign?.coordinationBreakdown?.contentSimilarity || 91,
    hashtagOverlap: currentCampaign?.coordinationBreakdown?.sharedHashtags || 96,
    accountAgeDistribution: currentCampaign?.coordinationBreakdown?.activityBurst || 92,
    urlCooccurrence: currentCampaign?.coordinationBreakdown?.sharedUrls || 88,
  };

  const campaignAccounts = accounts.filter((a) =>
    accountsList.includes(a.username)
  );

  const sigBarColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Campaign Intelligence
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Algorithmic detection of coordinated inauthentic behavior, narrative manipulation, and synthetic astroturfing.
          </p>
        </div>
        <button
          id="btn-view-network-campaign"
          onClick={() => onNavigateToNetwork(currentCampaign?.id)}
          className="px-3 py-2 rounded-md text-[13px] font-semibold flex items-center gap-2 shrink-0 transition-colors"
          style={{ background: "var(--accent)", color: "var(--accent-text-on)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--accent)"}
        >
          <Network className="w-4 h-4" />
          <span>Network graph</span>
        </button>
      </div>

      {/* Campaign Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {campaigns.map((camp) => {
          const isSelected = currentCampaign?.id === camp.id;
          return (
            <button
              key={camp.id}
              onClick={() => onSelectCampaign(camp.id)}
              className="px-3.5 py-2 rounded-md text-[12px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              style={{
                background: isSelected ? "var(--accent-subtle)" : "var(--bg-elevated)",
                border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                color: isSelected ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: camp.threatLevel === "CRITICAL" ? "var(--sev-critical)" : "var(--sev-medium)" }}
              />
              <span>{camp.name}</span>
              <ThreatBadge level={camp.threatLevel} size="sm" showScore={camp.threatScore} />
            </button>
          );
        })}
      </div>

      {currentCampaign && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Campaign Details (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main campaign card */}
            <div
              className="rounded-lg p-5 space-y-4"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex flex-wrap items-start justify-between gap-4 pb-4"
                style={{ borderBottom: "1px solid var(--border-muted)" }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {currentCampaign.id}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--sev-critical-bg)",
                        color: "var(--sev-critical)",
                        border: "1px solid var(--sev-critical-bd)"
                      }}
                    >
                      {targetNarrative}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {currentCampaign.name}
                  </h2>
                  <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {summaryDesc}
                  </p>
                </div>
                <ThreatBadge level={currentCampaign.threatLevel} size="lg" />
              </div>

              {/* 4 stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                {[
                  { label: "Coordination", val: `${currentCampaign.coordinationScore}%`, color: "var(--accent)" },
                  { label: "Threat score", val: `${currentCampaign.threatScore} / 100`, color: "var(--sev-critical)" },
                  { label: "Accounts", val: `${accountsList.length} nodes`, color: "var(--text-primary)" },
                  { label: "Burst window", val: burstWindow, color: "var(--sev-medium)" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 rounded-md"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-[10px] block mb-1" style={{ color: "var(--text-muted)" }}>
                      {stat.label}
                    </span>
                    <span className="text-base font-bold block" style={{ color: stat.color }}>
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* 5-signal breakdown */}
              <div className="pt-3 space-y-2.5" style={{ borderTop: "1px solid var(--border-muted)" }}>
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>
                    5-Signal coordination breakdown
                  </h4>
                  <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--accent)" }}>
                    Composite: {currentCampaign.coordinationScore}%
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "1. Time synchronicity", desc: "Posting latency within 5-minute interval", val: coordinationSignals.timeSynchronicity },
                    { label: "2. Content similarity", desc: "TF-IDF N-gram overlap", val: coordinationSignals.contentSimilarity },
                    { label: "3. Hashtag overlap", desc: "Shared hashtag co-occurrence", val: coordinationSignals.hashtagOverlap },
                    { label: "4. Account age distribution", desc: "Accounts <14 days old", val: coordinationSignals.accountAgeDistribution },
                    { label: "5. URL co-occurrence", desc: "Shared obfuscated links", val: coordinationSignals.urlCooccurrence },
                  ].map((sig, i) => (
                    <div
                      key={i}
                      className="text-[12px] p-2.5 rounded-md"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{sig.label}</span>
                        <span className="font-mono font-semibold" style={{ color: "var(--text-secondary)" }}>
                          {sig.val}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--bg-surface)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${sig.val}%`, background: sigBarColors[i] }}
                        />
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sig.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repeated phrases */}
              <div className="pt-3" style={{ borderTop: "1px solid var(--border-muted)" }}>
                <h4
                  className="text-[12px] font-medium mb-2 flex items-center gap-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Repeat className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  Repeated phrases & astroturf clusters
                </h4>
                <div className="space-y-1.5">
                  {currentCampaign.repeatedPhrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-md text-[12px] font-mono flex items-center justify-between"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                    >
                      <span style={{ color: "var(--accent)" }}>"{phrase}"</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
                      >
                        ×{accountsList.length} accounts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Historical match */}
            {currentCampaign.historicalMatch && (
              <div
                className="rounded-lg p-5 space-y-4"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              >
                <div
                  className="flex items-center justify-between pb-3"
                  style={{ borderBottom: "1px solid var(--border-muted)" }}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Historical campaign match
                    </h3>
                  </div>
                  <span
                    className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded"
                    style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                  >
                    {currentCampaign.historicalMatch.matchPercentage || currentCampaign.historicalMatch.similarity}% match
                  </span>
                </div>
                <div className="space-y-3 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Matched prior dossier:</span>
                    <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                      {currentCampaign.historicalMatch.campaignName}
                    </span>
                  </div>
                  <p
                    className="p-3 rounded-md leading-relaxed"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    <strong className="block mb-1" style={{ color: "var(--text-primary)" }}>Pattern analysis:</strong>
                    {currentCampaign.historicalMatch.patternSimilarity ||
                      currentCampaign.historicalMatch.characteristics?.join(" · ") ||
                      "High lexical and timing convergence identified."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Gauge + Accounts (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <ThreatScoreGauge
              score={currentCampaign.threatScore}
              threatLevel={currentCampaign.threatLevel}
              breakdown={currentCampaign.threatBreakdown}
              title="Campaign threat score"
            />

            {/* Involved accounts */}
            <div
              className="rounded-lg p-5"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center justify-between pb-3 mb-3"
                style={{ borderBottom: "1px solid var(--border-muted)" }}
              >
                <div>
                  <h4 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    Coordinated accounts
                    <span
                      className="ml-1.5 text-[11px] font-mono font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ({campaignAccounts.length})
                    </span>
                  </h4>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Click any node to view dossier
                  </span>
                </div>
                <button
                  onClick={() => onNavigateToNetwork(currentCampaign.id)}
                  className="text-[12px] flex items-center gap-1 font-medium transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  <Network className="w-3.5 h-3.5" /> Graph
                </button>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
                {campaignAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.username)}
                    className="p-3 rounded-md transition-colors cursor-pointer flex items-center justify-between"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full font-mono font-semibold text-[11px] flex items-center justify-center"
                        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--accent)" }}
                      >
                        {acc.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[13px] font-medium block" style={{ color: "var(--text-primary)" }}>
                          {acc.displayName}
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                          @{acc.username} · Age: {acc.accountAgeDays}d
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-medium" style={{ color: "var(--sev-critical)" }}>
                        Bot: {acc.botProbability}%
                      </span>
                      <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import {
  Post,
  Account,
  Campaign,
  ThreatAlert,
  ActiveTab
} from "../types";
import { MetricCard } from "../components/MetricCard";
import { AlertCard } from "../components/AlertCard";
import { PostCard } from "../components/PostCard";
import {
  calculateSentiment,
  calculateEngagementRate,
  calculateTrendingTopics,
  calculateTrendingHashtags,
  calculateActivityMetrics
} from "../utils/analytics";
import {
  MessageSquare,
  Smile,
  Users,
  ShieldAlert,
  TrendingUp,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface OverviewViewProps {
  posts: Post[];
  accounts: Account[];
  campaigns: Campaign[];
  alerts: ThreatAlert[];
  onOpenSimulation: () => void;
  onNavigate: (tab: ActiveTab, targetId?: string) => void;
  onSelectAccount: (username: string) => void;
  onAnalyzePost: (post: Post) => void;
}

const tooltipStyle = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--text-primary)",
  fontSize: "12px",
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  posts,
  accounts,
  campaigns,
  alerts,
  onNavigate,
  onSelectAccount,
  onAnalyzePost
}) => {
  const sentiment = calculateSentiment(posts);
  const engagement = calculateEngagementRate(posts);
  const trendingTopics = calculateTrendingTopics(posts).slice(0, 5);
  const trendingHashtags = calculateTrendingHashtags(posts).slice(0, 6);

  const criticalThreatCount = alerts.filter(
    (a) => a.severity === "CRITICAL" || a.severity === "HIGH"
  ).length;

  const sentimentTrendData = [
    { time: "08:00", positive: 78, neutral: 18, negative: 4 },
    { time: "08:30", positive: 82, neutral: 14, negative: 4 },
    { time: "09:00", positive: 65, neutral: 25, negative: 10 },
    { time: "09:30", positive: 70, neutral: 22, negative: 8 },
    { time: "10:00", positive: 58, neutral: 20, negative: 22 },
    { time: "10:20", positive: 42, neutral: 18, negative: 40 },
    { time: "10:35", positive: 28, neutral: 12, negative: 60 }
  ];

  const platformEngData = [
    { name: "Twitter/X", count: posts.filter((p) => p.platform === "twitter").length, color: "var(--accent)" },
    { name: "Instagram", count: posts.filter((p) => p.platform === "instagram").length, color: "var(--sev-critical)" },
    { name: "LinkedIn", count: posts.filter((p) => p.platform === "linkedin").length, color: "var(--chart-2)" },
    { name: "Threads", count: posts.filter((p) => p.platform === "threads").length, color: "var(--sev-medium)" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div
          className="text-[11px] font-mono mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Overview · Live intelligence
        </div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Social Intelligence Overview
        </h1>
        <p
          className="text-[13px] mt-1 max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          A live operating picture of public conversation, coordinated behavior, and emerging risk.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-posts-analyzed"
          title="Posts analyzed"
          value={posts.length}
          subtitle={`Across ${new Set(posts.map((p) => p.platform)).size} platforms`}
          icon={MessageSquare}
          trend={{ value: "+18% velocity", isPositive: true }}
          onClick={() => onNavigate("social-analytics")}
        />
        <MetricCard
          id="metric-overall-sentiment"
          title="Overall sentiment"
          value={`${sentiment.positivePercent}% pos`}
          subtitle={`${sentiment.negativePercent}% negative · ${sentiment.neutralPercent}% neutral`}
          icon={Smile}
          trend={{
            value: sentiment.negativePercent > 35 ? "Adversarial shift" : "Constructive",
            isAdversarial: sentiment.negativePercent > 35,
            isPositive: sentiment.positivePercent > 50
          }}
          onClick={() => onNavigate("social-analytics")}
        />
        <MetricCard
          id="metric-active-accounts"
          title="Active accounts"
          value={new Set(posts.map((p) => p.username)).size}
          subtitle={`${accounts.filter((a) => a.burstActivity).length} with burst activity`}
          icon={Users}
          trend={{ value: `${accounts.length} tracked`, isPositive: true }}
          onClick={() => onNavigate("audience")}
        />
        <MetricCard
          id="metric-threat-signals"
          title="Threat signals"
          value={criticalThreatCount}
          subtitle={`${campaigns.length} campaigns · ${alerts.length} alerts`}
          icon={ShieldAlert}
          trend={{
            value: criticalThreatCount > 0 ? "Critical anomaly" : "Nominal",
            isAdversarial: criticalThreatCount > 0
          }}
          onClick={() => onNavigate("threat-center")}
        />
      </div>

      {/* Row 1: Sentiment Trend & Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)] gap-4">
        {/* Sentiment Trend Chart */}
        <div
          className="rounded-lg p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-4"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Sentiment trajectory
              </h3>
              <span
                className="text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                Time-series sentiment shifts tracking disinformation burst
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1" style={{ color: "var(--sev-low)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--sev-low)" }} /> Positive
              </span>
              <span className="flex items-center gap-1" style={{ color: "var(--sev-critical)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--sev-critical)" }} /> Negative
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentTrendData}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--sev-low)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--sev-low)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--sev-critical)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--sev-critical)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="positive" stroke="var(--sev-low)" strokeWidth={2} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="negative" stroke="var(--sev-critical)" strokeWidth={2} fill="url(#colorNeg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending Topics */}
        <div
          className="rounded-lg p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-3"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Trending topics
            </h3>
            <button
              onClick={() => onNavigate("trends")}
              className="text-[12px] font-medium transition-colors"
              style={{ color: "var(--accent)" }}
            >
              View all →
            </button>
          </div>

          <div className="space-y-2">
            {trendingTopics.map((t, idx) => (
              <div
                key={idx}
                className="px-3 py-2.5 rounded-md flex items-center justify-between gap-2 transition-colors"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                      #{idx + 1}
                    </span>
                    <span
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.topic}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t.postCount} posts · {t.totalEngagement} eng
                  </span>
                </div>
                <span
                  className="text-[10px] font-mono shrink-0"
                  style={{
                    color: t.sentimentLabel === "Positive"
                      ? "var(--sev-low)"
                      : t.sentimentLabel === "Negative"
                      ? "var(--sev-critical)"
                      : "var(--text-muted)"
                  }}
                >
                  {t.sentimentLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Trending Hashtags & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
        {/* Trending Hashtags */}
        <div
          className="rounded-lg p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-3"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Trending hashtags
            </h3>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              Velocity analysis
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {trendingHashtags.map((h, i) => {
              const isFlagged = h.hashtag === "#CleanEnergyHoax" || h.hashtag === "#SolarScam";
              return (
                <div
                  key={i}
                  className="p-3 rounded-md"
                  style={{
                    background: "var(--bg-elevated)",
                    border: `1px solid var(--border)`,
                    borderLeft: isFlagged ? `2px solid var(--sev-critical)` : `1px solid var(--border)`,
                  }}
                >
                  <span
                    className="text-[12px] font-mono font-medium block truncate"
                    style={{ color: isFlagged ? "var(--sev-critical)" : "var(--accent)" }}
                  >
                    {h.hashtag}
                  </span>
                  <div
                    className="mt-1 flex items-center justify-between text-[10px] font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>{h.count} hits</span>
                    <span
                      style={{
                        color: h.momentum === "High Spike" ? "var(--sev-critical)" : "var(--text-muted)",
                        fontWeight: h.momentum === "High Spike" ? 600 : 400,
                      }}
                    >
                      {h.momentum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Distribution */}
        <div
          className="rounded-lg p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-2"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Platform distribution
            </h3>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              Avg {engagement.averageEngagementRate}% eng
            </span>
          </div>

          <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformEngData} layout="vertical">
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {platformEngData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Threat Alerts */}
      <div
        className="rounded-lg p-5"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" style={{ color: "var(--sev-critical)" }} />
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Active threat alerts
              <span
                className="ml-2 text-[11px] font-mono font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                ({alerts.length})
              </span>
            </h3>
          </div>
          <button
            onClick={() => onNavigate("threat-center")}
            className="text-[12px] font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Open Threat Center →
          </button>
        </div>

        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onInvestigate={(route, targetId) => onNavigate(route as ActiveTab, targetId)}
            />
          ))}
        </div>
      </div>

      {/* Row 4: Recent Activity Feed */}
      <div
        className="rounded-lg p-5"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Recent activity
            </h3>
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              Live inspection of simulated feed posts
            </span>
          </div>
          <button
            onClick={() => onNavigate("social-analytics")}
            className="text-[12px] font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Explore all {posts.length} posts →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.slice(0, 4).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onAnalyze={onAnalyzePost}
              onSelectAccount={onSelectAccount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

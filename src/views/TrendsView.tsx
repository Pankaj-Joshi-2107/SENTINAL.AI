import React from "react";
import { Post } from "../types";
import {
  calculateTrendingTopics,
  calculateTrendingHashtags,
  calculateSentiment
} from "../utils/analytics";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

interface TrendsViewProps {
  posts: Post[];
  onSelectTopic?: (topic: string) => void;
}

const tooltipStyle = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--text-primary)",
  fontSize: "12px",
};

export const TrendsView: React.FC<TrendsViewProps> = ({ posts, onSelectTopic }) => {
  const topics = calculateTrendingTopics(posts);
  const hashtags = calculateTrendingHashtags(posts);

  const timelineData = [
    { hour: "08:00", renewable: 4, aiTech: 3, transit: 1, hoaxScam: 0 },
    { hour: "08:45", renewable: 6, aiTech: 5, transit: 2, hoaxScam: 0 },
    { hour: "09:30", renewable: 8, aiTech: 6, transit: 4, hoaxScam: 1 },
    { hour: "10:15", renewable: 7, aiTech: 6, transit: 3, hoaxScam: 4 },
    { hour: "10:35", renewable: 4, aiTech: 4, transit: 2, hoaxScam: 9 },
  ];

  const emergingTopics = [
    { name: "#CleanEnergyHoax", surge: "+480%", status: "Anomalous spike", isThreat: true },
    { name: "Grid-Scale Storage", surge: "+85%", status: "Organic growth", isThreat: false },
    { name: "Reasoning Models", surge: "+62%", status: "Organic growth", isThreat: false },
  ];

  const decliningTopics = [
    { name: "Municipal Transit Budget", change: "-34%", status: "Decaying" },
    { name: "Rooftop Solar Tests", change: "-22%", status: "Stable" },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Trend Intelligence
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Topic velocity tracking, hashtag acceleration, and anomalous coordinate surges.
          </p>
        </div>
        <span
          className="text-[11px] font-mono px-2.5 py-1 rounded shrink-0"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          {topics.length} topics tracked
        </span>
      </div>

      {/* Row 1: Emerging and Declining */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emerging */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-3"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <ArrowUpRight className="w-4 h-4" style={{ color: "var(--sev-critical)" }} />
              Emerging topics
            </h3>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>Velocity surge</span>
          </div>
          <div className="space-y-2.5">
            {emergingTopics.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-2.5 rounded-md flex items-center justify-between"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderLeft: item.isThreat ? "2px solid var(--sev-critical)" : "1px solid var(--border)",
                }}
              >
                <div>
                  <span
                    className="text-[13px] font-medium block"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[12px]">
                  <span
                    className="font-semibold"
                    style={{ color: item.isThreat ? "var(--sev-critical)" : "var(--sev-low)" }}
                  >
                    {item.surge}
                  </span>
                  {item.isThreat && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        background: "var(--sev-critical-bg)",
                        color: "var(--sev-critical)",
                        border: "1px solid var(--sev-critical-bd)",
                      }}
                    >
                      Anomaly
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-3"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <ArrowDownRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              Declining topics
            </h3>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>Natural decay</span>
          </div>
          <div className="space-y-2.5">
            {decliningTopics.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-2.5 rounded-md flex items-center justify-between"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              >
                <div>
                  <span className="text-[13px] font-medium block" style={{ color: "var(--text-primary)" }}>
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{item.status}</span>
                </div>
                <span className="font-mono text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Timeline Chart */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <div>
            <h3
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Activity className="w-4 h-4" style={{ color: "var(--accent)" }} />
              Topic frequency over time
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Comparing organic topics vs. coordinated astroturf emergence
            </span>
          </div>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="renewable" name="Renewable Energy" stroke="var(--sev-low)" strokeWidth={2} />
              <Line type="monotone" dataKey="aiTech" name="AI & Tech" stroke="var(--accent)" strokeWidth={2} />
              <Line type="monotone" dataKey="transit" name="Urban Transit" stroke="var(--sev-medium)" strokeWidth={2} />
              <Line type="monotone" dataKey="hoaxScam" name="Hoax/Disinfo" stroke="var(--sev-critical)" strokeWidth={2.5} strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Sentiment Table */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sentiment & engagement by topic
          </h3>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
            {topics.length} tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-muted)" }}>
                {["Topic", "Posts", "Sentiment", "Avg score", "Engagement", "Momentum"].map(h => (
                  <th
                    key={h}
                    className="pb-3 font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((t, idx) => (
                <tr
                  key={idx}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--border-muted)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>{t.topic}</td>
                  <td className="py-3 font-mono" style={{ color: "var(--text-secondary)" }}>{t.postCount}</td>
                  <td className="py-3">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{
                        background: t.sentimentLabel === "Positive"
                          ? "var(--sev-low-bg)"
                          : t.sentimentLabel === "Negative"
                          ? "var(--sev-critical-bg)"
                          : "var(--bg-elevated)",
                        color: t.sentimentLabel === "Positive"
                          ? "var(--sev-low)"
                          : t.sentimentLabel === "Negative"
                          ? "var(--sev-critical)"
                          : "var(--text-muted)",
                      }}
                    >
                      {t.sentimentLabel}
                    </span>
                  </td>
                  <td className="py-3 font-mono" style={{ color: "var(--text-muted)" }}>{t.averageSentiment}</td>
                  <td className="py-3 font-mono font-semibold" style={{ color: "var(--accent)" }}>{t.totalEngagement}</td>
                  <td className="py-3 font-mono text-[11px]">
                    <span
                      style={{
                        color: t.momentum === "Surging" ? "var(--sev-critical)" : "var(--text-secondary)",
                        fontWeight: t.momentum === "Surging" ? 600 : 400,
                      }}
                    >
                      {t.momentum}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

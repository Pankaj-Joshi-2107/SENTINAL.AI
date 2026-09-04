import React, { useState, useMemo } from "react";
import { Post, Account } from "../types";
import { PostCard } from "../components/PostCard";
import {
  calculateSentiment,
  calculateEmotion,
  calculateEngagementRate,
  calculateTrendingTopics,
  calculateTrendingHashtags
} from "../utils/analytics";
import { Filter, RotateCcw, Search } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from "recharts";

interface SocialAnalyticsViewProps {
  posts: Post[];
  accounts: Account[];
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

const selectStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "var(--radius-sm)",
  padding: "6px 10px",
  fontSize: "12px",
  width: "100%",
};

export const SocialAnalyticsView: React.FC<SocialAnalyticsViewProps> = ({
  posts,
  accounts,
  onSelectAccount,
  onAnalyzePost
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => { if (p.topic) set.add(p.topic); });
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedPlatform !== "all" && p.platform !== selectedPlatform) return false;
      if (selectedSentiment !== "all") {
        if (selectedSentiment === "positive" && p.sentiment !== "positive") return false;
        if (selectedSentiment === "neutral" && p.sentiment !== "neutral") return false;
        if (selectedSentiment === "negative" && p.sentiment !== "negative") return false;
      }
      if (selectedTopic !== "all" && p.topic !== selectedTopic) return false;
      if (selectedRisk !== "all") {
        const risk = (p.cyberbullyingRisk || 0);
        if (selectedRisk === "low" && risk > 30) return false;
        if (selectedRisk === "medium" && (risk <= 30 || risk > 60)) return false;
        if (selectedRisk === "high" && (risk <= 60 || risk > 80)) return false;
        if (selectedRisk === "critical" && risk <= 80) return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesText = p.text.toLowerCase().includes(q);
        const matchesUser = p.username.toLowerCase().includes(q);
        const matchesTag = (p.hashtags || []).some((h) => h.toLowerCase().includes(q));
        if (!matchesText && !matchesUser && !matchesTag) return false;
      }
      return true;
    });
  }, [posts, selectedPlatform, selectedSentiment, selectedTopic, selectedRisk, searchQuery]);

  const sentiment = calculateSentiment(filteredPosts);
  const emotions = calculateEmotion(filteredPosts);
  const engagement = calculateEngagementRate(filteredPosts);
  const trendingTopics = calculateTrendingTopics(filteredPosts);

  const sentimentPieData = [
    { name: "Positive", value: sentiment.positive, color: "var(--sev-low)" },
    { name: "Neutral", value: sentiment.neutral, color: "var(--text-muted)" },
    { name: "Negative", value: sentiment.negative, color: "var(--sev-critical)" }
  ].filter((d) => d.value > 0);

  const topicSentimentData = trendingTopics.slice(0, 5).map((t) => ({
    name: t.topic.length > 15 ? t.topic.slice(0, 15) + "..." : t.topic,
    posts: t.postCount,
    engagement: t.totalEngagement
  }));

  const emotionBarColors = ["var(--sev-low)", "var(--sev-critical)", "var(--sev-medium)", "var(--accent)", "var(--chart-2)"];

  const resetFilters = () => {
    setSelectedPlatform("all");
    setSelectedSentiment("all");
    setSelectedTopic("all");
    setSelectedRisk("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Social Analytics
        </h1>
        <p
          className="text-[13px] mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          Real-time metrics across sentiment, emotion, topic frequency, and engagement velocity.
        </p>
        <span
          className="text-[11px] font-mono mt-1 inline-block"
          style={{ color: "var(--text-muted)" }}
        >
          {filteredPosts.length} of {posts.length} posts
        </span>
      </div>

      {/* Filter Toolbar */}
      <div
        className="rounded-lg p-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-2 text-[12px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <Filter className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span>Filters</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-[12px] flex items-center gap-1 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Platform</label>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} style={selectStyle}>
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter / X</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="threads">Threads</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Sentiment</label>
            <select value={selectedSentiment} onChange={(e) => setSelectedSentiment(e.target.value)} style={selectStyle}>
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Topic</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={selectStyle}>
              <option value="all">All Topics</option>
              {availableTopics.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Risk level</label>
            <select value={selectedRisk} onChange={(e) => setSelectedRisk(e.target.value)} style={selectStyle}>
              <option value="all">All Risk Levels</option>
              <option value="low">Low (0–30)</option>
              <option value="medium">Medium (31–60)</option>
              <option value="high">High (61–80)</option>
              <option value="critical">Critical (81–100)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] mb-1 font-mono" style={{ color: "var(--text-muted)" }}>Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Text, user, hashtag…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5"
                style={{ ...selectStyle, padding: "6px 10px 6px 28px" }}
              />
              <Search className="w-3.5 h-3.5 absolute left-2 top-2" style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Sentiment Pie + Emotions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sentiment Pie */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-3"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Sentiment distribution
            </h3>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
              Score: {sentiment.averageScore}
            </span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {sentimentPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentPieData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={4} dataKey="value">
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>No matching posts.</div>
            )}
          </div>

          <div
            className="grid grid-cols-3 gap-2 pt-3 text-center font-mono text-[11px]"
            style={{ borderTop: "1px solid var(--border-muted)" }}
          >
            <div className="p-2 rounded" style={{ background: "var(--bg-elevated)" }}>
              <span className="font-bold block" style={{ color: "var(--sev-low)" }}>{sentiment.positivePercent}%</span>
              <span style={{ color: "var(--text-muted)" }}>Positive</span>
            </div>
            <div className="p-2 rounded" style={{ background: "var(--bg-elevated)" }}>
              <span className="font-bold block" style={{ color: "var(--text-muted)" }}>{sentiment.neutralPercent}%</span>
              <span style={{ color: "var(--text-muted)" }}>Neutral</span>
            </div>
            <div className="p-2 rounded" style={{ background: "var(--bg-elevated)" }}>
              <span className="font-bold block" style={{ color: "var(--sev-critical)" }}>{sentiment.negativePercent}%</span>
              <span style={{ color: "var(--text-muted)" }}>Negative</span>
            </div>
          </div>
        </div>

        {/* Emotions */}
        <div
          className="rounded-lg p-5"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between pb-3 mb-4"
            style={{ borderBottom: "1px solid var(--border-muted)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Emotion / valence
            </h3>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>NLP extraction</span>
          </div>

          <div className="space-y-3">
            {emotions.map((emo, i) => (
              <div key={emo.name} className="text-[12px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{emo.name}</span>
                  <span className="font-mono" style={{ color: "var(--text-muted)" }}>
                    {emo.count} posts ({emo.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${emo.percentage}%`, background: emotionBarColors[i % emotionBarColors.length] }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="pt-3 mt-3 flex items-center justify-between text-[11px]"
            style={{ borderTop: "1px solid var(--border-muted)", color: "var(--text-muted)" }}
          >
            <span>Average engagement rate</span>
            <span className="font-mono font-semibold" style={{ color: "var(--accent)" }}>
              {engagement.averageEngagementRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Topic Frequency Chart */}
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
              Topic frequency & engagement
            </h3>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Volume across extracted semantic clusters
            </span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
            {trendingTopics.length} topics
          </span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicSentimentData}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="posts" name="Post Count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="engagement" name="Engagement" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Filtered Posts */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Filtered posts
            <span
              className="ml-2 text-[11px] font-mono font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              ({filteredPosts.length})
            </span>
          </h3>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Sorted by velocity
          </span>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onAnalyze={onAnalyzePost} onSelectAccount={onSelectAccount} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              No posts match the current filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-[12px] transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

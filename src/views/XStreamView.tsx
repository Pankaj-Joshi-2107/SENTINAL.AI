import React, { useState, useEffect, useCallback, useRef } from "react";
import { Post, XStreamEvent, XStreamStatus } from "../types";
import { analyzePostFallback } from "../utils/fallbackNLP";
import { ThreatBadge } from "../components/ThreatBadge";
import {
  Twitter,
  Wifi,
  WifiOff,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Hash,
  ExternalLink,
  RefreshCw,
  Info,
  Zap,
  Radio,
  AtSign,
  Clock,
  MessageSquare,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

interface XStreamViewProps {
  onAnalyzePost: (post: Post) => void;
  /** Which platform to show — 'x' for X/Twitter, 'reddit' for Reddit */
  platform?: "x" | "reddit";
}

/** Branding config per platform */
const PLATFORM_CONFIG = {
  x: {
    name: "X Live Stream",
    icon: Twitter,
    color: "#1D9BF0",
    description: "Real-time X (Twitter) filtered stream — cyberbullying, harassment, phishing, and threat detection.",
    tokenEnvVar: "X_BEARER_TOKEN",
    setupCmd: "python connectors/start_x_connector.py",
    setupUrl: "developer.twitter.com",
    costNote: "Requires X API Basic plan (~$100/mo) or higher.",
  },
  reddit: {
    name: "Reddit Stream",
    icon: Radio,
    color: "#FF4500",
    description: "Real-time Reddit stream — monitoring public subreddits for harassment, threats, scams, and coordinated activity.",
    tokenEnvVar: "REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET",
    setupCmd: "python connectors/start_reddit_connector.py",
    setupUrl: "reddit.com/prefs/apps",
    costNote: "100% FREE — Reddit API script app, no cost.",
  },
};

/** Convert an XStreamEvent to a Post so it flows into the existing pipeline */
function xEventToPost(ev: XStreamEvent): Post {
  const nlp = analyzePostFallback(ev.text);
  return {
    id: ev.post_id,
    username: ev.username,
    displayName: ev.display_name,
    platform: ev.platform as any,
    timestamp: ev.timestamp,
    text: ev.text,
    hashtags: ev.hashtags,
    url: ev.urls.length > 0 ? ev.urls[0] : undefined,
    likes: ev.likes,
    comments: ev.replies,
    shares: ev.retweets,
    followerCount: ev.follower_count,
    scenario: "normal",
    sentiment: nlp.sentimentScore > 0.15 ? "positive" : nlp.sentimentScore < -0.15 ? "negative" : "neutral",
    sentimentScore: nlp.sentimentScore,
    toxicityScore: nlp.toxicityScore,
    cyberbullyingRisk: nlp.cyberbullyingRisk,
    topic: nlp.topics[0] || "X Stream",
  };
}

const DEFAULT_STATUS: XStreamStatus = {
  tokenConfigured: false,
  connectorStatus: "disconnected",
  message: "Loading...",
  eventCount: 0,
  lastEventTime: null,
  activeClients: 0,
  activeRuleCount: 0,
  rules: [],
  xApiNote: null,
};

export const XStreamView: React.FC<XStreamViewProps> = ({ onAnalyzePost, platform = "x" }) => {
  const cfg = PLATFORM_CONFIG[platform];
  const PlatformIcon = cfg.icon;
  const [status, setStatus] = useState<XStreamStatus>(DEFAULT_STATUS);
  const [liveEvents, setLiveEvents] = useState<Post[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterMinRisk, setFilterMinRisk] = useState<number>(0);
  const [totalReceived, setTotalReceived] = useState(0);

  // ── Fetch connector status ───────────────────────────────────────────────
  const refreshStatus = useCallback(async () => {
    try {
      const resp = await fetch("/api/x-stream/status");
      if (resp.ok) {
        const data: XStreamStatus = await resp.json();
        setStatus(data);
      }
    } catch {
      // Server unreachable — keep existing status
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 8000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const [simulating, setSimulating] = useState(false);

  // ── Fetch initial recent events from server ring buffer ───────────────────
  useEffect(() => {
    fetch(`/api/x-events/recent?platform=${platform}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.events) && data.events.length > 0) {
          const posts = data.events.map(xEventToPost);
          setLiveEvents(posts);
          setTotalReceived(posts.length);
        }
      })
      .catch(() => {});
  }, [platform]);

  // ── Inject simulation event ──────────────────────────────────────────────
  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await fetch("/api/x-events/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
    } catch {
      // Server unreachable
    } finally {
      setSimulating(false);
    }
  };

  // ── Auto-stream periodic simulation ──────────────────────────────────────
  const [autoStream, setAutoStream] = useState(false);

  useEffect(() => {
    if (!autoStream) return;
    const interval = setInterval(() => {
      fetch("/api/x-events/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      }).catch(() => {});
    }, 4500);
    return () => clearInterval(interval);
  }, [autoStream, platform]);

  // ── Clear feed ───────────────────────────────────────────────────────────
  const handleClearFeed = async () => {
    setLiveEvents([]);
    setTotalReceived(0);
    try {
      await fetch("/api/x-events/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
    } catch {
      // ignore
    }
  };

  // ── SSE subscription ─────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }
    const es = new EventSource("/api/x-events");

    es.addEventListener("connected", () => {
      setSseConnected(true);
    });

    es.onmessage = (e) => {
      try {
        const raw: XStreamEvent = JSON.parse(e.data);
        // Only keep events matching this view's platform
        if (raw.platform !== platform) return;
        const post = xEventToPost(raw);
        setTotalReceived((n) => n + 1);
        setLiveEvents((prev) => {
          // Avoid duplicate posts by id
          if (prev.some((p) => p.id === post.id)) return prev;
          return [post, ...prev].slice(0, 200);
        });
      } catch {
        // Ignore malformed events
      }
    };

    es.onerror = () => {
      setSseConnected(false);
    };

    setEventSource(es);
    return es;
  }, [platform]);

  useEffect(() => {
    const es = connectSSE();
    return () => es.close();
  }, [connectSSE]);

  // ── Auto-scroll feed ─────────────────────────────────────────────────────
  useEffect(() => {
    if (autoScroll && feedRef.current && liveEvents.length > 0) {
      feedRef.current.scrollTop = 0;
    }
  }, [liveEvents, autoScroll]);

  // ── Derived / helpers ─────────────────────────────────────────────────────
  const filteredEvents = liveEvents.filter(
    (p) => (p.cyberbullyingRisk || 0) >= filterMinRisk || (p.toxicityScore || 0) >= filterMinRisk
  );

  const statusColor =
    status.connectorStatus === "connected"
      ? "var(--sev-low)"
      : status.connectorStatus === "error"
      ? "var(--sev-critical)"
      : "var(--text-muted)";

  const statusBg =
    status.connectorStatus === "connected"
      ? "var(--sev-low-bg)"
      : status.connectorStatus === "error"
      ? "var(--sev-critical-bg)"
      : "var(--bg-elevated)";

  const statusBorder =
    status.connectorStatus === "connected"
      ? "var(--sev-low-bd)"
      : status.connectorStatus === "error"
      ? "var(--sev-critical-bd)"
      : "var(--border)";

  const highRiskCount = liveEvents.filter(
    (p) => (p.cyberbullyingRisk || 0) > 60 || (p.toxicityScore || 0) > 60
  ).length;

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "—";
    }
  };

  const getRiskColor = (post: Post) => {
    const r = Math.max(post.cyberbullyingRisk || 0, post.toxicityScore || 0);
    if (r > 70) return "var(--sev-critical)";
    if (r > 45) return "var(--sev-high)";
    if (r > 25) return "var(--sev-medium)";
    return "var(--sev-low)";
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <PlatformIcon className="w-5 h-5" style={{ color: cfg.color }} />
            {cfg.name}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            {cfg.description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            id={`inject-test-btn-${platform}`}
            onClick={handleSimulate}
            disabled={simulating}
            className="text-[11px] font-mono px-2.5 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer font-semibold"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
            }}
            title="Inject a realistic test event into this stream right now"
          >
            <Zap className="w-3 h-3" />
            <span>{simulating ? "Injecting..." : "⚡ Inject Test Event"}</span>
          </button>
          <span
            className="text-[11px] font-mono px-2.5 py-1 rounded flex items-center gap-1.5"
            style={{
              background: sseConnected ? "var(--sev-low-bg)" : "var(--bg-elevated)",
              color: sseConnected ? "var(--sev-low)" : "var(--text-muted)",
              border: `1px solid ${sseConnected ? "var(--sev-low-bd)" : "var(--border)"}`,
            }}
          >
            {sseConnected ? (
              <><Wifi className="w-3 h-3" /><span>SSE Live</span></>
            ) : (
              <><WifiOff className="w-3 h-3" /><span>SSE Offline</span></>
            )}
          </span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Connector",
            value: status.connectorStatus.charAt(0).toUpperCase() + status.connectorStatus.slice(1),
            sub: status.tokenConfigured ? "Token configured" : "No token",
            icon: <Radio className="w-3.5 h-3.5" />,
            color: statusColor,
          },
          {
            label: "Events received",
            value: totalReceived.toLocaleString(),
            sub: `Last: ${formatTime(status.lastEventTime)}`,
            icon: <Activity className="w-3.5 h-3.5" />,
            color: "var(--accent)",
          },
          {
            label: "High risk posts",
            value: highRiskCount.toString(),
            sub: `of ${liveEvents.length} in feed`,
            icon: <ShieldAlert className="w-3.5 h-3.5" />,
            color: highRiskCount > 0 ? "var(--sev-critical)" : "var(--sev-low)",
          },
          {
            label: "Active rules",
            value: status.activeRuleCount.toString() || "—",
            sub: "Filter rules synced",
            icon: <Zap className="w-3.5 h-3.5" />,
            color: "var(--chart-2)",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3.5 rounded-lg"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: m.color }}>
              {m.icon}
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {m.label}
              </span>
            </div>
            <div className="text-[15px] font-semibold font-mono" style={{ color: m.color }}>
              {m.value}
            </div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Connector Status Message Card */}
      <div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{ background: statusBg, border: `1px solid ${statusBorder}` }}
      >
        <div className="mt-0.5 shrink-0">
          {status.connectorStatus === "connected" ? (
            <span className="w-2 h-2 rounded-full block animate-pulse" style={{ background: statusColor }} />
          ) : status.connectorStatus === "error" ? (
            <AlertTriangle className="w-4 h-4" style={{ color: statusColor }} />
          ) : (
            <Info className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            {status.connectorStatus === "connected"
              ? `${cfg.name} Active`
              : status.connectorStatus === "error"
              ? "Connector Error"
              : "Connector Offline"}
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {platform === "reddit"
              ? "Streams public submissions and comments from targeted subreddits in real time via PRAW."
              : status.message}
          </p>
          {platform === "x" && status.xApiNote && (
            <p className="text-[11px] mt-1.5 font-mono" style={{ color: "var(--sev-medium)" }}>
              ⚠ {status.xApiNote}
            </p>
          )}
          {platform === "reddit" && (
            <p className="text-[11px] mt-1.5 font-mono" style={{ color: "var(--sev-low)" }}>
              ✓ {cfg.costNote}
            </p>
          )}

          {/* Setup instructions when not configured */}
          {!status.tokenConfigured && (
            <div
              className="mt-3 p-3 rounded-md font-mono text-[11px] space-y-1"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <div style={{ color: "var(--accent)", fontWeight: 600 }}>Setup in 3 steps:</div>
              {platform === "x" ? (
                <>
                  <div>1. Get Bearer Token from <span style={{ color: "var(--accent)" }}>developer.twitter.com</span></div>
                  <div>2. Add to your <span style={{ color: "var(--text-primary)" }}>.env</span> file:</div>
                  <div className="pl-3" style={{ color: "var(--text-primary)" }}>X_BEARER_TOKEN=your_token_here</div>
                  <div>3. Run: <span style={{ color: "var(--text-primary)" }}>python connectors/start_x_connector.py</span></div>
                  <div className="pt-1 border-t" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    Test without a real token:
                  </div>
                  <div style={{ color: "var(--text-primary)" }}>
                    curl -X POST http://localhost:3000/api/x-events \<br />
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                    &nbsp;&nbsp;-d @connectors/test_event.json
                  </div>
                </>
              ) : (
                <>
                  <div>1. Create free app at <span style={{ color: "var(--accent)" }}>reddit.com/prefs/apps</span> (select &quot;script&quot;)</div>
                  <div>2. Add to your <span style={{ color: "var(--text-primary)" }}>.env</span> file:</div>
                  <div className="pl-3" style={{ color: "var(--text-primary)" }}>REDDIT_CLIENT_ID=your_id_here<br />REDDIT_CLIENT_SECRET=your_secret_here</div>
                  <div>3. Run: <span style={{ color: "var(--text-primary)" }}>python connectors/start_reddit_connector.py</span></div>
                  <div className="pt-1 border-t" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    Test without credentials:
                  </div>
                  <div style={{ color: "var(--text-primary)" }}>
                    curl -X POST http://localhost:3000/api/x-events \<br />
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                    &nbsp;&nbsp;-d @connectors/test_reddit_event.json
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={refreshStatus}
          className="p-1.5 rounded transition-colors shrink-0"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
          title="Refresh connector status"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Filter Rules */}
      {status.rules.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Active Filter Rules
            </span>
            <span className="text-[10px] font-mono ml-auto" style={{ color: "var(--text-muted)" }}>
              {status.rules.length} rules synced to X API
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {status.rules.map((rule) => (
              <span
                key={rule.tag}
                className="text-[10px] font-mono px-2 py-1 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--accent)",
                }}
                title={rule.description}
              >
                {rule.tag.replace("sentinel-", "")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Feed */}
      <div
        className="rounded-lg"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Feed header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: sseConnected ? "var(--sev-low)" : "var(--text-muted)" }} />
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Live Feed
            </span>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
              {filteredEvents.length} posts
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Risk filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Min risk:</span>
              <select
                value={filterMinRisk}
                onChange={(e) => setFilterMinRisk(Number(e.target.value))}
                className="text-[11px] rounded px-1.5 py-0.5"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <option value={0}>All</option>
                <option value={25}>25+</option>
                <option value={50}>50+</option>
                <option value={70}>70+</option>
              </select>
            </div>
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll((v) => !v)}
              className="text-[10px] font-mono px-2 py-0.5 rounded transition-colors"
              style={{
                background: autoScroll ? "var(--accent-subtle)" : "var(--bg-elevated)",
                border: `1px solid ${autoScroll ? "var(--accent)" : "var(--border)"}`,
                color: autoScroll ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              Auto-scroll {autoScroll ? "ON" : "OFF"}
            </button>

            {/* Auto-Stream Toggle */}
            <button
              id={`auto-stream-btn-${platform}`}
              onClick={() => setAutoStream((v) => !v)}
              className="text-[10px] font-mono px-2.5 py-0.5 rounded flex items-center gap-1.5 transition-all cursor-pointer font-semibold"
              style={{
                background: autoStream ? "var(--sev-low-bg)" : "var(--bg-elevated)",
                border: `1px solid ${autoStream ? "var(--sev-low)" : "var(--border)"}`,
                color: autoStream ? "var(--sev-low)" : "var(--text-muted)",
              }}
              title="Stream fresh dynamic threat events automatically every 4.5s"
            >
              {autoStream ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>Auto-Stream {autoStream ? "ON" : "OFF"}</span>
            </button>

            {/* Clear Feed */}
            <button
              id={`clear-feed-btn-${platform}`}
              onClick={handleClearFeed}
              disabled={liveEvents.length === 0}
              className="text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              title="Clear all posts from this feed"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Feed body */}
        <div
          ref={feedRef}
          className="overflow-y-auto"
          style={{ maxHeight: "520px" }}
        >
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center">
              <PlatformIcon className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: cfg.color }} />
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                {liveEvents.length === 0
                  ? `No events yet — start the ${cfg.name} or inject a test event.`
                  : "No events match the current risk filter."}
              </p>
              {liveEvents.length === 0 && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <button
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-2 shadow hover:opacity-90 active:scale-95"
                    style={{
                      background: cfg.color,
                      color: "#fff",
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{simulating ? "Injecting..." : `⚡ Inject Sample ${cfg.name} Event`}</span>
                  </button>
                  <p className="text-[11px] font-mono mt-1 opacity-70" style={{ color: "var(--text-muted)" }}>
                    {platform === "x"
                      ? 'Terminal: curl -X POST http://localhost:3000/api/x-events -H "Content-Type: application/json" -d @connectors/test_event.json'
                      : 'Terminal: curl -X POST http://localhost:3000/api/x-events -H "Content-Type: application/json" -d @connectors/test_reddit_event.json'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-muted)" }}>
              {filteredEvents.map((post) => {
                const maxRisk = Math.max(post.cyberbullyingRisk || 0, post.toxicityScore || 0);
                const riskColor = getRiskColor(post);
                const nlp = analyzePostFallback(post.text);

                return (
                  <div
                    key={post.id}
                    className="p-4 transition-colors"
                    style={{
                      borderLeft: maxRisk > 60 ? `3px solid ${riskColor}` : "3px solid transparent",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  >
                    {/* Post header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold shrink-0"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--accent)" }}
                        >
                          {post.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                              {post.displayName}
                            </span>
                            <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                              @{post.username}
                            </span>
                            <PlatformIcon className="w-3 h-3 shrink-0" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                            <Clock className="w-3 h-3" />
                            {formatTime(post.timestamp)}
                            {post.followerCount > 0 && (
                              <><span>·</span><span>{post.followerCount.toLocaleString()} followers</span></>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Risk badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {maxRisk > 0 && (
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{
                              background: maxRisk > 60 ? "var(--sev-critical-bg)" : maxRisk > 30 ? "var(--sev-medium-bg)" : "var(--sev-low-bg)",
                              color: riskColor,
                              border: `1px solid ${riskColor}40`,
                            }}
                          >
                            Risk {maxRisk}
                          </span>
                        )}
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{
                            background: "var(--bg-elevated)",
                            color: nlp.sentiment === "Positive" ? "var(--sev-low)" : nlp.sentiment === "Negative" ? "var(--sev-critical)" : "var(--text-muted)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {nlp.sentiment}
                        </span>
                      </div>
                    </div>

                    {/* Text */}
                    <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--text-primary)" }}>
                      {post.text}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.hashtags.slice(0, 6).map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5"
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                              color: "var(--accent)",
                            }}
                          >
                            <Hash className="w-2.5 h-2.5" />
                            {h.replace("#", "")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* URLs */}
                    {post.url && (
                      <div
                        className="px-2.5 py-1.5 rounded flex items-center gap-1.5 text-[11px] font-mono mb-2"
                        style={{
                          background: "var(--bg-base)",
                          border: "1px solid var(--border)",
                          color: "var(--accent)",
                        }}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                        <span className="truncate">{post.url}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded shrink-0 ml-auto"
                          style={{
                            background: "var(--sev-medium-bg)",
                            color: "var(--sev-medium)",
                            border: "1px solid var(--sev-medium-bd)",
                          }}
                        >
                          External Link
                        </span>
                      </div>
                    )}

                    {/* Mentions */}
                    {post.hashtags.length === 0 && (
                      <div></div>
                    )}

                    {/* Threat indicators */}
                    {maxRisk > 50 && nlp.threatIndicators.filter(i => !i.includes("No severe")).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {nlp.threatIndicators.slice(0, 2).map((ind, i) => (
                          <div
                            key={i}
                            className="px-2.5 py-1.5 rounded text-[11px] flex items-center gap-2"
                            style={{
                              background: "var(--sev-critical-bg)",
                              borderLeft: "2px solid var(--sev-critical)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: "var(--sev-critical)" }} />
                            {ind}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer: engagement + analyze */}
                    <div
                      className="mt-2.5 pt-2 flex items-center justify-between text-[10px] font-mono"
                      style={{ borderTop: "1px solid var(--border-muted)", color: "var(--text-muted)" }}
                    >
                      <div className="flex items-center gap-4">
                        <span>♥ {post.likes}</span>
                        <span>↺ {post.shares}</span>
                        <span>💬 {post.comments}</span>
                        {post.hashtags.some(h => h.toLowerCase().includes("@")) && (
                          <span className="flex items-center gap-1">
                            <AtSign className="w-3 h-3" />
                            Mention
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onAnalyzePost(post)}
                        className="text-[11px] font-medium flex items-center gap-1 transition-all"
                        style={{ color: "var(--accent)" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.color = "var(--accent-hover)";
                          (e.currentTarget as HTMLElement).style.transform = "translateX(2px)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                          (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                        }}
                      >
                        <Zap className="w-3 h-3" />
                        Deep Analyze →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Architecture info panel */}
      <div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
        <div>
          <span className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-primary)" }}>
            How it works
          </span>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            The Python X connector streams matching tweets from the X Filtered Stream v2 API.
            Each tweet is normalized to SentinelEvent format and relayed to this dashboard via Server-Sent Events (SSE).
            NLP analysis (Gemini or offline fallback) runs automatically on every incoming post,
            feeding the same cyberbullying, toxicity, and threat pipeline used across all other views.
            All X credential handling happens exclusively in the Python process — the browser and Node.js server never see the Bearer Token.
          </p>
        </div>
      </div>
    </div>
  );
};

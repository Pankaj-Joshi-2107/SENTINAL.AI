import React from "react";
import { Post } from "../types";
import { Heart, MessageCircle, Share2, Twitter, Instagram, Linkedin, Globe, ExternalLink } from "lucide-react";

interface PostCardProps {
  post: Post;
  onAnalyze?: (post: Post) => void;
  onSelectAccount?: (username: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onAnalyze, onSelectAccount }) => {
  const getPlatformIcon = () => {
    switch (post.platform) {
      case "twitter": return <Twitter className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />;
      case "instagram": return <Instagram className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />;
      case "linkedin": return <Linkedin className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />;
      default: return <Globe className="w-3 h-3" style={{ color: "var(--text-muted)" }} />;
    }
  };

  const isCoordinated = post.scenario === "coordinated" || Boolean(post.campaignId);
  const isHighRisk = (post.cyberbullyingRisk || 0) > 60 || (post.toxicityScore || 0) > 60;
  const isCyberbullying = post.scenario === "cyberbullying";

  const getSentimentDot = () => {
    if (post.sentiment === "positive")
      return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--sev-low)" }} />;
    if (post.sentiment === "negative")
      return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--sev-critical)" }} />;
    return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--text-muted)" }} />;
  };

  const getSentimentLabel = () => {
    if (post.sentiment === "positive") return { label: "Positive", color: "var(--sev-low)" };
    if (post.sentiment === "negative") return { label: "Negative", color: "var(--sev-critical)" };
    return { label: "Neutral", color: "var(--text-muted)" };
  };

  const sentimentInfo = getSentimentLabel();

  return (
    <div
      id={`post-card-${post.id}`}
      className="rounded-xl p-4 transition-all duration-200 relative group"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
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
      {/* Header: Author & Risk status pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => onSelectAccount && onSelectAccount(post.username)}
            className="w-8 h-8 rounded-full font-mono font-semibold text-[11px] flex items-center justify-center shrink-0 transition-transform active:scale-95"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--accent)",
            }}
          >
            {post.username.slice(0, 2).toUpperCase()}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <button
                onClick={() => onSelectAccount && onSelectAccount(post.username)}
                className="text-[13px] font-semibold truncate transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
              >
                {post.displayName}
              </button>
              <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                @{post.username}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1 capitalize">
                {getPlatformIcon()}
                {post.platform}
              </span>
              <span>·</span>
              <span className="font-mono">
                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Severity / Scenario Pill */}
        <div className="shrink-0 flex items-center gap-1.5">
          {isCoordinated ? (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
              style={{
                background: "var(--sev-critical-bg)",
                color: "var(--sev-critical)",
                border: "1px solid var(--sev-critical-bd)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--sev-critical)" }} />
              Coordinated
            </span>
          ) : isCyberbullying || isHighRisk ? (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
              style={{
                background: "var(--sev-high-bg)",
                color: "var(--sev-high)",
                border: "1px solid var(--sev-high-bd)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--sev-high)" }} />
              High Risk
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: sentimentInfo.color }}>
              {getSentimentDot()}
              {sentimentInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Post Text */}
      <p
        className="mt-3 text-[13px] leading-relaxed select-text"
        style={{ color: "var(--text-primary)" }}
      >
        {post.text}
      </p>

      {/* Obfuscated / Flagged Link Chip */}
      {post.url && (
        <div
          className="mt-2.5 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-mono transition-colors"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-1.5 truncate" style={{ color: "var(--accent)" }}>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
            <span className="truncate">{post.url}</span>
          </div>
          <span
            className="text-[9px] font-sans font-medium px-1.5 py-0.5 rounded shrink-0 ml-2"
            style={{
              background: "var(--sev-medium-bg)",
              color: "var(--sev-medium)",
              border: "1px solid var(--sev-medium-bd)",
            }}
          >
            Obfuscated Link
          </span>
        </div>
      )}

      {/* Engagement Footer */}
      <div
        className="mt-3 pt-2.5 flex items-center justify-between text-[11px]"
        style={{ borderTop: "1px solid var(--border-muted)" }}
      >
        <div className="flex items-center gap-4 font-mono" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5 transition-colors">
            <Heart className="w-3.5 h-3.5" /> {post.likes}
          </span>
          <span className="flex items-center gap-1.5 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
          </span>
          <span className="flex items-center gap-1.5 transition-colors">
            <Share2 className="w-3.5 h-3.5" /> {post.shares}
          </span>
        </div>

        {onAnalyze && (
          <button
            onClick={() => onAnalyze(post)}
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
            <span>Analyze</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};

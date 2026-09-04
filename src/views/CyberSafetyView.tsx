import React, { useState } from "react";
import { Post } from "../types";
import { analyzePostFallback } from "../utils/fallbackNLP";
import { ThreatBadge } from "../components/ThreatBadge";
import {
  ShieldCheck,
  Info,
  CornerDownRight
} from "lucide-react";

interface CyberSafetyViewProps {
  posts: Post[];
  onAnalyzePost: (post: Post) => void;
}

export const CyberSafetyView: React.FC<CyberSafetyViewProps> = ({
  posts,
  onAnalyzePost
}) => {
  const harassmentPosts = posts.filter(
    (p) => (p.cyberbullyingRisk || 0) > 40 || (p.toxicityScore || 0) > 40 || p.scenario === "cyberbullying"
  );

  const [selectedPost, setSelectedPost] = useState<Post>(harassmentPosts[0] || posts[0]);
  const [customText, setCustomText] = useState<string>("");
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const textToAnalyze = useCustom ? customText : selectedPost?.text || "";
  const analysis = analyzePostFallback(textToAnalyze);

  const getRiskColor = () => {
    if (analysis.cyberbullyingRisk > 70) return "var(--sev-critical)";
    if (analysis.cyberbullyingRisk > 45) return "var(--sev-high)";
    if (analysis.cyberbullyingRisk > 25) return "var(--sev-medium)";
    return "var(--sev-low)";
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Cyber Safety & Harassment Detection
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Proactive identification of targeted harassment, hate speech, dogpiling, and digital bullying vectors.
          </p>
        </div>
        <span
          className="text-[11px] font-mono px-2.5 py-1 rounded shrink-0"
          style={{
            background: "var(--sev-medium-bg)",
            color: "var(--sev-medium)",
            border: "1px solid var(--sev-medium-bd)"
          }}
        >
          {harassmentPosts.length} incidents flagged
        </span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: incident selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Select incident or input text
              </h3>
              <div className="flex items-center gap-1.5">
                {[
                  { id: false, label: "Incidents" },
                  { id: true, label: "Custom" },
                ].map((mode) => (
                  <button
                    key={String(mode.id)}
                    onClick={() => {
                      setUseCustom(mode.id);
                      if (mode.id && !customText) {
                        setCustomText(
                          "You are an absolute fraud. Nobody likes your work and you should delete your account right now."
                        );
                      }
                    }}
                    className="text-[11px] px-2.5 py-1 rounded transition-colors font-mono"
                    style={{
                      background: useCustom === mode.id ? "var(--accent-subtle)" : "var(--bg-elevated)",
                      border: `1px solid ${useCustom === mode.id ? "var(--accent-border)" : "var(--border)"}`,
                      color: useCustom === mode.id ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {!useCustom ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {harassmentPosts.map((post) => {
                  const isSelected = selectedPost?.id === post.id;
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-3 rounded-md transition-colors cursor-pointer"
                      style={{
                        background: isSelected ? "var(--bg-elevated)" : "var(--bg-base)",
                        border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                        borderLeft: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          @{post.username}
                        </span>
                        <ThreatBadge level="HIGH" size="sm" showScore={post.cyberbullyingRisk || 78} />
                      </div>
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {post.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <label
                  className="text-[10px] font-mono block mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Text to analyze
                </label>
                <textarea
                  rows={7}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter text to analyze for cyberbullying / safety risks…"
                  className="w-full rounded-md p-3 text-[12px] leading-relaxed resize-none"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                  onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                  onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                />
              </div>
            )}
          </div>

          {/* Policy disclaimer */}
          <div
            className="rounded-lg p-4 flex items-start gap-2.5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-[11px] font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>
                Moderation & Safety Policy Notice
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                SENTINEL-AI operates as an advisory system. All flags support human trust and safety teams — no autonomous content removal.
              </p>
            </div>
          </div>
        </div>

        {/* Right: analysis results (7 cols) */}
        <div className="lg:col-span-7">
          <div
            className="rounded-lg p-5 space-y-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            {/* Status row */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 pb-4"
              style={{ borderBottom: "1px solid var(--border-muted)" }}
            >
              <div>
                <span className="text-[10px] font-mono block mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Safety status
                </span>
                <div className="flex items-center gap-2">
                  <ThreatBadge
                    level={
                      analysis.cyberbullyingRisk > 70
                        ? "CRITICAL"
                        : analysis.cyberbullyingRisk > 45
                        ? "HIGH"
                        : analysis.cyberbullyingRisk > 25
                        ? "MEDIUM"
                        : "LOW"
                    }
                    size="lg"
                    showScore={analysis.cyberbullyingRisk}
                  />
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                    Toxicity: {analysis.toxicityScore}/100
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono block mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Recommended action
                </span>
                <span
                  className="inline-flex items-center px-3 py-1 rounded text-[11px] font-mono font-semibold uppercase"
                  style={{
                    background:
                      analysis.recommendedAction === "ESCALATE"
                        ? "var(--sev-critical-bg)"
                        : analysis.recommendedAction === "FLAG FOR REVIEW"
                        ? "var(--sev-medium-bg)"
                        : "var(--sev-low-bg)",
                    color:
                      analysis.recommendedAction === "ESCALATE"
                        ? "var(--sev-critical)"
                        : analysis.recommendedAction === "FLAG FOR REVIEW"
                        ? "var(--sev-medium)"
                        : "var(--sev-low)",
                    border: `1px solid ${
                      analysis.recommendedAction === "ESCALATE"
                        ? "var(--sev-critical-bd)"
                        : analysis.recommendedAction === "FLAG FOR REVIEW"
                        ? "var(--sev-medium-bd)"
                        : "var(--sev-low-bd)"
                    }`,
                  }}
                >
                  {analysis.recommendedAction}
                </span>
              </div>
            </div>

            {/* Inspected text */}
            <div>
              <span className="text-[10px] font-mono block mb-1.5" style={{ color: "var(--text-muted)" }}>
                Analyzed text
              </span>
              <div
                className="p-3 rounded-md text-[12px] leading-relaxed italic"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                "{textToAnalyze}"
              </div>
            </div>

            {/* Risk gauge */}
            <div
              className="rounded-md p-4 space-y-2"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                  Harassment probability
                </span>
                <span className="font-mono font-bold text-base" style={{ color: getRiskColor() }}>
                  {analysis.cyberbullyingRisk} <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>/ 100</span>
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: "var(--bg-base)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${analysis.cyberbullyingRisk}%`,
                    background: `linear-gradient(90deg, var(--sev-low) 0%, var(--sev-medium) 50%, var(--sev-critical) 100%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
                <span>0 Low</span>
                <span>30 Medium</span>
                <span>60 High</span>
                <span>100 Critical</span>
              </div>
            </div>

            {/* Evidence markers */}
            {analysis.threatIndicators.length > 0 && (
              <div>
                <h4
                  className="text-[11px] font-medium mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Detected evidence & linguistic markers
                </h4>
                <div className="space-y-1.5">
                  {analysis.threatIndicators.map((ind, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-md text-[12px] flex items-start gap-2.5"
                      style={{
                        background: "var(--sev-critical-bg)",
                        borderLeft: "2px solid var(--sev-critical)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--sev-critical)" }} />
                      <div>
                        <strong style={{ color: "var(--sev-critical)" }}>Marker {i + 1}: </strong>
                        <span>{ind}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <h4 className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                Safety explanation
              </h4>
              <p
                className="text-[12px] leading-relaxed p-3 rounded-md"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {analysis.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

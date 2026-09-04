import React, { useState } from "react";
import { AnalysisResult, Post } from "../types";
import { analyzePostFallback } from "../utils/fallbackNLP";
import { ThreatBadge } from "../components/ThreatBadge";
import {
  SearchCode,
  Send,
  RefreshCw,
  Info,
  AlertTriangle,
  Tag,
  Zap
} from "lucide-react";

interface PostAnalyzerViewProps {
  initialPost?: Post | null;
}

const SAMPLE_POSTS = [
  {
    label: "Normal Discussion",
    text: "Excited to see modern grid-scale solar efficiency hitting new peaks this quarter. Distributed battery storage is making decentralized clean power viable! #RenewableEnergy #Sustainability #CleanTech"
  },
  {
    label: "Cyberbullying",
    text: "Look at this absolute fraud @aarav_climate acting like an expert. You know nothing, your research is a joke and you belong in the trash. Delete your account right now! #ExposeThem #FraudAlert"
  },
  {
    label: "Coordinated Astroturf",
    text: "Expose the fraud NOW before it spreads! The entire solar agenda is a massive taxpayer scam designed to bankrupt our power grid. Read the leaked files here: https://bit.ly/grid-dossier-2026 #CleanEnergyHoax #SolarScam #GreenTaxLies"
  }
];

export const PostAnalyzerView: React.FC<PostAnalyzerViewProps> = ({ initialPost }) => {
  const [inputText, setInputText] = useState<string>(
    initialPost ? initialPost.text : SAMPLE_POSTS[0].text
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(() =>
    analyzePostFallback(initialPost ? initialPost.text : SAMPLE_POSTS[0].text)
  );

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (data.success && data.analysis) {
        const a = data.analysis;
        setAnalysis({
          sentiment: a.sentiment || "Neutral",
          sentimentScore: a.sentimentScore || 0,
          confidence: a.confidence || 88,
          emotion: a.emotion || "Neutral",
          intent: a.intent || "Discussion",
          toxicityScore: a.toxicityScore || 0,
          cyberbullyingRisk: a.cyberbullyingRisk || 0,
          threatIndicators: a.threatIndicators || [],
          topics: a.topics || [],
          explanation: a.explanation || "",
          recommendedAction: a.recommendedAction || "NO ACTION",
          isFallback: false,
          source: "Powered by Gemini"
        });
      } else {
        setAnalysis(analyzePostFallback(inputText));
      }
    } catch (err) {
      setAnalysis(analyzePostFallback(inputText));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "ESCALATE": return "var(--sev-critical)";
      case "FLAG FOR REVIEW": return "var(--sev-medium)";
      case "MONITOR": return "var(--accent)";
      default: return "var(--sev-low)";
    }
  };

  const getActionBg = (action: string) => {
    switch (action) {
      case "ESCALATE": return "var(--sev-critical-bg)";
      case "FLAG FOR REVIEW": return "var(--sev-medium-bg)";
      case "MONITOR": return "var(--accent-subtle)";
      default: return "var(--sev-low-bg)";
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Post Analyzer
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Deep NLP analysis for toxicity, cyberbullying, coordinated indicators, and moderation actions.
          </p>
        </div>
        {analysis && (
          <span
            className="text-[11px] font-mono px-2.5 py-1 rounded shrink-0 flex items-center gap-1.5"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)"
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: analysis.isFallback ? "var(--sev-medium)" : "var(--sev-low)" }}
            />
            {analysis.source}
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input */}
        <div className="lg:col-span-5 space-y-3">
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Analyze a post
              </h3>
              <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                {inputText.length} chars
              </span>
            </div>

            {/* Quick-pick samples */}
            <div>
              <span className="text-[10px] font-mono block mb-2" style={{ color: "var(--text-muted)" }}>
                Demo scenarios
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_POSTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(sample.text)}
                    className="text-[11px] px-2.5 py-1 rounded transition-colors"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="textarea-post-analyzer"
              rows={7}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a social-media post here…"
              className="w-full rounded-md p-3 text-[13px] resize-none leading-relaxed"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
            />

            <button
              id="btn-analyze-sentinel-ai"
              disabled={isAnalyzing || !inputText.trim()}
              onClick={handleAnalyze}
              className="w-full py-2.5 px-4 rounded-md text-[13px] font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: isAnalyzing || !inputText.trim() ? "var(--bg-elevated)" : "var(--accent)",
                color: isAnalyzing || !inputText.trim() ? "var(--text-muted)" : "#fff",
                cursor: isAnalyzing || !inputText.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze with Sentinel AI</span>
                </>
              )}
            </button>
          </div>

          {/* NLP note */}
          <div
            className="rounded-lg p-4 flex items-start gap-2.5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
            <div>
              <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                Resilient NLP architecture
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Attempts Gemini analysis server-side. Falls back to deterministic offline NLP if unavailable.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Analysis Results */}
        <div className="lg:col-span-7">
          {analysis ? (
            <div
              className="rounded-lg p-5 space-y-5"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              {/* Action + confidence */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 pb-4"
                style={{ borderBottom: "1px solid var(--border-muted)" }}
              >
                <div>
                  <span className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>
                    Recommended action
                  </span>
                  <div
                    id="badge-recommended-action"
                    className="inline-flex items-center gap-2 px-3 py-1 rounded text-[12px] font-semibold uppercase tracking-wide"
                    style={{
                      background: getActionBg(analysis.recommendedAction),
                      color: getActionColor(analysis.recommendedAction),
                      border: `1px solid ${getActionColor(analysis.recommendedAction)}40`,
                    }}
                  >
                    {analysis.recommendedAction}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>Confidence</span>
                  <span className="text-xl font-semibold font-mono" style={{ color: "var(--accent)" }}>
                    {analysis.confidence}%
                  </span>
                </div>
              </div>

              {/* Metric grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Sentiment", value: analysis.sentiment, sub: `Score: ${analysis.sentimentScore}`,
                    color: analysis.sentiment === "Positive" ? "var(--sev-low)" : analysis.sentiment === "Negative" ? "var(--sev-critical)" : "var(--text-muted)" },
                  { label: "Emotion", value: analysis.emotion, sub: "Affective valence", color: "var(--chart-2)" },
                  { label: "Toxicity", value: `${analysis.toxicityScore}/100`, sub: "Toxicity index",
                    color: analysis.toxicityScore > 60 ? "var(--sev-critical)" : analysis.toxicityScore > 30 ? "var(--sev-medium)" : "var(--sev-low)" },
                  { label: "Cyber risk", value: `${analysis.cyberbullyingRisk}/100`, sub: "Safety metric",
                    color: analysis.cyberbullyingRisk > 60 ? "var(--sev-critical)" : analysis.cyberbullyingRisk > 30 ? "var(--sev-medium)" : "var(--sev-low)" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-md"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>
                      {m.label}
                    </span>
                    <span className="text-[15px] font-semibold font-mono block" style={{ color: m.color }}>
                      {m.value}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <h4 className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Explanation
                </h4>
                <div
                  className="p-3 rounded-md text-[12px] leading-relaxed"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  {analysis.explanation}
                </div>
              </div>

              {/* Threat Indicators */}
              {analysis.threatIndicators.length > 0 && (
                <div>
                  <h4
                    className="text-[11px] font-medium mb-2 flex items-center gap-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--sev-critical)" }} />
                    Threat indicators
                  </h4>
                  <div className="space-y-1.5">
                    {analysis.threatIndicators.map((ind, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-md text-[12px] flex items-center gap-2"
                        style={{
                          background: "var(--sev-critical-bg)",
                          borderLeft: "2px solid var(--sev-critical)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--sev-critical)" }} />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics + Intent */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3"
                style={{ borderTop: "1px solid var(--border-muted)" }}
              >
                <div>
                  <h4 className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Extracted topics
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.topics.map((top, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--accent)",
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Author intent
                  </h4>
                  <div
                    className="p-2 rounded-md text-[12px] font-mono"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {analysis.intent}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg p-12 text-center"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              Select a post or enter text to run analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

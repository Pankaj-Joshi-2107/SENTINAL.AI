import React from "react";
import { Settings, Shield, Cpu, RefreshCw, CheckCircle2, Terminal } from "lucide-react";

interface SettingsViewProps {
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Settings, Architecture & Ethics
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            System specifications, ethical safety guardrails, and weighted threat formulas.
          </p>
        </div>
        <span
          className="text-[11px] font-mono px-2.5 py-1 rounded shrink-0 flex items-center gap-1.5"
          style={{
            background: "var(--sev-low-bg)",
            color: "var(--sev-low)",
            border: "1px solid var(--sev-low-bd)"
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Compliant & secure
        </span>
      </div>

      {/* Team card */}
      <div
        className="rounded-lg p-5 space-y-3"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: "1px solid var(--border-muted)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[var(--border)] shadow-sm"
              style={{ background: "#111215" }}
            >
              <img
                src="/sentinel-shield.png"
                alt="Sentinel AI Emblem"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Team Syntrix · Smart India Hackathon
              </h3>
              <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                Social Threat Intelligence & Coordinated Disinformation Defense Platform
              </span>
            </div>
          </div>
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded shrink-0"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--accent)"
            }}
          >
            Threat Intel
          </span>
        </div>

        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          SENTINEL-AI was engineered to bridge social media analytics and national cyber safety. Unlike commercial monitoring
          platforms that merely count keyword frequency, SENTINEL-AI correlates sentiment drops, temporal bursts, phrase overlap,
          and account creation timelines to uncover hidden coordinated astroturfing campaigns.
        </p>
      </div>

      {/* Architecture + Formula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Formula */}
        <div
          className="rounded-lg p-5 space-y-3"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Explainable threat scoring formula
            </h3>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Every threat score is fully auditable and deterministic — a weighted linear combination of 5 orthogonal defense vectors:
          </p>

          <div
            className="rounded-md p-3 font-mono text-[12px] space-y-2"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <div
              className="text-[11px] font-bold pb-2"
              style={{ borderBottom: "1px solid var(--border-muted)", color: "var(--accent)" }}
            >
              THREAT_SCORE =
            </div>
            {[
              { label: "0.30 × NLP Risk Score", weight: "30% Weight", color: "var(--accent)" },
              { label: "0.20 × Coordination Score", weight: "20% Weight", color: "var(--chart-2)" },
              { label: "0.20 × Account Behavior Score", weight: "20% Weight", color: "var(--chart-3)" },
              { label: "0.15 × Content Similarity Score", weight: "15% Weight", color: "var(--sev-medium)" },
              { label: "0.15 × Historical Campaign Match", weight: "15% Weight", color: "var(--sev-critical)" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between" style={{ color: "var(--text-primary)" }}>
                <span>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NLP Pipeline */}
        <div
          className="rounded-lg p-5 space-y-3"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Resilient dual-tier NLP pipeline
            </h3>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Engineered for bulletproof execution with zero failure modes:
          </p>
          <ul className="space-y-2 text-[12px]">
            {[
              {
                label: "Tier 1 — Gemini 2.5 Flash",
                desc: "Deep semantic entity recognition, sarcasm detection, and intent classification via secure server-side Express proxy.",
                color: "var(--accent)",
              },
              {
                label: "Tier 2 — Deterministic offline NLP",
                desc: "Built-in rule engine executing lexicon scoring, profanity/cyberbullying dictionaries, and TF-IDF similarity if API or network is unavailable.",
                color: "var(--sev-low)",
              },
            ].map((tier) => (
              <li
                key={tier.label}
                className="p-3 rounded-md flex items-start gap-2.5"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              >
                <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: tier.color }} />
                <div>
                  <strong className="block mb-0.5" style={{ color: "var(--text-primary)" }}>{tier.label}:</strong>
                  <span style={{ color: "var(--text-secondary)" }}>{tier.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Data representation notice */}
      <div
        className="rounded-lg p-5 space-y-3"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "var(--sev-medium)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Transparent data representation notice
          </h3>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          In this evaluation deployment, SENTINEL-AI operates on a high-fidelity synthetic benchmark dataset designed to demonstrate complex edge cases
          (organic discussion, coordinated bot swarms, cyberbullying spikes) reliably without exposing live third-party personal data.
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          The platform's ingestion layer is architected for plug-and-play integration with authorized social media enterprise APIs
          (X/Twitter v2 filtered streams, Meta Graph API, Reddit API, LinkedIn Developer API, or custom Kafka/PubSub pipelines)
          in enterprise and law enforcement deployments.
        </p>
      </div>

      {/* Reset */}
      <div
        className="rounded-lg p-5 flex items-center justify-between gap-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div>
          <h4 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Reset benchmark dataset
          </h4>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Restore default synthetic stream posts, alerts, and campaign nodes
          </span>
        </div>
        <button
          id="btn-reset-all-data"
          onClick={onResetData}
          className="px-4 py-2 rounded-md text-[12px] font-semibold flex items-center gap-2 transition-colors shrink-0"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--sev-critical)",
            border: "1px solid var(--sev-critical-bd)"
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sev-critical-bg)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset all data
        </button>
      </div>
    </div>
  );
};

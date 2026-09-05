import React from "react";
import {
  ShieldAlert,
  ArrowRight,
  Zap,
  Activity,
  Network,
  Users,
  Eye,
  TrendingUp,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Radio,
  FileCheck,
  CheckCircle2,
  Lock,
  Globe,
  Share2,
  Compass,
  Database
} from "lucide-react";
import {
  XLogo,
  TelegramLogo,
  InstagramLogo,
  FacebookLogo,
  RedditLogo,
  YouTubeLogo
} from "../components/SocialLogos";

interface LandingPageViewProps {
  onNavigateToLogin: () => void;
  onNavigateToDashboard: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigateToLogin,
  onNavigateToDashboard
}) => {
  return (
    <div
      className="min-h-screen text-[var(--text-primary)] select-none"
      style={{
        background: "var(--bg-base)",
        backgroundImage:
          "radial-gradient(circle at 50% -120px, rgba(229, 169, 60, 0.07), transparent 60%), radial-gradient(circle at 100% 400px, rgba(255, 255, 255, 0.02), transparent 50%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 1. Top Navigation Bar */}
      <header
        className="sticky top-0 z-50 px-6 lg:px-12 py-4 flex items-center justify-between transition-all"
        style={{
          background: "rgba(19, 20, 24, 0.85)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div
            className="w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm border border-[var(--border)] flex items-center justify-center"
            style={{ background: "#111215" }}
          >
            <img
              src="/sentinel-shield.png"
              alt="Sentinel AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              SENTINEL
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                border: "1px solid var(--accent-border)",
              }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Center Anchor Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
          <a href="#problem" className="hover:text-[var(--text-primary)] transition-colors">
            Problem
          </a>
          <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
            Features
          </a>
          <a href="#platforms" className="hover:text-[var(--text-primary)] transition-colors">
            Coverage
          </a>
          <a href="#impact" className="hover:text-[var(--text-primary)] transition-colors">
            Impact
          </a>
          <a href="#capabilities" className="hover:text-[var(--text-primary)] transition-colors">
            Capabilities
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            id="nav-btn-launch"
            onClick={onNavigateToLogin}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "var(--accent-text-on)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.08)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.0)")}
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Main Headline */}
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-[1.15]"
          style={{ color: "var(--text-primary)" }}
        >
          Real-time social threat intelligence for{" "}
          <span style={{ color: "var(--accent)" }}>
            safer online communities
          </span>
        </h1>

        {/* Short & Accurate Subheadline */}
        <p
          className="mt-5 text-base sm:text-lg max-w-xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          AI-powered detection for sentiment shifts, coordinated campaigns, and emerging online threats.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            id="hero-btn-launch"
            onClick={onNavigateToLogin}
            className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #e5a93c 0%, #d49b2e 100%)",
              color: "var(--accent-text-on)",
              boxShadow: "0 4px 20px -2px rgba(229, 169, 60, 0.3)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.08)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.0)")}
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#features"
            className="px-5 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-active)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <span>See how it works</span>
          </a>
        </div>

        {/* Live Social Ingestion Strip with Real-Life Logos */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[var(--text-muted)]">
          <span className="text-[11px] tracking-wide uppercase">Actively ingesting live telemetry:</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.12)" }} title="X (Twitter)">
              <XLogo className="w-4 h-4 text-white" />
            </span>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ background: "rgba(36, 161, 222, 0.15)", border: "1px solid rgba(36, 161, 222, 0.3)" }} title="Telegram">
              <TelegramLogo className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ background: "rgba(225, 48, 108, 0.15)", border: "1px solid rgba(225, 48, 108, 0.3)" }} title="Instagram">
              <InstagramLogo className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ background: "rgba(24, 119, 242, 0.15)", border: "1px solid rgba(24, 119, 242, 0.3)" }} title="Facebook">
              <FacebookLogo className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ background: "rgba(255, 69, 0, 0.15)", border: "1px solid rgba(255, 69, 0, 0.3)" }} title="Reddit">
              <RedditLogo className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-sm" style={{ background: "rgba(255, 0, 0, 0.15)", border: "1px solid rgba(255, 0, 0, 0.3)" }} title="YouTube">
              <YouTubeLogo className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Framed Interactive Visual Preview */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl p-2 sm:p-3 transition-all relative group" style={{ background: "rgba(26, 27, 32, 0.8)", border: "1px solid var(--border)", boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)" }}>
          {/* Mac-style Window Controls */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-[var(--text-muted)] ml-2">sentinel.ai/dashboard · Live Intelligence Workstation</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              LIVE WORKSTATION
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-xl cursor-pointer"
            onClick={onNavigateToDashboard}
          >
            <img
              src="/dashboard-preview.png"
              alt="Sentinel AI Dashboard Preview"
              className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
              onError={(e) => {
                // Fallback graceful banner if image is still generating
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span
                className="px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xl"
                style={{ background: "var(--accent)", color: "var(--accent-text-on)" }}
              >
                <span>Enter Live Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section id="problem" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-medium tracking-wider uppercase" style={{ color: "var(--accent)" }}>
            Current Threat Landscape
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            The problem today.
          </h2>
          <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
            Modern disinformation, cyberbullying, and synthetic coordination exploit structural blindspots across isolated social networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Share2,
              title: "Fragmented & scattered social media signals",
              desc: "Threats emerge across fragmented platforms simultaneously with no unified cross-channel visibility.",
            },
            {
              icon: Activity,
              title: "Hard to understand public sentiment & emotions",
              desc: "Traditional tools only score basic polarity while missing nuanced anger, fear, and targeted hostility.",
            },
            {
              icon: Users,
              title: "Limited knowledge about audience & demographics",
              desc: "Bot swarms and sockpuppet rings mask their synthetic identities behind fabricated account metadata.",
            },
            {
              icon: TrendingUp,
              title: "Missing early trend or narrative shifts",
              desc: "Malicious astroturfing campaigns operate below viral thresholds until irreversible damage occurs.",
            },
            {
              icon: Network,
              title: "Unknown influence flow & coordinated campaigns",
              desc: "Complex multi-account puppeteering and synchronized copy-paste operations evade keyword filters.",
            },
            {
              icon: AlertTriangle,
              title: "Cyberbullying & online harassment go unnoticed",
              desc: "Coordinated dogpiling and toxic harassment campaigns bypass conventional word blocklists.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl transition-all duration-200 group"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-active)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    border: "1px solid var(--accent-border)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-medium tracking-wider uppercase" style={{ color: "var(--accent)" }}>
            Engineered Solution
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            5-in-1 intelligence, one platform.
          </h2>
          <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
            A comprehensive, multi-layer analytics architecture designed to fuse social listening with real-time cybersecurity defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              num: "01",
              title: "5-in-1 Intelligence",
              desc: "Combines sentiment, demographics, trends, network, and threat detection in one platform.",
              icon: Compass
            },
            {
              num: "02",
              title: "Cyber + Social Fusion",
              desc: "First approach to blend social media analytics with cybersecurity and cyberbullying protection.",
              icon: ShieldCheck
            },
            {
              num: "03",
              title: "Real-Time & Proactive",
              desc: "Detects threats and trends as they emerge, not after they go viral.",
              icon: Zap
            },
            {
              num: "04",
              title: "Context-Aware AI",
              desc: "Understands content, context, and connections for smarter decisions.",
              icon: Brain
            },
            {
              num: "05",
              title: "User Safety First",
              desc: "Built-in cyberbullying detection and community safety mechanisms.",
              icon: Lock
            },
            {
              num: "06",
              title: "Actionable Insights",
              desc: "Transforms raw data into clear insights, alerts, and next-best actions.",
              icon: FileCheck
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl relative overflow-hidden transition-all duration-200 group"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-active)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--accent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold font-mono" style={{ color: "var(--text-muted)" }}>
                    {item.num}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Platform Coverage Strip */}
      <section id="platforms" className="py-20 px-6 lg:px-12 border-t border-[var(--border)] relative overflow-hidden" style={{ background: "rgba(22, 23, 28, 0.45)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-medium tracking-wider uppercase" style={{ color: "var(--accent)" }}>
              Multi-Source Sensor Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
              Unified across 6+ social platforms.
            </h2>
            <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
              Continuous real-time ingestion, NLP sentiment parsing, and behavioral graph mapping across mainstream social ecosystems.
            </p>
          </div>

          {/* Real-Life Style Current Look Logos Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "X (Twitter)",
                handle: "@twitter",
                role: "Live Firehose",
                accentGlow: "rgba(255, 255, 255, 0.08)",
                borderActive: "rgba(255, 255, 255, 0.25)",
                icon: <XLogo className="w-5 h-5 text-white" />,
              },
              {
                name: "Telegram",
                handle: "t.me/channels",
                role: "Public Channels",
                accentGlow: "rgba(36, 161, 222, 0.12)",
                borderActive: "rgba(36, 161, 222, 0.4)",
                icon: <TelegramLogo className="w-5 h-5" />,
              },
              {
                name: "Instagram",
                handle: "@instagram",
                role: "Reels & Posts",
                accentGlow: "rgba(225, 48, 108, 0.12)",
                borderActive: "rgba(225, 48, 108, 0.4)",
                icon: <InstagramLogo className="w-5 h-5" />,
              },
              {
                name: "Facebook",
                handle: "fb.com/pages",
                role: "Pages & Groups",
                accentGlow: "rgba(24, 119, 242, 0.12)",
                borderActive: "rgba(24, 119, 242, 0.4)",
                icon: <FacebookLogo className="w-5 h-5" />,
              },
              {
                name: "Reddit",
                handle: "r/discussions",
                role: "Subreddits & Feeds",
                accentGlow: "rgba(255, 69, 0, 0.12)",
                borderActive: "rgba(255, 69, 0, 0.4)",
                icon: <RedditLogo className="w-5 h-5" />,
              },
              {
                name: "YouTube",
                handle: "yt.com/transcripts",
                role: "Transcripts & Shorts",
                accentGlow: "rgba(255, 0, 0, 0.12)",
                borderActive: "rgba(255, 0, 0, 0.4)",
                icon: <YouTubeLogo className="w-5 h-5" />,
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="group relative p-5 rounded-xl flex flex-col items-center text-center transition-all duration-300 cursor-default"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = p.accentGlow;
                  (e.currentTarget as HTMLElement).style.borderColor = p.borderActive;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 24px -6px ${p.accentGlow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Real-Life Official Logo Emblem */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-md transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "rgba(10, 11, 14, 0.6)", border: "1px solid rgba(255, 255, 255, 0.07)" }}
                >
                  {p.icon}
                </div>

                <div className="font-semibold text-sm tracking-tight mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </div>
                <div className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {p.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Impact Section */}
      <section id="impact" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-medium tracking-wider uppercase" style={{ color: "var(--accent)" }}>
            Measurable Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            Impact.
          </h2>
          <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
            Designed for cyber cells, moderation teams, brand custodians, and national narrative integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: "Immediate Threat Awareness",
              desc: "Instantly alerts analysts to coordinated astroturfing and artificial manipulation operations.",
            },
            {
              title: "National Narrative Protection",
              desc: "Safeguards public discourse from targeted foreign influence operations and malicious bot networks.",
            },
            {
              title: "Authentic Public Insight",
              desc: "Delivers precise clarity on genuine user sentiment by eliminating automated platform noise.",
            },
            {
              title: "Cross-Platform Resilience",
              desc: "Establishes a unified security and intelligence backbone operating across 6+ social networks simultaneously.",
            },
            {
              title: "Preserved Digital Trust",
              desc: "Protects online communities and public institutions from reputational damage and disinformation campaigns.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl flex flex-col justify-between transition-all duration-200"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--sev-low)" }} />
                  <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-muted)" }}>
                    BENCHMARK #{idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Unique Capabilities Strip */}
      <section id="capabilities" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-medium tracking-wider uppercase" style={{ color: "var(--accent)" }}>
            Proprietary Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            Unique capabilities.
          </h2>
          <p className="text-sm mt-3" style={{ color: "var(--text-secondary)" }}>
            Under-the-hood algorithmic innovations developed for modern social media intelligence and threat defense.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Cyberbullying Detection",
              desc: "Maps harassment signatures to vector embeddings to instantly identify coordinated online bullying across platforms.",
            },
            {
              title: "Dual-Layer Framework",
              desc: "Merges traditional audience analytics with an automated cybersecurity defence layer.",
            },
            {
              title: "Coordination Fingerprinting",
              desc: "Calculates a 0–100 Threat Risk Score using 4-factor behavioural heuristics.",
            },
            {
              title: "Historical Campaign Matcher",
              desc: "Uses vector search to match active manipulation campaigns against historic threat signatures.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center mb-3 text-xs font-bold font-mono"
                style={{
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                {idx + 1}
              </div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Closing CTA Band */}
      <section className="py-20 px-6 lg:px-12 border-t border-[var(--border)]" style={{ background: "rgba(26, 27, 32, 0.6)" }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Official Emblem */}
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6 shadow-2xl border border-[var(--border)] flex items-center justify-center"
            style={{
              background: "#111215",
              boxShadow: "0 12px 36px -6px rgba(229, 169, 60, 0.25)",
            }}
          >
            <img
              src="/sentinel-shield.png"
              alt="Sentinel AI Emblem"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            See Sentinel-AI in action.
          </h2>
          <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Explore the live threat intelligence console, examine live campaign graphs, and trigger synthetic disinformation swarms.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              id="cta-band-btn-launch"
              onClick={onNavigateToLogin}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #e5a93c 0%, #d49b2e 100%)",
                color: "var(--accent-text-on)",
                boxShadow: "0 6px 24px -3px rgba(229, 169, 60, 0.35)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.08)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.0)")}
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Minimal Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[var(--border)] text-center text-xs font-mono" style={{ color: "var(--text-muted)" }}>
        Team Syntrix · Smart India Hackathon 2026 · Social Media Analytics · Theme: Smart Automation
      </footer>
    </div>
  );
};

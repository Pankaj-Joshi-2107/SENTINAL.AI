import React, { useState } from "react";
import { ShieldAlert, ArrowRight, ArrowLeft, Lock, Mail, Key } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState("analyst@syntrix.ai");
  const [password, setPassword] = useState("••••••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between items-center p-6 select-none"
      style={{
        background: "var(--bg-base)",
        backgroundImage:
          "radial-gradient(circle at 50% 20%, rgba(229, 169, 60, 0.05), transparent 50%)",
      }}
    >
      {/* Top back navigation */}
      <div className="w-full max-w-md pt-4">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>
      </div>

      {/* Centered Login Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 my-auto shadow-2xl relative"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-xl border border-[var(--border)] flex items-center justify-center"
            style={{
              background: "#111215",
              boxShadow: "0 8px 30px -4px rgba(229, 169, 60, 0.2)",
            }}
          >
            <img
              src="/sentinel-shield.png"
              alt="Sentinel AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 leading-none">
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
          <h2 className="text-xl font-bold mt-4" style={{ color: "var(--text-primary)" }}>
            Access the Intelligence Center
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Sign in to access real-time social threat telemetry
          </p>
        </div>

        {/* Mock Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                id="login-input-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@syntrix.ai"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-mono outline-none transition-all"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-active)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Security passkey
              </label>
              <span className="text-[10px] font-mono" style={{ color: "var(--accent)" }}>
                Pre-filled for demo
              </span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                id="login-input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-mono outline-none transition-all"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-active)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            id="login-btn-submit"
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] mt-2"
            style={{
              background: "linear-gradient(135deg, #e5a93c 0%, #d49b2e 100%)",
              color: "var(--accent-text-on)",
              boxShadow: "0 4px 14px -2px rgba(229, 169, 60, 0.3)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.08)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = "brightness(1.0)")}
          >
            <span>Sign In to Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo environment note */}
        <div
          className="mt-5 p-3 rounded-xl text-center text-[11px]"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <span className="font-semibold block mb-0.5">Demo Environment</span>
          Any credentials will grant access for hackathon evaluation.
        </div>

        {/* Skip action */}
        <div className="mt-4 text-center">
          <button
            id="login-btn-guest"
            onClick={onLoginSuccess}
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            Continue as guest →
          </button>
        </div>
      </div>

      {/* Login Footer line */}
      <div className="py-4 text-center text-xs font-mono" style={{ color: "var(--text-muted)" }}>
        Smart India Hackathon 2026 · Team Syntrix
      </div>
    </div>
  );
};

import React from "react";
import { CheckCircle2, Info, X } from "lucide-react";

export type ToastTone = "success" | "info";

interface ToastProps {
  message: string;
  tone?: ToastTone;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, tone = "success", onClose }) => (
  <div
    role="status"
    className="fixed right-5 bottom-5 z-[60] flex max-w-sm items-start gap-3 rounded-lg p-3 shadow-lg"
    style={{
      background: "var(--bg-surface)",
      border: `1px solid ${tone === "success" ? "var(--sev-low-bd)" : "var(--border)"}`,
    }}
  >
    {tone === "success" ? (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--sev-low)" }} />
    ) : (
      <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
    )}
    <span className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>{message}</span>
    <button aria-label="Dismiss notification" onClick={onClose} style={{ color: "var(--text-muted)" }}>
      <X className="h-4 w-4" />
    </button>
  </div>
);

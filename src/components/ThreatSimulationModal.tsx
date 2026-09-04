import React, { useState, useEffect } from "react";
import { X, Play, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { ThreatBadge } from "./ThreatBadge";

interface ThreatSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSimulation: () => void;
  onInvestigateCampaign: () => void;
}

const STEPS = [
  { id: 1, label: "Receiving simulated social stream...", desc: "Ingesting incoming 8 high-velocity posts across synthetic nodes" },
  { id: 2, label: "Sentiment analyzed", desc: "Negative sentiment spiked to 88% across Renewable Energy nodes" },
  { id: 3, label: "Topics detected", desc: "Clustering detected #CleanEnergyHoax surge with 98% phrase overlap" },
  { id: 4, label: "Behavior analyzed", desc: "Identified burst posting anomaly from 8 accounts created within 14 days" },
  { id: 5, label: "Coordination analyzed", desc: "Calculated 92% cross-account coordination across time & content" },
  { id: 6, label: "Threat score calculated", desc: "Applied formula (30% NLP + 20% Coord + 20% Acct + 15% Sim + 15% Hist)" },
  { id: 7, label: "COORDINATED ACTIVITY DETECTED", desc: "Actionable alert generated for human safety and moderation teams" },
];

export const ThreatSimulationModal: React.FC<ThreatSimulationModalProps> = ({
  isOpen,
  onClose,
  onCompleteSimulation,
  onInvestigateCampaign,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsRunning(false);
      setIsFinished(false);
    }
  }, [isOpen]);

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsFinished(false);
    setCurrentStep(1);

    // Sequence runs across 4.2 seconds (approx 600ms per step)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 7) {
          clearInterval(interval);
          setIsRunning(false);
          setIsFinished(true);
          onCompleteSimulation();
          return 7;
        }
        return prev + 1;
      });
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl overflow-hidden flex flex-col rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md" style={{ background: 'var(--sev-critical-bg)', color: 'var(--sev-critical)' }}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Threat Simulation
                <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                  Scenario C
                </span>
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Demonstrates real-time correlation: stream, sentiment, behavioral bursts, and coordination scoring.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>Pipeline execution</span>
              <span>{Math.round((currentStep / 7) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>

          {/* Stepper Display */}
          <div className="space-y-2 rounded-lg p-4 max-h-[280px] overflow-y-auto" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
            {STEPS.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isPending = currentStep < step.id;

              return (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-2.5 rounded-md transition-all"
                  style={{
                    background: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                    border: `1px solid ${isCurrent ? 'var(--accent-border)' : 'transparent'}`,
                    opacity: isPending ? 0.4 : 1,
                  }}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--sev-low)' }} />
                    ) : isCurrent ? (
                      <Activity className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold flex items-center justify-between">
                      <span style={{ color: isCurrent ? 'var(--accent)' : isPast ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        Step {step.id}: {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                          Processing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result Banner when finished */}
          {isFinished && (
            <div className="p-4 rounded-lg animate-in zoom-in-95 duration-200" style={{ background: 'var(--sev-critical-bg)', border: '1px solid var(--sev-critical-bd)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: 'var(--sev-critical)' }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--sev-critical)' }}>
                    ⚠ Coordinated activity detected
                  </span>
                </div>
                <ThreatBadge level="CRITICAL" showScore={87} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center font-mono" style={{ borderTop: '1px solid var(--sev-critical-bd)' }}>
                {[
                  { label: 'Coordination', val: '92%', color: 'var(--sev-critical)' },
                  { label: 'Threat score', val: '87 / 100', color: 'var(--sev-critical)' },
                  { label: 'Accounts', val: '8', color: 'var(--text-primary)' },
                  { label: 'Burst window', val: '5 mins', color: 'var(--accent)' },
                ].map(stat => (
                  <div key={stat.label} className="p-2 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <span className="text-[10px] block mb-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    <span className="text-base font-bold" style={{ color: stat.color }}>{stat.val}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Disinformation burst identified using identical hashtag cluster (<span style={{ color: 'var(--accent)' }}>#CleanEnergyHoax</span>) and obfuscated bit.ly link targets.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>Mode: Synthetic stream injection</span>
          <div className="flex items-center gap-2">
            {!isRunning && !isFinished ? (
              <button
                id="btn-trigger-simulation"
                onClick={startSimulation}
                className="px-4 py-2 rounded-md text-[13px] font-semibold flex items-center gap-2 transition-colors"
                style={{ background: 'var(--accent)', color: 'var(--accent-text-on)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent)'}
              >
                <Play className="w-4 h-4 fill-current" />
                Start 5-second simulation
              </button>
            ) : isRunning ? (
              <button
                disabled
                className="px-4 py-2 rounded-md text-[12px] font-medium flex items-center gap-2 cursor-not-allowed"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <Activity className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                Simulation in progress…
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={startSimulation}
                  className="px-3.5 py-2 rounded-md text-[12px] transition-colors"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'}
                >
                  Run again
                </button>
                <button
                  id="btn-investigate-campaign-sim"
                  onClick={() => { onClose(); onInvestigateCampaign(); }}
                  className="px-4 py-2 rounded-md text-[12px] font-semibold flex items-center gap-2 transition-colors"
                  style={{ background: 'var(--sev-critical)', color: '#fff' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >
                  <span>Investigate campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Account, Post } from "../types";
import { X, ShieldAlert, CheckCircle, AlertOctagon, UserCheck, Twitter, Hash, Activity } from "lucide-react";
import { ThreatBadge } from "./ThreatBadge";

interface AccountIntelligenceDrawerProps {
  account: Account | null;
  posts: Post[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCampaign?: (campaignId: string) => void;
}

export const AccountIntelligenceDrawer: React.FC<AccountIntelligenceDrawerProps> = ({
  account,
  posts,
  isOpen,
  onClose,
  onSelectCampaign
}) => {
  if (!isOpen || !account) return null;

  const accountPosts = posts.filter((p) => p.username === account.username);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200" style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Account Intelligence
            </h3>
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

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Identity Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full font-mono font-semibold text-base flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
              >
                {account.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  {account.displayName}
                  {account.verified && <UserCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
                </h4>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>@{account.username}</span>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Account age: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{account.accountAgeDays} days</span>
                </div>
              </div>
            </div>
            <ThreatBadge level={account.riskLevel} size="md" showScore={account.behaviorScore} />
          </div>

          {account.bio && (
            <p className="text-[12px] p-3 rounded-md italic leading-relaxed" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              "{account.bio}"
            </p>
          )}

          {/* Key Behavioral Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <span className="text-[10px] font-mono block mb-1" style={{ color: 'var(--text-muted)' }}>
                Behavior risk score
              </span>
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: account.behaviorScore > 75 ? 'var(--sev-critical)' : account.behaviorScore > 40 ? 'var(--sev-medium)' : 'var(--sev-low)' }}
              >
                {account.behaviorScore} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 100</span>
              </span>
            </div>

            <div className="p-3 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <span className="text-[10px] font-mono block mb-1" style={{ color: 'var(--text-muted)' }}>
                Bot probability
              </span>
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: account.botProbability > 80 ? 'var(--sev-critical)' : account.botProbability > 40 ? 'var(--sev-medium)' : 'var(--sev-low)' }}
              >
                {account.botProbability}%
              </span>
            </div>

            <div className="p-3 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <span className="text-[10px] font-mono block mb-1" style={{ color: 'var(--text-muted)' }}>
                Followers / Following
              </span>
              <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {account.followerCount} / {account.followingCount}
              </span>
            </div>

            <div className="p-3 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <span className="text-[10px] font-mono block mb-1" style={{ color: 'var(--text-muted)' }}>
                Burst posting detected
              </span>
              <span
                className="text-sm font-mono font-bold"
                style={{ color: account.burstActivity ? 'var(--sev-critical)' : 'var(--sev-low)' }}
              >
                {account.burstActivity ? "Yes (high freq)" : "No (organic)"}
              </span>
            </div>
          </div>

          {/* Campaign Associations */}
          <div>
            <h5 className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Campaign associations</h5>
            {account.campaignIds.length > 0 ? (
              <div className="space-y-1.5">
                {account.campaignIds.map((cid, i) => (
                  <div
                    key={i}
                    onClick={() => { if (onSelectCampaign) onSelectCampaign(cid); onClose(); }}
                    className="p-2.5 rounded-md flex items-center justify-between cursor-pointer transition-colors"
                    style={{ background: 'var(--sev-critical-bg)', borderLeft: '2px solid var(--sev-critical)', border: '1px solid var(--sev-critical-bd)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,81,73,0.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--sev-critical-bg)'}
                  >
                    <div className="text-[12px]">
                      <span className="font-mono font-semibold block" style={{ color: 'var(--sev-critical)' }}>{cid}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Active participant in coordinated swarm</span>
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>View →</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] p-2.5 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                No malicious campaign clustering linked to this account.
              </p>
            )}
          </div>

          {/* Shared Hashtags */}
          <div>
            <h5 className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Frequent hashtags</h5>
            <div className="flex flex-wrap gap-1.5">
              {account.sharedHashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', border: '1px solid var(--border-muted)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Account Posts */}
          <div>
            <h5 className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Posts in dataset ({accountPosts.length})
            </h5>
            <div className="space-y-1.5">
              {accountPosts.map((p) => (
                <div key={p.id} className="p-2.5 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-primary)' }}>{p.text}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span>{new Date(p.timestamp).toLocaleTimeString()}</span>
                    <span>Toxicity: {p.toxicityScore || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 flex items-center justify-between gap-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Moderation action:</span>
          <div className="flex gap-2">
            <button
              onClick={() => alert(`Marked @${account.username} for active human review queue.`)}
              className="px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors"
              style={{ background: 'var(--bg-surface)', color: 'var(--sev-medium)', border: '1px solid var(--sev-medium-bd)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--sev-medium-bg)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'}
            >
              Flag for review
            </button>
            <button
              onClick={() => alert(`Escalated @${account.username} to Trust & Safety leads.`)}
              className="px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors"
              style={{ background: 'var(--sev-critical)', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Escalate threat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

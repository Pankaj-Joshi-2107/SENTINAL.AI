import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Campaign, Account, Post } from "../types";
import { Network, Info, Hash, Globe } from "lucide-react";

interface NetworkIntelligenceViewProps {
  campaigns: Campaign[];
  accounts: Account[];
  posts: Post[];
  selectedCampaignId?: string | null;
  onSelectAccount: (username: string) => void;
  onSelectCampaign: (campaignId: string) => void;
}

export const NetworkIntelligenceView: React.FC<NetworkIntelligenceViewProps> = ({
  campaigns,
  accounts,
  posts,
  selectedCampaignId,
  onSelectAccount,
  onSelectCampaign
}) => {
  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const campaignId = activeCampaign ? activeCampaign.id : "CAMP-2026-042";
    const campaignName = activeCampaign ? activeCampaign.name : "Coordinated Solar Disinfo Swarm";

    // Campaign hub node
    nodes.push({
      id: campaignId,
      type: "default",
      position: { x: 350, y: 220 },
      data: {
        label: (
          <div style={{ padding: "10px", textAlign: "center" }}>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--sev-critical)", display: "block", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "2px" }}>
              THREAT CAMPAIGN HUB
            </span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
              {campaignName}
            </span>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
              Score: {activeCampaign?.threatScore || 87}/100 · {(activeCampaign?.accountsInvolved || activeCampaign?.accounts || []).length || 8} accounts
            </span>
          </div>
        )
      },
      style: {
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        border: "1px solid var(--sev-critical)",
        borderRadius: "10px",
        width: 240,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
      }
    });

    // Hashtag nodes
    const hashtags = [
      { id: "tag-cleanenergyhoax", label: "#CleanEnergyHoax", x: 180, y: 50 },
      { id: "tag-solarscam", label: "#SolarScam", x: 390, y: 40 },
      { id: "tag-greentaxlies", label: "#GreenTaxLies", x: 590, y: 60 },
    ];

    hashtags.forEach((h) => {
      nodes.push({
        id: h.id,
        position: { x: h.x, y: h.y },
        data: {
          label: (
            <div style={{ padding: "4px 8px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: "3px" }}>
                {h.label}
              </span>
              <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "monospace", display: "block" }}>
                Cluster keyword
              </span>
            </div>
          )
        },
        style: {
          background: "var(--bg-elevated)",
          border: "1px solid var(--accent-border)",
          borderRadius: "6px",
          color: "var(--accent)"
        }
      });
      edges.push({
        id: `edge-camp-${h.id}`,
        source: campaignId,
        target: h.id,
        animated: true,
        style: { stroke: "var(--accent)", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--accent)" }
      });
    });

    // URL node
    const urlNodeId = "url-dossier";
    nodes.push({
      id: urlNodeId,
      position: { x: 700, y: 220 },
      data: {
        label: (
          <div style={{ padding: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--sev-medium)", fontWeight: 600, display: "block" }}>
              bit.ly/grid-dossier-2026
            </span>
            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "monospace", display: "block", marginTop: "2px" }}>
              Shared malicious link
            </span>
          </div>
        )
      },
      style: {
        background: "var(--bg-elevated)",
        border: "1px solid var(--sev-medium-bd)",
        borderRadius: "6px",
        color: "var(--sev-medium)"
      }
    });
    edges.push({
      id: "edge-camp-url",
      source: campaignId,
      target: urlNodeId,
      style: { stroke: "var(--sev-medium)", strokeDasharray: "4 4" }
    });

    // Account nodes
    const campaignAccList = activeCampaign?.accountsInvolved || activeCampaign?.accounts || [];
    const relevantAccounts = accounts.filter((a) => campaignAccList.includes(a.username));
    const radius = 260;
    const centerObj = { x: 420, y: 240 };
    const totalAcc = relevantAccounts.length || 8;

    relevantAccounts.forEach((acc, idx) => {
      const angle = Math.PI * (0.15 + (0.7 * idx) / (totalAcc - 1));
      const x = centerObj.x + radius * Math.cos(angle) - 60;
      const y = centerObj.y + radius * Math.sin(angle);
      const nodeId = `acc-${acc.username}`;

      nodes.push({
        id: nodeId,
        position: { x, y },
        data: {
          username: acc.username,
          label: (
            <div style={{ padding: "8px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                @{acc.username}
              </div>
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--text-muted)", display: "block" }}>
                Bot: <strong style={{ color: "var(--sev-critical)" }}>{acc.botProbability}%</strong> · Age: {acc.accountAgeDays}d
              </span>
              <span style={{ fontSize: "8px", color: "var(--accent)", display: "block", marginTop: "3px", letterSpacing: "0.05em" }}>
                CLICK TO INSPECT
              </span>
            </div>
          )
        },
        style: {
          background: "var(--bg-surface)",
          border: "1px solid var(--sev-critical-bd)",
          borderRadius: "8px",
          width: 140,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
        }
      });
      edges.push({
        id: `edge-camp-${nodeId}`,
        source: campaignId,
        target: nodeId,
        animated: true,
        style: { stroke: "var(--sev-critical)", strokeWidth: 1.5, opacity: 0.7 }
      });
      if (idx % 2 === 0) {
        edges.push({
          id: `edge-acc-url-${idx}`,
          source: nodeId,
          target: urlNodeId,
          style: { stroke: "var(--sev-medium)", strokeWidth: 1, opacity: 0.4 }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [activeCampaign, accounts]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id.startsWith("acc-")) {
        const username = node.data?.username as string;
        if (username) onSelectAccount(username);
      } else if (node.id.startsWith("CAMP-")) {
        onSelectCampaign(node.id);
      }
    },
    [onSelectAccount, onSelectCampaign]
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Network Intelligence
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Graph visualization of coordinated accounts, narrative anchors, shared hyperlinks, and swarm topology.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono shrink-0">
          {[
            { color: "var(--sev-critical)", label: "Campaign / Accounts" },
            { color: "var(--accent)", label: "Hashtags" },
            { color: "var(--sev-medium)", label: "Shared URL" },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5" style={{ color: l.color }}>
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* React Flow */}
      <div
        className="rounded-lg overflow-hidden relative"
        style={{
          height: "560px",
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="var(--border)" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith("acc-")) return "var(--sev-critical)";
              if (node.id.startsWith("tag-")) return "var(--accent)";
              if (node.id.startsWith("url-")) return "var(--sev-medium)";
              return "var(--sev-critical)";
            }}
            maskColor="rgba(13,17,23,0.7)"
          />
        </ReactFlow>

        {/* Overlay hint */}
        <div
          className="absolute top-4 left-4 p-3 rounded-lg max-w-xs pointer-events-none text-[12px]"
          style={{
            background: "rgba(22,27,34,0.92)",
            backdropFilter: "blur(4px)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span className="font-medium text-[12px]" style={{ color: "var(--text-primary)" }}>
              Interactive graph
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
            Click account nodes to view full dossiers. Drag or scroll to explore.
          </p>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import { ResearchGraphData, EvidenceRelationshipType } from '@/types';
import { ClaimTypeBadge, RelationshipBadge, GapStatusBadge } from './Badges';
import { FileText, Sparkles, AlertTriangle, ExternalLink, X, Info } from 'lucide-react';

// Custom Node for Paper
function PaperNodeComponent({ data }: { data: any }) {
  const paper = data.paper;
  return (
    <div className="px-4 py-3 rounded-lg bg-surface border border-border shadow-lg max-w-[280px] hover:border-secondary transition-all">
      <Handle type="target" position={Position.Top} className="!bg-secondary w-2 h-2" />
      <div className="flex items-center space-x-2 mb-1.5">
        <FileText className="w-4 h-4 text-secondary shrink-0" />
        <span className="text-[11px] font-mono text-content-secondary uppercase truncate">
          {paper.venue || 'Scholarly Paper'} ({paper.year || '2024'})
        </span>
      </div>
      <h4 className="text-xs font-semibold text-content-primary line-clamp-2 leading-snug">
        {paper.title}
      </h4>
      <div className="mt-2 flex items-center justify-between text-[10px] text-content-muted">
        <span>{paper.authors?.[0]?.name || 'Author'} et al.</span>
        {paper.doi && <span className="font-mono text-accent">DOI: verified</span>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-secondary w-2 h-2" />
    </div>
  );
}

// Custom Node for Claim
function ClaimNodeComponent({ data }: { data: any }) {
  const claim = data.claim;
  return (
    <div className="px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border-highlight shadow-md max-w-[260px] hover:border-accent transition-all">
      <Handle type="target" position={Position.Top} className="!bg-accent w-2 h-2" />
      <div className="flex items-center justify-between mb-1.5">
        <ClaimTypeBadge type={claim.claim_type} />
        <span className="text-[10px] font-mono text-accent">
          {(claim.extraction_confidence * 100).toFixed(0)}%
        </span>
      </div>
      <p className="text-xs text-content-primary line-clamp-3 leading-relaxed">
        "{claim.claim_text}"
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-accent w-2 h-2" />
    </div>
  );
}

// Custom Node for Candidate Gap
function GapNodeComponent({ data }: { data: any }) {
  const gap = data.gap;
  return (
    <div className="px-4 py-3 rounded-lg bg-surface-elevated border-2 border-accent/60 shadow-xl max-w-[300px]">
      <Handle type="target" position={Position.Top} className="!bg-accent w-2 h-2" />
      <div className="flex items-center space-x-2 mb-1.5">
        <Sparkles className="w-4 h-4 text-accent shrink-0" />
        <GapStatusBadge status={gap.status} />
      </div>
      <h4 className="text-xs font-bold text-accent line-clamp-2">
        {gap.title}
      </h4>
      <p className="mt-1 text-[11px] text-content-secondary line-clamp-2">
        {gap.research_question}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-accent w-2 h-2" />
    </div>
  );
}

const nodeTypes = {
  paper: PaperNodeComponent,
  claim: ClaimNodeComponent,
  gap: GapNodeComponent,
};

interface Props {
  graphData: ResearchGraphData;
  onSelectClaim?: (claim: any) => void;
  onSelectGap?: (gap: any) => void;
}

export function EvidenceGraphView({ graphData, onSelectClaim, onSelectGap }: Props) {
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  // Generate initial React Flow layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const papers = graphData.nodes.filter(n => n.type === 'paper');
    const claims = graphData.nodes.filter(n => n.type === 'claim');
    const gaps = graphData.nodes.filter(n => n.type === 'gap');

    // Layout papers horizontally at y = 50
    papers.forEach((p, idx) => {
      nodes.push({
        id: p.id,
        type: 'paper',
        position: { x: idx * 320 + 50, y: 50 },
        data: p.data,
      });
    });

    // Layout claims horizontally at y = 240
    claims.forEach((c, idx) => {
      nodes.push({
        id: c.id,
        type: 'claim',
        position: { x: (idx % 6) * 300 + 40, y: 240 + Math.floor(idx / 6) * 160 },
        data: c.data,
      });
    });

    // Layout gaps at y = 620
    gaps.forEach((g, idx) => {
      nodes.push({
        id: g.id,
        type: 'gap',
        position: { x: idx * 360 + 80, y: 620 },
        data: g.data,
      });
    });

    // Process edges
    graphData.edges.forEach((e) => {
      let strokeColor = '#384759';
      let strokeWidth = 1.5;
      let animated = false;

      if (e.type === 'SUPPORTS') {
        strokeColor = '#43D9A3';
        strokeWidth = 2;
      } else if (e.type === 'CHALLENGES') {
        strokeColor = '#F59E0B';
        strokeWidth = 2;
        animated = true;
      } else if (e.type === 'CONTRADICTS') {
        strokeColor = '#EF4444';
        strokeWidth = 2.5;
        animated = true;
      } else if (e.type === 'QUALIFIES') {
        strokeColor = '#65B8FF';
        strokeWidth = 2;
      } else if (e.type === 'ADDRESSES_GAP') {
        strokeColor = '#A855F7';
        strokeWidth = 2;
        animated = true;
      }

      edges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated,
        style: { stroke: strokeColor, strokeWidth },
        labelStyle: { fill: strokeColor, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#121922', fillOpacity: 0.85 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
        data: e,
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [graphData]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedEntity(node.data);
    if (node.type === 'claim' && onSelectClaim) onSelectClaim(node.data.claim);
    if (node.type === 'gap' && onSelectGap) onSelectGap(node.data.gap);
  };

  return (
    <div className="relative w-full h-[620px] rounded-xl border border-border bg-background overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#16202C" gap={20} size={1} />
        <Controls />
      </ReactFlow>

      {/* Floating Legend */}
      <div className="absolute top-4 left-4 p-3 rounded-lg bg-surface/90 backdrop-blur-md border border-border text-xs space-y-1.5 shadow-lg pointer-events-none sm:pointer-events-auto">
        <span className="font-mono text-[10px] text-content-secondary uppercase block font-semibold">
          Evidence Relationships
        </span>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-content-secondary">Supports</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-content-secondary">Challenges</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-content-secondary">Contradicts</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-content-secondary">Qualifies</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-content-secondary">Addresses Gap</span>
          </span>
        </div>
      </div>

      {/* Entity Inspector Sidebar */}
      {selectedEntity && (
        <div className="absolute top-4 right-4 w-80 max-h-[580px] overflow-y-auto p-4 rounded-xl bg-surface-elevated/95 backdrop-blur-md border border-border shadow-2xl z-20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-mono text-accent uppercase font-bold flex items-center space-x-1">
              <Info className="w-3.5 h-3.5" />
              <span>Evidence Inspector</span>
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-content-muted hover:text-content-primary p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEntity.paper && (
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-mono text-content-muted">Scholarly Paper</span>
              <h4 className="font-semibold text-content-primary">{selectedEntity.paper.title}</h4>
              <p className="text-content-secondary leading-relaxed">{selectedEntity.paper.abstract}</p>
              <div className="pt-2 border-t border-border flex justify-between items-center text-[11px]">
                <span className="font-mono text-content-muted">{selectedEntity.paper.venue}</span>
                {selectedEntity.paper.canonical_url && (
                  <a
                    href={selectedEntity.paper.canonical_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {selectedEntity.claim && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-content-muted">Scientific Claim</span>
                <ClaimTypeBadge type={selectedEntity.claim.claim_type} />
              </div>
              <p className="font-medium text-content-primary italic leading-relaxed">
                "{selectedEntity.claim.claim_text}"
              </p>
              <div className="p-2.5 rounded bg-surface border border-border space-y-1">
                <span className="text-[10px] font-mono text-content-muted uppercase block">
                  Grounding Supporting Passage:
                </span>
                <p className="text-[11px] text-content-secondary font-mono">
                  {selectedEntity.claim.supporting_passage}
                </p>
              </div>
            </div>
          )}

          {selectedEntity.gap && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-content-muted">Candidate Gap</span>
                <GapStatusBadge status={selectedEntity.gap.status} />
              </div>
              <h4 className="font-bold text-accent">{selectedEntity.gap.title}</h4>
              <p className="text-content-secondary">{selectedEntity.gap.description}</p>
              <div className="p-2 rounded bg-surface border border-border">
                <span className="text-[10px] font-mono text-content-muted block mb-1">
                  Proposed Research Question:
                </span>
                <p className="font-medium text-content-primary">{selectedEntity.gap.research_question}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

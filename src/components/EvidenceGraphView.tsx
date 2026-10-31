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
import { 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  ExternalLink, 
  X, 
  Info, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';

// Scholarly Paper Node
function PaperNodeComponent({ data }: { data: any }) {
  const paper = data.paper;
  return (
    <div className="px-4 py-3.5 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper hover:border-[#252622] transition-all w-[320px] text-left select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#252622] !w-2.5 !h-2.5 !border-2 !border-[#FDFCF9]" />
      
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#E3E1D9]/70">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#777873] uppercase tracking-wide truncate">
          <BookOpen className="w-3.5 h-3.5 text-[#858B70] shrink-0" />
          <span className="truncate">{paper.venue || 'Scholarly Publication'}</span>
        </div>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">
          {paper.year || '2024'}
        </span>
      </div>

      <h4 className="font-serif text-sm font-semibold text-[#252622] line-clamp-2 leading-snug">
        {paper.title}
      </h4>

      <div className="mt-2.5 pt-2 border-t border-[#E3E1D9]/50 flex items-center justify-between text-[11px] font-mono text-[#777873]">
        <span className="truncate max-w-[180px]">
          {paper.authors?.[0]?.name || 'Author'} et al.
        </span>
        {paper.doi ? (
          <span className="text-[#858B70] text-[10px]">DOI Verified</span>
        ) : (
          <span className="text-[#9D9E99] text-[10px]">Indexed</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#252622] !w-2.5 !h-2.5 !border-2 !border-[#FDFCF9]" />
    </div>
  );
}

// Extracted Scientific Claim Node
function ClaimNodeComponent({ data }: { data: any }) {
  const claim = data.claim;
  return (
    <div className="px-3.5 py-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] shadow-[0_1px_3px_rgba(37,38,34,0.04)] hover:border-[#B96645] hover:bg-[#FDFCF9] transition-all w-[300px] text-left select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#858B70] !w-2 !h-2 !border-2 !border-[#FDFCF9]" />
      
      <div className="flex items-center justify-between mb-2">
        <ClaimTypeBadge type={claim.claim_type} />
        <span className="text-[10px] font-mono text-[#858B70] bg-[#858B70]/10 px-1.5 py-0.5 rounded">
          {(claim.extraction_confidence * 100).toFixed(0)}% Conf
        </span>
      </div>

      <p className="text-xs text-[#252622] line-clamp-3 leading-relaxed font-sans">
        &ldquo;{claim.claim_text}&rdquo;
      </p>

      {claim.experimental_context?.hardware_environment && (
        <div className="mt-2 pt-1.5 border-t border-[#E3E1D9]/50 flex items-center gap-1 text-[10px] font-mono text-[#777873] truncate">
          <Cpu className="w-3 h-3 text-[#777873] shrink-0" />
          <span className="truncate">{claim.experimental_context.hardware_environment}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#858B70] !w-2 !h-2 !border-2 !border-[#FDFCF9]" />
    </div>
  );
}

// Candidate Research Gap Node
function GapNodeComponent({ data }: { data: any }) {
  const gap = data.gap;
  return (
    <div className="px-4 py-3.5 rounded-xl bg-[#FDFCF9] border-2 border-[#B96645] shadow-paper-lg w-[340px] text-left select-none">
      <Handle type="target" position={Position.Top} className="!bg-[#B96645] !w-2.5 !h-2.5 !border-2 !border-[#FDFCF9]" />
      
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#E3E1D9]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#B96645] uppercase tracking-wide font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#B96645] shrink-0" />
          <span>Research Frontier</span>
        </div>
        <GapStatusBadge status={gap.status} />
      </div>

      <h4 className="font-serif text-sm font-semibold text-[#252622] line-clamp-2 leading-snug">
        {gap.title}
      </h4>

      <p className="mt-1.5 text-xs text-[#777873] line-clamp-2 leading-relaxed">
        {gap.research_question}
      </p>

      <div className="mt-2.5 pt-2 border-t border-[#E3E1D9] flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#858B70] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>6-Stage Falsified</span>
        </span>
        <span className="text-[#B96645] font-semibold">Prior Work Checked</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-[#B96645] !w-2.5 !h-2.5 !border-2 !border-[#FDFCF9]" />
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

  // Generate robust column-based hierarchical layout (Eliminating overlapping!)
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const papers = graphData.nodes.filter(n => n.type === 'paper');
    const allClaims = graphData.nodes.filter(n => n.type === 'claim');
    const gaps = graphData.nodes.filter(n => n.type === 'gap');

    const COLUMN_WIDTH = 370;
    const START_X = 60;
    const PAPER_Y = 60;
    const CLAIM_START_Y = 250;
    const CLAIM_ROW_HEIGHT = 160;

    let maxBottomY = CLAIM_START_Y;

    // Track assigned claims to avoid orphans
    const assignedClaimIds = new Set<string>();

    // 1. Group claims by their parent paper
    papers.forEach((p, colIdx) => {
      const colX = START_X + colIdx * COLUMN_WIDTH;

      // Add Paper Node
      nodes.push({
        id: p.id,
        type: 'paper',
        position: { x: colX, y: PAPER_Y },
        data: p.data,
      });

      // Find claims belonging to this paper
      const paperClaims = allClaims.filter(c => {
        const claimObj = (c.data as any)?.claim;
        return claimObj?.paper_id === p.id || claimObj?.paper_title === (p.data as any)?.paper?.title;
      });

      // Stack claims vertically directly beneath their parent paper
      paperClaims.forEach((c, rowIdx) => {
        assignedClaimIds.add(c.id);
        const claimY = CLAIM_START_Y + rowIdx * CLAIM_ROW_HEIGHT;
        if (claimY > maxBottomY) maxBottomY = claimY;

        nodes.push({
          id: c.id,
          type: 'claim',
          position: { x: colX + 10, y: claimY },
          data: c.data,
        });
      });
    });

    // 2. Any orphan claims (not directly mapped to a paper in graphData)
    const orphanClaims = allClaims.filter(c => !assignedClaimIds.has(c.id));
    if (orphanClaims.length > 0) {
      const orphanColX = START_X + Math.max(papers.length, 1) * COLUMN_WIDTH;
      orphanClaims.forEach((c, rowIdx) => {
        const claimY = CLAIM_START_Y + rowIdx * CLAIM_ROW_HEIGHT;
        if (claimY > maxBottomY) maxBottomY = claimY;

        nodes.push({
          id: c.id,
          type: 'claim',
          position: { x: orphanColX + 10, y: claimY },
          data: c.data,
        });
      });
    }

    // 3. Position Candidate Research Gaps at the bottom tier, distributed horizontally
    const gapY = maxBottomY + 220;
    gaps.forEach((g, idx) => {
      nodes.push({
        id: g.id,
        type: 'gap',
        position: { x: START_X + idx * 400, y: gapY },
        data: g.data,
      });
    });

    // 4. Process evidence edges with scholarly editorial styling
    graphData.edges.forEach((e) => {
      let strokeColor = '#777873';
      let strokeWidth = 1.5;
      let strokeDasharray: string | undefined = undefined;
      let animated = false;

      if (e.type === 'SUPPORTS' || e.type === 'REPLICATES') {
        strokeColor = '#858B70'; // Olive
        strokeWidth = 2.2;
      } else if (e.type === 'CONTRADICTS') {
        strokeColor = '#B96645'; // Terracotta
        strokeWidth = 2.8;
        animated = true;
      } else if (e.type === 'CHALLENGES') {
        strokeColor = '#B96645'; // Terracotta
        strokeWidth = 2.2;
        animated = true;
      } else if (e.type === 'QUALIFIES') {
        strokeColor = '#777873';
        strokeWidth = 1.5;
        strokeDasharray = '4 4';
      } else if (e.type === 'ADDRESSES_GAP') {
        strokeColor = '#B96645';
        strokeWidth = 2;
        strokeDasharray = '5 5';
        animated = true;
      }

      edges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || (e.type ? e.type.replace(/_/g, ' ') : undefined),
        animated,
        style: { stroke: strokeColor, strokeWidth, strokeDasharray },
        labelStyle: { fill: strokeColor, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#FDFCF9', stroke: '#E3E1D9', strokeWidth: 1, rx: 4, ry: 4 },
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
    <div className="relative w-full h-[680px] rounded-xl border border-[#E3E1D9] bg-[#F7F6F2] overflow-hidden shadow-paper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#DDD9CF" gap={24} size={1} />
        <Controls />
      </ReactFlow>

      {/* Floating Scholarly Legend */}
      <div className="absolute top-4 left-4 p-3.5 rounded-lg bg-[#FDFCF9]/95 backdrop-blur-md border border-[#E3E1D9] text-xs space-y-2 shadow-paper pointer-events-none sm:pointer-events-auto">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-[#777873] uppercase tracking-wider font-semibold">
            Evidence Relationships
          </span>
          <span className="text-[10px] font-mono text-[#858B70]">
            {graphData.nodes.length} Nodes • {graphData.edges.length} Edges
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#858B70]/10 border border-[#858B70]/25 text-[#5A6048]">
            <span className="w-2 h-2 rounded-full bg-[#858B70]" />
            <span>Supports</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#B96645]/15 border border-[#B96645]/30 text-[#B96645]">
            <span className="w-2 h-2 rounded-full bg-[#B96645]" />
            <span>Contradicts / Challenges</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873]">
            <span className="w-2 h-2 rounded-full bg-[#777873]" />
            <span>Qualifies</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#B96645]/10 border border-[#B96645]/20 text-[#934E32]">
            <span className="w-2 h-2 rounded-full bg-[#B96645] border border-[#B96645]" />
            <span>Addresses Gap</span>
          </span>
        </div>
      </div>

      {/* Entity Inspector Slide-over Panel */}
      {selectedEntity && (
        <div className="absolute top-4 right-4 w-96 max-h-[630px] overflow-y-auto p-5 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper-lg z-20 space-y-4 animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E1D9]">
            <span className="text-xs font-mono text-[#B96645] uppercase font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Evidence Inspector</span>
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-[#777873] hover:text-[#252622] p-1 rounded hover:bg-[#FAF8F3]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEntity.paper && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-[#777873]">Scholarly Publication</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">
                  {selectedEntity.paper.year || '2024'}
                </span>
              </div>
              <h4 className="font-serif text-base font-semibold text-[#252622] leading-snug">
                {selectedEntity.paper.title}
              </h4>
              <p className="text-[#777873] leading-relaxed line-clamp-6">
                {selectedEntity.paper.abstract || 'No abstract preview available.'}
              </p>
              <div className="pt-3 border-t border-[#E3E1D9] flex justify-between items-center text-[11px] font-mono">
                <span className="text-[#777873] truncate max-w-[200px]">{selectedEntity.paper.venue || 'Journal / Proceedings'}</span>
                {selectedEntity.paper.canonical_url && (
                  <a
                    href={selectedEntity.paper.canonical_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#B96645] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>View Paper</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {selectedEntity.claim && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-[#777873]">Grounded Scientific Claim</span>
                <ClaimTypeBadge type={selectedEntity.claim.claim_type} />
              </div>
              <p className="font-serif text-sm font-medium text-[#252622] italic leading-relaxed">
                &ldquo;{selectedEntity.claim.claim_text}&rdquo;
              </p>

              {/* Exact Verbatim Grounding Passage */}
              <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-1.5">
                <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider block font-semibold">
                  Source Grounding Passage:
                </span>
                <p className="text-[11px] text-[#252622] font-mono leading-relaxed bg-[#FDFCF9] p-2 rounded border border-[#E3E1D9]">
                  {selectedEntity.claim.supporting_passage}
                </p>
              </div>

              {/* Experimental Context Details */}
              {selectedEntity.claim.experimental_context && (
                <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-2">
                  <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider block font-semibold">
                    Experimental Conditions:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {selectedEntity.claim.experimental_context.hardware_environment && (
                      <div className="p-1.5 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                        <span className="text-[#9D9E99] block text-[9px]">HARDWARE:</span>
                        <span className="text-[#252622] truncate block">{selectedEntity.claim.experimental_context.hardware_environment}</span>
                      </div>
                    )}
                    {selectedEntity.claim.experimental_context.precision_or_quantization && (
                      <div className="p-1.5 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                        <span className="text-[#9D9E99] block text-[9px]">PRECISION:</span>
                        <span className="text-[#252622] truncate block">{selectedEntity.claim.experimental_context.precision_or_quantization}</span>
                      </div>
                    )}
                    {selectedEntity.claim.experimental_context.context_length && (
                      <div className="p-1.5 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                        <span className="text-[#9D9E99] block text-[9px]">CONTEXT:</span>
                        <span className="text-[#252622] truncate block">{selectedEntity.claim.experimental_context.context_length}</span>
                      </div>
                    )}
                    {selectedEntity.claim.experimental_context.sample_size && (
                      <div className="p-1.5 rounded bg-[#FDFCF9] border border-[#E3E1D9]">
                        <span className="text-[#9D9E99] block text-[9px]">SAMPLE SIZE:</span>
                        <span className="text-[#252622] truncate block">{selectedEntity.claim.experimental_context.sample_size}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedEntity.gap && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-[#777873]">Candidate Research Gap</span>
                <GapStatusBadge status={selectedEntity.gap.status} />
              </div>
              <h4 className="font-serif text-base font-semibold text-[#B96645] leading-snug">
                {selectedEntity.gap.title}
              </h4>
              <p className="text-[#777873] leading-relaxed">
                {selectedEntity.gap.description}
              </p>
              <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-1">
                <span className="text-[10px] font-mono text-[#777873] uppercase tracking-wider block font-semibold">
                  Testable Research Question:
                </span>
                <p className="font-serif text-sm font-medium text-[#252622] italic">
                  {selectedEntity.gap.research_question}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

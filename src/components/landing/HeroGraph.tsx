import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface GraphNode {
  id: string;
  refNumber: string;
  label: string;
  sublabel: string;
  type: 'central' | 'paper' | 'dataset' | 'contradiction' | 'gap';
  cx: number;
  cy: number;
  color: string;
  strokeColor: string;
  fillColor: string;
  citations?: number;
  year?: string;
  doi?: string;
  summary: string;
  connectedTo: string[];
}

export const HeroGraph: React.FC<{ onSelectNode?: (node: GraphNode) => void }> = ({ onSelectNode }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const nodes: GraphNode[] = [
    {
      id: 'center',
      refNumber: 'CORE',
      label: 'Cognitive Scaffolding & Memory Retention',
      sublabel: 'Investigation Inception • Semantic Seed',
      type: 'central',
      cx: 480,
      cy: 260,
      color: '#252622',
      strokeColor: '#252622',
      fillColor: '#252622',
      summary: 'Central inquiry exploring whether generative AI scaffolding impairs or bolsters human long-term knowledge retention.',
      connectedTo: ['paper-1', 'paper-2', 'paper-3', 'dataset-1', 'contra-1', 'gap-1']
    },
    {
      id: 'paper-1',
      refNumber: 'Ref [01]',
      label: 'Chen et al. (2025)',
      sublabel: 'Nature Human Behavior • doi:10.1038/s41562-024',
      type: 'paper',
      cx: 230,
      cy: 160,
      color: '#252622',
      strokeColor: '#252622',
      fillColor: '#FDFCF9',
      citations: 142,
      year: '2025',
      summary: 'Controlled trial (N=1,420) showing +34% initial problem decomposition speed when using conversational AI scaffolding.',
      connectedTo: ['center', 'dataset-1', 'contra-1']
    },
    {
      id: 'paper-2',
      refNumber: 'Ref [02]',
      label: 'Vogel & Larsson (2024)',
      sublabel: 'Cognitive Science • doi:10.1111/cogs.13421',
      type: 'paper',
      cx: 730,
      cy: 170,
      color: '#252622',
      strokeColor: '#252622',
      fillColor: '#FDFCF9',
      citations: 89,
      year: '2024',
      summary: 'Longitudinal re-test (N=980) demonstrating 22% lower retention at 60-day interval following persistent assistance reliance.',
      connectedTo: ['center', 'contra-1', 'gap-1']
    },
    {
      id: 'paper-3',
      refNumber: 'Ref [03]',
      label: 'Amershi et al. (2019)',
      sublabel: 'ACM CHI Conference • Foundations',
      type: 'paper',
      cx: 320,
      cy: 400,
      color: '#252622',
      strokeColor: '#252622',
      fillColor: '#FDFCF9',
      citations: 412,
      year: '2019',
      summary: 'Foundational framework establishing 18 usability heuristics for mixed-initiative human-AI collaboration.',
      connectedTo: ['center', 'dataset-2', 'paper-1']
    },
    {
      id: 'dataset-1',
      refNumber: 'Data [D1]',
      label: 'OpenCognition 100k',
      sublabel: 'Zenodo Repository • DOI: 10.5281/81299',
      type: 'dataset',
      cx: 150,
      cy: 330,
      color: '#858B70',
      strokeColor: '#858B70',
      fillColor: '#FDFCF9',
      citations: 312,
      year: '2025',
      summary: 'Public benchmark containing 100,000 recorded research problem-solving interactions and protocol analysis logs.',
      connectedTo: ['center', 'paper-1']
    },
    {
      id: 'dataset-2',
      refNumber: 'Data [D2]',
      label: 'Spaced Recall Matrix',
      sublabel: 'Dryad Digital Repository • Longitudinal',
      type: 'dataset',
      cx: 580,
      cy: 430,
      color: '#858B70',
      strokeColor: '#858B70',
      fillColor: '#FDFCF9',
      citations: 45,
      year: '2024',
      summary: 'Psychometric test scores and interval evaluations of 980 human learners across 12-month follow-up.',
      connectedTo: ['paper-2', 'center']
    },
    {
      id: 'contra-1',
      refNumber: 'Conflict [C-01]',
      label: 'Retention vs Comprehension Divergence',
      sublabel: 'Disputed Mechanism • Identified by PaperTrail',
      type: 'contradiction',
      cx: 500,
      cy: 110,
      color: '#B96645',
      strokeColor: '#B96645',
      fillColor: '#F3E8E2',
      summary: 'Chen (2025) reports rapid conceptual grasp, whereas Vogel (2024) reveals decay over 60 days. Divergence traced to evaluation latency.',
      connectedTo: ['paper-1', 'paper-2', 'center']
    },
    {
      id: 'gap-1',
      refNumber: 'Gap [G-01]',
      label: 'Unexplored: Socratic Interleaving',
      sublabel: 'Formulated Hypothesis Opportunity',
      type: 'gap',
      cx: 810,
      cy: 340,
      color: '#B96645',
      strokeColor: '#B96645',
      fillColor: '#FDFCF9',
      summary: 'Absence of published studies testing whether forcing hypothesis entry prior to AI response offsets delayed recall loss.',
      connectedTo: ['center', 'paper-2', 'dataset-2']
    }
  ];

  const hoveredNode = nodes.find(n => n.id === hoveredNodeId);

  const isFiltered = (type: GraphNode['type']) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'paper' && type === 'paper') return true;
    if (activeFilter === 'contradiction' && type === 'contradiction') return true;
    if (activeFilter === 'gap' && type === 'gap') return true;
    if (activeFilter === 'dataset' && type === 'dataset') return true;
    return false;
  };

  return (
    <div className="relative w-full rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper overflow-hidden">
      {/* Top Diagram Metadata Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-[#E3E1D9] bg-[#FAF8F3] gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#777873]">
            Fig. 1.0 — Research Network Schematic
          </span>
          <span className="text-[#CCC8BC]">•</span>
          <span className="text-xs text-[#252622] font-medium">
            Cross-Disciplinary Synthesizer
          </span>
        </div>

        {/* Typographic Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[#777873] mr-1 hidden sm:inline">Layer:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'paper', label: 'Papers [01-03]' },
            { id: 'contradiction', label: 'Disputes' },
            { id: 'gap', label: 'Gaps' },
            { id: 'dataset', label: 'Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                activeFilter === tab.id
                  ? 'bg-[#252622] text-[#FDFCF9]'
                  : 'text-[#777873] hover:text-[#252622] hover:bg-[#EFECE5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Scientific Canvas */}
      <div className="relative w-full h-[520px] bg-[#FDFCF9] p-4 select-none">
        {/* Subtle diagram grid rule markings */}
        <div className="absolute inset-0 bg-paper-grid opacity-60 pointer-events-none" />

        <svg 
          viewBox="0 0 960 520" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Precision arrow marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#CCC8BC" />
            </marker>
          </defs>

          {/* Connection Lines */}
          <g className="connections">
            {/* Core to Paper 1 */}
            <line 
              x1="480" y1="260" x2="230" y2="160" 
              stroke={hoveredNodeId === 'paper-1' || hoveredNodeId === 'center' ? '#252622' : '#E3E1D9'} 
              strokeWidth={hoveredNodeId === 'paper-1' ? "1.8" : "1"}
            />
            {/* Core to Paper 2 */}
            <line 
              x1="480" y1="260" x2="730" y2="170" 
              stroke={hoveredNodeId === 'paper-2' || hoveredNodeId === 'center' ? '#252622' : '#E3E1D9'} 
              strokeWidth={hoveredNodeId === 'paper-2' ? "1.8" : "1"}
            />
            {/* Core to Paper 3 */}
            <line 
              x1="480" y1="260" x2="320" y2="400" 
              stroke={hoveredNodeId === 'paper-3' || hoveredNodeId === 'center' ? '#252622' : '#E3E1D9'} 
              strokeWidth={hoveredNodeId === 'paper-3' ? "1.8" : "1"}
            />
            {/* Core to Dataset 1 */}
            <line 
              x1="480" y1="260" x2="150" y2="330" 
              stroke={hoveredNodeId === 'dataset-1' ? '#858B70' : '#E3E1D9'} 
              strokeWidth="1" strokeDasharray="3 3"
            />
            {/* Core to Dataset 2 */}
            <line 
              x1="480" y1="260" x2="580" y2="430" 
              stroke={hoveredNodeId === 'dataset-2' ? '#858B70' : '#E3E1D9'} 
              strokeWidth="1" strokeDasharray="3 3"
            />
            {/* Paper 1 to Dataset 1 */}
            <line 
              x1="230" y1="160" x2="150" y2="330" 
              stroke="#E3E1D9" strokeWidth="1"
            />
            {/* Paper 2 to Dataset 2 */}
            <line 
              x1="730" y1="170" x2="580" y2="430" 
              stroke="#E3E1D9" strokeWidth="1"
            />
            {/* Paper 1 to Paper 3 */}
            <line 
              x1="230" y1="160" x2="320" y2="400" 
              stroke="#E3E1D9" strokeWidth="0.8" strokeDasharray="2 3"
            />
            {/* Contradiction between Paper 1 and Paper 2 */}
            <path 
              d="M 230 160 Q 480 80 730 170" 
              fill="none" 
              stroke={hoveredNodeId === 'contra-1' ? '#B96645' : '#D9896C'} 
              strokeWidth={hoveredNodeId === 'contra-1' ? "2" : "1.4"} 
              strokeDasharray="4 4"
            />
            {/* Core to Gap 1 */}
            <line 
              x1="480" y1="260" x2="810" y2="340" 
              stroke={hoveredNodeId === 'gap-1' ? '#B96645' : '#E3E1D9'} 
              strokeWidth="1.2" strokeDasharray="3 3"
            />
            {/* Paper 2 to Gap 1 */}
            <line 
              x1="730" y1="170" x2="810" y2="340" 
              stroke="#E3E1D9" strokeWidth="1"
            />
          </g>

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isTarget = isFiltered(node.type);
            const isHovered = hoveredNodeId === node.id;
            const opacity = isTarget ? 1 : 0.25;

            return (
              <g
                key={node.id}
                opacity={opacity}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => onSelectNode && onSelectNode(node)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Node Ring Indicator */}
                {isHovered && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={node.type === 'central' ? 32 : 22}
                    fill="none"
                    stroke={node.strokeColor}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ animationDuration: '24s' }}
                  />
                )}

                {/* Primary Circle */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={node.type === 'central' ? 24 : (node.type === 'gap' ? 14 : 12)}
                  fill={node.fillColor}
                  stroke={node.strokeColor}
                  strokeWidth={node.type === 'gap' ? 1.5 : (isHovered ? 2 : 1.2)}
                  strokeDasharray={node.type === 'gap' ? '3 3' : 'none'}
                />

                {/* Center Core dot */}
                {node.type !== 'central' && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={node.type === 'gap' ? 2.5 : 3.5}
                    fill={node.color}
                  />
                )}

                {/* Central Node Internal Motif */}
                {node.type === 'central' && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={8}
                    fill="#FDFCF9"
                  />
                )}

                {/* Node Label Text */}
                <text
                  x={node.cx}
                  y={node.cy + (node.type === 'central' ? 38 : 25)}
                  textAnchor="middle"
                  className="font-sans text-[11px] font-medium fill-[#252622]"
                >
                  {node.label}
                </text>

                {/* Reference Number Tag */}
                <text
                  x={node.cx}
                  y={node.cy - 18}
                  textAnchor="middle"
                  className={`font-mono text-[9px] uppercase tracking-wider font-semibold ${
                    node.type === 'contradiction'
                      ? 'fill-[#B96645]'
                      : node.type === 'gap'
                      ? 'fill-[#B96645]'
                      : node.type === 'dataset'
                      ? 'fill-[#858B70]'
                      : 'fill-[#777873]'
                  }`}
                >
                  {node.refNumber}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Node Editorial Inspector Card */}
        {hoveredNode && (
          <div 
            className="absolute bottom-6 left-6 z-20 max-w-sm p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                hoveredNode.type === 'contradiction'
                  ? 'bg-[#F3E8E2] text-[#B96645]'
                  : hoveredNode.type === 'gap'
                  ? 'bg-[#F3E8E2] text-[#B96645]'
                  : hoveredNode.type === 'dataset'
                  ? 'bg-[#EBECE6] text-[#858B70]'
                  : 'bg-[#EFECE5] text-[#252622]'
              }`}>
                {hoveredNode.refNumber} • {hoveredNode.type.toUpperCase()}
              </span>

              {hoveredNode.year && (
                <span className="text-[10px] font-mono text-[#777873]">
                  Pub. {hoveredNode.year}
                </span>
              )}
            </div>

            <h4 className="text-sm font-serif font-bold text-[#252622] leading-snug">
              {hoveredNode.label}
            </h4>
            <p className="text-[11px] font-mono text-[#777873] mt-0.5 truncate">
              {hoveredNode.sublabel}
            </p>
            <p className="text-xs text-[#777873] mt-2 leading-relaxed">
              {hoveredNode.summary}
            </p>

            <div className="mt-3 pt-2.5 border-t border-[#E3E1D9] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#9D9E99]">
                {hoveredNode.connectedTo.length} relational vertices
              </span>
              <span className="text-[#B96645] font-medium flex items-center gap-0.5">
                Inspect Lineage <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Diagram Caption / Publication Legend Footer */}
      <div className="px-6 py-3.5 border-t border-[#E3E1D9] bg-[#FAF8F3] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#777873]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#252622] inline-block" />
            <span>Research Papers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#858B70] inline-block" />
            <span>Datasets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B96645] inline-block" />
            <span>Contradictions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#B96645] border-dashed inline-block" />
            <span>Research Gaps</span>
          </div>
        </div>

        <div>
          <span>Dataset: 24 indexed papers • Crossref verified</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  FileText, 
  Database, 
  AlertTriangle, 
  Lightbulb, 
  Info
} from 'lucide-react';

export const ProductPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'contradictions' | 'datasets' | 'gaps' | 'timeline'>('graph');
  const [selectedTopic, setSelectedTopic] = useState<string>('Impact of artificial intelligence on human learning');

  const sampleTopics = [
    'Impact of artificial intelligence on human learning',
    'CRISPR-Cas9 off-target cleavage mechanisms',
    'Room-temperature ambient pressure superconductivity replication'
  ];

  return (
    <section id="discover" className="relative py-24 sm:py-36 bg-[#FDFCF9] border-b border-[#E3E1D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-[#777873]">
            <span>Section 05</span>
            <span className="text-[#CCC8BC]">/</span>
            <span className="text-[#B96645] font-semibold">The Interface</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#252622] leading-[1.08]">
            Designed for deep inquiry. <br />
            <span className="italic text-[#B96645]">Engineered for discovery.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#777873] leading-relaxed">
            Experience the PaperTrail research intelligence interface. Explore connected papers, 
            inspect flagged contradictions, browse datasets, and surface unanswered questions.
          </p>
        </div>

        {/* Dashboard Shell — Warm Editorial Application Workspace */}
        <div className="rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper overflow-hidden">
          {/* Top Window Chrome */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-[#FAF8F3] border-b border-[#E3E1D9] gap-3">
            <div className="flex items-center gap-3">
              <span className="font-serif text-sm font-semibold text-[#252622]">
                PaperTrail Workspace
              </span>
              <span className="text-[#CCC8BC]">/</span>
              <span className="font-mono text-xs text-[#777873]">
                Session ID: PT-2026-042
              </span>
            </div>

            {/* Clearly labeled illustrative demo disclaimer badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#EFECE5] border border-[#E3E1D9] text-[11px] font-mono text-[#777873]">
              <Info className="w-3.5 h-3.5 text-[#B96645]" />
              <span>ILLUSTRATIVE DEMO DATA — SIMULATED RESEARCH TOPIC</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-[#858B70]">
              <span className="w-2 h-2 rounded-full bg-[#858B70]" />
              <span>4 Repositories Connected</span>
            </div>
          </div>

          {/* Research Search & Topic Selector Bar */}
          <div className="p-6 bg-[#FDFCF9] border-b border-[#E3E1D9] space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777873]" />
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono text-[#252622] placeholder-[#777873] focus:outline-none focus:border-[#252622]"
                  placeholder="Enter research query, paper title, or DOI..."
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] text-xs font-mono text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3] transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#252622] text-[#FDFCF9] font-medium text-xs hover:bg-[#383A34] transition-all">
                  <Sparkles className="w-3.5 h-3.5 text-[#EFECE5]" />
                  <span>Traverse Graph</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-[#777873] text-[11px]">Simulated Presets:</span>
              {sampleTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1 rounded text-[11px] transition-all ${
                    selectedTopic === topic
                      ? 'bg-[#252622] text-[#FDFCF9]'
                      : 'bg-[#FAF8F3] text-[#777873] hover:text-[#252622] border border-[#E3E1D9]'
                  }`}
                >
                  {topic.length > 36 ? topic.slice(0, 34) + '...' : topic}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Overview Row (Explicitly labeled demo metrics) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-[#FAF8F3] border-b border-[#E3E1D9]">
            <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#777873]">Illustrative Papers</span>
                <div className="font-serif text-3xl font-bold text-[#252622] mt-1">24</div>
                <div className="text-[11px] font-mono text-[#777873] mt-0.5">arXiv, Nature, IEEE</div>
              </div>
              <FileText className="w-4 h-4 text-[#777873]" />
            </div>

            <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#777873]">Connected Datasets</span>
                <div className="font-serif text-3xl font-bold text-[#858B70] mt-1">8</div>
                <div className="text-[11px] font-mono text-[#777873] mt-0.5">Zenodo, Dryad, OpenData</div>
              </div>
              <Database className="w-4 h-4 text-[#858B70]" />
            </div>

            <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#777873]">Contradictions Flagged</span>
                <div className="font-serif text-3xl font-bold text-[#B96645] mt-1">5</div>
                <div className="text-[11px] font-mono text-[#777873] mt-0.5">Empirical discrepancies</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-[#B96645]" />
            </div>

            <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#777873]">Research Gaps</span>
                <div className="font-serif text-3xl font-bold text-[#252622] mt-1">3</div>
                <div className="text-[11px] font-mono text-[#777873] mt-0.5">Unexplored questions</div>
              </div>
              <Lightbulb className="w-4 h-4 text-[#252622]" />
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-2 bg-[#FAF8F3] border-b border-[#E3E1D9] overflow-x-auto text-xs font-mono">
            {[
              { id: 'graph', label: 'Relational Graph' },
              { id: 'contradictions', label: 'Contradiction Analysis (5)' },
              { id: 'datasets', label: 'Connected Datasets (8)' },
              { id: 'gaps', label: 'Research Gaps (3)' },
              { id: 'timeline', label: 'Evolution Timeline' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 border-b-2 font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'border-[#252622] text-[#252622] bg-[#FDFCF9]'
                      : 'border-transparent text-[#777873] hover:text-[#252622]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Workspace Body */}
          <div className="p-6 bg-[#FDFCF9] min-h-[400px]">
            {/* VIEW 1: Relational Graph View */}
            {activeTab === 'graph' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] p-6 relative min-h-[340px] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-mono text-[#777873]">
                    <span>Cluster: Cognitive Assistance & Memory Consolidation</span>
                    <span>Algorithm: Topological Semantic Mesh</span>
                  </div>

                  {/* Clean SVG schematic representation */}
                  <div className="relative my-6 h-56 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#E3E1D9" strokeWidth="1.2" />
                      <line x1="50%" y1="50%" x2="75%" y2="28%" stroke="#E3E1D9" strokeWidth="1.2" />
                      <line x1="25%" y1="25%" x2="75%" y2="28%" stroke="#B96645" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="50%" y1="50%" x2="30%" y2="78%" stroke="#858B70" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#E3E1D9" strokeWidth="1.2" strokeDasharray="3 3" />
                    </svg>

                    {/* Central Query Node */}
                    <div className="relative z-10 p-3 rounded-lg bg-[#252622] text-[#FDFCF9] text-center max-w-[170px] shadow-sm">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[#CCC8BC]">INQUIRY CORE</div>
                      <div className="font-serif text-sm font-semibold mt-0.5">AI in Learning</div>
                    </div>

                    {/* Paper 1 Top Left */}
                    <div className="absolute top-2 left-6 p-2.5 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] text-left max-w-[160px] shadow-paper-subtle">
                      <span className="text-[9px] font-mono text-[#858B70] block font-semibold">[Ref 01] PAPER (2025)</span>
                      <span className="font-serif text-xs font-semibold text-[#252622] block truncate">Chen et al. Scaffolding</span>
                      <span className="text-[10px] text-[#777873] block">+34% initial fluency</span>
                    </div>

                    {/* Paper 2 Top Right (Conflict) */}
                    <div className="absolute top-4 right-6 p-2.5 rounded-lg bg-[#FDFCF9] border border-[#B96645] text-left max-w-[160px] shadow-paper-subtle">
                      <span className="text-[9px] font-mono text-[#B96645] block font-semibold">[Ref 02] CONFLICT DETECTED</span>
                      <span className="font-serif text-xs font-semibold text-[#252622] block truncate">Vogel (2024) Retention</span>
                      <span className="text-[10px] text-[#B96645] block">-22% delayed recall</span>
                    </div>

                    {/* Dataset Bottom Left */}
                    <div className="absolute bottom-2 left-10 p-2.5 rounded-lg bg-[#FDFCF9] border border-[#858B70] text-left max-w-[160px]">
                      <span className="text-[9px] font-mono text-[#858B70] block font-semibold">[Data 01] ZENODO</span>
                      <span className="font-serif text-xs font-semibold text-[#252622] block truncate">OpenCognition 100k</span>
                      <span className="text-[10px] text-[#777873] block">N = 100,000 tasks</span>
                    </div>

                    {/* Gap Bottom Right */}
                    <div className="absolute bottom-2 right-10 p-2.5 rounded-lg bg-[#FDFCF9] border border-[#252622] border-dashed text-left max-w-[160px]">
                      <span className="text-[9px] font-mono text-[#252622] block font-semibold">[Gap 01] UNEXPLORED</span>
                      <span className="font-serif text-xs font-semibold text-[#252622] block truncate">Socratic Interleaving</span>
                      <span className="text-[10px] text-[#777873] block">0 published trials</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#777873] pt-3 border-t border-[#E3E1D9]">
                    <span>Click any node in graph to view full citation manifest</span>
                    <span className="text-[#252622] font-semibold">Graph Affinity: 98.2%</span>
                  </div>
                </div>

                {/* Right Drawer: Paper Reference Detail */}
                <div className="lg:col-span-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E3E1D9] pb-3 text-xs font-mono">
                    <span className="text-[#858B70] uppercase font-semibold">Selected Paper [Ref 01]</span>
                    <span className="text-[#777873]">Nature Hum. Behav.</span>
                  </div>

                  <div>
                    <h4 className="font-serif text-base font-bold text-[#252622] leading-snug">
                      Chen et al. (2025): "Cognitive Scaffolding & Problem Decomposition via Large Language Models"
                    </h4>
                    <p className="text-xs text-[#777873] mt-2 leading-relaxed">
                      Evaluated 1,420 undergraduate students solving computational problems. 
                      Scaffolded prompting increased immediate comprehension benchmarks significantly.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E3E1D9] text-xs font-mono text-[#777873]">
                    <div className="flex justify-between">
                      <span>Harvested via:</span>
                      <span className="text-[#252622]">TinyFish autonomous crawl</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cohort Size:</span>
                      <span className="text-[#858B70]">N = 1,420 (Double-Blind)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flagged Conflict:</span>
                      <span className="text-[#B96645]">Diverges from Vogel (2024)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#B96645] text-xs font-mono text-[#252622]">
                    <div className="text-[10px] uppercase font-bold text-[#B96645] mb-1">
                      PaperTrail Synthesis Note:
                    </div>
                    Vogel (2024) tested participants after 60 days of no AI assistance; Chen (2025) concluded measurement after 48 hours. Latency discrepancy accounts for divergence.
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: Contradictions View */}
            {activeTab === 'contradictions' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[#B96645] uppercase font-semibold">
                      Automated Contradiction Ledger
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#252622] mt-0.5">
                      5 Empirical Discrepancies Detected Across 24 Papers
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#F3E8E2] text-[#B96645] font-semibold">
                    Methodology Dissonance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[#858B70]">
                      <span className="font-semibold">Study A: Scaffolding Gain</span>
                      <span>Chen et al. (2025)</span>
                    </div>
                    <h5 className="font-serif text-base font-semibold text-[#252622]">
                      "Generative guidance enhances mental model formation"
                    </h5>
                    <p className="text-xs text-[#777873] leading-relaxed">
                      "Participants receiving immediate Socratic hints completed task trees 34% faster with fewer redundant inquiries (p &lt; 0.001)."
                    </p>
                    <div className="pt-2 border-t border-[#E3E1D9] text-[11px] text-[#777873] flex justify-between">
                      <span>Tested: 48h Post-Test</span>
                      <span className="text-[#252622] font-semibold">Cohort: N=1,420</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-lg bg-[#FAF8F3] border border-[#B96645] space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[#B96645]">
                      <span className="font-semibold">Study B: Delayed Decay</span>
                      <span>Vogel & Larsson (2024)</span>
                    </div>
                    <h5 className="font-serif text-base font-semibold text-[#252622]">
                      "Cognitive offloading produces delayed recall deficit"
                    </h5>
                    <p className="text-xs text-[#777873] leading-relaxed">
                      "At 60 days, participants who used continuous AI assist scored 22% lower on unassisted recall tasks than manual search control group (p = 0.004)."
                    </p>
                    <div className="pt-2 border-t border-[#E3E1D9] text-[11px] text-[#777873] flex justify-between">
                      <span>Tested: 60-Day Retest</span>
                      <span className="text-[#252622] font-semibold">Cohort: N=980</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] text-xs font-mono text-[#777873]">
                  <span className="text-[#252622] font-bold">PaperTrail Synthesis:</span> The apparent contradiction is resolved by isolating test latency. Immediate assistance creates higher fluency, but without spaced retrieval intervals, long-term consolidation is impaired.
                </div>
              </div>
            )}

            {/* VIEW 3: Connected Datasets */}
            {activeTab === 'datasets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'OpenCognition 100k Benchmark', repo: 'Zenodo', records: '100,000 tasks', format: 'Parquet / CSV', license: 'CC-BY-4.0', linked: '4 Papers' },
                  { name: 'Longitudinal Spaced Recall Matrix', repo: 'Dryad', records: '980 participants', format: 'HDF5 / RData', license: 'Open Data', linked: '2 Papers' },
                  { name: 'fMRI Frontal Lobe Load Scans', repo: 'OpenNeuro', records: '142 scan series', format: 'BIDS / NIfTI', license: 'ODbL', linked: '1 Paper' },
                  { name: 'High-School Geometry Interaction Logs', repo: 'HuggingFace', records: '45,000 dialogues', format: 'JSONL', license: 'MIT', linked: '3 Papers' },
                ].map((ds, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] font-mono text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#858B70] font-semibold">{ds.repo}</span>
                      <span className="text-[#777873]">{ds.format}</span>
                    </div>
                    <h5 className="font-serif text-base font-semibold text-[#252622] mb-1">{ds.name}</h5>
                    <div className="flex items-center justify-between text-[11px] text-[#777873] mt-3 pt-2 border-t border-[#E3E1D9]">
                      <span>{ds.records}</span>
                      <span className="text-[#252622] font-semibold">{ds.linked}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 4: Research Gaps */}
            {activeTab === 'gaps' && (
              <div className="space-y-3 font-mono text-xs">
                {[
                  {
                    gapId: 'GAP-01',
                    title: 'Delayed Socratic Scaffolding vs Pure Retrieval Practice',
                    score: '94 / 100 Novelty',
                    desc: 'No current publications have tested an interleaving model where conversational AI prompts actively delay answers by forcing user hypothesis entry first.',
                    priority: 'High Priority Hypothesis'
                  },
                  {
                    gapId: 'GAP-02',
                    title: 'Cross-Domain Metacognition Calibration in Autonomous Literature Review',
                    score: '91 / 100 Novelty',
                    desc: 'Absence of empirical trials testing whether researchers develop overconfidence in literature mastery when using multi-hop graph synthesizers.',
                    priority: 'Methodology Opportunity'
                  },
                  {
                    gapId: 'GAP-03',
                    title: 'Preprint Citation Drift vs Peer-Reviewed Post-Correction',
                    score: '88 / 100 Novelty',
                    desc: 'Dataset gap between bioRxiv retraction notifications and subsequent derivative downstream citations in machine learning pipelines.',
                    priority: 'Data Pipeline Void'
                  }
                ].map((gap) => (
                  <div key={gap.gapId} className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B96645] font-bold">{gap.gapId}</span>
                      <span className="px-2 py-0.5 rounded bg-[#EBECE6] text-[#858B70] font-semibold">
                        {gap.score}
                      </span>
                    </div>
                    <h5 className="font-serif text-base font-bold text-[#252622]">{gap.title}</h5>
                    <p className="text-xs text-[#777873] leading-relaxed">{gap.desc}</p>
                    <div className="pt-2 border-t border-[#E3E1D9] flex items-center justify-between text-[11px] text-[#252622]">
                      <span>{gap.priority}</span>
                      <span className="text-[#B96645] hover:underline cursor-pointer">Export Study Specification &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 5: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E3E1D9]">
                  {[
                    { year: '2019', paper: 'Sweller et al. — Cognitive Load Theory in Digital Environments', shift: 'Foundation' },
                    { year: '2022', paper: 'Brown & Clark — Generative Dialogues in STEM Pedagogy', shift: 'Initial Adoption' },
                    { year: '2024', paper: 'Vogel & Larsson — Delayed Recall Testing Unveils Offloading Deficit', shift: 'Contradiction Surfaced' },
                    { year: '2025', paper: 'Chen et al. — Active Scaffolding Compensates for Memory Loss', shift: 'Synthesis & Hybridization' },
                    { year: '2026', paper: 'PaperTrail Autonomous Network — Unifying 24 Trials and Flagging Open Gaps', shift: 'Current Frontier' },
                  ].map((item, idx) => (
                    <div key={idx} className="relative bg-[#FAF8F3] p-3 rounded-lg border border-[#E3E1D9]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#252622] font-bold">{item.year}</span>
                        <span className="text-[10px] text-[#777873] bg-[#FDFCF9] border border-[#E3E1D9] px-2 py-0.5 rounded">{item.shift}</span>
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#252622]">{item.paper}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dashboard Status Footer */}
          <div className="px-6 py-3 bg-[#FAF8F3] border-t border-[#E3E1D9] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#777873]">
            <div className="flex items-center gap-3 text-[11px]">
              <span>Sources: Nature, arXiv, IEEE, Zenodo</span>
              <span className="text-[#CCC8BC]">•</span>
              <span className="text-[#858B70]">TinyFish Navigation Engine Online</span>
            </div>
            <div className="text-[11px] text-[#252622]">
              PaperTrail Intelligence Core v2.4
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

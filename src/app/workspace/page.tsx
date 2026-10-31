'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { EvidenceGraphView } from '@/components/EvidenceGraphView';
import { DisagreementView } from '@/components/DisagreementView';
import { GapExplorerView } from '@/components/GapExplorerView';
import { TimelineEvolutionView } from '@/components/TimelineEvolutionView';
import { RetractionAlertsView } from '@/components/RetractionAlertsView';
import { PreprintLineageView } from '@/components/PreprintLineageView';
import { DatasetExplorerView } from '@/components/DatasetExplorerView';
import { CrossDomainView } from '@/components/CrossDomainView';
import { ClaimTypeBadge, OpenAccessBadge } from '@/components/Badges';
import {
  Paper,
  Claim,
  ResearchGap,
  EvidenceRelationship,
  ResearchGraphData,
  ResearchSession,
  GapInvestigationReport,
  ProposedExperiment,
  EvidenceEvolutionEvent,
  PaperLineage,
  RetractionAlert,
  Dataset,
  CrossDomainConnection,
} from '@/types';
import {
  Search,
  Sparkles,
  Network,
  FileText,
  ArrowRightLeft,
  Loader2,
  ExternalLink,
  Play,
  Cpu,
  Layers,
  Clock,
  ShieldAlert,
  GitCompare,
  Database,
  Shuffle,
  RefreshCw,
} from 'lucide-react';

const PRESET_QUERIES = [
  'Under what conditions does 4-bit quantization degrade reasoning in edge small language models?',
  'How does sustained thermal throttling affect token throughput on mobile SoCs?',
  'Compare AWQ vs GPTQ memory bandwidth bottlenecks on ARM CPU architectures',
  'Activation sparsity caching efficiency on ultra-low memory edge devices',
];

export default function WorkspacePage() {
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'discovery' | 'graph' | 'claims' | 'disagreements' | 'gaps' | 'timeline' | 'lineages' | 'retractions' | 'datasets' | 'cross-domain'
  >('discovery');

  // Session state data
  const [papers, setPapers] = useState<Paper[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [disagreements, setDisagreements] = useState<EvidenceRelationship[]>([]);
  const [gaps, setGaps] = useState<ResearchGap[]>([]);
  const [graphData, setGraphData] = useState<ResearchGraphData>({ nodes: [], edges: [] });
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([]);
  const [evolutionEvents, setEvolutionEvents] = useState<EvidenceEvolutionEvent[]>([]);
  const [lineages, setLineages] = useState<PaperLineage[]>([]);
  const [retractionAlerts, setRetractionAlerts] = useState<RetractionAlert[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [crossDomains, setCrossDomains] = useState<CrossDomainConnection[]>([]);

  // Initialize or load session
  useEffect(() => {
    initDefaultSession();
  }, []);

  const initDefaultSession = async () => {
    try {
      const res = await fetch('/api/research/sessions');
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        selectSession(data.sessions[0].id);
      } else {
        createNewSession(PRESET_QUERIES[0]);
      }
    } catch {
      createNewSession(PRESET_QUERIES[0]);
    }
  };

  const createNewSession = async (question: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/research/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_question: question,
          title: question.slice(0, 65),
          domain: 'edge_ai',
        }),
      });
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session);
        setQuery(question);
        await runDiscovery(data.session.id, question);
      }
    } catch (err: any) {
      console.error('Session creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/research/sessions/${sessionId}`);
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session);
        setQuery(data.session.research_question);
        await refreshSessionData(sessionId);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshSessionData = async (sessionId: string) => {
    const [
      papersRes,
      claimsRes,
      disRes,
      gapsRes,
      graphRes,
      timelineRes,
      lineagesRes,
      retractionsRes,
      datasetsRes,
      crossRes,
    ] = await Promise.all([
      fetch(`/api/research/sessions/${sessionId}/papers`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/claims`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/disagreements`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/gaps`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/graph`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/timeline`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/lineages`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/retractions`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/datasets`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/research/sessions/${sessionId}/cross-domain`).then(r => r.json()).catch(() => ({})),
    ]);

    setPapers(papersRes.papers || []);
    setClaims(claimsRes.claims || []);
    setDisagreements(disRes.disagreements || []);
    setGaps(gapsRes.gaps || []);
    setGraphData(graphRes.graph || { nodes: [], edges: [] });
    setEvolutionEvents(timelineRes.events || []);
    setLineages(lineagesRes.lineages || []);
    setRetractionAlerts(retractionsRes.alerts || []);
    setDatasets(datasetsRes.datasets || []);
    setCrossDomains(crossRes.connections || []);
  };

  const runDiscovery = async (sessionId: string, targetQuery?: string) => {
    setLoading(true);
    try {
      const q = targetQuery || query;
      const res = await fetch(`/api/research/sessions/${sessionId}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 12 }),
      });
      const data = await res.json();
      if (data.papers) {
        setPapers(data.papers);
        setSourcesUsed(data.sources_used || []);
        await runAnalysis(sessionId);
      }
    } catch (err: any) {
      alert(`Discovery error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (sessionId: string) => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/analyze`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await refreshSessionData(sessionId);
      }
    } catch (err: any) {
      alert(`Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCheckEvolution = async () => {
    if (!activeSession) return;
    setEvolving(true);
    try {
      const res = await fetch(`/api/research/sessions/${activeSession.id}/evolution/check`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await refreshSessionData(activeSession.id);
        setActiveTab('timeline');
      }
    } catch (err: any) {
      alert(`Evolution check error: ${err.message}`);
    } finally {
      setEvolving(false);
    }
  };

  const handleFalsifyGap = async (gapId: string): Promise<GapInvestigationReport> => {
    const res = await fetch(`/api/research/gaps/${gapId}/investigate`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falsification failed');
    if (activeSession) await refreshSessionData(activeSession.id);
    return data.report;
  };

  const handlePlanExperiment = async (gapId: string): Promise<ProposedExperiment> => {
    const res = await fetch(`/api/research/gaps/${gapId}/plan-experiment`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Experiment planning failed');
    return data.experiment;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Control Bar: Research Query & Engine Triggers */}
        <div className="p-5 rounded-xl border border-border bg-surface shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-content-muted absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter research topic, hypothesis, DOI, or arXiv identifier (e.g. 2402.14905)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface-elevated border border-border text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent text-sm transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeSession) {
                    runDiscovery(activeSession.id, query);
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  if (activeSession) runDiscovery(activeSession.id, query);
                }}
                disabled={loading || analyzing || !query.trim()}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-background hover:bg-accent-hover disabled:opacity-50 transition-all shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Discover</span>
              </button>

              <button
                onClick={() => {
                  if (activeSession) runAnalysis(activeSession.id);
                }}
                disabled={analyzing || loading || papers.length === 0}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-surface-elevated border border-border hover:border-secondary text-content-primary disabled:opacity-50 transition-all"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-secondary" /> : <Play className="w-4 h-4 text-secondary" />}
                <span>Extract & Link</span>
              </button>

              <button
                onClick={handleCheckEvolution}
                disabled={evolving || loading}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/50 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${evolving ? 'animate-spin' : ''}`} />
                <span>Check Evolution</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Queries */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-content-muted">Sample Investigations:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(preset);
                  createNewSession(preset);
                }}
                className="px-2.5 py-1 rounded bg-surface-elevated border border-border text-content-secondary hover:text-accent hover:border-accent/40 text-[11px] truncate max-w-[280px] transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Provenance and Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-surface/70 border border-border text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-content-muted">Corpus:</span>
            <span className="font-semibold text-content-primary">{papers.length} Papers</span>
            <span className="text-content-muted">•</span>
            <span className="font-semibold text-accent">{claims.length} Claims</span>
            <span className="text-content-muted">•</span>
            <span className="font-semibold text-amber-400">{disagreements.length} Disagreements</span>
            <span className="text-content-muted">•</span>
            <span className="font-semibold text-purple-400">{gaps.length} Gaps</span>
            <span className="text-content-muted">•</span>
            <span className="font-semibold text-sky-400">{evolutionEvents.length} Evolution Events</span>
          </div>

          {sourcesUsed.length > 0 && (
            <div className="flex items-center space-x-1.5 font-mono text-[11px] text-content-muted">
              <span>Sources:</span>
              <span className="text-content-secondary">{sourcesUsed.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 border-b border-border pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'discovery'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Discovery ({papers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'graph'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Evidence Graph ({graphData.nodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'claims'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Claims ({claims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('disagreements')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'disagreements'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Disagreements ({disagreements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'gaps'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gaps & Falsification ({gaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Evidence Timeline ({evolutionEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lineages')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'lineages'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-secondary" />
            <span>Preprint Lineage ({lineages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('retractions')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'retractions'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Retractions ({retractionAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'datasets'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-accent" />
            <span>Datasets ({datasets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cross-domain')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'cross-domain'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-content-secondary hover:text-content-primary'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" />
            <span>Cross-Domain ({crossDomains.length})</span>
          </button>
        </div>

        {/* Tab 1: Discovery View */}
        {activeTab === 'discovery' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-5 rounded-xl border border-border bg-surface hover:border-border-highlight transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-secondary uppercase font-semibold">
                          {paper.venue || 'Scholarly Archive'}
                        </span>
                        {paper.year && <span className="text-xs font-mono text-content-muted">({paper.year})</span>}
                        <OpenAccessBadge status={paper.open_access_status} />
                      </div>
                      <h4 className="text-base font-bold text-content-primary leading-snug">
                        {paper.title}
                      </h4>
                      <p className="text-xs text-content-muted">
                        Authors: {paper.authors.map(a => a.name).join(', ') || 'Unknown'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {paper.canonical_url && (
                        <a
                          href={paper.canonical_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-content-secondary hover:text-accent hover:border-accent/40"
                        >
                          <span>Original Paper</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-content-secondary leading-relaxed">
                    {paper.abstract}
                  </p>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-content-muted">
                    <span>Citations: {paper.citation_count || 0}</span>
                    <span>Provider ID: {paper.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Evidence Graph */}
        {activeTab === 'graph' && (
          <EvidenceGraphView graphData={graphData} />
        )}

        {/* Tab 3: Grounded Claims View */}
        {activeTab === 'claims' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl border border-border bg-surface hover:border-accent/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <ClaimTypeBadge type={claim.claim_type} />
                  <span className="text-xs font-mono text-accent">
                    Confidence: {(claim.extraction_confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <p className="text-sm font-semibold text-content-primary italic">
                  "{claim.claim_text}"
                </p>

                <div className="p-3 rounded-lg bg-surface-elevated border border-border space-y-1">
                  <span className="text-[10px] font-mono text-content-muted uppercase block">
                    Grounded Supporting Passage ({claim.section}):
                  </span>
                  <p className="text-xs text-content-secondary font-mono leading-relaxed">
                    {claim.supporting_passage}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-content-muted flex justify-between">
                  <span className="truncate max-w-[200px]">{claim.paper_title || 'From source paper'}</span>
                  <span className="text-accent">{claim.verification_status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Disagreements View */}
        {activeTab === 'disagreements' && (
          <DisagreementView disagreements={disagreements} />
        )}

        {/* Tab 5: Candidate Gap Explorer & Falsification */}
        {activeTab === 'gaps' && (
          <GapExplorerView
            gaps={gaps}
            onFalsify={handleFalsifyGap}
            onPlanExperiment={handlePlanExperiment}
          />
        )}

        {/* Tab 6: Evidence Evolution Timeline */}
        {activeTab === 'timeline' && activeSession && (
          <TimelineEvolutionView
            sessionId={activeSession.id}
            events={evolutionEvents}
            onCheckEvolution={handleCheckEvolution}
          />
        )}

        {/* Tab 7: Preprint-to-Publication Lineages */}
        {activeTab === 'lineages' && (
          <PreprintLineageView lineages={lineages} />
        )}

        {/* Tab 8: Retraction & Correction Alerts */}
        {activeTab === 'retractions' && (
          <RetractionAlertsView alerts={retractionAlerts} />
        )}

        {/* Tab 9: Accessible Benchmark Datasets */}
        {activeTab === 'datasets' && (
          <DatasetExplorerView datasets={datasets} />
        )}

        {/* Tab 10: Cross-Domain Connections */}
        {activeTab === 'cross-domain' && (
          <CrossDomainView connections={crossDomains} />
        )}
      </main>
    </div>
  );
}

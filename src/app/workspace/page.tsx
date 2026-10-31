'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaperTrailShell } from '@/components/shell/PaperTrailShell';
import { WorkspaceTab } from '@/components/shell/PaperTrailSidebar';
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
  Plus,
  BookOpen,
  Compass,
  CheckCircle2,
  Filter,
  ArrowRight,
  HardDrive
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  { id: 'general', label: 'Cross-Disciplinary / General Science' },
  { id: 'cognitive_science', label: 'Cognitive Science & Learning' },
  { id: 'biomedicine', label: 'Biomedicine & Genomics' },
  { id: 'materials_physics', label: 'Physics & Materials Science' },
  { id: 'edge_ai', label: 'Edge AI & Resource-Constrained Inference' },
  { id: 'climate', label: 'Climate & Earth Systems' },
];

const INSPIRATION_QUESTIONS = [
  {
    domain: 'cognitive_science',
    label: 'Cognitive Scaffolding & Memory Retention',
    question: 'Does persistent conversational AI scaffolding impair long-term conceptual retention in human learners?',
  },
  {
    domain: 'biomedicine',
    label: 'CRISPR-Cas9 Off-Target Variations',
    question: 'What mechanisms explain off-target Cas9 cleavage frequency variations across diverse human cell lineages?',
  },
  {
    domain: 'materials_physics',
    label: 'Ambient Superconductivity Replication',
    question: 'Under what pressure and temperature boundaries do substituted cuprate and nickelate compounds exhibit zero resistance?',
  },
  {
    domain: 'edge_ai',
    label: 'Edge AI 4-Bit Reasoning Boundaries',
    question: 'Under what conditions does 4-bit activation and weight quantization degrade reasoning in edge small language models?',
  },
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(null);
  const [allSessions, setAllSessions] = useState<ResearchSession[]>([]);
  const [inquiryInput, setInquiryInput] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('general');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('discovery');
  
  // Execution status
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [analyzingMessage, setAnalyzingMessage] = useState('');
  const [showInquiryDesk, setShowInquiryDesk] = useState(false);

  // Investigation datasets
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
  const [paperFilter, setPaperFilter] = useState('');

  // Initial load
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/research/sessions');
      const data = await res.json();
      const sessions: ResearchSession[] = data.sessions || [];
      setAllSessions(sessions);

      const urlSessionId = searchParams.get('session');
      const urlQuery = searchParams.get('q');

      if (urlSessionId) {
        await selectSession(urlSessionId);
      } else if (urlQuery) {
        setInquiryInput(urlQuery);
        await initiateInvestigation(urlQuery, 'general');
      } else if (sessions.length > 0) {
        // Load most recent session
        await selectSession(sessions[0].id);
      } else {
        // No sessions exist yet: present Inquiry Desk
        setShowInquiryDesk(true);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setShowInquiryDesk(true);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}`);
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session);
        setInquiryInput(data.session.research_question);
        setSelectedDomain(data.session.domain || 'general');
        setShowInquiryDesk(false);

        // Fetch session data in parallel
        await Promise.allSettled([
          fetchSessionPapers(sessionId),
          fetchSessionClaims(sessionId),
          fetchSessionDisagreements(sessionId),
          fetchSessionGaps(sessionId),
          fetchSessionGraph(sessionId),
          fetchSessionEvolution(sessionId),
          fetchSessionLineages(sessionId),
          fetchSessionRetractions(sessionId),
          fetchSessionDatasets(sessionId),
          fetchSessionCrossDomains(sessionId),
        ]);
      }
    } catch (err) {
      console.error('Failed to select session:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateInvestigation = async (question: string, domain: string) => {
    if (!question.trim()) return;

    setAnalyzing(true);
    setShowInquiryDesk(false);
    setAnalyzingStep(1);
    setAnalyzingMessage('Retrieving literature across OpenAlex, arXiv, Semantic Scholar, and Crossref...');

    try {
      // 1. Create session in database
      const createRes = await fetch('/api/research/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_question: question,
          title: question.length > 60 ? `${question.slice(0, 60)}...` : question,
          domain: domain || 'general',
        }),
      });
      const createData = await createRes.json();
      const session: ResearchSession = createData.session;
      if (!session) throw new Error('Failed to create research session');

      setActiveSession(session);
      setAllSessions(prev => [session, ...prev.filter(s => s.id !== session.id)]);

      // 2. Discover multi-provider papers
      setAnalyzingStep(2);
      setAnalyzingMessage('Querying scientific repositories & deduplicating evidence...');
      const discoverRes = await fetch(`/api/research/sessions/${session.id}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, limit: 12 }),
      });
      const discoverData = await discoverRes.json();
      const discoveredPapers: Paper[] = discoverData.papers || [];
      setPapers(discoveredPapers);
      setSourcesUsed(discoverData.sources_used || []);

      // 3. Extract grounded scientific claims and investigate disagreements
      setAnalyzingStep(3);
      setAnalyzingMessage('Extracting grounded scientific claims, experimental conditions, and detecting contradictions...');
      const analyzeRes = await fetch(`/api/research/sessions/${session.id}/analyze`, {
        method: 'POST',
      });
      const analyzeData = await analyzeRes.json();
      if (analyzeData.claims) setClaims(analyzeData.claims);
      if (analyzeData.disagreements) setDisagreements(analyzeData.disagreements);
      if (analyzeData.gaps) setGaps(analyzeData.gaps);

      // 4. Synthesize evidence relationship graph
      setAnalyzingStep(4);
      setAnalyzingMessage('Synthesizing evidence relationship graph and calculating provenance...');
      await Promise.allSettled([
        fetchSessionClaims(session.id),
        fetchSessionDisagreements(session.id),
        fetchSessionGaps(session.id),
        fetchSessionGraph(session.id),
      ]);

      // 5. Check ancillary modules (datasets, evolution, lineages, retractions, cross-domain)
      setAnalyzingStep(5);
      setAnalyzingMessage('Finalizing investigation portfolio...');
      await Promise.allSettled([
        fetchSessionDatasets(session.id),
        fetchSessionEvolution(session.id),
        fetchSessionLineages(session.id),
        fetchSessionRetractions(session.id),
        fetchSessionCrossDomains(session.id),
      ]);

      setActiveTab('discovery');
    } catch (err: any) {
      console.error('Investigation initiation error:', err);
      alert(`Investigation notice: ${err.message}`);
    } finally {
      setAnalyzing(false);
      setAnalyzingStep(0);
      setAnalyzingMessage('');
    }
  };

  const fetchSessionPapers = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/papers`);
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionClaims = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/claims`);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionDisagreements = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/disagreements`);
      const data = await res.json();
      setDisagreements(data.disagreements || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionGaps = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/gaps`);
      const data = await res.json();
      setGaps(data.gaps || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionGraph = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/graph`);
      const data = await res.json();
      if (data.graph) setGraphData(data.graph);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionEvolution = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/evolution`);
      const data = await res.json();
      setEvolutionEvents(data.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionLineages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/lineages`);
      const data = await res.json();
      setLineages(data.lineages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionRetractions = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/retractions`);
      const data = await res.json();
      setRetractionAlerts(data.alerts || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionDatasets = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/datasets`);
      const data = await res.json();
      setDatasets(data.datasets || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessionCrossDomains = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/research/sessions/${sessionId}/cross-domain`);
      const data = await res.json();
      setCrossDomains(data.connections || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunFalsify = async (gapId: string): Promise<GapInvestigationReport> => {
    if (!activeSession) throw new Error('No active session');
    const res = await fetch(`/api/research/sessions/${activeSession.id}/gaps/${gapId}/falsify`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.report) {
      await fetchSessionGaps(activeSession.id);
      return data.report;
    }
    throw new Error(data.error || 'Falsification failed');
  };

  const handlePlanExperiment = async (gapId: string): Promise<ProposedExperiment> => {
    if (!activeSession) throw new Error('No active session');
    const res = await fetch(`/api/research/sessions/${activeSession.id}/gaps/${gapId}/experiment`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.experiment) return data.experiment;
    throw new Error(data.error || 'Experiment synthesis failed');
  };

  const handleCheckEvolution = async () => {
    if (!activeSession) return;
    const res = await fetch(`/api/research/sessions/${activeSession.id}/evolution/check`, {
      method: 'POST',
    });
    const data = await res.json();
    await fetchSessionEvolution(activeSession.id);
  };

  const filteredPapers = papers.filter(p => {
    if (!paperFilter.trim()) return true;
    const q = paperFilter.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.abstract?.toLowerCase().includes(q) ||
      p.venue?.toLowerCase().includes(q) ||
      p.authors?.some(a => a.name.toLowerCase().includes(q))
    );
  });

  return (
    <PaperTrailShell
      activeSession={activeSession}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNewInquiry={() => setShowInquiryDesk(true)}
      counts={{
        papers: papers.length,
        claims: claims.length,
        disagreements: disagreements.length,
        gaps: gaps.length,
        datasets: datasets.length,
        retractions: retractionAlerts.length,
        evolutionEvents: evolutionEvents.length,
      }}
    >
      {/* 1. Scholarly Inquiry Desk Modal / View */}
      {showInquiryDesk && (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-200">
          {/* Hero Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#777873]">
              <span>Scientific Inception</span>
              <span className="text-[#CCC8BC]">/</span>
              <span className="text-[#B96645] font-semibold">New Investigation</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#252622] tracking-tight leading-[1.1]">
              Formulate your scientific inquiry. <br />
              <span className="italic text-[#B96645]">Traverse evidence across disciplines.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#777873] leading-relaxed max-w-2xl font-sans">
              PaperTrail explores OpenAlex, arXiv, Semantic Scholar, and Crossref to extract grounded scientific claims, differentiate apparent from genuine contradictions, and formulate falsifiable research gaps.
            </p>
          </div>

          {/* Primary Inquiry Card */}
          <div className="rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] p-6 shadow-paper space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#777873] font-semibold block">
                Research Question, Hypothesis, or DOI:
              </label>
              <textarea
                value={inquiryInput}
                onChange={(e) => setInquiryInput(e.target.value)}
                rows={3}
                placeholder="e.g. Does persistent LLM conversational scaffolding impair delayed memory retention in human learners?"
                className="w-full p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-sm text-[#252622] placeholder-[#9D9E99] font-sans focus:outline-none focus:border-[#252622] transition-colors resize-none"
              />
            </div>

            {/* Scientific Domain Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#777873] font-semibold block">
                Primary Scientific Field / Taxonomy:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {DOMAIN_OPTIONS.map((dom) => (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setSelectedDomain(dom.id)}
                    className={`p-2.5 rounded-lg text-xs font-mono text-left transition-all border ${
                      selectedDomain === dom.id
                        ? 'bg-[#252622] text-[#FDFCF9] border-[#252622] font-semibold shadow-sm'
                        : 'bg-[#FAF8F3] text-[#777873] border-[#E3E1D9] hover:text-[#252622] hover:bg-[#FDFCF9]'
                    }`}
                  >
                    {dom.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Providers Status Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#777873]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider">Multi-Provider Index:</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">OpenAlex</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">arXiv</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">Semantic Scholar</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622]">Crossref</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#858B70]">TinyFish Ready</span>
              </div>

              <div className="flex items-center gap-3">
                {activeSession && (
                  <button
                    type="button"
                    onClick={() => setShowInquiryDesk(false)}
                    className="px-4 py-2.5 rounded-lg border border-[#E3E1D9] text-xs font-mono text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => initiateInvestigation(inquiryInput, selectedDomain)}
                  disabled={!inquiryInput.trim() || analyzing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#252622] text-[#FDFCF9] text-xs font-medium hover:bg-[#383A34] disabled:opacity-50 transition-all shadow-[0_1px_3px_rgba(37,38,34,0.1)] active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#EFECE5]" />
                  <span>Initiate Scientific Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Cross-Disciplinary Inspiration Prompts */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#777873] font-semibold">
              Example Research Questions Across Disciplines:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INSPIRATION_QUESTIONS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setInquiryInput(item.question);
                    setSelectedDomain(item.domain);
                  }}
                  className="p-4 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] hover:border-[#B96645] hover:bg-[#FAF8F3] cursor-pointer transition-all space-y-1.5 shadow-paper-subtle group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#B96645] font-semibold">{item.label}</span>
                    <span className="text-[#777873] group-hover:text-[#252622] flex items-center gap-1">
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <p className="font-serif text-sm text-[#252622] leading-snug">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Investigations Drawer */}
          {allSessions.length > 0 && (
            <div className="pt-4 border-t border-[#E3E1D9] space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#777873] font-semibold">
                Recent Saved Investigations ({allSessions.length}):
              </h3>
              <div className="divide-y divide-[#E3E1D9] rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] overflow-hidden shadow-paper-subtle">
                {allSessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s.id)}
                    className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] shrink-0">
                        {s.id.slice(0, 12)}
                      </span>
                      <span className="font-serif text-sm text-[#252622] truncate">
                        {s.title || s.research_question}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#B96645] font-semibold shrink-0 ml-4 flex items-center gap-1">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Multi-Stage Progress Modal */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252622]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] p-6 shadow-paper-lg space-y-5">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#B96645] animate-spin" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#252622]">
                  Autonomous Scientific Evidence Pipeline
                </h3>
                <p className="text-xs text-[#777873] font-sans">
                  Executing verifiable literature synthesis & adversarial gap audits
                </p>
              </div>
            </div>

            {/* Stages Visualizer */}
            <div className="space-y-3 font-mono text-xs">
              {[
                { step: 1, title: 'Multi-Provider Scholarly Retrieval', desc: 'OpenAlex, arXiv, Semantic Scholar, Crossref' },
                { step: 2, title: 'Deduplication & Provenance Ingestion', desc: 'Normalized DOIs & canonical full-texts' },
                { step: 3, title: 'Grounded Claim Extraction', desc: 'Verbatim citations & experimental condition matrices' },
                { step: 4, title: 'Disagreement & Contradiction Audit', desc: 'Differentiating apparent vs genuine divergence' },
                { step: 5, title: 'Candidate Gap Synthesis & Graph Assembly', desc: 'Building multi-tier relationship topology' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                    analyzingStep > s.step
                      ? 'bg-[#858B70]/10 border-[#858B70]/30 text-[#5A6048]'
                      : analyzingStep === s.step
                      ? 'bg-[#FAF8F3] border-[#B96645] text-[#252622] shadow-sm'
                      : 'bg-[#FDFCF9] border-[#E3E1D9]/60 text-[#9D9E99]'
                  }`}
                >
                  <div className="mt-0.5">
                    {analyzingStep > s.step ? (
                      <CheckCircle2 className="w-4 h-4 text-[#858B70]" />
                    ) : analyzingStep === s.step ? (
                      <Loader2 className="w-4 h-4 text-[#B96645] animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#CCC8BC] flex items-center justify-center text-[10px]">
                        {s.step}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold block">{s.title}</span>
                    <span className="text-[11px] text-[#777873] font-sans block">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#777873] italic text-center font-serif">
              {analyzingMessage}
            </p>
          </div>
        </div>
      )}

      {/* 3. Active Investigation Workspace Canvas */}
      {!showInquiryDesk && activeSession && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Active Session Headline Banner */}
          <div className="p-6 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] shadow-paper space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#777873]">
                <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622] font-semibold">
                  Session: {activeSession.id.slice(0, 16)}
                </span>
                <span>•</span>
                <span className="text-[#858B70] uppercase font-semibold">
                  Domain: {activeSession.domain || 'General Science'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckEvolution}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono text-[#777873] hover:text-[#252622] hover:bg-[#FDFCF9] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#858B70]" />
                  <span>Check Continuous Evolution</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#252622] leading-tight">
                {activeSession.title || activeSession.research_question}
              </h2>
              <p className="mt-1 text-xs text-[#777873] font-mono leading-relaxed">
                Primary Question: {activeSession.research_question}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-3 border-t border-[#E3E1D9] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[#777873] text-[10px] block uppercase">Papers Verified</span>
                <span className="text-base font-semibold text-[#252622]">{papers.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[#777873] text-[10px] block uppercase">Grounded Claims</span>
                <span className="text-base font-semibold text-[#252622]">{claims.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[#777873] text-[10px] block uppercase">Contradictions</span>
                <span className="text-base font-semibold text-[#B96645]">{disagreements.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[#777873] text-[10px] block uppercase">Research Gaps</span>
                <span className="text-base font-semibold text-[#B96645]">{gaps.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[#777873] text-[10px] block uppercase">Datasets Linked</span>
                <span className="text-base font-semibold text-[#858B70]">{datasets.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <span className="text-[#777873] text-[10px] block uppercase">Retraction Alerts</span>
                <span className="text-base font-semibold text-[#252622]">{retractionAlerts.length}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E3E1D9] text-xs font-mono">
            {[
              { id: 'discovery' as WorkspaceTab, label: 'Overview & Papers', count: papers.length },
              { id: 'graph' as WorkspaceTab, label: 'Evidence Graph', count: claims.length },
              { id: 'claims' as WorkspaceTab, label: 'Grounded Claims', count: claims.length },
              { id: 'disagreements' as WorkspaceTab, label: 'Contradictions & Divergence', count: disagreements.length },
              { id: 'gaps' as WorkspaceTab, label: 'Research Gaps & Audits', count: gaps.length },
              { id: 'datasets' as WorkspaceTab, label: 'Accessible Datasets', count: datasets.length },
              { id: 'timeline' as WorkspaceTab, label: 'Evidence Evolution', count: evolutionEvents.length },
              { id: 'lineages' as WorkspaceTab, label: 'Preprint Lineages', count: lineages.length },
              { id: 'retractions' as WorkspaceTab, label: 'Retractions', count: retractionAlerts.length },
              { id: 'cross-domain' as WorkspaceTab, label: 'Cross-Domain', count: crossDomains.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-[#252622] text-[#FDFCF9] border-[#252622] font-semibold shadow-sm'
                    : 'bg-[#FDFCF9] text-[#777873] border-[#E3E1D9] hover:text-[#252622] hover:bg-[#FAF8F3]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] ${
                    activeTab === tab.id ? 'bg-[#383A34] text-[#FDFCF9]' : 'bg-[#FAF8F3] text-[#777873]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Views */}
          {activeTab === 'discovery' && (
            <div className="space-y-6">
              {/* Paper Search & Provider Info */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777873]" />
                  <input
                    type="text"
                    value={paperFilter}
                    onChange={(e) => setPaperFilter(e.target.value)}
                    placeholder="Search verified papers by author, title, venue..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#FDFCF9] border border-[#E3E1D9] text-xs font-mono text-[#252622] placeholder-[#9D9E99] focus:outline-none focus:border-[#252622]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#777873]">
                  <span>Showing {filteredPapers.length} of {papers.length} publications</span>
                </div>
              </div>

              {/* Papers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-5 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] hover:border-[#CCC8BC] transition-all space-y-3.5 shadow-paper flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs font-mono">
                        <span className="text-[#777873] truncate max-w-[200px]">
                          {paper.venue || 'Scholarly Journal'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <OpenAccessBadge status={paper.open_access_status} />
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#252622] text-[10px]">
                            {paper.year || '2024'}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-serif text-base font-semibold text-[#252622] leading-snug">
                        {paper.title}
                      </h4>

                      <p className="text-xs text-[#777873] line-clamp-3 leading-relaxed font-sans">
                        {paper.abstract || 'No abstract text preview available.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E3E1D9] flex items-center justify-between text-xs font-mono text-[#777873]">
                      <span className="truncate max-w-[200px]">
                        {paper.authors?.[0]?.name || 'Author'} et al.
                      </span>

                      {paper.canonical_url && (
                        <a
                          href={paper.canonical_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#B96645] hover:underline font-semibold"
                        >
                          <span>Verified Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#252622]">
                    Hierarchical Evidence Relationship Graph
                  </h3>
                  <p className="text-xs text-[#777873] font-sans">
                    Interactive topology mapping papers (top tier), extracted claims (column tiers), and research gaps (bottom tier).
                  </p>
                </div>
              </div>
              <EvidenceGraphView graphData={graphData} />
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3E1D9]">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#252622]">
                    Grounded Scientific Claims
                  </h3>
                  <p className="text-xs text-[#777873] font-sans">
                    Every extracted claim preserves an exact supporting passage and paper citation.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873]">
                  {claims.length} claims extracted
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-5 rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] hover:border-[#CCC8BC] transition-all space-y-3 shadow-paper"
                  >
                    <div className="flex items-center justify-between">
                      <ClaimTypeBadge type={claim.claim_type} />
                      <span className="text-xs font-mono text-[#858B70] bg-[#858B70]/10 px-2 py-0.5 rounded">
                        {(claim.extraction_confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>

                    <p className="font-serif text-sm font-medium text-[#252622] leading-relaxed italic">
                      &ldquo;{claim.claim_text}&rdquo;
                    </p>

                    <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono space-y-1">
                      <span className="text-[10px] text-[#777873] uppercase tracking-wider block font-semibold">
                        Verbatim Grounding Passage:
                      </span>
                      <p className="text-[#252622] leading-relaxed">
                        {claim.supporting_passage}
                      </p>
                    </div>

                    {claim.experimental_context && (
                      <div className="pt-2 border-t border-[#E3E1D9] flex flex-wrap gap-1.5 text-[10px] font-mono text-[#777873]">
                        {claim.experimental_context.hardware_environment && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9]">
                            HW: {claim.experimental_context.hardware_environment}
                          </span>
                        )}
                        {claim.experimental_context.precision_or_quantization && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9]">
                            PREC: {claim.experimental_context.precision_or_quantization}
                          </span>
                        )}
                        {claim.experimental_context.context_length && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E3E1D9]">
                            CTX: {claim.experimental_context.context_length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'disagreements' && (
            <DisagreementView disagreements={disagreements} />
          )}

          {activeTab === 'gaps' && (
            <GapExplorerView
              gaps={gaps}
              onFalsify={handleRunFalsify}
              onPlanExperiment={handlePlanExperiment}
            />
          )}

          {activeTab === 'datasets' && (
            <DatasetExplorerView datasets={datasets} />
          )}

          {activeTab === 'timeline' && (
            <TimelineEvolutionView
              sessionId={activeSession.id}
              events={evolutionEvents}
              onCheckEvolution={handleCheckEvolution}
            />
          )}

          {activeTab === 'lineages' && (
            <PreprintLineageView lineages={lineages} />
          )}

          {activeTab === 'retractions' && (
            <RetractionAlertsView alerts={retractionAlerts} />
          )}

          {activeTab === 'cross-domain' && (
            <CrossDomainView connections={crossDomains} />
          )}
        </div>
      )}
    </PaperTrailShell>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6 text-xs font-mono text-[#777873]">
        <Loader2 className="w-5 h-5 animate-spin text-[#B96645] mr-2" />
        <span>Loading PaperTrail Scientific Workspace...</span>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}

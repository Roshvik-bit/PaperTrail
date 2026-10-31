import {
  Paper,
  Claim,
  ExperimentalContext,
  EvidenceRelationship,
  ResearchGap,
  GapInvestigationReport,
  ProposedExperiment,
  ProcessingJob,
  ResearchSession,
  ResearchGraphData,
  JobType,
  JobStatus
} from '@/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class PaperTrailRepository {
  private supabase: SupabaseClient | null = null;
  private static memoryStore = {
    sessions: new Map<string, ResearchSession>(),
    sessionPapers: new Map<string, Set<string>>(),
    papers: new Map<string, Paper>(),
    claims: new Map<string, Claim>(),
    contexts: new Map<string, ExperimentalContext>(),
    relationships: new Map<string, EvidenceRelationship>(),
    gaps: new Map<string, ResearchGap>(),
    investigations: new Map<string, GapInvestigationReport[]>(),
    experiments: new Map<string, ProposedExperiment>(),
    jobs: new Map<string, ProcessingJob>(),
  };

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key && url.startsWith('http')) {
      try {
        this.supabase = createClient(url, key);
      } catch (e) {
        console.warn('[Repository] Supabase init failed, using in-memory store:', e);
      }
    }
  }

  // --- SESSIONS ---
  async createSession(title: string, researchQuestion: string, domain = 'edge_ai'): Promise<ResearchSession> {
    const session: ResearchSession = {
      id: `sess_${Math.random().toString(36).substring(2, 10)}`,
      title,
      research_question: researchQuestion,
      domain,
      status: 'ACTIVE',
      budget_limit: 5.00,
      cost_accumulated: 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('research_sessions')
          .insert({
            id: session.id,
            title: session.title,
            research_question: session.research_question,
            domain: session.domain,
            status: session.status,
          })
          .select()
          .single();
        if (!error && data) return data as ResearchSession;
      } catch (err) {
        console.warn('[Repository] Supabase insert session fallback:', err);
      }
    }

    PaperTrailRepository.memoryStore.sessions.set(session.id, session);
    PaperTrailRepository.memoryStore.sessionPapers.set(session.id, new Set());
    return session;
  }

  async getSession(id: string): Promise<ResearchSession | null> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase.from('research_sessions').select('*').eq('id', id).single();
        if (data) return data as ResearchSession;
      } catch {}
    }
    return PaperTrailRepository.memoryStore.sessions.get(id) || null;
  }

  async listSessions(): Promise<ResearchSession[]> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase.from('research_sessions').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) return data as ResearchSession[];
      } catch {}
    }
    return Array.from(PaperTrailRepository.memoryStore.sessions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // --- PAPERS ---
  async savePaper(paper: Paper, sessionId?: string): Promise<Paper> {
    PaperTrailRepository.memoryStore.papers.set(paper.id, paper);
    if (sessionId) {
      const set = PaperTrailRepository.memoryStore.sessionPapers.get(sessionId) || new Set();
      set.add(paper.id);
      PaperTrailRepository.memoryStore.sessionPapers.set(sessionId, set);
    }

    if (this.supabase) {
      try {
        await this.supabase.from('papers').upsert({
          id: paper.id,
          title: paper.title,
          abstract: paper.abstract,
          doi: paper.doi,
          arxiv_id: paper.arxiv_id,
          openalex_id: paper.openalex_id,
          semantic_scholar_id: paper.semantic_scholar_id,
          publication_date: paper.publication_date,
          year: paper.year,
          venue: paper.venue,
          publication_type: paper.publication_type,
          authors: paper.authors,
          canonical_url: paper.canonical_url,
          open_access_status: paper.open_access_status,
          full_text_status: paper.full_text_status,
          raw_full_text: paper.raw_full_text,
          metadata: paper.metadata,
        });

        if (sessionId) {
          await this.supabase.from('session_papers').upsert({
            session_id: sessionId,
            paper_id: paper.id,
          });
        }
      } catch (err) {
        console.warn('[Repository] Supabase savePaper error:', err);
      }
    }

    return paper;
  }

  async getPaper(id: string): Promise<Paper | null> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase.from('papers').select('*').eq('id', id).single();
        if (data) return data as Paper;
      } catch {}
    }
    return PaperTrailRepository.memoryStore.papers.get(id) || null;
  }

  async getPapersForSession(sessionId: string): Promise<Paper[]> {
    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from('session_papers')
          .select('papers(*)')
          .eq('session_id', sessionId);
        if (data && data.length > 0) {
          return data.map((d: any) => d.papers).filter(Boolean) as Paper[];
        }
      } catch {}
    }

    const paperIds = PaperTrailRepository.memoryStore.sessionPapers.get(sessionId) || new Set();
    const papers: Paper[] = [];
    for (const id of Array.from(paperIds)) {
      const p = PaperTrailRepository.memoryStore.papers.get(id);
      if (p) papers.push(p);
    }
    return papers;
  }

  // --- CLAIMS ---
  async saveClaims(claims: Claim[]): Promise<void> {
    for (const c of claims) {
      PaperTrailRepository.memoryStore.claims.set(c.id, c);
    }

    if (this.supabase) {
      try {
        await this.supabase.from('claims').upsert(
          claims.map(c => ({
            id: c.id,
            paper_id: c.paper_id,
            claim_text: c.claim_text,
            claim_type: c.claim_type,
            section: c.section,
            supporting_passage: c.supporting_passage,
            page_number: c.page_number,
            extraction_confidence: c.extraction_confidence,
            verification_status: c.verification_status,
            extraction_version: c.extraction_version,
          }))
        );
      } catch (err) {
        console.warn('[Repository] Supabase saveClaims error:', err);
      }
    }
  }

  async getClaim(id: string): Promise<Claim | null> {
    return PaperTrailRepository.memoryStore.claims.get(id) || null;
  }

  async getClaimsForPaper(paperId: string): Promise<Claim[]> {
    return Array.from(PaperTrailRepository.memoryStore.claims.values()).filter(c => c.paper_id === paperId);
  }

  async getClaimsForSession(sessionId: string): Promise<Claim[]> {
    const papers = await this.getPapersForSession(sessionId);
    const paperIdSet = new Set(papers.map(p => p.id));
    return Array.from(PaperTrailRepository.memoryStore.claims.values()).filter(c => paperIdSet.has(c.paper_id));
  }

  // --- EXPERIMENTAL CONTEXTS ---
  async saveContext(context: ExperimentalContext): Promise<void> {
    PaperTrailRepository.memoryStore.contexts.set(context.id, context);
  }

  async getContextForPaper(paperId: string): Promise<ExperimentalContext | null> {
    for (const ctx of PaperTrailRepository.memoryStore.contexts.values()) {
      if (ctx.paper_id === paperId) return ctx;
    }
    return null;
  }

  // --- RELATIONSHIPS ---
  async saveRelationship(rel: EvidenceRelationship): Promise<void> {
    PaperTrailRepository.memoryStore.relationships.set(rel.id, rel);
  }

  async getRelationshipsForSession(sessionId: string): Promise<EvidenceRelationship[]> {
    const claims = await this.getClaimsForSession(sessionId);
    const claimIds = new Set(claims.map(c => c.id));
    return Array.from(PaperTrailRepository.memoryStore.relationships.values()).filter(
      r => claimIds.has(r.source_claim_id) || claimIds.has(r.target_claim_id)
    );
  }

  // --- RESEARCH GAPS ---
  async saveGap(gap: ResearchGap): Promise<ResearchGap> {
    PaperTrailRepository.memoryStore.gaps.set(gap.id, gap);
    return gap;
  }

  async updateGapStatus(id: string, status: ResearchGap['status']): Promise<void> {
    const gap = PaperTrailRepository.memoryStore.gaps.get(id);
    if (gap) {
      gap.status = status;
      gap.updated_at = new Date().toISOString();
    }
  }

  async getGapsForSession(sessionId: string): Promise<ResearchGap[]> {
    return Array.from(PaperTrailRepository.memoryStore.gaps.values()).filter(g => g.session_id === sessionId);
  }

  async getGap(id: string): Promise<ResearchGap | null> {
    return PaperTrailRepository.memoryStore.gaps.get(id) || null;
  }

  // --- GAP INVESTIGATIONS ---
  async saveInvestigation(report: GapInvestigationReport): Promise<void> {
    const existing = PaperTrailRepository.memoryStore.investigations.get(report.research_gap_id) || [];
    existing.push(report);
    PaperTrailRepository.memoryStore.investigations.set(report.research_gap_id, existing);
  }

  async getInvestigationsForGap(gapId: string): Promise<GapInvestigationReport[]> {
    return PaperTrailRepository.memoryStore.investigations.get(gapId) || [];
  }

  // --- EXPERIMENTS ---
  async saveExperiment(exp: ProposedExperiment): Promise<ProposedExperiment> {
    PaperTrailRepository.memoryStore.experiments.set(exp.id, exp);
    return exp;
  }

  async getExperimentForGap(gapId: string): Promise<ProposedExperiment | null> {
    for (const exp of PaperTrailRepository.memoryStore.experiments.values()) {
      if (exp.research_gap_id === gapId) return exp;
    }
    return null;
  }

  async getExperiment(id: string): Promise<ProposedExperiment | null> {
    return PaperTrailRepository.memoryStore.experiments.get(id) || null;
  }

  // --- PROCESSING JOBS ---
  async createJob(jobType: JobType, input: Record<string, unknown>, sessionId?: string): Promise<ProcessingJob> {
    const job: ProcessingJob = {
      id: `job_${Math.random().toString(36).substring(2, 10)}`,
      session_id: sessionId,
      job_type: jobType,
      status: 'QUEUED',
      input,
      progress: 0,
      errors: [],
      created_at: new Date().toISOString(),
    };
    PaperTrailRepository.memoryStore.jobs.set(job.id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | null> {
    const job = PaperTrailRepository.memoryStore.jobs.get(id);
    if (!job) return null;
    Object.assign(job, updates);
    return job;
  }

  async getJob(id: string): Promise<ProcessingJob | null> {
    return PaperTrailRepository.memoryStore.jobs.get(id) || null;
  }

  // --- EVIDENCE GRAPH GENERATION ---
  async getGraphForSession(sessionId: string): Promise<ResearchGraphData> {
    const papers = await this.getPapersForSession(sessionId);
    const claims = await this.getClaimsForSession(sessionId);
    const relationships = await this.getRelationshipsForSession(sessionId);
    const gaps = await this.getGapsForSession(sessionId);

    const nodes: ResearchGraphData['nodes'] = [];
    const edges: ResearchGraphData['edges'] = [];

    // Paper nodes
    for (const p of papers) {
      nodes.push({
        id: p.id,
        type: 'paper',
        label: p.title.slice(0, 45) + (p.title.length > 45 ? '...' : ''),
        sublabel: `${p.venue || 'Publication'} (${p.year || 'n.d.'})`,
        data: { paper: p },
      });
    }

    // Claim nodes
    for (const c of claims) {
      nodes.push({
        id: c.id,
        type: 'claim',
        label: c.claim_text.slice(0, 40) + '...',
        sublabel: `[${c.claim_type}] - Confidence ${(c.extraction_confidence * 100).toFixed(0)}%`,
        data: { claim: c },
      });

      // Edge from paper to its claim
      edges.push({
        id: `e_${c.paper_id}_${c.id}`,
        source: c.paper_id,
        target: c.id,
        type: 'USES_METHOD',
        label: 'asserts',
      });
    }

    // Relationship edges between claims
    for (const r of relationships) {
      edges.push({
        id: r.id,
        source: r.source_claim_id,
        target: r.target_claim_id,
        type: r.relationship_type,
        label: r.relationship_type,
        confidence: r.confidence,
        supporting_evidence: r.supporting_evidence,
      });
    }

    // Gap nodes
    for (const g of gaps) {
      nodes.push({
        id: g.id,
        type: 'gap',
        label: `GAP: ${g.title.slice(0, 35)}...`,
        sublabel: `Status: ${g.status}`,
        data: { gap: g },
      });

      for (const sp of g.supporting_papers) {
        edges.push({
          id: `e_gap_${g.id}_${sp.paper_id}`,
          source: sp.paper_id,
          target: g.id,
          type: 'ADDRESSES_GAP',
          label: 'motivates_gap',
        });
      }
    }

    return { nodes, edges };
  }
}

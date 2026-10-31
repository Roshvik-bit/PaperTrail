// =====================================================================
// PAPERTRAIL SQLITE RESEARCH REPOSITORY
// High-performance local-first storage using Node.js native DatabaseSync
// Fully supports sessions, papers, claims, gaps, experiments & portability
// =====================================================================

import path from 'path';
import fs from 'fs';
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
  JobStatus,
  EvidenceEvolutionEvent,
  Dataset,
  PaperLineage,
  RetractionAlert,
  CrossDomainConnection,
  ResearchBundle,
  ResearchImportResult,
  StorageStatusInfo
} from '@/types';
import { ResearchRepository } from './repository-interface';
import { ResearchImportService } from '../export/import-service';

export class SQLiteResearchRepository implements ResearchRepository {
  private db: any = null;
  private dbPath: string;

  constructor(customPath?: string) {
    const defaultDir = path.join(process.cwd(), '.papertrail-data');
    if (!fs.existsSync(defaultDir)) {
      try {
        fs.mkdirSync(defaultDir, { recursive: true });
      } catch {}
    }

    this.dbPath = customPath || process.env.SQLITE_DB_PATH || path.join(defaultDir, 'papertrail.db');
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // Dynamic require of node:sqlite for runtime isolation
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(this.dbPath);
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA foreign_keys = ON;');
      this.createTables();
    } catch (err: any) {
      console.warn(`[SQLiteRepository] Failed to initialize SQLite at ${this.dbPath}:`, err.message);
    }
  }

  private createTables() {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS research_sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        research_question TEXT NOT NULL,
        domain TEXT NOT NULL DEFAULT 'edge_ai',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        budget_limit REAL DEFAULT 5.00,
        cost_accumulated REAL DEFAULT 0.00,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        abstract TEXT,
        doi TEXT,
        arxiv_id TEXT,
        openalex_id TEXT,
        semantic_scholar_id TEXT,
        publication_date TEXT,
        year INTEGER,
        venue TEXT,
        publication_type TEXT DEFAULT 'article',
        authors TEXT,
        canonical_url TEXT,
        open_access_status TEXT DEFAULT 'unknown',
        full_text_status TEXT DEFAULT 'unavailable',
        citation_count INTEGER DEFAULT 0,
        is_retracted INTEGER DEFAULT 0,
        retraction_notice TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS session_papers (
        session_id TEXT NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        relevance_score REAL DEFAULT 1.0,
        added_at TEXT NOT NULL,
        PRIMARY KEY (session_id, paper_id)
      );

      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        claim_text TEXT NOT NULL,
        claim_type TEXT NOT NULL DEFAULT 'FINDING',
        section TEXT,
        supporting_passage TEXT NOT NULL,
        page_number INTEGER,
        extraction_confidence REAL NOT NULL DEFAULT 0.85,
        verification_status TEXT NOT NULL DEFAULT 'AUTOMATICALLY_EXTRACTED',
        extraction_version TEXT NOT NULL DEFAULT 'v1.0.0',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS experimental_contexts (
        id TEXT PRIMARY KEY,
        paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        claim_id TEXT,
        model TEXT,
        model_size TEXT,
        hardware TEXT,
        processor TEXT,
        dataset TEXT,
        methodology TEXT,
        quantization TEXT,
        precision TEXT,
        environment TEXT,
        sample_size INTEGER,
        metrics TEXT,
        variables TEXT,
        raw_context TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS evidence_relationships (
        id TEXT PRIMARY KEY,
        source_claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
        target_claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
        relationship_type TEXT NOT NULL,
        supporting_evidence TEXT NOT NULL,
        context_comparison TEXT,
        confidence REAL NOT NULL DEFAULT 0.80,
        verification_status TEXT NOT NULL DEFAULT 'AUTOMATIC',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS research_gaps (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES research_sessions(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        research_question TEXT NOT NULL,
        description TEXT NOT NULL,
        gap_type TEXT NOT NULL,
        supporting_evidence TEXT,
        counter_evidence TEXT,
        coverage_summary TEXT,
        confidence REAL NOT NULL DEFAULT 0.75,
        status TEXT NOT NULL DEFAULT 'CANDIDATE',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS gap_investigations (
        id TEXT PRIMARY KEY,
        research_gap_id TEXT NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
        search_queries TEXT NOT NULL,
        sources_searched TEXT NOT NULL,
        papers_found TEXT NOT NULL,
        counter_evidence_found TEXT NOT NULL,
        outcome TEXT NOT NULL,
        coverage_limitations TEXT NOT NULL,
        reasoning_summary TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS proposed_experiments (
        id TEXT PRIMARY KEY,
        research_gap_id TEXT NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
        objective TEXT NOT NULL,
        hypothesis TEXT NOT NULL,
        variables TEXT NOT NULL,
        methodology TEXT NOT NULL,
        datasets TEXT NOT NULL,
        hardware TEXT NOT NULL,
        baselines TEXT NOT NULL,
        metrics TEXT NOT NULL,
        estimated_resources TEXT NOT NULL,
        limitations TEXT,
        checklist TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS processing_jobs (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES research_sessions(id) ON DELETE SET NULL,
        job_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'QUEUED',
        input TEXT NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        result TEXT,
        errors TEXT,
        started_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        creator TEXT,
        license TEXT,
        version TEXT,
        access_url TEXT NOT NULL,
        source_repository TEXT NOT NULL,
        availability TEXT NOT NULL DEFAULT 'PUBLIC',
        metadata TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS paper_datasets (
        paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
        relationship TEXT NOT NULL DEFAULT 'EVALUATES_ON',
        PRIMARY KEY (paper_id, dataset_id)
      );

      CREATE TABLE IF NOT EXISTS paper_lineage (
        id TEXT PRIMARY KEY,
        preprint_paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        published_paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        confidence REAL NOT NULL DEFAULT 0.90,
        match_evidence TEXT NOT NULL,
        methodology_diff TEXT,
        findings_diff TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS retraction_alerts (
        id TEXT PRIMARY KEY,
        paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        status_type TEXT NOT NULL,
        notice_url TEXT,
        notice_date TEXT,
        reason TEXT NOT NULL,
        affected_claim_ids TEXT,
        affected_gap_ids TEXT,
        provenance_warning TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cross_domain_connections (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES research_sessions(id) ON DELETE CASCADE,
        source_domain TEXT NOT NULL,
        target_domain TEXT NOT NULL,
        shared_phenomenon TEXT NOT NULL,
        hypothesis_statement TEXT NOT NULL,
        differing_terminology TEXT,
        source_paper_ids TEXT,
        target_paper_ids TEXT,
        confidence REAL NOT NULL DEFAULT 0.75,
        status TEXT NOT NULL DEFAULT 'CANDIDATE_HYPOTHESIS',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS evidence_evolution_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        paper_id TEXT,
        impact_summary TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  // --- SESSIONS ---
  async createSession(title: string, researchQuestion: string, domain = 'edge_ai', customId?: string): Promise<ResearchSession> {
    const session: ResearchSession = {
      id: customId || `sess_${Math.random().toString(36).substring(2, 10)}`,
      title,
      research_question: researchQuestion,
      domain,
      status: 'ACTIVE',
      budget_limit: 5.00,
      cost_accumulated: 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO research_sessions (id, title, research_question, domain, status, budget_limit, cost_accumulated, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(session.id, session.title, session.research_question, session.domain, session.status, session.budget_limit, session.cost_accumulated, session.created_at, session.updated_at);
    }

    return session;
  }

  async getSession(id: string): Promise<ResearchSession | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM research_sessions WHERE id = ?');
    const row = stmt.get(id);
    return row ? (row as ResearchSession) : null;
  }

  async listSessions(): Promise<ResearchSession[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM research_sessions ORDER BY created_at DESC');
    return stmt.all() as ResearchSession[];
  }

  async updateSession(id: string, updates: Partial<ResearchSession>): Promise<ResearchSession | null> {
    const existing = await this.getSession(id);
    if (!existing || !this.db) return null;

    const updated: ResearchSession = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE research_sessions
      SET title = ?, research_question = ?, domain = ?, status = ?, budget_limit = ?, cost_accumulated = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(updated.title, updated.research_question, updated.domain, updated.status, updated.budget_limit, updated.cost_accumulated, updated.updated_at, id);
    return updated;
  }

  // --- PAPERS ---
  async savePaper(paper: Paper, sessionId?: string): Promise<Paper> {
    if (!this.db) return paper;

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO papers (
        id, title, abstract, doi, arxiv_id, openalex_id, semantic_scholar_id,
        publication_date, year, venue, publication_type, authors, canonical_url,
        open_access_status, full_text_status, citation_count, is_retracted, retraction_notice,
        metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      paper.id,
      paper.title,
      paper.abstract || '',
      paper.doi || null,
      paper.arxiv_id || null,
      paper.openalex_id || null,
      paper.semantic_scholar_id || null,
      paper.publication_date || null,
      paper.year || null,
      paper.venue || null,
      paper.publication_type || 'article',
      JSON.stringify(paper.authors || []),
      paper.canonical_url || null,
      paper.open_access_status || 'unknown',
      paper.full_text_status || 'unavailable',
      paper.citation_count || 0,
      paper.is_retracted ? 1 : 0,
      paper.retraction_notice || null,
      JSON.stringify(paper.metadata || {}),
      paper.created_at || new Date().toISOString(),
      paper.updated_at || new Date().toISOString()
    );

    if (sessionId) {
      const relStmt = this.db.prepare(`
        INSERT OR IGNORE INTO session_papers (session_id, paper_id, added_at)
        VALUES (?, ?, ?)
      `);
      relStmt.run(sessionId, paper.id, new Date().toISOString());
    }

    return paper;
  }

  async getPaper(id: string): Promise<Paper | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM papers WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this.mapPaperRow(row);
  }

  async getPapersForSession(sessionId: string): Promise<Paper[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT p.* FROM papers p
      JOIN session_papers sp ON sp.paper_id = p.id
      WHERE sp.session_id = ?
    `);
    const rows = stmt.all(sessionId);
    return rows.map((r: any) => this.mapPaperRow(r));
  }

  private mapPaperRow(r: any): Paper {
    return {
      ...r,
      authors: r.authors ? JSON.parse(r.authors) : [],
      metadata: r.metadata ? JSON.parse(r.metadata) : {},
      is_retracted: Boolean(r.is_retracted),
    };
  }

  // --- CLAIMS ---
  async saveClaims(claims: Claim[]): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO claims (
        id, paper_id, claim_text, claim_type, section, supporting_passage,
        page_number, extraction_confidence, verification_status, extraction_version, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of claims) {
      stmt.run(
        c.id,
        c.paper_id,
        c.claim_text,
        c.claim_type,
        c.section || null,
        c.supporting_passage,
        c.page_number || null,
        c.extraction_confidence,
        c.verification_status,
        c.extraction_version,
        c.created_at || new Date().toISOString()
      );
    }
  }

  async getClaim(id: string): Promise<Claim | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM claims WHERE id = ?');
    const row = stmt.get(id);
    return row ? (row as Claim) : null;
  }

  async getClaimsForPaper(paperId: string): Promise<Claim[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM claims WHERE paper_id = ?');
    return stmt.all(paperId) as Claim[];
  }

  async getClaimsForSession(sessionId: string): Promise<Claim[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT c.* FROM claims c
      JOIN session_papers sp ON sp.paper_id = c.paper_id
      WHERE sp.session_id = ?
    `);
    return stmt.all(sessionId) as Claim[];
  }

  // --- EXPERIMENTAL CONTEXTS ---
  async saveContext(context: ExperimentalContext): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO experimental_contexts (
        id, paper_id, claim_id, model, model_size, hardware, processor, dataset,
        methodology, quantization, precision, environment, sample_size, metrics, variables, raw_context, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      context.id,
      context.paper_id,
      context.claim_id || null,
      context.model || null,
      context.model_size || null,
      context.hardware || null,
      context.processor || null,
      context.dataset || null,
      context.methodology || null,
      context.quantization || null,
      context.precision || null,
      context.environment || null,
      context.sample_size || null,
      JSON.stringify(context.metrics || {}),
      JSON.stringify(context.variables || {}),
      context.raw_context || null,
      new Date().toISOString()
    );
  }

  async getContextForPaper(paperId: string): Promise<ExperimentalContext | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM experimental_contexts WHERE paper_id = ? LIMIT 1');
    const r = stmt.get(paperId);
    if (!r) return null;
    return {
      ...r,
      metrics: r.metrics ? JSON.parse(r.metrics) : {},
      variables: r.variables ? JSON.parse(r.variables) : {},
    } as ExperimentalContext;
  }

  // --- EVIDENCE RELATIONSHIPS ---
  async saveRelationship(rel: EvidenceRelationship): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO evidence_relationships (
        id, source_claim_id, target_claim_id, relationship_type,
        supporting_evidence, context_comparison, confidence, verification_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      rel.id,
      rel.source_claim_id,
      rel.target_claim_id,
      rel.relationship_type,
      rel.supporting_evidence,
      JSON.stringify(rel.context_comparison || {}),
      rel.confidence,
      rel.verification_status,
      rel.created_at || new Date().toISOString()
    );
  }

  async getRelationshipsForSession(sessionId: string): Promise<EvidenceRelationship[]> {
    if (!this.db) return [];
    const claims = await this.getClaimsForSession(sessionId);
    const claimIds = claims.map(c => c.id);
    if (claimIds.length === 0) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM evidence_relationships
    `);
    const all = stmt.all() as any[];
    const claimSet = new Set(claimIds);

    return all
      .filter(r => claimSet.has(r.source_claim_id) || claimSet.has(r.target_claim_id))
      .map(r => ({
        ...r,
        context_comparison: r.context_comparison ? JSON.parse(r.context_comparison) : {},
      }));
  }

  // --- RESEARCH GAPS ---
  async saveGap(gap: ResearchGap): Promise<ResearchGap> {
    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO research_gaps (
          id, session_id, title, research_question, description, gap_type,
          supporting_evidence, counter_evidence, coverage_summary, confidence, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        gap.id,
        gap.session_id || null,
        gap.title,
        gap.research_question,
        gap.description,
        gap.gap_type,
        JSON.stringify(gap.supporting_papers || []),
        JSON.stringify(gap.counter_evidence || []),
        gap.coverage_summary || null,
        gap.confidence,
        gap.status,
        gap.created_at || new Date().toISOString(),
        gap.updated_at || new Date().toISOString()
      );
    }
    return gap;
  }

  async getGap(id: string): Promise<ResearchGap | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM research_gaps WHERE id = ?');
    const r = stmt.get(id);
    if (!r) return null;
    return this.mapGapRow(r);
  }

  async getGapsForSession(sessionId: string): Promise<ResearchGap[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM research_gaps WHERE session_id = ?');
    const rows = stmt.all(sessionId);
    return rows.map((r: any) => this.mapGapRow(r));
  }

  async updateGap(gap: ResearchGap): Promise<ResearchGap> {
    return this.saveGap(gap);
  }

  private mapGapRow(r: any): ResearchGap {
    return {
      ...r,
      supporting_papers: r.supporting_papers
        ? JSON.parse(r.supporting_papers)
        : (r.supporting_evidence ? JSON.parse(r.supporting_evidence) : []),
      counter_evidence: r.counter_evidence ? JSON.parse(r.counter_evidence) : [],
    };
  }

  // --- GAP INVESTIGATIONS ---
  async saveInvestigation(report: GapInvestigationReport): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO gap_investigations (
        id, research_gap_id, search_queries, sources_searched, papers_found,
        counter_evidence_found, outcome, coverage_limitations, reasoning_summary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      report.id,
      report.research_gap_id,
      JSON.stringify(report.search_queries || []),
      JSON.stringify(report.sources_searched || []),
      JSON.stringify(report.papers_retrieved_count || 0),
      JSON.stringify(report.counter_evidence_papers || []),
      report.outcome,
      report.coverage_limitations,
      report.reasoning_summary,
      report.investigation_timestamp || new Date().toISOString()
    );
  }

  async getInvestigationsForGap(gapId: string): Promise<GapInvestigationReport[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM gap_investigations WHERE research_gap_id = ?');
    const rows = stmt.all(gapId);
    return rows.map((r: any) => ({
      ...r,
      original_gap_title: r.original_gap_title || '',
      original_question: r.original_question || '',
      search_queries: r.search_queries ? JSON.parse(r.search_queries) : [],
      sources_searched: r.sources_searched ? JSON.parse(r.sources_searched) : [],
      papers_retrieved_count: typeof r.papers_found === 'string' ? JSON.parse(r.papers_found) : (Number(r.papers_found) || 0),
      counter_evidence_papers: r.counter_evidence_found ? JSON.parse(r.counter_evidence_found) : [],
      human_review_recommendation: r.human_review_recommendation || '',
      investigation_timestamp: r.created_at || new Date().toISOString(),
    }));
  }

  // --- EXPERIMENTS ---
  async saveExperiment(exp: ProposedExperiment): Promise<ProposedExperiment> {
    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO proposed_experiments (
          id, research_gap_id, objective, hypothesis, variables, methodology,
          datasets, hardware, baselines, metrics, estimated_resources, limitations, checklist, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        exp.id,
        exp.research_gap_id,
        exp.objective,
        exp.testable_hypothesis,
        JSON.stringify(exp.variables || {}),
        exp.methodology,
        JSON.stringify(exp.datasets || []),
        JSON.stringify(exp.hardware_requirements || {}),
        JSON.stringify(exp.baselines || []),
        JSON.stringify(exp.metrics || []),
        JSON.stringify(exp.estimated_resources || {}),
        exp.limitations || null,
        JSON.stringify(exp.checklist || []),
        new Date().toISOString()
      );
    }
    return exp;
  }

  async getExperiment(id: string): Promise<ProposedExperiment | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM proposed_experiments WHERE id = ?');
    const r = stmt.get(id);
    if (!r) return null;
    return this.mapExperimentRow(r);
  }

  async getExperimentsForGap(gapId: string): Promise<ProposedExperiment[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM proposed_experiments WHERE research_gap_id = ?');
    const rows = stmt.all(gapId);
    return rows.map((r: any) => this.mapExperimentRow(r));
  }

  async getExperimentsForSession(sessionId: string): Promise<ProposedExperiment[]> {
    const gaps = await this.getGapsForSession(sessionId);
    const gapIds = gaps.map(g => g.id);
    if (gapIds.length === 0) return [];

    const experiments: ProposedExperiment[] = [];
    for (const gid of gapIds) {
      const exps = await this.getExperimentsForGap(gid);
      experiments.push(...exps);
    }
    return experiments;
  }

  private mapExperimentRow(r: any): ProposedExperiment {
    return {
      ...r,
      testable_hypothesis: r.testable_hypothesis || r.hypothesis || '',
      research_question: r.research_question || '',
      expected_contribution: r.expected_contribution || '',
      variables: r.variables ? JSON.parse(r.variables) : { independent: [], dependent: [], controlled: [] },
      datasets: r.datasets ? JSON.parse(r.datasets) : [],
      hardware_requirements: r.hardware ? JSON.parse(r.hardware) : { target_hardware: 'Edge device' },
      baselines: r.baselines ? JSON.parse(r.baselines) : [],
      metrics: r.metrics ? JSON.parse(r.metrics) : [],
      estimated_resources: r.estimated_resources ? JSON.parse(r.estimated_resources) : { compute_hours: 0, estimated_cost_usd: 0, estimation_confidence: 'ESTIMATED' },
      checklist: r.checklist ? JSON.parse(r.checklist) : [],
    };
  }

  // --- KNOWLEDGE GRAPH ---
  async getGraphData(sessionId: string): Promise<ResearchGraphData> {
    const papers = await this.getPapersForSession(sessionId);
    const claims = await this.getClaimsForSession(sessionId);
    const relationships = await this.getRelationshipsForSession(sessionId);
    const gaps = await this.getGapsForSession(sessionId);

    const nodes: ResearchGraphData['nodes'] = [];
    const edges: ResearchGraphData['edges'] = [];

    for (const p of papers) {
      nodes.push({
        id: p.id,
        type: 'paper',
        label: p.title.slice(0, 45) + (p.title.length > 45 ? '...' : ''),
        sublabel: `${p.venue || 'Publication'} (${p.year || 'n.d.'})`,
        data: { paper: p },
      });
    }

    for (const c of claims) {
      nodes.push({
        id: c.id,
        type: 'claim',
        label: c.claim_text.slice(0, 40) + '...',
        sublabel: `[${c.claim_type}] - Confidence ${(c.extraction_confidence * 100).toFixed(0)}%`,
        data: { claim: c },
      });

      edges.push({
        id: `e_${c.paper_id}_${c.id}`,
        source: c.paper_id,
        target: c.id,
        type: 'USES_METHOD',
        label: 'asserts',
      });
    }

    for (const r of relationships) {
      edges.push({
        id: r.id,
        source: r.source_claim_id,
        target: r.target_claim_id,
        type: r.relationship_type,
        label: r.relationship_type.toLowerCase(),
        confidence: r.confidence,
      });
    }

    for (const g of gaps) {
      nodes.push({
        id: g.id,
        type: 'gap',
        label: g.title.slice(0, 40) + '...',
        sublabel: `Gap: ${g.status}`,
        data: { gap: g },
      });
    }

    return { nodes, edges };
  }

  // --- PROCESSING JOBS ---
  async createJob(type: JobType, input: Record<string, unknown>, sessionId?: string): Promise<ProcessingJob> {
    const job: ProcessingJob = {
      id: `job_${Math.random().toString(36).substring(2, 10)}`,
      session_id: sessionId,
      job_type: type,
      status: 'QUEUED',
      input,
      progress: 0,
      created_at: new Date().toISOString(),
    };

    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO processing_jobs (id, session_id, job_type, status, input, progress, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(job.id, job.session_id || null, job.job_type, job.status, JSON.stringify(job.input), job.progress, job.created_at);
    }

    return job;
  }

  async updateJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | null> {
    const job = await this.getJob(id);
    if (!job || !this.db) return null;

    const updated: ProcessingJob = {
      ...job,
      ...updates,
      completed_at: (updates.status === 'COMPLETED' || updates.status === 'FAILED') ? new Date().toISOString() : job.completed_at,
    };

    const stmt = this.db.prepare(`
      UPDATE processing_jobs
      SET status = ?, progress = ?, result = ?, errors = ?, completed_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.status,
      updated.progress,
      updated.result ? JSON.stringify(updated.result) : null,
      updated.errors ? JSON.stringify(updated.errors) : null,
      updated.completed_at || null,
      id
    );

    return updated;
  }

  async getJob(id: string): Promise<ProcessingJob | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM processing_jobs WHERE id = ?');
    const r = stmt.get(id);
    if (!r) return null;
    return {
      ...r,
      input: r.input ? JSON.parse(r.input) : {},
      result: r.result ? JSON.parse(r.result) : undefined,
      errors: r.errors ? JSON.parse(r.errors) : [],
    } as ProcessingJob;
  }

  // --- EVOLUTION, LINEAGES, RETRACTIONS & DATASETS ---
  async saveEvolutionEvent(event: EvidenceEvolutionEvent): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO evidence_evolution_events (id, session_id, event_type, title, description, paper_id, impact_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      event.id,
      event.session_id,
      event.event_type,
      event.title,
      event.description,
      event.paper_id || null,
      JSON.stringify(event.impact_summary || {}),
      event.created_at || new Date().toISOString()
    );
  }

  async getEvolutionEvents(sessionId: string): Promise<EvidenceEvolutionEvent[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM evidence_evolution_events WHERE session_id = ? ORDER BY created_at ASC');
    const rows = stmt.all(sessionId);
    return rows.map((r: any) => ({
      ...r,
      impact_summary: r.impact_summary ? JSON.parse(r.impact_summary) : {},
    }));
  }

  async saveDataset(dataset: Dataset, paperId?: string): Promise<Dataset> {
    if (!this.db) return dataset;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO datasets (id, title, description, creator, license, version, access_url, source_repository, availability, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      dataset.id,
      dataset.title,
      dataset.description || null,
      dataset.creator || null,
      dataset.license || null,
      dataset.version || null,
      dataset.access_url,
      dataset.source_repository,
      dataset.availability,
      JSON.stringify(dataset.metadata || {}),
      dataset.created_at || new Date().toISOString()
    );

    if (paperId) {
      const relStmt = this.db.prepare('INSERT OR IGNORE INTO paper_datasets (paper_id, dataset_id) VALUES (?, ?)');
      relStmt.run(paperId, dataset.id);
    }

    return dataset;
  }

  async getDatasetsForSession(sessionId: string): Promise<Dataset[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM datasets');
    const rows = stmt.all();
    return rows.map((r: any) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : {},
    }));
  }

  async saveLineage(lineage: PaperLineage): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO paper_lineage (id, preprint_paper_id, published_paper_id, confidence, match_evidence, methodology_diff, findings_diff, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      lineage.id,
      lineage.preprint_paper_id,
      lineage.published_paper_id,
      lineage.confidence,
      JSON.stringify(lineage.match_evidence || {}),
      lineage.methodology_diff || null,
      lineage.findings_diff || null,
      lineage.created_at || new Date().toISOString()
    );
  }

  async getLineagesForSession(sessionId: string): Promise<PaperLineage[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM paper_lineage');
    const rows = stmt.all();
    return rows.map((r: any) => ({
      ...r,
      match_evidence: r.match_evidence ? JSON.parse(r.match_evidence) : {},
    }));
  }

  async saveRetractionAlert(alert: RetractionAlert): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO retraction_alerts (id, paper_id, status_type, notice_url, notice_date, reason, affected_claim_ids, affected_gap_ids, provenance_warning, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      alert.id,
      alert.paper_id,
      alert.status_type,
      alert.notice_url || null,
      alert.notice_date || null,
      alert.reason,
      JSON.stringify(alert.affected_claim_ids || []),
      JSON.stringify(alert.affected_gap_ids || []),
      alert.provenance_warning,
      alert.created_at || new Date().toISOString()
    );
  }

  async getRetractionAlertsForSession(sessionId: string): Promise<RetractionAlert[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM retraction_alerts');
    const rows = stmt.all();
    return rows.map((r: any) => ({
      ...r,
      affected_claim_ids: r.affected_claim_ids ? JSON.parse(r.affected_claim_ids) : [],
      affected_gap_ids: r.affected_gap_ids ? JSON.parse(r.affected_gap_ids) : [],
    }));
  }

  async saveCrossDomain(connection: CrossDomainConnection): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO cross_domain_connections (id, session_id, source_domain, target_domain, shared_phenomenon, hypothesis_statement, differing_terminology, source_paper_ids, target_paper_ids, confidence, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      connection.id,
      connection.session_id || null,
      connection.source_domain,
      connection.target_domain,
      connection.shared_phenomenon,
      connection.hypothesis_statement,
      JSON.stringify(connection.differing_terminology || []),
      JSON.stringify(connection.source_paper_ids || []),
      JSON.stringify(connection.target_paper_ids || []),
      connection.confidence,
      connection.status,
      connection.created_at || new Date().toISOString()
    );
  }

  async getCrossDomainForSession(sessionId: string): Promise<CrossDomainConnection[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM cross_domain_connections WHERE session_id = ?');
    const rows = stmt.all(sessionId);
    return rows.map((r: any) => ({
      ...r,
      differing_terminology: r.differing_terminology ? JSON.parse(r.differing_terminology) : [],
      source_paper_ids: r.source_paper_ids ? JSON.parse(r.source_paper_ids) : [],
      target_paper_ids: r.target_paper_ids ? JSON.parse(r.target_paper_ids) : [],
    }));
  }

  // --- COMPLETE RESEARCH BUNDLE EXPORT ---
  async getCompleteResearchBundle(sessionId: string): Promise<ResearchBundle | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const papers = await this.getPapersForSession(sessionId);
    const claims = await this.getClaimsForSession(sessionId);
    const relationships = await this.getRelationshipsForSession(sessionId);
    const gaps = await this.getGapsForSession(sessionId);
    const experiments = await this.getExperimentsForSession(sessionId);
    const datasets = await this.getDatasetsForSession(sessionId);
    const lineages = await this.getLineagesForSession(sessionId);
    const retraction_alerts = await this.getRetractionAlertsForSession(sessionId);
    const cross_domain = await this.getCrossDomainForSession(sessionId);
    const evolution_events = await this.getEvolutionEvents(sessionId);

    const investigations: GapInvestigationReport[] = [];
    for (const g of gaps) {
      const invs = await this.getInvestigationsForGap(g.id);
      investigations.push(...invs);
    }

    const contexts: ExperimentalContext[] = [];
    for (const p of papers) {
      const ctx = await this.getContextForPaper(p.id);
      if (ctx) contexts.push(ctx);
    }

    return {
      manifest: {
        format_version: '1.0.0',
        app_name: 'PaperTrail',
        app_version: '1.0.0',
        exported_at: new Date().toISOString(),
        session_id: session.id,
        title: session.title,
        research_question: session.research_question,
        domain: session.domain,
        counts: {
          papers: papers.length,
          claims: claims.length,
          contexts: contexts.length,
          evidence_relationships: relationships.length,
          research_gaps: gaps.length,
          gap_investigations: investigations.length,
          proposed_experiments: experiments.length,
          datasets: datasets.length,
          lineages: lineages.length,
          retraction_alerts: retraction_alerts.length,
          cross_domain_connections: cross_domain.length,
          evolution_events: evolution_events.length,
        },
      },
      session,
      papers,
      claims,
      contexts,
      relationships,
      gaps,
      investigations,
      experiments,
      datasets,
      lineages,
      retraction_alerts,
      cross_domain,
      evolution_events,
    };
  }

  // --- IMPORT ---
  async importResearchBundle(bundle: ResearchBundle, options?: { mode?: 'CREATE_NEW' | 'MERGE' | 'REPLACE'; overwriteConfirmed?: boolean }): Promise<ResearchImportResult> {
    return ResearchImportService.restoreIntoRepository(this, bundle, options);
  }

  // --- SEARCH ---
  async searchLocal(query: string): Promise<{ papers: Paper[]; claims: Claim[] }> {
    if (!this.db) return { papers: [], claims: [] };
    const term = `%${query.trim()}%`;

    const paperStmt = this.db.prepare('SELECT * FROM papers WHERE title LIKE ? OR abstract LIKE ? LIMIT 25');
    const claimStmt = this.db.prepare('SELECT * FROM claims WHERE claim_text LIKE ? OR supporting_passage LIKE ? LIMIT 50');

    const paperRows = paperStmt.all(term, term);
    const claimRows = claimStmt.all(term, term);

    return {
      papers: paperRows.map((r: any) => this.mapPaperRow(r)),
      claims: claimRows as Claim[],
    };
  }

  // --- STORAGE STATUS ---
  async getStorageStatus(): Promise<StorageStatusInfo> {
    let sizeBytes = 0;
    try {
      if (fs.existsSync(this.dbPath)) {
        sizeBytes = fs.statSync(this.dbPath).size;
      }
    } catch {}

    const sessions = await this.listSessions();
    let totalPapers = 0;
    if (this.db) {
      try {
        const countRow = this.db.prepare('SELECT COUNT(*) as cnt FROM papers').get();
        totalPapers = countRow?.cnt || 0;
      } catch {}
    }

    return {
      provider: 'sqlite',
      cloud_connected: false,
      local_database_available: !!this.db,
      local_database_path: this.dbPath,
      local_database_size_bytes: sizeBytes,
      active_sessions_count: sessions.length,
      total_papers_count: totalPapers,
      last_sync_at: new Date().toISOString(),
    };
  }
}

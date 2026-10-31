// =====================================================================
// PAPERTRAIL STORAGE ABSTRACTION INTERFACE
// Contract implemented by SupabaseResearchRepository and SQLiteResearchRepository
// =====================================================================

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

export interface ResearchRepository {
  // --- SESSIONS ---
  createSession(title: string, researchQuestion: string, domain?: string, customId?: string): Promise<ResearchSession>;
  getSession(id: string): Promise<ResearchSession | null>;
  listSessions(): Promise<ResearchSession[]>;
  updateSession(id: string, updates: Partial<ResearchSession>): Promise<ResearchSession | null>;

  // --- PAPERS ---
  savePaper(paper: Paper, sessionId?: string): Promise<Paper>;
  getPaper(id: string): Promise<Paper | null>;
  getPapersForSession(sessionId: string): Promise<Paper[]>;

  // --- CLAIMS ---
  saveClaims(claims: Claim[]): Promise<void>;
  getClaim(id: string): Promise<Claim | null>;
  getClaimsForPaper(paperId: string): Promise<Claim[]>;
  getClaimsForSession(sessionId: string): Promise<Claim[]>;

  // --- EXPERIMENTAL CONTEXTS ---
  saveContext(context: ExperimentalContext): Promise<void>;
  getContextForPaper(paperId: string): Promise<ExperimentalContext | null>;

  // --- EVIDENCE RELATIONSHIPS ---
  saveRelationship(rel: EvidenceRelationship): Promise<void>;
  getRelationshipsForSession(sessionId: string): Promise<EvidenceRelationship[]>;

  // --- RESEARCH GAPS ---
  saveGap(gap: ResearchGap): Promise<ResearchGap>;
  getGap(id: string): Promise<ResearchGap | null>;
  getGapsForSession(sessionId: string): Promise<ResearchGap[]>;
  updateGap(gap: ResearchGap): Promise<ResearchGap>;

  // --- GAP INVESTIGATIONS ---
  saveInvestigation(report: GapInvestigationReport): Promise<void>;
  getInvestigationsForGap(gapId: string): Promise<GapInvestigationReport[]>;

  // --- EXPERIMENTS ---
  saveExperiment(exp: ProposedExperiment): Promise<ProposedExperiment>;
  getExperiment(id: string): Promise<ProposedExperiment | null>;
  getExperimentsForGap(gapId: string): Promise<ProposedExperiment[]>;
  getExperimentsForSession(sessionId: string): Promise<ProposedExperiment[]>;

  // --- KNOWLEDGE GRAPH ---
  getGraphData(sessionId: string): Promise<ResearchGraphData>;

  // --- PROCESSING JOBS ---
  createJob(type: JobType, input: Record<string, unknown>, sessionId?: string): Promise<ProcessingJob>;
  updateJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | null>;
  getJob(id: string): Promise<ProcessingJob | null>;

  // --- EVOLUTION, LINEAGE, RETRACTIONS & DATASETS ---
  saveEvolutionEvent(event: EvidenceEvolutionEvent): Promise<void>;
  getEvolutionEvents(sessionId: string): Promise<EvidenceEvolutionEvent[]>;

  saveDataset(dataset: Dataset, paperId?: string): Promise<Dataset>;
  getDatasetsForSession(sessionId: string): Promise<Dataset[]>;

  saveLineage(lineage: PaperLineage): Promise<void>;
  getLineagesForSession(sessionId: string): Promise<PaperLineage[]>;

  saveRetractionAlert(alert: RetractionAlert): Promise<void>;
  getRetractionAlertsForSession(sessionId: string): Promise<RetractionAlert[]>;

  saveCrossDomain(connection: CrossDomainConnection): Promise<void>;
  getCrossDomainForSession(sessionId: string): Promise<CrossDomainConnection[]>;

  // --- PORTABILITY, EXPORT & SEARCH ---
  getCompleteResearchBundle(sessionId: string): Promise<ResearchBundle | null>;
  importResearchBundle(bundle: ResearchBundle, options?: { mode?: 'CREATE_NEW' | 'MERGE' | 'REPLACE'; overwriteConfirmed?: boolean }): Promise<ResearchImportResult>;
  searchLocal(query: string): Promise<{ papers: Paper[]; claims: Claim[] }>;
  getStorageStatus(): Promise<StorageStatusInfo>;
}

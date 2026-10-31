// =====================================================================
// PAPERTRAIL CORE DOMAIN TYPES & SCIENTIFIC SCHEMAS
// =====================================================================

export type OpenAccessStatus = 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed' | 'unknown';
export type FullTextStatus = 'unavailable' | 'abstract_only' | 'open_access_pdf' | 'stored_pdf' | 'extracted_text';

export interface Author {
  name: string;
  affiliation?: string;
  orcid?: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  doi?: string;
  arxiv_id?: string;
  openalex_id?: string;
  semantic_scholar_id?: string;
  publication_date?: string;
  year?: number;
  venue?: string;
  publication_type?: string;
  authors: Author[];
  canonical_url?: string;
  open_access_status: OpenAccessStatus;
  full_text_status: FullTextStatus;
  raw_full_text?: string;
  citation_count?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaperSource {
  id: string;
  paper_id: string;
  provider: 'openalex' | 'semantic_scholar' | 'crossref' | 'arxiv' | 'tinyfish' | 'manual_upload';
  external_id: string;
  source_url?: string;
  metadata?: Record<string, unknown>;
  last_checked_at: string;
}

export interface PaperCitation {
  id: string;
  citing_paper_id: string;
  cited_paper_id: string;
  provider: string;
  citation_context?: string;
  created_at: string;
}

export type ClaimType =
  | 'HYPOTHESIS'
  | 'FINDING'
  | 'METHODOLOGY'
  | 'LIMITATION'
  | 'BENCHMARK_RESULT'
  | 'THEORETICAL_BOUND';

export type ClaimVerificationStatus =
  | 'AUTOMATICALLY_EXTRACTED'
  | 'CORROBORATED'
  | 'HUMAN_VERIFIED'
  | 'DISPUTED';

export interface Claim {
  id: string;
  paper_id: string;
  paper_title?: string;
  paper_year?: number;
  claim_text: string;
  claim_type: ClaimType;
  section?: string;
  supporting_passage: string;
  page_number?: number;
  extraction_confidence: number;
  verification_status: ClaimVerificationStatus;
  extraction_version: string;
  created_at: string;
}

export interface ExperimentalContext {
  id: string;
  paper_id: string;
  claim_id?: string;
  model?: string;
  model_size?: string;
  hardware?: string;
  processor?: string;
  dataset?: string;
  methodology?: string;
  quantization?: string;
  precision?: string;
  environment?: string;
  sample_size?: number;
  metrics?: Record<string, string | number>;
  variables?: Record<string, string>;
  raw_context?: string;
  created_at: string;
}

export type EvidenceRelationshipType =
  | 'SUPPORTS'
  | 'CHALLENGES'
  | 'CONTRADICTS'
  | 'QUALIFIES'
  | 'EXTENDS'
  | 'REPLICATES'
  | 'PARTIALLY_REPLICATES'
  | 'USES_SIMILAR_METHOD'
  | 'DIFFERENT_EXPERIMENTAL_CONTEXT'
  | 'INSUFFICIENT_EVIDENCE';

export interface EvidenceRelationship {
  id: string;
  source_claim_id: string;
  target_claim_id: string;
  source_claim?: Claim;
  target_claim?: Claim;
  relationship_type: EvidenceRelationshipType;
  supporting_evidence: string;
  context_comparison?: ContextComparison;
  confidence: number;
  verification_status: 'AUTOMATIC' | 'HUMAN_CONFIRMED' | 'REJECTED';
  created_at: string;
}

export interface ContextComparison {
  similarities: string[];
  differences: {
    variable: string;
    source_val: string;
    target_val: string;
    impact_level: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  possible_explanations: string[];
  alternative_explanations: string[];
  remaining_uncertainty: string;
  is_genuine_contradiction: boolean;
}

export interface DisagreementInvestigation {
  id: string;
  claim_a: Claim;
  claim_b: Claim;
  paper_a: Paper;
  paper_b: Paper;
  context_a?: ExperimentalContext;
  context_b?: ExperimentalContext;
  comparison: ContextComparison;
  confidence: number;
  summary: string;
}

export type GapType =
  | 'UNEXPLORED_EXPERIMENTAL_COMBINATION'
  | 'REPEATED_LIMITATION'
  | 'UNRESOLVED_DISAGREEMENT'
  | 'UNDEREXPLORED_DATASET'
  | 'UNINVESTIGATED_HARDWARE_ENV'
  | 'METHODOLOGICAL_INCONSISTENCY'
  | 'MISSING_DIRECT_COMPARISON';

export type GapStatus =
  | 'CANDIDATE'
  | 'RETAINED_CANDIDATE'
  | 'NARROWED_CANDIDATE'
  | 'EXISTING_WORK_FOUND'
  | 'INSUFFICIENT_COVERAGE'
  | 'REQUIRES_HUMAN_REVIEW';

export interface ResearchGap {
  id: string;
  topic_id?: string;
  session_id?: string;
  title: string;
  research_question: string;
  description: string;
  gap_type: GapType;
  supporting_papers: { paper_id: string; title: string; year?: number; relevant_limitation?: string }[];
  counter_evidence: { paper_id?: string; title: string; citation: string; why_counter: string }[];
  coverage_summary: string;
  confidence: number;
  status: GapStatus;
  suggested_experiment?: string;
  search_coverage_limitations?: string;
  created_at: string;
  updated_at: string;
}

export interface GapInvestigationReport {
  id: string;
  research_gap_id: string;
  original_gap_title: string;
  original_question: string;
  search_queries: string[];
  sources_searched: string[];
  papers_retrieved_count: number;
  counter_evidence_papers: {
    title: string;
    doi?: string;
    year?: number;
    venue?: string;
    summary: string;
    relevance_to_gap: string;
  }[];
  outcome: GapStatus;
  revised_question?: string;
  coverage_limitations: string;
  reasoning_summary: string;
  human_review_recommendation: string;
  investigation_timestamp: string;
}

export interface ProposedExperiment {
  id: string;
  research_gap_id: string;
  objective: string;
  research_question: string;
  testable_hypothesis: string;
  variables: {
    independent: string[];
    dependent: string[];
    controlled: string[];
  };
  methodology: string;
  baselines: string[];
  datasets: { name: string; size?: string; source_url?: string; availability: 'PUBLIC' | 'RESTRICTED' | 'PROPRIETARY' }[];
  hardware_requirements: {
    target_hardware: string;
    gpu_min_vram_gb?: number;
    ram_gb?: number;
    estimated_inference_ms?: number;
    thermal_considerations?: string;
  };
  metrics: string[];
  estimated_resources: {
    compute_hours: number;
    estimated_cost_usd: number;
    estimation_confidence: 'MEASURED' | 'CALCULATED' | 'ESTIMATED' | 'UNKNOWN';
  };
  limitations: string;
  expected_contribution: string;
  checklist: { item: string; completed: boolean }[];
  created_at: string;
}

export type JobType =
  | 'PAPER_DISCOVERY'
  | 'PAPER_FETCH'
  | 'DOCUMENT_PARSE'
  | 'CLAIM_EXTRACTION'
  | 'CONTEXT_EXTRACTION'
  | 'CITATION_EXPANSION'
  | 'DISAGREEMENT_ANALYSIS'
  | 'GAP_DISCOVERY'
  | 'GAP_FALSIFICATION'
  | 'EXPERIMENT_PLANNING';

export type JobStatus =
  | 'QUEUED'
  | 'FETCHING'
  | 'PARSING'
  | 'EXTRACTING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIAL';

export interface ProcessingJob {
  id: string;
  session_id?: string;
  job_type: JobType;
  status: JobStatus;
  input: Record<string, unknown>;
  progress: number;
  result?: Record<string, unknown>;
  errors?: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ResearchSession {
  id: string;
  user_id?: string;
  title: string;
  research_question: string;
  domain: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  budget_limit: number;
  cost_accumulated: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ResearchGraphData {
  nodes: {
    id: string;
    type: 'paper' | 'claim' | 'gap' | 'experiment';
    label: string;
    sublabel?: string;
    data: Record<string, unknown>;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: string;
    label: string;
    confidence?: number;
    supporting_evidence?: string;
  }[];
}

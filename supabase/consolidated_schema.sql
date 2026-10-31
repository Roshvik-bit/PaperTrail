-- =====================================================================
-- PAPERTRAIL — CONSOLIDATED SUPABASE SCHEMA
-- Ready for Supabase SQL Editor
-- Supports all Core Intelligence, Evolution, Lineage, Retractions,
-- Datasets, Cross-Domain Transfers, and Processing Pipelines.
-- =====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. CORE RESEARCH ENTITIES
-- =====================================================================

-- Research Topics
CREATE TABLE IF NOT EXISTS research_topics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL DEFAULT 'edge_ai',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Research Sessions
CREATE TABLE IF NOT EXISTS research_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID,
    title TEXT NOT NULL,
    research_question TEXT NOT NULL,
    domain TEXT NOT NULL DEFAULT 'edge_ai',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
    budget_limit NUMERIC(8, 2) DEFAULT 5.00,
    cost_accumulated NUMERIC(8, 4) DEFAULT 0.0000,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canonical Papers
CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    doi TEXT UNIQUE,
    arxiv_id TEXT UNIQUE,
    openalex_id TEXT UNIQUE,
    semantic_scholar_id TEXT UNIQUE,
    publication_date DATE,
    year INTEGER,
    venue TEXT,
    publication_type TEXT DEFAULT 'article',
    authors JSONB DEFAULT '[]'::jsonb,
    canonical_url TEXT,
    open_access_status TEXT DEFAULT 'unknown' CHECK (open_access_status IN ('gold', 'green', 'hybrid', 'bronze', 'closed', 'unknown')),
    full_text_status TEXT DEFAULT 'unavailable' CHECK (full_text_status IN ('unavailable', 'abstract_only', 'open_access_pdf', 'stored_pdf', 'extracted_text')),
    raw_full_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paper Sources (Provenance & lineage from OpenAlex, arXiv, Crossref, etc.)
CREATE TABLE IF NOT EXISTS paper_sources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('openalex', 'semantic_scholar', 'crossref', 'arxiv', 'tinyfish', 'manual_upload')),
    external_id TEXT NOT NULL,
    source_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(paper_id, provider, external_id)
);

-- Paper Citations
CREATE TABLE IF NOT EXISTS paper_citations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    citing_paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    cited_paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'crossref',
    citation_context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(citing_paper_id, cited_paper_id)
);

-- Session Papers (Association)
CREATE TABLE IF NOT EXISTS session_papers (
    session_id TEXT NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5, 4) DEFAULT 1.0000,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (session_id, paper_id)
);

-- Claims (Structured assertion with verbatim grounding passage)
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    claim_type TEXT NOT NULL DEFAULT 'FINDING' CHECK (claim_type IN ('HYPOTHESIS', 'FINDING', 'METHODOLOGY', 'LIMITATION', 'BENCHMARK_RESULT', 'THEORETICAL_BOUND')),
    section TEXT,
    supporting_passage TEXT NOT NULL,
    page_number INTEGER,
    extraction_confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.850 CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
    verification_status TEXT NOT NULL DEFAULT 'AUTOMATICALLY_EXTRACTED' CHECK (verification_status IN ('AUTOMATICALLY_EXTRACTED', 'CORROBORATED', 'HUMAN_VERIFIED', 'DISPUTED')),
    extraction_version TEXT NOT NULL DEFAULT 'v1.0.0',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Experimental Contexts
CREATE TABLE IF NOT EXISTS experimental_contexts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    claim_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
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
    metrics JSONB DEFAULT '{}'::jsonb,
    variables JSONB DEFAULT '{}'::jsonb,
    raw_context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence Relationships (Graph edges between claims)
CREATE TABLE IF NOT EXISTS evidence_relationships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    target_claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'SUPPORTS',
        'CHALLENGES',
        'CONTRADICTS',
        'QUALIFIES',
        'EXTENDS',
        'REPLICATES',
        'PARTIALLY_REPLICATES',
        'USES_SIMILAR_METHOD',
        'DIFFERENT_EXPERIMENTAL_CONTEXT',
        'INSUFFICIENT_EVIDENCE'
    )),
    supporting_evidence TEXT NOT NULL,
    context_comparison JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.800 CHECK (confidence >= 0 AND confidence <= 1),
    verification_status TEXT NOT NULL DEFAULT 'AUTOMATIC' CHECK (verification_status IN ('AUTOMATIC', 'HUMAN_CONFIRMED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_claim_id, target_claim_id, relationship_type)
);

-- Research Gaps (Candidate gaps discovered across evidence)
CREATE TABLE IF NOT EXISTS research_gaps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    topic_id TEXT REFERENCES research_topics(id) ON DELETE SET NULL,
    session_id TEXT REFERENCES research_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    research_question TEXT NOT NULL,
    description TEXT NOT NULL,
    gap_type TEXT NOT NULL CHECK (gap_type IN (
        'UNEXPLORED_EXPERIMENTAL_COMBINATION',
        'REPEATED_LIMITATION',
        'UNRESOLVED_DISAGREEMENT',
        'UNDEREXPLORED_DATASET',
        'UNINVESTIGATED_HARDWARE_ENV',
        'METHODOLOGICAL_INCONSISTENCY',
        'MISSING_DIRECT_COMPARISON'
    )),
    supporting_evidence JSONB DEFAULT '[]'::jsonb,
    counter_evidence JSONB DEFAULT '[]'::jsonb,
    coverage_summary TEXT,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.750 CHECK (confidence >= 0 AND confidence <= 1),
    status TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN (
        'CANDIDATE',
        'RETAINED_CANDIDATE',
        'NARROWED_CANDIDATE',
        'EXISTING_WORK_FOUND',
        'INSUFFICIENT_COVERAGE',
        'REQUIRES_HUMAN_REVIEW'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gap Investigations (Auditable falsification logs)
CREATE TABLE IF NOT EXISTS gap_investigations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    research_gap_id TEXT NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
    search_queries JSONB NOT NULL DEFAULT '[]'::jsonb,
    sources_searched JSONB NOT NULL DEFAULT '[]'::jsonb,
    papers_found JSONB NOT NULL DEFAULT '[]'::jsonb,
    counter_evidence_found JSONB NOT NULL DEFAULT '[]'::jsonb,
    outcome TEXT NOT NULL CHECK (outcome IN (
        'RETAINED_CANDIDATE',
        'NARROWED_CANDIDATE',
        'EXISTING_WORK_FOUND',
        'INSUFFICIENT_COVERAGE',
        'REQUIRES_HUMAN_REVIEW'
    )),
    coverage_limitations TEXT NOT NULL,
    reasoning_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposed Experiments (Testable protocols with hardware & cost estimates)
CREATE TABLE IF NOT EXISTS proposed_experiments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    research_gap_id TEXT NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
    objective TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '{"independent": [], "dependent": [], "controlled": []}'::jsonb,
    methodology TEXT NOT NULL,
    datasets JSONB NOT NULL DEFAULT '[]'::jsonb,
    hardware JSONB NOT NULL DEFAULT '{}'::jsonb,
    baselines JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_resources JSONB NOT NULL DEFAULT '{"gpu_hours": null, "memory_gb": null, "cost_usd": null, "estimation_confidence": "ESTIMATED"}'::jsonb,
    limitations TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Processing Jobs (Background asynchronous tasks)
CREATE TABLE IF NOT EXISTS processing_jobs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT REFERENCES research_sessions(id) ON DELETE SET NULL,
    job_type TEXT NOT NULL CHECK (job_type IN (
        'PAPER_DISCOVERY',
        'PAPER_FETCH',
        'DOCUMENT_PARSE',
        'CLAIM_EXTRACTION',
        'CONTEXT_EXTRACTION',
        'CITATION_EXPANSION',
        'DISAGREEMENT_ANALYSIS',
        'GAP_DISCOVERY',
        'GAP_FALSIFICATION',
        'EXPERIMENT_PLANNING'
    )),
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'FETCHING', 'PARSING', 'EXTRACTING', 'VALIDATING', 'COMPLETED', 'FAILED', 'PARTIAL')),
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result JSONB,
    errors JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 2. EVOLUTION, LINEAGE, RETRACTION & CROSS-DOMAIN TABLES
-- =====================================================

-- Preprint-to-Publication Lineage
CREATE TABLE IF NOT EXISTS paper_lineage (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    preprint_paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    published_paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.900,
    match_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    methodology_diff TEXT,
    findings_diff TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(preprint_paper_id, published_paper_id)
);

-- Retraction and Correction Intelligence
CREATE TABLE IF NOT EXISTS retraction_alerts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    status_type TEXT NOT NULL CHECK (status_type IN ('RETRACTED', 'CORRECTED', 'EXPRESSION_OF_CONCERN')),
    notice_url TEXT,
    notice_date DATE,
    reason TEXT NOT NULL,
    affected_claim_ids JSONB DEFAULT '[]'::jsonb,
    affected_gap_ids JSONB DEFAULT '[]'::jsonb,
    provenance_warning TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datasets (Hugging Face, Zenodo, Figshare, Repositories)
CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    creator TEXT,
    license TEXT,
    version TEXT,
    access_url TEXT NOT NULL,
    source_repository TEXT NOT NULL CHECK (source_repository IN ('huggingface', 'zenodo', 'figshare', 'github', 'paperswithcode', 'other')),
    availability TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (availability IN ('PUBLIC', 'RESTRICTED', 'PROPRIETARY')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_datasets (
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'EVALUATES_ON' CHECK (relationship IN ('EVALUATES_ON', 'INTRODUCES_DATASET', 'BENCHMARKS_ON')),
    PRIMARY KEY(paper_id, dataset_id)
);

-- Cross-Domain Connections
CREATE TABLE IF NOT EXISTS cross_domain_connections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT REFERENCES research_sessions(id) ON DELETE CASCADE,
    source_domain TEXT NOT NULL,
    target_domain TEXT NOT NULL,
    shared_phenomenon TEXT NOT NULL,
    hypothesis_statement TEXT NOT NULL,
    differing_terminology JSONB DEFAULT '{}'::jsonb,
    source_paper_ids JSONB DEFAULT '[]'::jsonb,
    target_paper_ids JSONB DEFAULT '[]'::jsonb,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.750,
    status TEXT NOT NULL DEFAULT 'CANDIDATE_HYPOTHESIS' CHECK (status IN ('CANDIDATE_HYPOTHESIS', 'VALIDATED_TRANSFER', 'REFUTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence Evolution Timeline Events
CREATE TABLE IF NOT EXISTS evidence_evolution_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'NEW_PUBLICATION_INGESTED',
        'CLAIM_CONFLICT_DETECTED',
        'GAP_REASSESSED',
        'RETRACTION_REGISTERED',
        'PREPRINT_PUBLISHED',
        'CROSS_DOMAIN_DISCOVERED',
        'NULL_RESULT_RECORDED'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    paper_id TEXT REFERENCES papers(id) ON DELETE SET NULL,
    impact_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Research Monitors (Scheduled continuous surveillance)
CREATE TABLE IF NOT EXISTS research_monitors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    query_topic TEXT NOT NULL,
    monitor_provider TEXT NOT NULL DEFAULT 'tinyfish_monitor',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'FAILED')),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_check_due TIMESTAMPTZ,
    new_findings_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT RETRIEVAL & GRAPH TRAVERSAL
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);
CREATE INDEX IF NOT EXISTS idx_papers_arxiv ON papers(arxiv_id);
CREATE INDEX IF NOT EXISTS idx_papers_openalex ON papers(openalex_id);
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_claims_paper ON claims(paper_id);
CREATE INDEX IF NOT EXISTS idx_claims_type ON claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_context_paper ON experimental_contexts(paper_id);
CREATE INDEX IF NOT EXISTS idx_context_claim ON experimental_contexts(claim_id);
CREATE INDEX IF NOT EXISTS idx_context_model ON experimental_contexts(model);
CREATE INDEX IF NOT EXISTS idx_context_hardware ON experimental_contexts(hardware);
CREATE INDEX IF NOT EXISTS idx_evidence_source ON evidence_relationships(source_claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_target ON evidence_relationships(target_claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_gaps_session ON research_gaps(session_id);
CREATE INDEX IF NOT EXISTS idx_gaps_status ON research_gaps(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_citations_pair ON paper_citations(citing_paper_id, cited_paper_id);
CREATE INDEX IF NOT EXISTS idx_lineage_pair ON paper_lineage(preprint_paper_id, published_paper_id);
CREATE INDEX IF NOT EXISTS idx_retraction_paper ON retraction_alerts(paper_id);
CREATE INDEX IF NOT EXISTS idx_datasets_repo ON datasets(source_repository);
CREATE INDEX IF NOT EXISTS idx_evolution_session ON evidence_evolution_events(session_id);
CREATE INDEX IF NOT EXISTS idx_monitors_session ON research_monitors(session_id);

-- =====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposed_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE experimental_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE retraction_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_domain_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_evolution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_monitors ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted reads for scholarly entities and public session data
DROP POLICY IF EXISTS "Public papers are readable by all" ON papers;
CREATE POLICY "Public papers are readable by all" ON papers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public claims are readable by all" ON claims;
CREATE POLICY "Public claims are readable by all" ON claims FOR ALL USING (true);

DROP POLICY IF EXISTS "Public contexts are readable by all" ON experimental_contexts;
CREATE POLICY "Public contexts are readable by all" ON experimental_contexts FOR ALL USING (true);

DROP POLICY IF EXISTS "Public relationships are readable by all" ON evidence_relationships;
CREATE POLICY "Public relationships are readable by all" ON evidence_relationships FOR ALL USING (true);

DROP POLICY IF EXISTS "Public sessions are accessible" ON research_sessions;
CREATE POLICY "Public sessions are accessible" ON research_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public session papers are accessible" ON session_papers;
CREATE POLICY "Public session papers are accessible" ON session_papers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public research gaps are accessible" ON research_gaps;
CREATE POLICY "Public research gaps are accessible" ON research_gaps FOR ALL USING (true);

DROP POLICY IF EXISTS "Public experiments are accessible" ON proposed_experiments;
CREATE POLICY "Public experiments are accessible" ON proposed_experiments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public processing jobs are accessible" ON processing_jobs;
CREATE POLICY "Public processing jobs are accessible" ON processing_jobs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public paper sources are accessible" ON paper_sources;
CREATE POLICY "Public paper sources are accessible" ON paper_sources FOR ALL USING (true);

DROP POLICY IF EXISTS "Public citations are accessible" ON paper_citations;
CREATE POLICY "Public citations are accessible" ON paper_citations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public lineages are accessible" ON paper_lineage;
CREATE POLICY "Public lineages are accessible" ON paper_lineage FOR ALL USING (true);

DROP POLICY IF EXISTS "Public retractions are accessible" ON retraction_alerts;
CREATE POLICY "Public retractions are accessible" ON retraction_alerts FOR ALL USING (true);

DROP POLICY IF EXISTS "Public datasets are accessible" ON datasets;
CREATE POLICY "Public datasets are accessible" ON datasets FOR ALL USING (true);

DROP POLICY IF EXISTS "Public paper datasets are accessible" ON paper_datasets;
CREATE POLICY "Public paper datasets are accessible" ON paper_datasets FOR ALL USING (true);

DROP POLICY IF EXISTS "Public cross domain are accessible" ON cross_domain_connections;
CREATE POLICY "Public cross domain are accessible" ON cross_domain_connections FOR ALL USING (true);

DROP POLICY IF EXISTS "Public evolution events are accessible" ON evidence_evolution_events;
CREATE POLICY "Public evolution events are accessible" ON evidence_evolution_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Public research monitors are accessible" ON research_monitors;
CREATE POLICY "Public research monitors are accessible" ON research_monitors FOR ALL USING (true);


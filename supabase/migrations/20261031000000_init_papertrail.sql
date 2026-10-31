-- =====================================================================
-- PAPERTRAIL EVIDENCE-CENTRIC RESEARCH INTELLIGENCE SCHEMA
-- Migration: 20261031000000_init_papertrail.sql
-- =====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. RESEARCH TOPICS
CREATE TABLE IF NOT EXISTS research_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL DEFAULT 'edge_ai',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RESEARCH SESSIONS
CREATE TABLE IF NOT EXISTS research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. PAPERS (Canonical scholarly entities)
CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. PAPER SOURCES (Multi-provider lineage & provenance)
CREATE TABLE IF NOT EXISTS paper_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('openalex', 'semantic_scholar', 'crossref', 'arxiv', 'tinyfish', 'manual_upload')),
    external_id TEXT NOT NULL,
    source_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(paper_id, provider, external_id)
);

-- 5. PAPER CITATIONS (Citation network edges)
CREATE TABLE IF NOT EXISTS paper_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citing_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    cited_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'crossref',
    citation_context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(citing_paper_id, cited_paper_id)
);

-- 6. SESSION PAPERS (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS session_papers (
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5, 4) DEFAULT 1.0000,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (session_id, paper_id)
);

-- 7. CLAIMS (Granular structured assertions from papers)
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
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

-- 8. EXPERIMENTAL CONTEXTS (Environment & conditions for claims)
CREATE TABLE IF NOT EXISTS experimental_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
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

-- 9. EVIDENCE RELATIONSHIPS (Graph edges between claims)
CREATE TABLE IF NOT EXISTS evidence_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    target_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
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

-- 10. RESEARCH GAPS (Candidate gaps discovered across evidence)
CREATE TABLE IF NOT EXISTS research_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES research_topics(id) ON DELETE SET NULL,
    session_id UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
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

-- 11. GAP INVESTIGATIONS (Auditable falsification logs)
CREATE TABLE IF NOT EXISTS gap_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_gap_id UUID NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
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

-- 12. PROPOSED EXPERIMENTS (Concrete, resource-evaluated protocols)
CREATE TABLE IF NOT EXISTS proposed_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_gap_id UUID NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
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

-- 13. PROCESSING JOBS (Asynchronous execution pipeline)
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES research_sessions(id) ON DELETE SET NULL,
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
-- INDEXES FOR SCIENTIFIC RETRIEVAL PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);
CREATE INDEX IF NOT EXISTS idx_papers_arxiv ON papers(arxiv_id);
CREATE INDEX IF NOT EXISTS idx_papers_openalex ON papers(openalex_id);
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_papers_title_trgm ON papers USING gin (to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_claims_paper ON claims(paper_id);
CREATE INDEX IF NOT EXISTS idx_claims_type ON claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_claims_text_search ON claims USING gin (to_tsvector('english', claim_text));

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

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposed_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Anonymous reading of scholarly entities (papers, claims, citations, contexts are public scholarly data)
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE experimental_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public papers are readable by all" ON papers FOR SELECT USING (true);
CREATE POLICY "Public claims are readable by all" ON claims FOR SELECT USING (true);
CREATE POLICY "Public contexts are readable by all" ON experimental_contexts FOR SELECT USING (true);
CREATE POLICY "Public relationships are readable by all" ON evidence_relationships FOR SELECT USING (true);

-- User-scoped policies for research sessions
CREATE POLICY "Users can manage their sessions" ON research_sessions
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can access session papers" ON session_papers
    FOR ALL USING (true);

CREATE POLICY "Users can access research gaps" ON research_gaps
    FOR ALL USING (true);

CREATE POLICY "Users can access proposed experiments" ON proposed_experiments
    FOR ALL USING (true);

CREATE POLICY "Users can access processing jobs" ON processing_jobs
    FOR ALL USING (true);

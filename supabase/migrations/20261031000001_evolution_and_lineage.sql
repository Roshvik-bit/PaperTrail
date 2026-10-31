-- =====================================================================
-- PAPERTRAIL EVOLVING RESEARCH INTELLIGENCE SCHEMA
-- Migration: 20261031000001_evolution_and_lineage.sql
-- =====================================================================

-- 1. PREPRINT-TO-PUBLICATION LINEAGE
CREATE TABLE IF NOT EXISTS paper_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preprint_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    published_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.900,
    match_evidence JSONB NOT NULL DEFAULT '{}'::jsonb, -- { title_similarity, author_overlap, doi_match }
    methodology_diff TEXT,
    findings_diff TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(preprint_paper_id, published_paper_id)
);

-- 2. RETRACTION AND CORRECTION INTELLIGENCE
CREATE TABLE IF NOT EXISTS retraction_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    status_type TEXT NOT NULL CHECK (status_type IN ('RETRACTED', 'CORRECTED', 'EXPRESSION_OF_CONCERN')),
    notice_url TEXT,
    notice_date DATE,
    reason TEXT NOT NULL,
    affected_claim_ids JSONB DEFAULT '[]'::jsonb,
    affected_gap_ids JSONB DEFAULT '[]'::jsonb,
    provenance_warning TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DATASETS (Hugging Face, Zenodo, Figshare, Repositories)
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'EVALUATES_ON' CHECK (relationship IN ('EVALUATES_ON', 'INTRODUCES_DATASET', 'BENCHMARKS_ON')),
    PRIMARY KEY(paper_id, dataset_id)
);

-- 4. CROSS-DOMAIN CONNECTIONS
CREATE TABLE IF NOT EXISTS cross_domain_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
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

-- 5. EVIDENCE TIMELINE & EVOLUTION DELTAS
CREATE TABLE IF NOT EXISTS evidence_evolution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
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
    paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
    impact_summary JSONB NOT NULL DEFAULT '{}'::jsonb, -- { new_claims_count, affected_claims, gap_updates }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CONTINUOUS RESEARCH MONITORING TARGETS
CREATE TABLE IF NOT EXISTS research_monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    query_topic TEXT NOT NULL,
    monitor_provider TEXT NOT NULL DEFAULT 'tinyfish_monitor',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'FAILED')),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_check_due TIMESTAMPTZ,
    new_findings_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lineage_pair ON paper_lineage(preprint_paper_id, published_paper_id);
CREATE INDEX IF NOT EXISTS idx_retraction_paper ON retraction_alerts(paper_id);
CREATE INDEX IF NOT EXISTS idx_datasets_repo ON datasets(source_repository);
CREATE INDEX IF NOT EXISTS idx_evolution_session ON evidence_evolution_events(session_id);
CREATE INDEX IF NOT EXISTS idx_monitors_session ON research_monitors(session_id);


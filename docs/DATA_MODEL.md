# PaperTrail Data Model

## Relational & Graph Entity Model
PaperTrail implements a normalized PostgreSQL schema designed for scientific evidence tracking, provenance preservation, and graph traversal.

### 1. `papers`
Canonical scientific document records:
- `id`: UUID (Primary Key)
- `title`: String
- `abstract`: Text
- `doi`: String (Unique)
- `arxiv_id`: String (Unique)
- `openalex_id`: String (Unique)
- `semantic_scholar_id`: String (Unique)
- `publication_date`: Date
- `year`: Integer
- `venue`: String
- `authors`: JSONB Array (`[{ name, affiliation, orcid }]`)
- `canonical_url`: String
- `open_access_status`: `'gold' | 'green' | 'hybrid' | 'bronze' | 'closed' | 'unknown'`
- `full_text_status`: `'unavailable' | 'abstract_only' | 'open_access_pdf' | 'stored_pdf' | 'extracted_text'`
- `raw_full_text`: Text
- `metadata`: JSONB

### 2. `claims`
Granular structured assertions extracted directly from papers:
- `id`: UUID
- `paper_id`: UUID (Foreign Key -> `papers.id`)
- `claim_text`: String
- `claim_type`: `'HYPOTHESIS' | 'FINDING' | 'METHODOLOGY' | 'LIMITATION' | 'BENCHMARK_RESULT' | 'THEORETICAL_BOUND'`
- `section`: String
- `supporting_passage`: Text (verbatim or closely grounded passage)
- `page_number`: Integer
- `extraction_confidence`: Decimal (0.0 to 1.0)
- `verification_status`: `'AUTOMATICALLY_EXTRACTED' | 'CORROBORATED' | 'HUMAN_VERIFIED' | 'DISPUTED'`
- `extraction_version`: String

### 3. `experimental_contexts`
Hardware and execution parameters associated with claims:
- `id`: UUID
- `paper_id`: UUID
- `claim_id`: UUID
- `model`: String
- `model_size`: String (e.g. `1.1B`, `350M`)
- `hardware`: String (e.g. `Qualcomm Snapdragon 8 Gen 2`)
- `processor`: String (`CPU`, `GPU`, `NPU`, `Heterogeneous SoC`)
- `dataset`: String (e.g. `MMLU`, `Wikitext-2`)
- `methodology`: String
- `quantization`: String (e.g. `4-bit AWQ`, `GPTQ`)
- `precision`: String
- `environment`: String (e.g. `llama.cpp`)
- `metrics`: JSONB
- `variables`: JSONB

### 4. `evidence_relationships`
Graph edges connecting claims across different studies:
- `id`: UUID
- `source_claim_id`: UUID
- `target_claim_id`: UUID
- `relationship_type`:
  - `SUPPORTS`
  - `CHALLENGES`
  - `CONTRADICTS`
  - `QUALIFIES`
  - `EXTENDS`
  - `REPLICATES`
  - `PARTIALLY_REPLICATES`
  - `USES_SIMILAR_METHOD`
  - `DIFFERENT_EXPERIMENTAL_CONTEXT`
  - `INSUFFICIENT_EVIDENCE`
- `supporting_evidence`: Text
- `context_comparison`: JSONB (`similarities`, `differences`, `possible_explanations`, `is_genuine_contradiction`)
- `confidence`: Decimal

### 5. `research_gaps`
Identified candidate areas of empirical uncertainty:
- `id`: UUID
- `session_id`: UUID
- `title`: String
- `research_question`: String
- `description`: Text
- `gap_type`: `'UNEXPLORED_EXPERIMENTAL_COMBINATION' | 'REPEATED_LIMITATION' | 'UNRESOLVED_DISAGREEMENT' | 'UNDEREXPLORED_DATASET' | 'UNINVESTIGATED_HARDWARE_ENV' | 'METHODOLOGICAL_INCONSISTENCY' | 'MISSING_DIRECT_COMPARISON'`
- `status`: `'CANDIDATE' | 'RETAINED_CANDIDATE' | 'NARROWED_CANDIDATE' | 'EXISTING_WORK_FOUND' | 'INSUFFICIENT_COVERAGE' | 'REQUIRES_HUMAN_REVIEW'`
- `confidence`: Decimal

### 6. `gap_investigations`
Auditable logs of automated falsification attempts:
- `id`: UUID
- `research_gap_id`: UUID
- `search_queries`: JSONB Array
- `sources_searched`: JSONB Array
- `papers_found`: JSONB Array
- `counter_evidence_found`: JSONB Array
- `outcome`: Gap status verdict
- `coverage_limitations`: Text
- `reasoning_summary`: Text

### 7. `proposed_experiments`
Practical, resource-evaluated experiment protocols:
- `id`: UUID
- `research_gap_id`: UUID
- `objective`: Text
- `hypothesis`: Text
- `variables`: JSONB (`independent`, `dependent`, `controlled`)
- `methodology`: Text
- `datasets`: JSONB
- `hardware_requirements`: JSONB
- `metrics`: JSONB
- `estimated_resources`: JSONB (`compute_hours`, `estimated_cost_usd`, `estimation_confidence`)
- `checklist`: JSONB

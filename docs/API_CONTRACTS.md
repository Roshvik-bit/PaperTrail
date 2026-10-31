# PaperTrail API Contracts

## Endpoints Specification

### 1. Health & Integration Status
- **`GET /api/health`**
  - **Description**: Returns server operational health and status of connected scholarly providers (OpenAlex, Semantic Scholar, Crossref, arXiv, TinyFish, Supabase, LLM).
  - **Response**:
    ```json
    {
      "status": "healthy",
      "product": "PaperTrail",
      "version": "1.0.0",
      "integrations": {
        "openalex": true,
        "semantic_scholar": true,
        "crossref": true,
        "arxiv": true,
        "tinyfish": false,
        "supabase": false,
        "llm": "deterministic_fallback"
      }
    }
    ```

### 2. Research Sessions
- **`POST /api/research/sessions`**
  - **Body**: `{ "title"?: string, "research_question": string, "domain"?: string }`
  - **Response**: `{ "session": ResearchSession }`

- **`GET /api/research/sessions`**
  - **Response**: `{ "sessions": ResearchSession[] }`

- **`GET /api/research/sessions/:id`**
  - **Response**: `{ "session": ResearchSession }`

### 3. Scholarly Literature Discovery
- **`POST /api/research/sessions/:id/discover`**
  - **Body**: `{ "query"?: string, "limit"?: number }`
  - **Response**:
    ```json
    {
      "session_id": "string",
      "papers": [Paper],
      "total_found": 12,
      "sources_used": ["OpenAlex", "Semantic Scholar", "arXiv", "Crossref"],
      "external_resources": [TinyFishSearchResult],
      "query_interpreted": { "type": "NATURAL_QUERY", "normalized_value": "..." }
    }
    ```

### 4. Evidence Extraction & Analysis
- **`POST /api/research/sessions/:id/analyze`**
  - **Description**: Runs multi-stage scientific extraction, pairwise disagreement investigation, and candidate research-gap synthesis.
  - **Response**:
    ```json
    {
      "success": true,
      "job_id": "string",
      "analysis": {
        "claims_extracted_count": 18,
        "relationships_found_count": 8,
        "gaps_discovered_count": 2
      }
    }
    ```

### 5. Interactive Knowledge Graph
- **`GET /api/research/sessions/:id/graph`**
  - **Response**: `{ "graph": { "nodes": [...], "edges": [...] } }`

### 6. Disagreements & Claims
- **`GET /api/research/sessions/:id/claims`**
  - **Response**: `{ "claims": [Claim] }`

- **`GET /api/research/sessions/:id/disagreements`**
  - **Response**: `{ "disagreements": [EvidenceRelationship], "total": number }`

### 7. Candidate Gaps & Falsification
- **`GET /api/research/sessions/:id/gaps`**
  - **Response**: `{ "gaps": [ResearchGap] }`

- **`POST /api/research/gaps/:id/investigate`**
  - **Description**: Executes 6-stage adversarial falsification audit against candidate gap.
  - **Response**: `{ "report": GapInvestigationReport }`

### 8. Experiment Feasibility & Planning
- **`POST /api/research/gaps/:id/plan-experiment`**
  - **Description**: Generates a testable hypothesis, variables breakdown, and hardware feasibility estimate.
  - **Response**: `{ "experiment": ProposedExperiment }`


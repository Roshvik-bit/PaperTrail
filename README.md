# PaperTrail — Evolving Research Intelligence Engine

> **Discover what research has established, what it challenges, what remains unexplored, and how the scientific evidence changes over time.**

PaperTrail is an evidence-driven scientific intelligence engine. Unlike superficial paper summarizers or static citation maps, PaperTrail continuously tracks evolving scientific understanding across peer-reviewed literature, preprints, datasets, and benchmark environments.

---

## Key Capabilities

1. **Continuous Research Tracking & Evidence Timeline**:
   - Create research investigations around a topic, hypothesis, paper, or research gap.
   - Automatically ingest newly published research via scholarly providers and TinyMonitor.
   - Re-evaluate existing claims, identify shifts in consensus, and log transparent evidence evolution deltas.
2. **Grounded Scientific Claim Extraction**:
   - Extracts structured claims (`FINDING`, `HYPOTHESIS`, `METHODOLOGY`, `LIMITATION`, `BENCHMARK_RESULT`) with verbatim supporting quotes and experimental context.
3. **Context-Aware Disagreement Investigation**:
   - Differentiates apparent contradictions (caused by differing hardware, bitwidth, context length, or thermal duration) from genuine scientific conflicts.
4. **Candidate Research-Gap Discovery & 6-Stage Falsification**:
   - Synthesizes candidate gaps across repeated limitations and unexplored hardware regimes.
   - Subject candidate gaps to a 6-stage adversarial audit that attempts to disprove them against prior work.
5. **Practical Experiment Feasibility Planning**:
   - Synthesizes formal $H_1$ hypotheses, independent/dependent variables, hardware feasibility budgets, and pre-flight checklists.
6. **Preprint-to-Publication Lineage**:
   - Maps early arXiv preprints to final peer-reviewed conference/journal proceedings, isolating methodology shifts.
7. **Retraction and Correction Intelligence**:
   - Preserves historical evidence visibly; automatically flags dependent claims and recalculates conclusions with prominent provenance warnings.
8. **Accessible Dataset Discovery**:
   - Connects verified public datasets (Hugging Face, Zenodo, Figshare) to empirical evaluation papers.
9. **Cross-Domain Hypothesis Transfer**:
   - Surfaces structural analogies and shared mechanisms connecting Edge AI to adjacent sciences (Neuromorphic Computing, OS Thermal Governors).

---

## Initial Domain: Edge AI, SLMs & Constrained Inference
- Sub-billion & small language models (MobileLLM, TinyLlama)
- Quantization & compression tradeoffs (AWQ, GPTQ, SmoothQuant)
- Memory bandwidth & thermal throttling dynamics under sustained on-device execution
- CPU vs. GPU vs. NPU execution regimes

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- npm or pnpm

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Optional provider keys:
- `TINYFISH_API_KEY`: TinySearch, TinyFetch, TinyAgent & TinyMonitor
- `SEMANTIC_SCHOLAR_API_KEY`: High-throughput Semantic Scholar Graph API
- `OPENALEX_EMAIL`: Polite pool email for OpenAlex
- `GEMINI_API_KEY` / `OPENAI_API_KEY`: LLM synthesis (defaults to deterministic scientific inference engine if omitted)
- `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Supabase PostgreSQL persistence (defaults to in-memory/cache store if omitted)

### 3. Installation & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running the Test Suite
```bash
npm test
```
Executes the comprehensive automated test suite (17 tests across 13 suites) covering:
- API & health contracts
- Repository session & graph lifecycle
- Curated landmark Edge AI benchmark corpus
- Query classification & deduplication
- Claim & context extraction
- Context-aware disagreement resolution
- Candidate gap discovery & 6-stage falsification
- Experiment feasibility planning
- Preprint-to-publication lineage matching
- Retraction intelligence & impact propagation
- Cross-domain candidate discovery
- Continuous research evolution engine (vertical slice)
- TinyMonitor & offline polling resilience

---

## Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Data Model & Database Schema](docs/DATA_MODEL.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Research Pipeline Details](docs/RESEARCH_PIPELINE.md)
- [Evaluation Framework](docs/EVALUATION.md)
- [Agent Operating Guidelines](AGENTS.md)

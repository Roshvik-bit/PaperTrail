# PaperTrail — Autonomous Research Intelligence Engine

> **Discover the connections. Challenge the evidence. Find what to investigate next.**

PaperTrail is an evidence-driven research intelligence engine designed for researchers, scientists, and AI engineers.

Unlike literature search engines or paper summarizers, PaperTrail focuses on:
- **Grounded Scientific Claim Extraction**: Extracting structured findings paired with exact supporting passages.
- **Context-Aware Disagreement Investigation**: Dissecting conflicting findings across differing hardware, bitwidths, and benchmarks to separate apparent contradictions from genuine scientific conflicts.
- **Candidate Research-Gap Discovery**: Identifying underexplored experimental combinations across peer-reviewed literature.
- **Adversarial Research-Gap Falsification**: Executing automated 6-stage counter-evidence audits to challenge candidate gaps against prior art.
- **Practical Experiment Planning**: Generating testable H1 hypotheses with independent/dependent variables and hardware resource feasibility evaluations.

---

## Initial Domain: Edge AI & Small Language Models
PaperTrail launches with a specialized focus on:
- Sub-billion & small language model inference (MobileLLM, TinyLlama)
- Quantization & compression tradeoffs (AWQ, GPTQ, SmoothQuant)
- Memory bandwidth & thermal throttling dynamics under sustained on-device execution
- CPU vs GPU vs NPU execution regimes

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

Configure optional provider keys for increased rate limits:
- `SEMANTIC_SCHOLAR_API_KEY`: Semantic Scholar higher throughput
- `OPENALEX_EMAIL`: Polite pool email for OpenAlex
- `TINYFISH_API_KEY`: Autonomous web navigation
- `GEMINI_API_KEY` / `OPENAI_API_KEY`: LLM synthesis (defaults to high-precision deterministic scientific inference engine if omitted)
- `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Supabase PostgreSQL persistence (defaults to persistent in-memory repository if omitted)

### 3. Installation & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Tests
```bash
npm test
```

---

## Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Data Model & Database Schema](docs/DATA_MODEL.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Research Pipeline Details](docs/RESEARCH_PIPELINE.md)
- [Evaluation Framework](docs/EVALUATION.md)
- [Agent Operating Guidelines](AGENTS.md)

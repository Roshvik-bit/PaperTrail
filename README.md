# PaperTrail — Autonomous Research Intelligence Engine

<div align="center">
  <img src="public/logo.png" alt="PaperTrail Emblem" width="120" style="mix-blend-mode: multiply;" />
  <br />
  <h3><strong>Discover the connections. Challenge the evidence. Find what to investigate next.</strong></h3>
  <p><em>An evidence-driven scientific intelligence engine that tracks consensus evolution, resolves experimental contradictions, and adversarially falsifies candidate research gaps.</em></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tests-25%20Passing%20(18%20Suites)-858B70?style=flat-square" alt="Tests" />
    <img src="https://img.shields.io/badge/Storage-Local_SQLite_%2B_Supabase-B96645?style=flat-square" alt="Storage" />
    <img src="https://img.shields.io/badge/LLM-Local_Ollama_%2F_Gemini_%2F_OpenAI-252622?style=flat-square" alt="LLM" />
    <img src="https://img.shields.io/badge/Scholarly_APIs-OpenAlex_%E2%80%A2_arXiv_%E2%80%A2_S2_%E2%80%A2_Crossref-858B70?style=flat-square" alt="Scholarly APIs" />
  </p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [What Sets PaperTrail Apart](#what-sets-papertrail-apart)
- [Core Scientific Capabilities](#core-scientific-capabilities)
- [Academic Journal Design System](#academic-journal-design-system)
- [Local-First Architecture & Portability](#local-first-architecture--portability)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Evaluation & Test Suite](#evaluation--test-suite)
- [Documentation & Agent Principles](#documentation--agent-principles)

---

## Overview

Scientific knowledge is distributed across tens of millions of papers, preprints, benchmarks, datasets, and errata. Researchers waste hundreds of hours manually comparing inconsistent findings, isolating unstated experimental differences, and investigating research questions that have already been answered.

**PaperTrail** automates this investigative workflow. It is **not** an AI paper summarizer, chatbot, or generic citation graph. Instead, it operates as an autonomous scientific intelligence engine that:

1. **Extracts strictly grounded scientific claims** with exact verbatim citations and experimental context matrices.
2. **Investigates conflicting findings**, isolating whether apparent disagreements stem from differing hardware, quantization bitwidths, thermal throttling, or evaluation metrics.
3. **Discovers candidate research gaps** across limitation frontiers and subjects them to an automated **6-stage counter-evidence falsification audit**.
4. **Synthesizes concrete, resource-evaluated experiment protocols** with testable hypotheses, hardware feasibility scores, and pre-flight checklists.
5. **Continuously monitors research streams**, updating relationship graphs and generating transparent evidence evolution timelines as new publications appear.

---

## What Sets PaperTrail Apart

| Capability | Generic AI Summarizer / Chatbot | Traditional Citation Graphs | **PaperTrail Research Intelligence** |
| :--- | :--- | :--- | :--- |
| **Epistemic Distinctions** | Confuses hypotheses with facts | Ignores claim validity | **Strictly separates findings, hypotheses, and candidate gaps** |
| **Claim Grounding** | Generates plausible hallucinations | No passage extraction | **Every claim cites exact verbatim supporting passages** |
| **Handling Contradictions** | Either hallucinates agreement or declares binary contradiction | Shows undirected citation links | **Differentiates apparent divergence (context differences) from genuine conflicts** |
| **Research Gap Discovery** | Generates generic, unvalidated ideas | None | **Discovers candidate gaps and runs 6-stage adversarial falsification** |
| **Experiment Planning** | Superficial bullet points | None | **Formal $H_1$ hypotheses, variables, compute budgets & feasibility scores** |
| **Historical Provenance** | Deletes or ignores retractions silently | Shows stale citation counts | **Preserves retraction history with visible provenance warnings** |
| **Portability & Privacy** | Trapped in SaaS silos | Proprietary schemas | **Local SQLite database (`node:sqlite`) + Full ZIP research exports** |

---

## Core Scientific Capabilities

### 1. Multi-Provider Scholarly Discovery
Coordinates parallel, deduplicated queries across primary scientific repositories:
- **OpenAlex**: Global scholarly graph with open access status, topics, and authorships.
- **arXiv**: Preprints, raw abstracts, and direct arXiv identifier lookups.
- **Semantic Scholar**: Influence metrics, citation counts, and paper embeddings.
- **Crossref**: Publisher-verified metadata, official DOIs, and Crossmark provenance checks.
- **TinyFish Autonomous Discovery**: Web benchmarks, evaluation codebases, and continuous publication tracking.

### 2. Grounded Scientific Claim & Context Extraction
Extracts structured assertions validated against strict Zod schemas:
- **Claim Types**: `FINDING`, `HYPOTHESIS`, `METHODOLOGY`, `LIMITATION`, `BENCHMARK_RESULT`, `THEORETICAL_BOUND`.
- **Experimental Conditions Matrix**: Model architecture, parameter scale, processor (CPU/GPU/NPU/SoC), precision/quantization, batch size, context window length, and benchmark dataset.
- **Verbatim Grounding**: Every claim captures an exact supporting quote from the document text to eliminate model hallucination.

### 3. Context-Aware Disagreement Investigation
When two studies report diverging results, PaperTrail isolates the underlying independent variables before labeling them a contradiction:
- Differentiates **Apparent Contradictions** (e.g. burst throughput vs. sustained thermal throttling on mobile SoCs) from **Genuine Scientific Conflicts**.
- Identifies isolated factors, calculates empirical uncertainty, and formulates testable resolution hypotheses.

### 4. 6-Stage Adversarial Research-Gap Falsification
Newly generated research opportunities are explicitly designated as `CANDIDATE RESEARCH GAP` until audited:
1. **Target Formulation**: Deconstruct candidate gap into core assumptions.
2. **Counter-Evidence Search**: Aggressive retrieval across past literature specifically targeting prior solutions.
3. **Prior Work Assessment**: Classifies whether past papers already resolved the inquiry.
4. **Falsification Verdict**: Assigns verified status (`RETAINED_CANDIDATE`, `NARROWED_CANDIDATE`, `EXISTING_WORK_FOUND`, `INSUFFICIENT_COVERAGE`, or `REQUIRES_HUMAN_REVIEW`).
5. **Scoping Refinement**: Restricts the question boundary to preserve novel empirical territory.
6. **Provenance Logging**: Records audit justification, retrieved papers, and expert recommendations.

### 5. Practical Experiment Protocol & Feasibility Planning
Converts surviving candidate gaps into reproducible laboratory blueprints:
- Formal $H_1$ testable hypothesis.
- Independent, dependent, and controlled variable isolation.
- Hardware specifications, VRAM requirements, estimated compute hours, and financial cost in USD.
- Quantitative feasibility score and step-by-step pre-flight procedures.

### 6. Continuous Tracking & Evidence Evolution Timeline
- Tracks investigations over time as new preprints and journal articles emerge.
- Integrates TinyFish Monitor to track research topics and publication channels.
- Emits structured `EvidenceEvolutionEvent` records logging what changed in the consensus topology.

### 7. Preprint-to-Publication Lineage Mapping
- Matches early arXiv preprints with eventual conference and journal proceedings.
- Isolates methodology refinements, benchmark shifts, and revised author claims without prematurely merging records.

### 8. Retraction & Correction Intelligence
- Never silently deletes historical evidence.
- Retracted papers and dependent claims are prominently highlighted with visible provenance alerts, automatically recalculating downstream confidence metrics.

### 9. Accessible Dataset Discovery
- Links empirical evaluation papers to verified public datasets on Hugging Face, Zenodo, Figshare, and GitHub.
- Verifies licensing terms and hosting availability.

### 10. Cross-Domain Hypothesis Transfer
- Identifies structural analogies and shared physical mechanisms connecting primary research to adjacent disciplines (e.g. mapping thermal throttling in edge SoCs to thermodynamic governors in biology).

---

## Academic Journal Design System

PaperTrail features a bespoke editorial design language engineered for scientific rigor, clarity, and deep inquiry:

- **Typography**: 
  - **Instrument Serif**: Editorial headings, article titles, and hypothesis statements.
  - **DM Sans**: Clean interface controls, metadata labels, and body text.
  - **JetBrains Mono**: DOIs, citations, hardware variables, and confidence metrics.
- **Reference Color Palette**:
  - `Warm Ivory Canvas`: `--paper-bg: #F7F6F2`
  - `Paper Surfaces`: `--paper-surface: #FDFCF9`, `--paper-surface-alt: #FAF8F3`
  - `Academic Ink`: `--paper-ink: #252622`, `--paper-muted: #777873`
  - `Terracotta Accent`: `--paper-accent: #B96645` (Contradictions, challenges, research frontiers)
  - `Muted Olive Accent`: `--paper-data: #858B70` (Supporting evidence, confirmed datasets)
  - `Hairline Borders`: `--paper-border: #E3E1D9`, strong: `#CCC8BC`
- **Hierarchical Evidence Graph**:
  - Column-tiered layout grouping claims strictly under their parent paper columns (eliminating overlapping nodes).
  - Slide-over **Evidence Inspector Panel** showing verbatim supporting passages, experimental matrices, and DOI links.
- **Zero SaaS Clutter**: No neon gradients, no dark terminal dashboards, no emojis as icons, no glassmorphism.

---

## Local-First Architecture & Portability

PaperTrail is built with dual-tier storage flexibility:

### 1. Native SQLite Local Store (`node:sqlite`)
- Uses Node.js native `DatabaseSync` (`node:sqlite`) with Write-Ahead Logging (`WAL`) mode.
- Completely local and private stored at `.papertrail-data/papertrail.db`.
- Requires zero external database setup or cloud account to run full investigations.

### 2. Cloud Synchronization (Supabase PostgreSQL)
- Seamless cloud synchronization for collaborative multi-device sessions with resilient in-memory fallback.

### 3. Complete Research Export Engine
Export any investigation in one click into standardized scholarly formats:
- **Full ZIP Research Archive**: Organized, zero-dependency ZIP archive containing:
  ```
  papertrail-research/
  ├── manifest.json
  ├── README.md
  ├── papers/
  ├── claims/
  ├── evidence/
  ├── graph/
  ├── research-gaps/
  ├── experiments/
  ├── datasets/
  ├── timeline/
  ├── reports/
  └── provenance/
  ```
- **Standard Research Formats**: JSON, CSV, BibTeX (`.bib`), Markdown Research Brief, and Print-ready HTML Briefs.
- **Security Guardrails**: CRC32 verification, strict path-traversal prevention, and complete redaction of API keys or credentials.

---

## Repository Structure

```
PaperTrail/
├── src/
│   ├── app/                                # Next.js 14 App Router
│   │   ├── api/research/                   # Research sessions, discovery, analysis & gaps
│   │   ├── api/storage/                    # SQLite status and cloud sync
│   │   ├── workspace/page.tsx              # Primary scientific inquiry workspace
│   │   ├── page.tsx                        # Publication landing & interactive explorer
│   │   ├── layout.tsx                      # Root layout & Google Fonts integration
│   │   └── globals.css                     # Editorial design system & Tailwind layers
│   ├── components/
│   │   ├── shell/                          # PaperTrailShell, Topbar & Sidebar
│   │   ├── landing/                        # Hero, Problem, Solutions & Preview sections
│   │   ├── EvidenceGraphView.tsx           # ReactFlow hierarchical evidence graph
│   │   ├── DisagreementView.tsx            # Context-aware conflict resolution
│   │   ├── GapExplorerView.tsx             # 6-stage gap audit & experiment planning
│   │   ├── TimelineEvolutionView.tsx       # Evidence evolution timeline
│   │   ├── PreprintLineageView.tsx         # arXiv-to-proceeding matching
│   │   ├── RetractionAlertsView.tsx        # Post-publication alert provenance
│   │   ├── DatasetExplorerView.tsx         # Hugging Face & Zenodo benchmark explorer
│   │   ├── CrossDomainView.tsx             # Interdisciplinary transfer hypotheses
│   │   ├── ExportDropdown.tsx              # Multi-format research export menu
│   │   └── StoragePortabilityModal.tsx     # Local SQLite & Supabase manager
│   ├── lib/
│   │   ├── scholarly/                      # OpenAlex, arXiv, Semantic Scholar, Crossref, TinyFish
│   │   ├── llm/                            # Ollama, Gemini, OpenAI providers & Zod schemas
│   │   ├── analysis/                       # Multi-stage research analysis pipeline
│   │   ├── export/                         # Native ZIP archiver, BibTeX & serializers
│   │   └── db/                             # SQLite repository & Supabase implementations
│   └── types/index.ts                      # Strict TypeScript domain schemas
├── docs/                                   # Architecture, API & pipeline specifications
├── scripts/test-runner.mjs                 # Comprehensive automated test suite
├── supabase/consolidated_schema.sql        # Supabase PostgreSQL schema
└── tailwind.config.ts                      # Editorial design tokens
```

---

## Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node v20 and v26)
- **npm** or **pnpm**
- *(Optional)* **Ollama** running locally for private, local LLM claim extraction.

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/your-username/papertrail.git
cd papertrail

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### 3. Environment Configuration
Edit `.env` to configure your preferred providers:
```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LLM Provider (Options: 'ollama', 'gemini', 'openai')
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:20b-cloud

# Scholarly Provider Polite Access
OPENALEX_EMAIL=researcher@example.edu
CROSSREF_MAILTO=researcher@example.edu

# Optional Cloud DB & Autonomous Web Scraping
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
# TINYFISH_API_KEY=...
```

> **Note on LLM Execution**: If no LLM API key or Ollama instance is configured, PaperTrail automatically engages its **deterministic scientific inference engine** to ensure all extraction, contradiction resolution, and gap audits execute reliably with zero crashes.

### 4. Run the Engine
```bash
# Start development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/research/sessions` | `GET` / `POST` | List all sessions or initiate a new scientific inquiry |
| `/api/research/sessions/[id]` | `GET` | Retrieve session metadata and research question |
| `/api/research/sessions/[id]/discover` | `POST` | Query OpenAlex, arXiv, S2, Crossref & TinyFish |
| `/api/research/sessions/[id]/analyze` | `POST` | Extract grounded claims, context matrices & contradictions |
| `/api/research/sessions/[id]/papers` | `GET` | List all verified papers with DOI citations |
| `/api/research/sessions/[id]/claims` | `GET` | List extracted claims with verbatim passages |
| `/api/research/sessions/[id]/disagreements` | `GET` | List apparent vs. genuine contradictions |
| `/api/research/sessions/[id]/gaps` | `GET` | Retrieve candidate research gaps |
| `/api/research/sessions/[id]/gaps/[gapId]/falsify` | `POST` | Execute 6-stage adversarial counter-evidence audit |
| `/api/research/sessions/[id]/gaps/[gapId]/experiment` | `POST` | Generate concrete experiment protocol & compute estimate |
| `/api/research/sessions/[id]/graph` | `GET` | Retrieve multi-tiered node & edge relationship topology |
| `/api/research/sessions/[id]/evolution` | `GET` | Retrieve chronological evidence evolution events |
| `/api/research/sessions/[id]/evolution/check` | `POST` | Poll monitors and index for new consensus shifts |
| `/api/research/sessions/[id]/export` | `GET` | Download ZIP archive, JSON, CSV, BibTeX, or Markdown |
| `/api/research/import` | `POST` | Import and restore research archive with schema validation |
| `/api/storage/status` | `GET` | Inspect SQLite local store & Supabase connectivity status |
| `/api/storage/sync` | `POST` | Synchronize local SQLite records with cloud storage |

---

## Evaluation & Test Suite

PaperTrail comes with an automated test suite verifying contracts, repository operations, security sanitization, and scholarly pipelines:

```bash
npm test
```

### Verified Test Matrix (25 Tests across 18 Suites):
- ✔ PaperTrail API & Health Contracts
- ✔ PaperTrail Repository Engine & Graph Lifecycle
- ✔ Curated Landmark Benchmark Corpus
- ✔ Multi-Provider Discovery & Deduplication
- ✔ Grounded Claim & Context Extraction Engine
- ✔ Context-Aware Disagreement Investigation
- ✔ Candidate Gap Discovery & 6-Stage Falsification
- ✔ Experiment Feasibility & Protocol Planning
- ✔ Preprint-to-Publication Lineage Matching
- ✔ Retraction Intelligence & Provenance Impact
- ✔ Cross-Domain Hypothesis Transfer Engine
- ✔ Continuous Research Evolution Engine
- ✔ TinyMonitor & Polling Resilience
- ✔ Research Export Engine & Multi-Format Serialization
- ✔ ZIP Security Auditing & Path Traversal Defense
- ✔ Research Import Engine & Provenance Restoration
- ✔ Local SQLite Research Repository Engine (`node:sqlite`)
- ✔ Research Repository Factory & Storage Status

---

## Documentation & Agent Principles

- [**Architecture Overview**](docs/ARCHITECTURE.md): Comprehensive system blueprints and data flows.
- [**Agent Guidelines (`AGENTS.md`)**](AGENTS.md): Operational rules, epistemic directives, and sub-service roles.
- [**Data Model Specification**](docs/DATA_MODEL.md): Relational schemas, TypeScript interfaces, and enum boundaries.
- [**API Contracts**](docs/API_CONTRACTS.md): Detailed request/response payloads.
- [**Research Pipeline**](docs/RESEARCH_PIPELINE.md): Step-by-step algorithms for falsification and disagreement resolution.
- [**Evaluation Framework**](docs/EVALUATION.md): Quantitative benchmark suites and methodology.

---

<div align="center">
  <p><strong>PaperTrail Research Intelligence</strong> — Engineered for deep inquiry, verifiable evidence, and accelerated scientific discovery.</p>
## Contributors

This project was developed during a hackathon through the collaborative efforts of the following contributors.

| Contribution | GitHub Profile |
|:---|:---|
| UI / Frontend Development | [roshvik-bit](https://github.com/roshvik-bit) |
| Backend Development | [umeshadabala](https://github.com/umeshadabala) |

**Project Repository:** [PaperTrail](https://github.com/umeshadabala/PaperTrail)

We appreciate the time, effort, and collaboration that went into building this project.
</div>

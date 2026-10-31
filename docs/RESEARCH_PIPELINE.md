# PaperTrail Research Pipeline

## Scientific Information Processing Pipeline

PaperTrail uses a sequential, multi-stage processing pipeline ensuring grounding, traceability, and falsifiability.

```
       [Research Question / DOI / arXiv]
                       │
                       ▼
         STAGE 1: Scholarly Discovery
  (OpenAlex + Semantic Scholar + Crossref + arXiv + TinyFish)
                       │
                       ▼
       STAGE 2: Deduplication & Provenance
   (DOI / arXiv matching + Normalized Title Hashing)
                       │
                       ▼
     STAGE 3: Grounded Claim & Context Extraction
 (Structured assertions, section, exact quote, hardware profile)
                       │
                       ▼
  STAGE 4: Context-Aware Disagreement Investigation
  (Isolates hardware, precision, duration, apparent vs genuine)
                       │
                       ▼
     STAGE 5: Candidate Research-Gap Discovery
   (Repeated limitations, underexplored hardware regimes)
                       │
                       ▼
   STAGE 6: Adversarial Research-Gap Falsification
(Decomposition -> Query expansion -> Counter-evidence evaluation)
                       │
                       ▼
  STAGE 7: Experiment Protocol & Feasibility Planning
   (Hypothesis H1, IV/DV/CV, hardware feasibility calculator)
```

### Detailed Stage Breakdown

#### 1. Scholarly Discovery
Queries multiple providers in parallel with timeout safeguards. When searching for Edge AI or Small Language Models, automatically incorporates authentic peer-reviewed landmark literature (MobileLLM, AWQ, GPTQ, TinyLlama, PowerInfer, and Thermal Dynamics).

#### 2. Deduplication & Provenance
Tracks external IDs from every contributing source. Merges Open Access PDF links from arXiv with citation counts from Semantic Scholar and OpenAlex.

#### 3. Grounded Claim Extraction
Extracts assertions categorized by:
- `FINDING`
- `HYPOTHESIS`
- `METHODOLOGY`
- `LIMITATION`
- `BENCHMARK_RESULT`
- `THEORETICAL_BOUND`
Every extracted claim is paired with verbatim text from the paper.

#### 4. Disagreement Investigation
Prevents simplistic binary agree/disagree labels. Examines:
- Model Architecture & Size
- Quantization Bitwidth & Algorithm
- Evaluation Duration (Burst vs Sustained)
- Cooling & Thermal Throttling State
- Compute Device (GPU, CPU, NPU)

#### 5. Gap Falsification Workflow
The 6-stage falsification workflow attempts to disprove candidate gaps:
- **Stage 1**: Gap Decomposition (Extract alternate terminology)
- **Stage 2**: Search Expansion (Query scholarly APIs for overlapping work)
- **Stage 3**: Reference Exploration (Follow citations and follow-up benchmarks)
- **Stage 4**: Counter-Evidence Analysis (Evaluate existing answers)
- **Stage 5**: Gap Revision (Retain, Narrow, or Reject)
- **Stage 6**: Auditable Report Generation

#### 6. Practical Experiment Design
Generates concrete protocols with:
- Formal H1 testable hypothesis
- Independent, Dependent, and Controlled variables
- Hardware feasibility checks (RAM, VRAM, and thermal throttling)
- Pre-flight checklist and JSON export


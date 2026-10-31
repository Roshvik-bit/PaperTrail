# PaperTrail Evaluation & Quality Framework

## Scientific Rigor Metrics
PaperTrail evaluates scientific intelligence across ten key dimensions:

1. **Paper Retrieval Precision & Recall**: Accuracy in retrieving relevant scholarly articles without introducing non-peer-reviewed spam.
2. **Claim Evidence Grounding (CEG)**: Verification that every extracted scientific claim directly corresponds to a passage in the source document.
3. **Experimental Context Extraction Accuracy (ECE)**: Precision in correctly capturing model parameters, quantization bitwidths, and hardware backends.
4. **Relationship Classification Accuracy (RCA)**: Precision in differentiating `SUPPORTS`, `CHALLENGES`, `QUALIFIES`, and `CONTRADICTS`.
5. **False Contradiction Rate (FCR)**: Frequency with which differing experimental conditions are mistakenly labeled as genuine contradictions (target: < 5%).
6. **Gap Falsification Sensitivity (GFS)**: Probability of identifying relevant prior work that invalidates an assumed research gap.
7. **Experiment Feasibility Rate (EFR)**: Percentage of proposed experiments that specify achievable hardware requirements rather than unconstrained cloud compute.

## Benchmark Corpus: Edge AI & Small Language Models
The initial evaluation benchmark includes:
- **MobileLLM** (Meta AI, ICML 2024 / arXiv:2402.14905)
- **AWQ** (MIT, MLSys 2024 / arXiv:2306.00978)
- **GPTQ** (IST Austria, ICLR 2023 / arXiv:2210.17323)
- **TinyLlama** (Zhang et al., 2024 / arXiv:2401.02385)
- **PowerInfer** (Shanghai Jiao Tong, ASPLOS 2024 / arXiv:2312.12456)
- **Thermal Throttling in Mobile LLM Inference** (Cambridge, IEEE Pervasive 2024)

## Ground Truth Test Cases
- **Case 1 (Apparent vs Genuine Contradiction)**: AWQ claims 3.2x latency speedup on mobile GPU burst benchmarks; Thermal Throttling paper reports 43-61% throughput degradation after 90 seconds.
  - *Expected Classification*: `QUALIFIES` (Apparent Contradiction driven by workload duration and thermal state).
- **Case 2 (Gap Falsification)**: A candidate gap proposing "Does quantization degrade mobile LLM throughput?" is presented.
  - *Expected Outcome*: `EXISTING_WORK_FOUND` or `NARROWED_CANDIDATE` citing Chen et al. (IEEE 2024) and Lin et al. (MLSys 2024).


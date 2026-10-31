import { z } from 'zod';

export const ClaimExtractionSchema = z.object({
  claims: z.array(z.object({
    claim_text: z.string().min(10),
    claim_type: z.enum([
      'HYPOTHESIS',
      'FINDING',
      'METHODOLOGY',
      'LIMITATION',
      'BENCHMARK_RESULT',
      'THEORETICAL_BOUND'
    ]),
    section: z.string().default('Abstract'),
    supporting_passage: z.string().min(10),
    page_number: z.number().int().optional(),
    extraction_confidence: z.number().min(0).max(1).default(0.88),
  })).min(1),
  experimental_context: z.object({
    model: z.string().optional(),
    model_size: z.string().optional(),
    hardware: z.string().optional(),
    processor: z.string().optional(),
    dataset: z.string().optional(),
    methodology: z.string().optional(),
    quantization: z.string().optional(),
    precision: z.string().optional(),
    environment: z.string().optional(),
    sample_size: z.number().optional(),
    metrics: z.record(z.union([z.string(), z.number()])).default({}),
    variables: z.record(z.string()).default({}),
    raw_context: z.string().optional(),
  }),
  limitations: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
});

export type ClaimExtractionOutput = z.infer<typeof ClaimExtractionSchema>;

export const ContextComparisonSchema = z.object({
  relationship_type: z.enum([
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
  ]),
  confidence: z.number().min(0).max(1),
  is_genuine_contradiction: z.boolean(),
  supporting_evidence: z.string().min(10),
  similarities: z.array(z.string()).default([]),
  differences: z.array(z.object({
    variable: z.string(),
    source_val: z.string(),
    target_val: z.string(),
    impact_level: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })).default([]),
  possible_explanations: z.array(z.string()).default([]),
  alternative_explanations: z.array(z.string()).default([]),
  remaining_uncertainty: z.string().default('Requires direct head-to-head empirical measurement under controlled thermal conditions.'),
});

export type ContextComparisonOutput = z.infer<typeof ContextComparisonSchema>;

export const GapDiscoverySchema = z.object({
  gaps: z.array(z.object({
    title: z.string().min(10),
    research_question: z.string().min(15),
    description: z.string().min(25),
    gap_type: z.enum([
      'UNEXPLORED_EXPERIMENTAL_COMBINATION',
      'REPEATED_LIMITATION',
      'UNRESOLVED_DISAGREEMENT',
      'UNDEREXPLORED_DATASET',
      'UNINVESTIGATED_HARDWARE_ENV',
      'METHODOLOGICAL_INCONSISTENCY',
      'MISSING_DIRECT_COMPARISON'
    ]),
    supporting_paper_ids: z.array(z.string()),
    relevant_limitations: z.array(z.string()).default([]),
    unexplored_conditions: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1).default(0.78),
    suggested_experiment_direction: z.string(),
    search_coverage_limitations: z.string().default('Evaluated across OpenAlex, arXiv, Semantic Scholar, and Crossref.'),
  })).min(1),
});

export type GapDiscoveryOutput = z.infer<typeof GapDiscoverySchema>;

export const GapFalsificationSchema = z.object({
  outcome: z.enum([
    'RETAINED_CANDIDATE',
    'NARROWED_CANDIDATE',
    'EXISTING_WORK_FOUND',
    'INSUFFICIENT_COVERAGE',
    'REQUIRES_HUMAN_REVIEW'
  ]),
  revised_question: z.string().optional(),
  search_queries_used: z.array(z.string()),
  counter_evidence_findings: z.array(z.object({
    title: z.string(),
    doi: z.string().optional(),
    year: z.number().optional(),
    venue: z.string().optional(),
    summary: z.string(),
    relevance_to_gap: z.string(),
  })).default([]),
  coverage_limitations: z.string(),
  reasoning_summary: z.string(),
  human_review_recommendation: z.string(),
});

export type GapFalsificationOutput = z.infer<typeof GapFalsificationSchema>;

export const ExperimentPlanSchema = z.object({
  objective: z.string().min(10),
  research_question: z.string().min(15),
  testable_hypothesis: z.string().min(15),
  variables: z.object({
    independent: z.array(z.string()),
    dependent: z.array(z.string()),
    controlled: z.array(z.string()),
  }),
  methodology: z.string().min(30),
  baselines: z.array(z.string()),
  datasets: z.array(z.object({
    name: z.string(),
    size: z.string().optional(),
    source_url: z.string().optional(),
    availability: z.enum(['PUBLIC', 'RESTRICTED', 'PROPRIETARY'])
  })),
  hardware_requirements: z.object({
    target_hardware: z.string(),
    gpu_min_vram_gb: z.number().optional(),
    ram_gb: z.number().optional(),
    estimated_inference_ms: z.number().optional(),
    thermal_considerations: z.string().optional(),
  }),
  metrics: z.array(z.string()),
  estimated_resources: z.object({
    compute_hours: z.number(),
    estimated_cost_usd: z.number(),
    estimation_confidence: z.enum(['MEASURED', 'CALCULATED', 'ESTIMATED', 'UNKNOWN'])
  }),
  limitations: z.string(),
  expected_contribution: z.string(),
  checklist: z.array(z.object({
    item: z.string(),
    completed: z.boolean().default(false)
  })),
});

export type ExperimentPlanOutput = z.infer<typeof ExperimentPlanSchema>;


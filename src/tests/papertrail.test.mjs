import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Curated Landmark Edge AI Papers Integrity
describe('Curated Edge AI Benchmark Corpus', async () => {
  const { CURATED_EDGE_AI_PAPERS } = await import('../lib/scholarly/curated-edge-ai.ts');

  test('contains authentic peer-reviewed landmark papers', () => {
    assert.ok(CURATED_EDGE_AI_PAPERS.length >= 5, 'Should have at least 5 benchmark papers');
    for (const paper of CURATED_EDGE_AI_PAPERS) {
      assert.ok(paper.title, 'Paper must have a title');
      assert.ok(paper.abstract, 'Paper must have an abstract');
      assert.ok(paper.authors.length > 0, 'Paper must have authors');
      assert.ok(paper.year, 'Paper must have publication year');
      assert.ok(paper.canonical_url, 'Paper must have a valid source URL');
    }
  });

  test('includes key quantization & thermal throttling reference studies', () => {
    const titles = CURATED_EDGE_AI_PAPERS.map(p => p.title.toLowerCase());
    const hasAWQ = titles.some(t => t.includes('awq'));
    const hasGPTQ = titles.some(t => t.includes('gptq'));
    const hasMobileLLM = titles.some(t => t.includes('mobilellm'));
    const hasThermal = titles.some(t => t.includes('thermal'));

    assert.ok(hasAWQ, 'Must include AWQ benchmark');
    assert.ok(hasGPTQ, 'Must include GPTQ benchmark');
    assert.ok(hasMobileLLM, 'Must include MobileLLM benchmark');
    assert.ok(hasThermal, 'Must include Thermal Throttling benchmark');
  });
});

// Test 2: Multi-Source Scholarly Discovery & Deduplication
describe('Research Discovery Service', async () => {
  const { ResearchDiscoveryService } = await import('../lib/scholarly/research-discovery.ts');
  const service = new ResearchDiscoveryService();

  test('discovers and deduplicates papers for edge AI query', async () => {
    const result = await service.discover('quantization mobile language model latency', { limit: 6 });
    assert.ok(result.papers.length > 0, 'Should discover papers');
    assert.ok(result.sources_used.length > 0, 'Should record sources used');

    // Verify deduplication: no duplicate DOIs or normalized titles
    const ids = new Set();
    for (const paper of result.papers) {
      assert.ok(!ids.has(paper.id), `Duplicate paper ID found: ${paper.id}`);
      ids.add(paper.id);
    }
  });

  test('correctly classifies query types (DOI vs arXiv vs Natural Query)', async () => {
    const doiRes = await service.discover('10.48550/arXiv.2402.14905');
    assert.equal(doiRes.query_interpreted.type, 'DOI');

    const arxivRes = await service.discover('arXiv:2401.02385');
    assert.equal(arxivRes.query_interpreted.type, 'ARXIV');

    const naturalRes = await service.discover('thermal throttling mobile inference');
    assert.equal(naturalRes.query_interpreted.type, 'NATURAL_QUERY');
  });
});

// Test 3: Grounded Claim Extraction & Zod Schema Validation
describe('Claim & Context Extraction', async () => {
  const { LLMService } = await import('../lib/llm/llm-provider.ts');
  const { CURATED_EDGE_AI_PAPERS } = await import('../lib/scholarly/curated-edge-ai.ts');
  const llm = new LLMService();

  test('extracts grounded claims with verbatim supporting passages', async () => {
    const paper = CURATED_EDGE_AI_PAPERS[0]; // MobileLLM
    const extraction = await llm.extractClaimsAndContext(paper);

    assert.ok(extraction.claims.length > 0, 'Must extract at least one claim');
    for (const claim of extraction.claims) {
      assert.ok(claim.claim_text.length >= 10, 'Claim text must be substantial');
      assert.ok(claim.supporting_passage.length >= 10, 'Supporting passage must be preserved');
      assert.ok(claim.extraction_confidence >= 0 && claim.extraction_confidence <= 1, 'Confidence must be between 0 and 1');
      assert.ok(
        ['FINDING', 'HYPOTHESIS', 'METHODOLOGY', 'LIMITATION', 'BENCHMARK_RESULT', 'THEORETICAL_BOUND'].includes(claim.claim_type),
        `Invalid claim type: ${claim.claim_type}`
      );
    }

    assert.ok(extraction.experimental_context, 'Must extract experimental context');
    assert.ok(extraction.experimental_context.quantization || extraction.experimental_context.hardware, 'Must capture hardware or quantization');
  });
});

// Test 4: Disagreement Investigation (Apparent vs Genuine Contradiction)
describe('Context-Aware Disagreement Investigation', async () => {
  const { LLMService } = await import('../lib/llm/llm-provider.ts');
  const llm = new LLMService();

  test('resolves AWQ burst speedup vs sustained thermal degradation as an apparent contradiction', async () => {
    const claimA = {
      id: 'c1',
      paper_id: 'p1',
      claim_text: 'AWQ achieves 3.2x latency speedup over FP16 on mobile GPUs.',
      claim_type: 'FINDING',
      supporting_passage: 'On mobile GPUs, 4-bit AWQ achieves 3.2x latency speedup over FP16 while maintaining zero-shot perplexity.',
      extraction_confidence: 0.95,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1',
      created_at: new Date().toISOString(),
    };

    const contextA = {
      id: 'ctx1',
      paper_id: 'p1',
      hardware: 'Qualcomm Snapdragon Adreno GPU',
      processor: 'Mobile GPU',
      quantization: '4-bit AWQ',
      variables: { 'Workload Duration': 'Burst < 30s' },
      created_at: new Date().toISOString(),
    };

    const claimB = {
      id: 'c2',
      paper_id: 'p2',
      claim_text: 'Token generation drops by 43% to 61% from initial burst performance due to thermal throttling.',
      claim_type: 'LIMITATION',
      supporting_passage: 'Token generation drops by 43% to 61% from initial burst performance due to DVFS downclocking.',
      extraction_confidence: 0.94,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1',
      created_at: new Date().toISOString(),
    };

    const contextB = {
      id: 'ctx2',
      paper_id: 'p2',
      hardware: 'Snapdragon 8 Gen 2 Smartphone',
      processor: 'Heterogeneous SoC',
      quantization: '4-bit',
      variables: { 'Workload Duration': 'Sustained > 5 mins' },
      created_at: new Date().toISOString(),
    };

    const result = await llm.investigateDisagreement(claimA, contextA, claimB, contextB);

    assert.ok(result.relationship_type === 'QUALIFIES' || result.relationship_type === 'CHALLENGES');
    assert.equal(result.is_genuine_contradiction, false, 'Should be an apparent contradiction due to thermal duration');
    assert.ok(result.differences.length > 0, 'Must identify experimental context differences');
    assert.ok(result.remaining_uncertainty, 'Must identify remaining empirical uncertainty');
  });
});

// Test 5: Research-Gap Discovery & 6-Stage Falsification Audit
describe('Research-Gap Discovery & Falsification Engine', async () => {
  const { LLMService } = await import('../lib/llm/llm-provider.ts');
  const { CURATED_EDGE_AI_PAPERS } = await import('../lib/scholarly/curated-edge-ai.ts');
  const llm = new LLMService();

  test('synthesizes candidate research gaps across paper limitations', async () => {
    const gapsOutput = await llm.discoverResearchGaps(CURATED_EDGE_AI_PAPERS, []);
    assert.ok(gapsOutput.gaps.length > 0, 'Should synthesize candidate gaps');

    const firstGap = gapsOutput.gaps[0];
    assert.ok(firstGap.title, 'Gap must have a title');
    assert.ok(firstGap.research_question, 'Gap must have a testable research question');
    assert.ok(firstGap.supporting_paper_ids.length > 0, 'Gap must cite supporting papers');
  });

  test('falsification audit challenges candidate gap and produces auditable verdict', async () => {
    const candidateGap = {
      id: 'gap_test_1',
      title: 'Sustained Thermal Degradation in 4-bit Quantized SLMs on Mobile SoCs',
      research_question: 'How do quantization methods resist thermal throttling during extended on-device generation?',
      description: 'Prior benchmarks test burst performance; thermal stability remains underexplored.',
      gap_type: 'UNEXPLORED_EXPERIMENTAL_COMBINATION',
      supporting_papers: [{ paper_id: 'p1', title: 'AWQ' }],
      counter_evidence: [],
      coverage_summary: 'Scholarly index',
      confidence: 0.85,
      status: 'CANDIDATE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Provide counter-evidence paper (Chen et al. thermal throttling paper)
    const counterPapers = [CURATED_EDGE_AI_PAPERS[5]];
    const auditReport = await llm.falsifyResearchGap(candidateGap, counterPapers);

    assert.ok(
      ['RETAINED_CANDIDATE', 'NARROWED_CANDIDATE', 'EXISTING_WORK_FOUND', 'INSUFFICIENT_COVERAGE', 'REQUIRES_HUMAN_REVIEW'].includes(auditReport.outcome),
      `Invalid falsification outcome: ${auditReport.outcome}`
    );
    assert.ok(auditReport.search_queries_used.length > 0, 'Must record search queries used in audit');
    assert.ok(auditReport.reasoning_summary.length > 20, 'Must provide detailed reasoning');
  });
});

// Test 6: Practical Experiment Planning & Resource Feasibility
describe('Experiment Feasibility Planning Engine', async () => {
  const { LLMService } = await import('../lib/llm/llm-provider.ts');
  const llm = new LLMService();

  test('generates concrete protocol with testable hypothesis and feasibility evaluation', async () => {
    const gap = {
      id: 'gap_1',
      title: 'AWQ vs GPTQ Thermal Throttling Inflection Points',
      research_question: 'What is the comparative thermal throttling inflection point of AWQ vs GPTQ?',
      description: 'Comparative resistance under continuous 10-minute generation.',
      gap_type: 'UNEXPLORED_EXPERIMENTAL_COMBINATION',
      supporting_papers: [],
      counter_evidence: [],
      coverage_summary: '',
      confidence: 0.85,
      status: 'RETAINED_CANDIDATE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const plan = await llm.planExperiment(gap);

    assert.ok(plan.objective, 'Must have objective');
    assert.ok(plan.testable_hypothesis.includes('H1'), 'Must state formal H1 hypothesis');
    assert.ok(plan.variables.independent.length > 0, 'Must identify independent variables');
    assert.ok(plan.variables.dependent.length > 0, 'Must identify dependent variables');
    assert.ok(plan.variables.controlled.length > 0, 'Must identify controlled variables');
    assert.ok(plan.hardware_requirements.target_hardware, 'Must specify target hardware');
    assert.ok(plan.estimated_resources.compute_hours > 0, 'Must calculate estimated compute hours');
    assert.ok(plan.estimated_resources.estimation_confidence, 'Must specify estimation confidence');
    assert.ok(plan.checklist.length > 0, 'Must include pre-flight checklist');
  });
});

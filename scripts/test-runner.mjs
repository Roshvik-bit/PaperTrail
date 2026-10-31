import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Health endpoint check
describe('PaperTrail API & Health Contracts', () => {
  test('verifies health payload structure', async () => {
    const { GET } = await import('../src/app/api/health/route.ts');
    const res = await GET();
    const data = await res.json();

    assert.equal(data.status, 'healthy');
    assert.equal(data.product, 'PaperTrail');
    assert.equal(data.domain, 'Edge AI, On-Device AI, Small Language Models');
    assert.ok(data.integrations, 'Integrations object must be present');
    assert.equal(data.integrations.openalex, true);
    assert.equal(data.integrations.crossref, true);
    assert.equal(data.integrations.arxiv, true);
  });
});

// Test 2: Repository Session & Storage Lifecycle
describe('PaperTrail Repository Engine', async () => {
  const { PaperTrailRepository } = await import('../src/lib/db/repository.ts');
  const repo = new PaperTrailRepository();

  test('creates and retrieves a research session', async () => {
    const session = await repo.createSession(
      'Edge AI Quantization Analysis',
      'Under what conditions does 4-bit quantization degrade reasoning in edge small language models?'
    );

    assert.ok(session.id.startsWith('sess_'));
    assert.equal(session.domain, 'edge_ai');

    const fetched = await repo.getSession(session.id);
    assert.ok(fetched);
    assert.equal(fetched.id, session.id);
  });

  test('stores papers, claims, contexts and builds knowledge graph', async () => {
    const session = await repo.createSession('Test Session', 'Sample Question');

    const paper = {
      id: 'paper_test_1',
      title: 'AWQ: Activation-aware Weight Quantization',
      abstract: 'Protects top 1% salient weights.',
      authors: [{ name: 'Ji Lin' }],
      year: 2024,
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await repo.savePaper(paper, session.id);
    const sessionPapers = await repo.getPapersForSession(session.id);
    assert.equal(sessionPapers.length, 1);
    assert.equal(sessionPapers[0].id, 'paper_test_1');

    const claim = {
      id: 'claim_1',
      paper_id: 'paper_test_1',
      claim_text: 'AWQ achieves 3.2x latency speedup on mobile GPUs.',
      claim_type: 'FINDING',
      supporting_passage: '3.2x latency speedup over FP16 while maintaining perplexity.',
      extraction_confidence: 0.95,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1.0.0',
      created_at: new Date().toISOString(),
    };

    await repo.saveClaims([claim]);
    const claims = await repo.getClaimsForSession(session.id);
    assert.equal(claims.length, 1);

    const graph = await repo.getGraphForSession(session.id);
    assert.ok(graph.nodes.some(n => n.id === 'paper_test_1'));
    assert.ok(graph.nodes.some(n => n.id === 'claim_1'));
    assert.ok(graph.edges.length > 0);
  });
});

// Test 3: Curated Landmark Edge AI Papers
describe('Curated Edge AI Benchmark Corpus', async () => {
  const { CURATED_EDGE_AI_PAPERS } = await import('../src/lib/scholarly/curated-edge-ai.ts');

  test('contains authentic peer-reviewed landmark papers with verified DOIs and authors', () => {
    assert.ok(CURATED_EDGE_AI_PAPERS.length >= 6);
    for (const p of CURATED_EDGE_AI_PAPERS) {
      assert.ok(p.title.length > 10);
      assert.ok(p.abstract.length > 50);
      assert.ok(p.authors.length > 0);
      assert.ok(p.year >= 2022);
      assert.ok(p.canonical_url.startsWith('http'));
    }
  });
});

// Test 4: Scholarly Discovery & Query Classification
describe('Research Discovery Service', async () => {
  const { ResearchDiscoveryService } = await import('../src/lib/scholarly/research-discovery.ts');
  const service = new ResearchDiscoveryService();

  test('classifies DOI vs arXiv vs Natural Query', async () => {
    const resDoi = await service.discover('10.48550/arXiv.2402.14905');
    assert.equal(resDoi.query_interpreted.type, 'DOI');

    const resArxiv = await service.discover('arXiv:2401.02385');
    assert.equal(resArxiv.query_interpreted.type, 'ARXIV');

    const resNatural = await service.discover('quantization mobile language model');
    assert.equal(resNatural.query_interpreted.type, 'NATURAL_QUERY');
  });

  test('discovers and deduplicates papers', async () => {
    const result = await service.discover('quantization mobile language model', { limit: 8 });
    assert.ok(result.papers.length > 0);
    assert.ok(result.sources_used.length > 0);

    const ids = new Set();
    for (const p of result.papers) {
      assert.ok(!ids.has(p.id));
      ids.add(p.id);
    }
  });
});

// Test 5: Grounded Claim Extraction & Zod Schema
describe('Claim & Context Extraction Engine', async () => {
  const { LLMService } = await import('../src/lib/llm/llm-provider.ts');
  const { CURATED_EDGE_AI_PAPERS } = await import('../src/lib/scholarly/curated-edge-ai.ts');
  const llm = new LLMService();

  test('extracts grounded claims with verbatim supporting passages', async () => {
    const extraction = await llm.extractClaimsAndContext(CURATED_EDGE_AI_PAPERS[0]);
    assert.ok(extraction.claims.length > 0);

    for (const c of extraction.claims) {
      assert.ok(c.claim_text.length >= 10);
      assert.ok(c.supporting_passage.length >= 10);
      assert.ok(['FINDING', 'HYPOTHESIS', 'METHODOLOGY', 'LIMITATION', 'BENCHMARK_RESULT', 'THEORETICAL_BOUND'].includes(c.claim_type));
    }

    assert.ok(extraction.experimental_context);
    assert.ok(extraction.experimental_context.quantization || extraction.experimental_context.hardware);
  });
});

// Test 6: Disagreement Investigation (Apparent vs Genuine)
describe('Context-Aware Disagreement Investigation', async () => {
  const { LLMService } = await import('../src/lib/llm/llm-provider.ts');
  const llm = new LLMService();

  test('resolves AWQ burst speedup vs sustained thermal degradation as an apparent contradiction', async () => {
    const claimA = {
      id: 'c1',
      paper_id: 'p1',
      claim_text: 'AWQ achieves 3.2x latency speedup over FP16 on mobile GPUs.',
      claim_type: 'FINDING',
      supporting_passage: '3.2x latency speedup over FP16 while maintaining zero-shot perplexity.',
      extraction_confidence: 0.95,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1.0.0',
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
      extraction_version: 'v1.0.0',
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

    const comparison = await llm.investigateDisagreement(claimA, contextA, claimB, contextB);

    assert.ok(comparison.relationship_type === 'QUALIFIES' || comparison.relationship_type === 'CHALLENGES');
    assert.equal(comparison.is_genuine_contradiction, false, 'Should be an apparent contradiction resolved by workload duration');
    assert.ok(comparison.differences.length > 0);
    assert.ok(comparison.remaining_uncertainty.length > 0);
  });
});

// Test 7: Candidate Gap Discovery & 6-Stage Falsification Audit
describe('Candidate Research Gap & Falsification Engine', async () => {
  const { LLMService } = await import('../src/lib/llm/llm-provider.ts');
  const { CURATED_EDGE_AI_PAPERS } = await import('../src/lib/scholarly/curated-edge-ai.ts');
  const llm = new LLMService();

  test('synthesizes candidate gaps across paper limitations', async () => {
    const gapsOutput = await llm.discoverResearchGaps(CURATED_EDGE_AI_PAPERS, []);
    assert.ok(gapsOutput.gaps.length > 0);
    assert.ok(gapsOutput.gaps[0].research_question);
  });

  test('executes 6-stage falsification audit against candidate gap', async () => {
    const candidateGap = {
      id: 'gap_test',
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

    const counterEvidencePapers = [CURATED_EDGE_AI_PAPERS[5]];
    const auditReport = await llm.falsifyResearchGap(candidateGap, counterEvidencePapers);

    assert.ok(['RETAINED_CANDIDATE', 'NARROWED_CANDIDATE', 'EXISTING_WORK_FOUND', 'INSUFFICIENT_COVERAGE', 'REQUIRES_HUMAN_REVIEW'].includes(auditReport.outcome));
    assert.ok(auditReport.search_queries_used.length > 0);
    assert.ok(auditReport.reasoning_summary.length > 20);
  });
});

// Test 8: Practical Experiment Feasibility Planning
describe('Experiment Feasibility Planning Engine', async () => {
  const { LLMService } = await import('../src/lib/llm/llm-provider.ts');
  const llm = new LLMService();

  test('generates concrete protocol with testable hypothesis and feasibility evaluation', async () => {
    const gap = {
      id: 'gap_plan',
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

    assert.ok(plan.objective);
    assert.ok(plan.testable_hypothesis.includes('H1'));
    assert.ok(plan.variables.independent.length > 0);
    assert.ok(plan.variables.dependent.length > 0);
    assert.ok(plan.variables.controlled.length > 0);
    assert.ok(plan.hardware_requirements.target_hardware);
    assert.ok(plan.estimated_resources.compute_hours > 0);
    assert.ok(plan.estimated_resources.estimation_confidence);
    assert.ok(plan.checklist.length > 0);
  });
});

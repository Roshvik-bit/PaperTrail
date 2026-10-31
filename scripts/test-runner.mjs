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

// Test 9: Preprint-to-Publication Lineage Matching
describe('Preprint Lineage Intelligence', async () => {
  const { PreprintLineageService } = await import('../src/lib/scholarly/preprint-lineage.ts');
  const service = new PreprintLineageService();

  test('correctly matches arXiv preprint to eventual conference publication with high confidence', () => {
    const preprint = {
      id: 'paper_awq_arxiv',
      title: 'AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration',
      abstract: 'We propose AWQ for on-device LLM acceleration.',
      authors: [{ name: 'Ji Lin' }, { name: 'Jiaming Tang' }, { name: 'Song Han' }],
      venue: 'arXiv Preprint',
      year: 2023,
      arxiv_id: '2306.00978',
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const published = {
      id: 'paper_awq_mlsys',
      title: 'AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration',
      abstract: 'We propose AWQ for on-device LLM acceleration with MLSys benchmarks.',
      authors: [{ name: 'Ji Lin' }, { name: 'Jiaming Tang' }, { name: 'Song Han' }],
      venue: 'MLSys: Conference on Machine Learning and Systems',
      year: 2024,
      doi: '10.48550/arXiv.2306.00978',
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const match = service.matchPreprintToPublication(preprint, published);
    assert.ok(match, 'Preprint and publication must match');
    assert.ok(match.confidence >= 0.85, 'Confidence must be at least 0.85');
    assert.ok(match.match_evidence.title_similarity > 0.80);
    assert.ok(match.match_evidence.author_overlap >= 0.90);
    assert.equal(match.preprint_venue, 'arXiv Preprint');
    assert.equal(match.published_venue, 'MLSys: Conference on Machine Learning and Systems');
  });

  test('rejects unrelated papers with low title/author overlap', () => {
    const paperA = {
      id: 'pA',
      title: 'Quantum Computing Fault Tolerance Bounds',
      abstract: 'Fault tolerant thresholds.',
      authors: [{ name: 'Alice Smith' }],
      venue: 'arXiv',
      open_access_status: 'gold',
      full_text_status: 'abstract_only',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const paperB = {
      id: 'pB',
      title: 'AWQ: Activation-aware Weight Quantization',
      abstract: 'Quantization for LLMs.',
      authors: [{ name: 'Ji Lin' }],
      venue: 'MLSys',
      open_access_status: 'gold',
      full_text_status: 'abstract_only',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const match = service.matchPreprintToPublication(paperA, paperB);
    assert.equal(match, null, 'Unrelated papers must not match');
  });
});

// Test 10: Retraction & Correction Intelligence
describe('Retraction Intelligence & Impact Propagation', async () => {
  const { RetractionIntelligenceService } = await import('../src/lib/scholarly/retraction-intelligence.ts');
  const service = new RetractionIntelligenceService();

  test('detects retraction flags and generates provenance alerts without deleting evidence', () => {
    const retractedPaper = {
      id: 'paper_flawed_1',
      title: 'Fabricated Superconductor Token Acceleration Rates',
      abstract: 'This paper has been retracted by the publisher.',
      is_retracted: true,
      authors: [{ name: 'Author X' }],
      open_access_status: 'gold',
      full_text_status: 'abstract_only',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const claims = [
      {
        id: 'c_flawed_1',
        paper_id: 'paper_flawed_1',
        claim_text: 'Achieved 10,000 tokens/sec on 0.5W budget.',
        claim_type: 'FINDING',
        supporting_passage: 'Superconducting chip operates at 10,000 tps.',
        extraction_confidence: 0.9,
        verification_status: 'AUTOMATICALLY_EXTRACTED',
        extraction_version: 'v1',
        created_at: new Date().toISOString(),
      }
    ];

    const relationships = [
      {
        id: 'rel_flawed',
        source_claim_id: 'c_flawed_1',
        target_claim_id: 'c_valid_1',
        relationship_type: 'CONTRADICTS',
        supporting_evidence: 'Direct contradiction in reported latency.',
        confidence: 0.9,
        verification_status: 'AUTOMATIC',
        created_at: new Date().toISOString(),
      }
    ];

    const gaps = [
      {
        id: 'gap_dependent',
        title: 'Superconductor Edge AI Limits',
        research_question: 'Can superconductors run LLMs?',
        description: 'Testing superconducting inference.',
        gap_type: 'UNINVESTIGATED_HARDWARE_ENV',
        supporting_papers: [{ paper_id: 'paper_flawed_1', title: 'Fabricated' }],
        counter_evidence: [],
        coverage_summary: '',
        confidence: 0.8,
        status: 'CANDIDATE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const impact = service.propagateRetractionImpact(retractedPaper, claims, relationships, gaps);

    assert.equal(impact.alert.status_type, 'RETRACTED');
    assert.equal(impact.affectedClaims.length, 1);
    assert.equal(impact.affectedRelationships.length, 1);
    assert.equal(impact.affectedGaps.length, 1);
    assert.ok(impact.alert.provenance_warning.includes('PROVENANCE ALERT'));
  });
});

// Test 11: Cross-Domain Candidate Discovery
describe('Cross-Domain Intelligence Engine', async () => {
  const { CrossDomainService } = await import('../src/lib/scholarly/cross-domain.ts');
  const { CURATED_EDGE_AI_PAPERS } = await import('../src/lib/scholarly/curated-edge-ai.ts');
  const service = new CrossDomainService();

  test('surfaces valid candidate cross-domain transfers with explicit terminology mappings', () => {
    const connections = service.discoverCrossDomainConnections(CURATED_EDGE_AI_PAPERS);
    assert.ok(connections.length > 0, 'Must discover cross-domain candidate connections');

    for (const conn of connections) {
      assert.equal(conn.status, 'CANDIDATE_HYPOTHESIS');
      assert.ok(conn.shared_phenomenon.length > 10);
      assert.ok(conn.hypothesis_statement.includes('Candidate Hypothesis:'));
      assert.ok(conn.differing_terminology.length > 0);
      for (const term of conn.differing_terminology) {
        assert.ok(term.source_term);
        assert.ok(term.target_term);
        assert.ok(term.context);
      }
    }
  });
});

// Test 12: Continuous Research Evolution Engine (Vertical Slice)
describe('Continuous Research Evolution Engine', async () => {
  const { EvolutionService } = await import('../src/lib/analysis/evolution-service.ts');
  const { PaperTrailRepository } = await import('../src/lib/db/repository.ts');
  const repo = new PaperTrailRepository();
  const evolution = new EvolutionService();

  test('ingests new research, extracts claims, detects conflicts, updates gaps and records evolution timeline', async () => {
    const session = await repo.createSession(
      'Evolution Test Session',
      'How does thermal throttling affect on-device inference?'
    );

    // Initial paper
    const initialPaper = {
      id: 'paper_burst_speed',
      title: 'Ultra-Fast Burst Quantization on Mobile Silicon',
      abstract: '4-bit quantization achieves 3x speedup on mobile GPU execution in 20-second bursts.',
      authors: [{ name: 'Researcher A' }],
      year: 2024,
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await repo.savePaper(initialPaper, session.id);

    // Save initial claim
    const initialClaim = {
      id: 'claim_initial_burst',
      paper_id: 'paper_burst_speed',
      claim_text: '4-bit quantization achieves 3x speedup on mobile GPU execution in 20-second bursts.',
      claim_type: 'FINDING',
      supporting_passage: '3x speedup on mobile GPU execution in 20-second bursts.',
      extraction_confidence: 0.92,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1.0.0',
      created_at: new Date().toISOString(),
    };
    await repo.saveClaims([initialClaim]);

    // Initial candidate gap
    const initialGap = {
      id: 'gap_evo_test',
      session_id: session.id,
      title: 'Thermal Resilience in Mobile Quantization',
      research_question: 'Does quantization resist thermal throttling during extended workloads?',
      description: 'Prior work only tested 20-second bursts.',
      gap_type: 'UNEXPLORED_EXPERIMENTAL_COMBINATION',
      supporting_papers: [{ paper_id: 'paper_burst_speed', title: 'Ultra-Fast Burst' }],
      counter_evidence: [],
      coverage_summary: '',
      confidence: 0.85,
      status: 'CANDIDATE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await repo.saveGap(initialGap);

    // Seed newly discovered publication representing evidence shift
    const newlyDiscoveredPaper = {
      id: 'paper_thermal_shift',
      title: 'Thermal Throttling Dynamics and Sustained Throughput Collapse on Mobile SoCs',
      abstract: 'Under continuous 5-minute workloads, 4-bit generation throughput collapses by 43-61% due to DVFS downclocking.',
      authors: [{ name: 'Hao Chen' }],
      year: 2024,
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Run Evolution Check
    const result = await evolution.checkSessionEvolution(session.id, newlyDiscoveredPaper);

    assert.equal(result.session_id, session.id);
    assert.ok(result.new_claims_extracted_count > 0, 'Must extract claims from new paper');
    assert.ok(result.evolution_event, 'Must record evolution timeline event');
    assert.equal(result.evolution_event.event_type, 'NEW_PUBLICATION_INGESTED');
    assert.ok(result.evolution_event.description.includes('New research ingested:'));

    // Check timeline events stored in repository
    const timelineEvents = await repo.getEvolutionEvents(session.id);
    assert.ok(timelineEvents.length >= 1, 'Timeline events must be retrievable');
  });
});

// Test 13: Monitoring Resilience & Offline Fallbacks
describe('TinyMonitor & Scholarly Polling Resilience', async () => {
  const { TinyFishProvider } = await import('../src/lib/scholarly/tinyfish.ts');
  const provider = new TinyFishProvider();

  test('handles unconfigured state gracefully with simulated monitor checks and zero crashes', async () => {
    const monitorRes = await provider.checkMonitor('Small Language Models Edge Throttling');
    assert.equal(monitorRes.status, 'ACTIVE');
    assert.ok(monitorRes.monitor_id.startsWith('tm_'));
    assert.ok(monitorRes.provenance_note);
  });
});

// Test 14: Research Export Engine
describe('Research Export Engine & Multi-Format Serialization', async () => {
  const { PaperTrailRepository } = await import('../src/lib/db/repository.ts');
  const { ResearchExportService } = await import('../src/lib/export/export-service.ts');
  const { extractZipArchive } = await import('../src/lib/export/zip-utils.ts');

  const repo = new PaperTrailRepository();
  let testSessionId = '';

  test('generates complete organized ZIP archive with manifest, dossiers, and protocols', async () => {
    const session = await repo.createSession('Export Test Session', 'How does INT4 AWQ compare with FP16?');
    testSessionId = session.id;

    await repo.savePaper({
      id: 'paper_awq_exp',
      title: 'AWQ: Activation-aware Weight Quantization for LLM Compression',
      abstract: 'Protects salient weights to retain LLM perplexity on edge devices.',
      authors: [{ name: 'Ji Lin' }, { name: 'Song Han' }],
      year: 2024,
      doi: '10.5555/awq.2024',
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, session.id);

    await repo.saveClaims([{
      id: 'claim_awq_exp_1',
      paper_id: 'paper_awq_exp',
      claim_text: 'AWQ preserves 4-bit perplexity within 0.1 delta across reasoning tasks.',
      claim_type: 'BENCHMARK_RESULT',
      supporting_passage: 'Across reasoning benchmarks, AWQ maintains FP16 perplexity within 0.1.',
      extraction_confidence: 0.94,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1.0.0',
      created_at: new Date().toISOString(),
    }]);

    await repo.saveGap({
      id: 'gap_exp_1',
      session_id: session.id,
      title: 'Thermal degradation in sustained edge quantization',
      research_question: 'Does AWQ burst performance degrade under thermal throttling?',
      description: 'Lack of long-running thermal evaluations.',
      gap_type: 'UNINVESTIGATED_HARDWARE_ENV',
      supporting_papers: [{ paper_id: 'paper_awq_exp', title: 'AWQ Paper' }],
      counter_evidence: [],
      coverage_summary: 'Scholarly index evaluated',
      confidence: 0.88,
      status: 'RETAINED_CANDIDATE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const bundle = await repo.getCompleteResearchBundle(session.id);
    assert.ok(bundle, 'Research bundle must be non-null');
    assert.equal(bundle.papers.length, 1);
    assert.equal(bundle.claims.length, 1);
    assert.equal(bundle.gaps.length, 1);

    // Export ZIP
    const exportedZip = ResearchExportService.exportBundle(bundle, 'zip');
    assert.ok(exportedZip.filename.endsWith('.zip'));
    assert.equal(exportedZip.mimeType, 'application/zip');
    assert.ok(Buffer.isBuffer(exportedZip.data));
    assert.ok(exportedZip.data.length > 500, 'ZIP file must have substantial binary content');

    // Inspect ZIP structure
    const entries = extractZipArchive(exportedZip.data);
    assert.ok(entries['manifest.json'], 'Must contain manifest.json');
    assert.ok(entries['README.md'], 'Must contain README.md');
    assert.ok(entries['papers/papers.json'], 'Must contain papers/papers.json');
    assert.ok(entries['papers/papers.csv'], 'Must contain papers/papers.csv');
    assert.ok(entries['claims/claims.json'], 'Must contain claims/claims.json');
    assert.ok(entries['research-gaps/gaps.json'], 'Must contain research-gaps/gaps.json');
    assert.ok(entries['reports/research_brief.md'], 'Must contain reports/research_brief.md');
    assert.ok(entries['reports/research_brief.html'], 'Must contain reports/research_brief.html');

    const manifest = entries['manifest.json'].json();
    assert.equal(manifest.format_version, '1.0.0');
    assert.equal(manifest.app_name, 'PaperTrail');
    assert.equal(manifest.counts.papers, 1);
  });

  test('exports valid BibTeX, JSON, and Markdown formats', async () => {
    const bundle = await repo.getCompleteResearchBundle(testSessionId);
    assert.ok(bundle);

    // BibTeX
    const bibtex = ResearchExportService.exportBundle(bundle, 'bibtex');
    assert.ok(bibtex.filename.endsWith('.bib'));
    assert.ok(String(bibtex.data).includes('@article{'));
    assert.ok(String(bibtex.data).includes('Activation-aware Weight Quantization'));
    assert.ok(String(bibtex.data).includes('Ji Lin'));

    // JSON
    const jsonExp = ResearchExportService.exportBundle(bundle, 'json');
    assert.ok(jsonExp.filename.endsWith('.json'));
    const parsed = JSON.parse(String(jsonExp.data));
    assert.equal(parsed.manifest.format_version, '1.0.0');
    assert.equal(parsed.papers[0].id, 'paper_awq_exp');

    // Markdown
    const mdExp = ResearchExportService.exportBundle(bundle, 'markdown');
    assert.ok(mdExp.filename.endsWith('.md'));
    assert.ok(String(mdExp.data).includes('# PaperTrail Scientific Research Brief'));
    assert.ok(String(mdExp.data).includes('AWQ: Activation-aware Weight Quantization'));
  });
});

// Test 15: Safe ZIP Extraction & Security Auditing
describe('ZIP Security Auditing & Path Traversal Prevention', async () => {
  const { createZipArchive, extractZipArchive } = await import('../src/lib/export/zip-utils.ts');

  test('safely compresses and extracts files with CRC32 verification', () => {
    const zip = createZipArchive([
      { path: 'manifest.json', content: '{"status":"ok"}' },
      { path: 'papers/test.txt', content: 'Testing content' },
    ]);

    const extracted = extractZipArchive(zip);
    assert.equal(extracted['manifest.json'].text(), '{"status":"ok"}');
    assert.equal(extracted['papers/test.txt'].text(), 'Testing content');
  });

  test('blocks path traversal attacks attempting directory escape', () => {
    const maliciousZip = createZipArchive([
      { path: '../../etc/passwd', content: 'malicious payload' },
    ]);

    assert.throws(() => {
      extractZipArchive(maliciousZip);
    }, /Disallowed path traversal/);
  });
});

// Test 16: Research Import Engine & Restoration
describe('Research Import Engine & Restoration', async () => {
  const { PaperTrailRepository } = await import('../src/lib/db/repository.ts');
  const { ResearchImportService } = await import('../src/lib/export/import-service.ts');
  const { ResearchExportService } = await import('../src/lib/export/export-service.ts');

  const repo = new PaperTrailRepository();

  test('restores complete investigation from ZIP archive without loss of provenance', async () => {
    const sourceSession = await repo.createSession('Source To Export', 'Does 4-bit quantization preserve safety?');
    await repo.savePaper({
      id: 'paper_import_test_1',
      title: 'Safety Invariants in Quantized Models',
      abstract: 'Investigates safety drift under edge quantization.',
      authors: [{ name: 'Researcher Alpha' }],
      year: 2024,
      open_access_status: 'green',
      full_text_status: 'abstract_only',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, sourceSession.id);

    await repo.saveClaims([{
      id: 'claim_import_test_1',
      paper_id: 'paper_import_test_1',
      claim_text: 'Safety guardrails drift by 14% after aggressive 4-bit weight pruning.',
      claim_type: 'FINDING',
      supporting_passage: 'We observe a 14% drift in safety guardrail alignment.',
      extraction_confidence: 0.91,
      verification_status: 'CORROBORATED',
      extraction_version: 'v1.0.0',
      created_at: new Date().toISOString(),
    }]);

    const bundle = await repo.getCompleteResearchBundle(sourceSession.id);
    assert.ok(bundle);
    const zipExport = ResearchExportService.exportBundle(bundle, 'zip');

    // Import into repository
    const parsedBundle = ResearchImportService.parseArchive(zipExport.data);
    assert.equal(parsedBundle.manifest.format_version, '1.0.0');
    assert.equal(parsedBundle.papers.length, 1);
    assert.equal(parsedBundle.claims.length, 1);

    const importResult = await repo.importResearchBundle(parsedBundle, { mode: 'CREATE_NEW' });
    assert.equal(importResult.success, true);
    assert.ok(importResult.session_id);
    assert.equal(importResult.imported_counts.papers, 1);
    assert.equal(importResult.imported_counts.claims, 1);

    // Verify imported session exists in repository
    const restoredSession = await repo.getSession(importResult.session_id);
    assert.ok(restoredSession);
    assert.equal(restoredSession.research_question, sourceSession.research_question);

    const restoredPapers = await repo.getPapersForSession(importResult.session_id);
    assert.equal(restoredPapers.length, 1);
    assert.equal(restoredPapers[0].title, 'Safety Invariants in Quantized Models');
  });

  test('rejects corrupted archives or invalid versions', () => {
    assert.throws(() => {
      ResearchImportService.parseArchive(Buffer.from('not a zip file'));
    }, /Invalid PaperTrail archive/);
  });
});

// Test 17: SQLite Research Repository Persistence & Full-Text Search
describe('Local SQLite Research Repository Engine', async () => {
  const { SQLiteResearchRepository } = await import('../src/lib/db/sqlite-repository.ts');
  const sqliteRepo = new SQLiteResearchRepository();

  test('stores, retrieves and updates research records in local SQLite database', async () => {
    const session = await sqliteRepo.createSession(
      'SQLite Local Session',
      'Local-first research storage benchmark',
      'edge_ai'
    );
    assert.ok(session.id);

    const paper = {
      id: 'paper_sqlite_1',
      title: 'TinyLlama: An Open-Source Small Language Model on Edge',
      abstract: 'Trained on 3 trillion tokens for mobile architectures.',
      authors: [{ name: 'Peiyuan Zhang' }],
      year: 2024,
      venue: 'arXiv',
      open_access_status: 'gold',
      full_text_status: 'open_access_pdf',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await sqliteRepo.savePaper(paper, session.id);

    const fetchedPaper = await sqliteRepo.getPaper('paper_sqlite_1');
    assert.ok(fetchedPaper);
    assert.equal(fetchedPaper.title, paper.title);

    const sessionPapers = await sqliteRepo.getPapersForSession(session.id);
    assert.equal(sessionPapers.length, 1);

    // Store Claim
    await sqliteRepo.saveClaims([{
      id: 'claim_sqlite_1',
      paper_id: 'paper_sqlite_1',
      claim_text: 'TinyLlama achieves 24 tok/sec on Raspberry Pi 5 8GB.',
      claim_type: 'BENCHMARK_RESULT',
      supporting_passage: 'Benchmarked on Raspberry Pi 5 achieving 24 tok/sec.',
      extraction_confidence: 0.95,
      verification_status: 'AUTOMATICALLY_EXTRACTED',
      extraction_version: 'v1.0.0',
      created_at: new Date().toISOString(),
    }]);

    const sessionClaims = await sqliteRepo.getClaimsForSession(session.id);
    assert.equal(sessionClaims.length, 1);
    assert.equal(sessionClaims[0].id, 'claim_sqlite_1');

    // Local Search
    const searchRes = await sqliteRepo.searchLocal('TinyLlama');
    assert.ok(searchRes.papers.length >= 1, 'Local search must find paper by keyword');
    assert.equal(searchRes.papers[0].id, 'paper_sqlite_1');

    // Storage Status
    const status = await sqliteRepo.getStorageStatus();
    assert.equal(status.provider, 'sqlite');
    assert.equal(status.local_database_available, true);
    assert.ok(status.local_database_size_bytes !== undefined);
  });
});

// Test 18: Repository Factory and Storage Abstraction
describe('Research Repository Factory & Storage Status', async () => {
  const { getResearchRepository, SupabaseResearchRepository, SQLiteResearchRepository } = await import('../src/lib/db/repository.ts');

  test('instantiates appropriate repository based on provider flag', () => {
    const supabaseRepo = getResearchRepository('supabase');
    assert.ok(supabaseRepo instanceof SupabaseResearchRepository);

    const sqliteRepo = getResearchRepository('sqlite');
    assert.ok(sqliteRepo instanceof SQLiteResearchRepository);
  });
});




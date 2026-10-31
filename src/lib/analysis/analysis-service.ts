import { PaperTrailRepository } from '../db/repository';
import { LLMService } from '../llm/llm-provider';
import { ResearchDiscoveryService } from '../scholarly/research-discovery';
import {
  Claim,
  ExperimentalContext,
  EvidenceRelationship,
  ResearchGap,
  GapInvestigationReport,
  ProposedExperiment,
  DisagreementInvestigation,
  Paper,
} from '@/types';

export class ResearchAnalysisService {
  private repo: PaperTrailRepository;
  private llm: LLMService;
  private discovery: ResearchDiscoveryService;

  constructor() {
    this.repo = new PaperTrailRepository();
    this.llm = new LLMService();
    this.discovery = new ResearchDiscoveryService();
  }

  /**
   * Complete multi-stage analysis pipeline for a research session
   */
  async analyzeSession(sessionId: string): Promise<{
    claims_extracted_count: number;
    relationships_found_count: number;
    gaps_discovered_count: number;
  }> {
    const papers = await this.repo.getPapersForSession(sessionId);
    if (papers.length === 0) {
      throw new Error('No papers found in session. Please run discovery first.');
    }

    const allClaims: Claim[] = [];
    const contexts: ExperimentalContext[] = [];

    // Stage 1: Scientific Claim & Context Extraction (Optimized batching)
    // Process papers concurrently in small batches to prevent sequential HTTP blocking
    const papersToExtract = papers.slice(0, 8); // Priority top 8 papers for deep extraction
    const extractionPromises = papersToExtract.map(async (paper) => {
      let existingClaims = await this.repo.getClaimsForPaper(paper.id);
      if (existingClaims.length === 0) {
        const extraction = await this.llm.extractClaimsAndContext(paper);

        const newClaims: Claim[] = extraction.claims.map((c, idx) => ({
          id: `claim_${paper.id}_${idx + 1}`,
          paper_id: paper.id,
          paper_title: paper.title,
          paper_year: paper.year,
          claim_text: c.claim_text,
          claim_type: c.claim_type,
          section: c.section,
          supporting_passage: c.supporting_passage,
          page_number: c.page_number,
          extraction_confidence: c.extraction_confidence,
          verification_status: 'AUTOMATICALLY_EXTRACTED',
          extraction_version: 'v1.0.0',
          created_at: new Date().toISOString(),
        }));

        await this.repo.saveClaims(newClaims);

        // Save experimental context
        const context: ExperimentalContext = {
          id: `ctx_${paper.id}`,
          paper_id: paper.id,
          model: extraction.experimental_context.model,
          model_size: extraction.experimental_context.model_size,
          hardware: extraction.experimental_context.hardware,
          processor: extraction.experimental_context.processor,
          dataset: extraction.experimental_context.dataset,
          methodology: extraction.experimental_context.methodology,
          quantization: extraction.experimental_context.quantization,
          precision: extraction.experimental_context.precision,
          environment: extraction.experimental_context.environment,
          sample_size: extraction.experimental_context.sample_size,
          metrics: extraction.experimental_context.metrics,
          variables: extraction.experimental_context.variables,
          raw_context: extraction.experimental_context.raw_context,
          created_at: new Date().toISOString(),
        };

        await this.repo.saveContext(context);
        return { claims: newClaims, context };
      }
      return { claims: existingClaims, context: null };
    });

    const extractionResults = await Promise.allSettled(extractionPromises);
    for (const res of extractionResults) {
      if (res.status === 'fulfilled' && res.value) {
        allClaims.push(...res.value.claims);
        if (res.value.context) contexts.push(res.value.context);
      }
    }

    // Also pick up any claims from other papers already in repository
    if (papers.length > 8) {
      for (const remainingPaper of papers.slice(8)) {
        const existing = await this.repo.getClaimsForPaper(remainingPaper.id);
        allClaims.push(...existing);
      }
    }

    // Stage 2: Context-Aware Disagreement Investigation & Relationship Mapping
    // Collect candidate cross-paper pairs, prioritizing FINDING and LIMITATION claims
    const candidatePairs: { claimA: Claim; claimB: Claim }[] = [];
    for (let i = 0; i < allClaims.length; i++) {
      for (let j = i + 1; j < allClaims.length; j++) {
        const claimA = allClaims[i];
        const claimB = allClaims[j];

        if (claimA.paper_id === claimB.paper_id) continue;

        if (
          (claimA.claim_type === 'FINDING' || claimA.claim_type === 'LIMITATION') &&
          (claimB.claim_type === 'FINDING' || claimB.claim_type === 'LIMITATION')
        ) {
          candidatePairs.push({ claimA, claimB });
          // Cap candidate pairs to top 6 to prevent combinatorial explosion & timeout
          if (candidatePairs.length >= 6) break;
        }
      }
      if (candidatePairs.length >= 6) break;
    }

    const relationships: EvidenceRelationship[] = [];
    const comparisonPromises = candidatePairs.map(async ({ claimA, claimB }) => {
      const contextA = await this.repo.getContextForPaper(claimA.paper_id);
      const contextB = await this.repo.getContextForPaper(claimB.paper_id);

      const comparison = await this.llm.investigateDisagreement(
        claimA,
        contextA || undefined,
        claimB,
        contextB || undefined
      );

      const rel: EvidenceRelationship = {
        id: `rel_${claimA.id}_${claimB.id}`,
        source_claim_id: claimA.id,
        target_claim_id: claimB.id,
        source_claim: claimA,
        target_claim: claimB,
        relationship_type: comparison.relationship_type,
        supporting_evidence: comparison.supporting_evidence,
        context_comparison: {
          similarities: comparison.similarities,
          differences: comparison.differences,
          possible_explanations: comparison.possible_explanations,
          alternative_explanations: comparison.alternative_explanations,
          remaining_uncertainty: comparison.remaining_uncertainty,
          is_genuine_contradiction: comparison.is_genuine_contradiction,
        },
        confidence: comparison.confidence,
        verification_status: 'AUTOMATIC',
        created_at: new Date().toISOString(),
      };

      await this.repo.saveRelationship(rel);
      return rel;
    });

    const settledRelationships = await Promise.allSettled(comparisonPromises);
    for (const item of settledRelationships) {
      if (item.status === 'fulfilled' && item.value) {
        relationships.push(item.value);
      }
    }

    // Stage 3: Candidate Research-Gap Discovery
    const existingGaps = await this.repo.getGapsForSession(sessionId);
    let newGapsCount = 0;

    if (existingGaps.length === 0) {
      const gapDiscovery = await this.llm.discoverResearchGaps(
        papers.slice(0, 8),
        allClaims.slice(0, 15)
      );

      for (const g of gapDiscovery.gaps) {
        const gap: ResearchGap = {
          id: `gap_${Math.random().toString(36).substring(2, 9)}`,
          session_id: sessionId,
          title: g.title,
          research_question: g.research_question,
          description: g.description,
          gap_type: g.gap_type,
          supporting_papers: g.supporting_paper_ids.map(id => {
            const p = papers.find(paper => paper.id === id);
            return {
              paper_id: id,
              title: p?.title || 'Supporting Study',
              year: p?.year,
              relevant_limitation: g.relevant_limitations?.[0]
            };
          }),
          counter_evidence: [],
          coverage_summary: g.search_coverage_limitations,
          confidence: g.confidence,
          status: 'CANDIDATE',
          suggested_experiment: g.suggested_experiment_direction,
          search_coverage_limitations: g.search_coverage_limitations,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await this.repo.saveGap(gap);
        newGapsCount++;
      }
    }

    return {
      claims_extracted_count: allClaims.length,
      relationships_found_count: relationships.length,
      gaps_discovered_count: newGapsCount || existingGaps.length,
    };
  }

  /**
   * Capability B: Deep disagreement investigation for two specific claims
   */
  async getDisagreementInvestigation(claimAId: string, claimBId: string): Promise<DisagreementInvestigation | null> {
    const claimA = await this.repo.getClaim(claimAId);
    const claimB = await this.repo.getClaim(claimBId);

    if (!claimA || !claimB) return null;

    const paperA = await this.repo.getPaper(claimA.paper_id);
    const paperB = await this.repo.getPaper(claimB.paper_id);
    if (!paperA || !paperB) return null;

    const contextA = await this.repo.getContextForPaper(claimA.paper_id);
    const contextB = await this.repo.getContextForPaper(claimB.paper_id);

    const comp = await this.llm.investigateDisagreement(claimA, contextA || undefined, claimB, contextB || undefined);

    return {
      id: `disagree_${claimA.id}_${claimB.id}`,
      claim_a: claimA,
      claim_b: claimB,
      paper_a: paperA,
      paper_b: paperB,
      context_a: contextA || undefined,
      context_b: contextB || undefined,
      comparison: {
        similarities: comp.similarities,
        differences: comp.differences,
        possible_explanations: comp.possible_explanations,
        alternative_explanations: comp.alternative_explanations,
        remaining_uncertainty: comp.remaining_uncertainty,
        is_genuine_contradiction: comp.is_genuine_contradiction,
      },
      summary: comp.supporting_evidence,
      confidence: comp.confidence,
    };
  }

  /**
   * Capability D: 6-Stage Adversarial Gap Falsification Workflow
   */
  async runGapFalsification(gapId: string): Promise<GapInvestigationReport> {
    return this.falsifyResearchGap(gapId);
  }

  async falsifyResearchGap(gapId: string): Promise<GapInvestigationReport> {
    const gap = await this.repo.getGap(gapId);
    if (!gap) throw new Error(`Research gap ${gapId} not found`);

    // Stages 1 & 2: Counter-evidence search
    const counterEvidenceQuery = `${gap.title} ${gap.research_question}`;
    const discovery = await this.discovery.discover(counterEvidenceQuery, { limit: 8 });

    // Stage 3 & 4: LLM Adversarial Falsification Synthesis
    const falsification = await this.llm.falsifyResearchGap(gap, discovery.papers);

    const report: GapInvestigationReport = {
      id: `investigation_${Math.random().toString(36).substring(2, 9)}`,
      research_gap_id: gap.id,
      original_gap_title: gap.title,
      original_question: gap.research_question,
      search_queries: [counterEvidenceQuery],
      sources_searched: ['OpenAlex', 'arXiv', 'Semantic Scholar', 'Crossref'],
      papers_retrieved_count: discovery.papers.length,
      counter_evidence_papers: falsification.counter_evidence_findings.map(ce => ({
        title: ce.title,
        year: ce.year,
        doi: ce.doi,
        summary: ce.summary,
        relevance_to_gap: ce.relevance_to_gap,
      })),
      outcome: falsification.outcome,
      reasoning_summary: falsification.reasoning_summary,
      revised_question: falsification.revised_question,
      coverage_limitations: falsification.coverage_limitations,
      human_review_recommendation: falsification.human_review_recommendation,
      investigation_timestamp: new Date().toISOString(),
    };

    await this.repo.saveInvestigation(report);

    // Update gap status based on falsification outcome
    gap.status = falsification.outcome;
    gap.counter_evidence = report.counter_evidence_papers.map(cp => ({
      title: cp.title,
      citation: cp.year ? `${cp.title} (${cp.year})` : cp.title,
      why_counter: cp.relevance_to_gap,
    }));
    gap.coverage_summary = falsification.coverage_limitations;
    gap.updated_at = new Date().toISOString();
    await this.repo.saveGap(gap);

    return report;
  }

  /**
   * Capability E: Generate Practical Experiment Plan
   */
  async planExperimentForGap(gapId: string): Promise<ProposedExperiment> {
    const gap = await this.repo.getGap(gapId);
    if (!gap) throw new Error(`Research gap ${gapId} not found`);

    const planOutput = await this.llm.planExperiment(gap);

    const experiment: ProposedExperiment = {
      id: `exp_${Math.random().toString(36).substring(2, 9)}`,
      research_gap_id: gap.id,
      objective: planOutput.objective,
      research_question: planOutput.research_question,
      testable_hypothesis: planOutput.testable_hypothesis,
      variables: planOutput.variables,
      methodology: planOutput.methodology,
      baselines: planOutput.baselines,
      datasets: planOutput.datasets,
      hardware_requirements: planOutput.hardware_requirements,
      metrics: planOutput.metrics,
      estimated_resources: planOutput.estimated_resources,
      limitations: planOutput.limitations,
      expected_contribution: planOutput.expected_contribution,
      checklist: planOutput.checklist,
      created_at: new Date().toISOString(),
    };

    await this.repo.saveExperiment(experiment);
    return experiment;
  }
}

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

    // Stage 1: Scientific Claim & Context Extraction
    for (const paper of papers) {
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
        existingClaims = newClaims;

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
        contexts.push(context);
      }

      allClaims.push(...existingClaims);
    }

    // Stage 2: Context-Aware Disagreement Investigation & Relationship Mapping
    const relationships: EvidenceRelationship[] = [];
    for (let i = 0; i < allClaims.length; i++) {
      for (let j = i + 1; j < allClaims.length; j++) {
        const claimA = allClaims[i];
        const claimB = allClaims[j];

        // Only compare claims from different papers
        if (claimA.paper_id === claimB.paper_id) continue;

        // Focus comparison when at least one claim is a FINDING or LIMITATION
        if (
          (claimA.claim_type === 'FINDING' || claimA.claim_type === 'LIMITATION') &&
          (claimB.claim_type === 'FINDING' || claimB.claim_type === 'LIMITATION')
        ) {
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
          relationships.push(rel);
        }
      }
    }

    // Stage 3: Candidate Research-Gap Discovery
    const existingGaps = await this.repo.getGapsForSession(sessionId);
    let newGapsCount = 0;

    if (existingGaps.length === 0) {
      const gapDiscovery = await this.llm.discoverResearchGaps(papers, allClaims);

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
      confidence: comp.confidence,
      summary: comp.supporting_evidence,
    };
  }

  /**
   * Capability D: 6-Stage Dedicated Research-Gap Falsification Workflow
   */
  async runGapFalsification(gapId: string): Promise<GapInvestigationReport> {
    const gap = await this.repo.getGap(gapId);
    if (!gap) throw new Error(`Research gap ${gapId} not found`);

    // STAGE 1: Gap decomposition & alternate formulations
    const searchTerms = [
      gap.title,
      gap.research_question,
      ...gap.title.split(':').map(s => s.trim())
    ];

    // STAGE 2 & 3: Multi-source search expansion & reference exploration
    const discoveryRes = await this.discovery.discover(gap.research_question, { limit: 8 });
    const counterEvidencePapers = discoveryRes.papers.filter(
      p => !gap.supporting_papers.some(sp => sp.paper_id === p.id)
    );

    // STAGE 4 & 5: Counter-evidence analysis & gap revision
    const falsificationOutput = await this.llm.falsifyResearchGap(gap, counterEvidencePapers);

    // Update gap status in repository
    await this.repo.updateGapStatus(gap.id, falsificationOutput.outcome);

    // STAGE 6: Auditable Investigation Report
    const report: GapInvestigationReport = {
      id: `inv_${Math.random().toString(36).substring(2, 9)}`,
      research_gap_id: gap.id,
      original_gap_title: gap.title,
      original_question: gap.research_question,
      search_queries: falsificationOutput.search_queries_used,
      sources_searched: discoveryRes.sources_used,
      papers_retrieved_count: discoveryRes.total_found,
      counter_evidence_papers: falsificationOutput.counter_evidence_findings,
      outcome: falsificationOutput.outcome,
      revised_question: falsificationOutput.revised_question,
      coverage_limitations: falsificationOutput.coverage_limitations,
      reasoning_summary: falsificationOutput.reasoning_summary,
      human_review_recommendation: falsificationOutput.human_review_recommendation,
      investigation_timestamp: new Date().toISOString(),
    };

    await this.repo.saveInvestigation(report);
    return report;
  }

  /**
   * Capability E: Practical Experiment Planning & Resource Feasibility
   */
  async planExperimentForGap(gapId: string): Promise<ProposedExperiment> {
    const gap = await this.repo.getGap(gapId);
    if (!gap) throw new Error(`Research gap ${gapId} not found`);

    // Check if experiment already planned
    const existing = await this.repo.getExperimentForGap(gapId);
    if (existing) return existing;

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

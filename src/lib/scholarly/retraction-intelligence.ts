import { Paper, Claim, EvidenceRelationship, ResearchGap, RetractionAlert } from '@/types';

export class RetractionIntelligenceService {
  /**
   * Check whether a paper has an active retraction or correction flag
   */
  detectRetractionStatus(paper: Paper): { isRetracted: boolean; type?: RetractionAlert['status_type']; reason?: string } {
    const meta = (paper.metadata || {}) as any;

    if (paper.is_retracted || meta.is_retracted === true) {
      return {
        isRetracted: true,
        type: 'RETRACTED',
        reason: meta.retraction_reason || 'Paper retracted by publisher or authors following post-publication audit.',
      };
    }

    const titleLower = paper.title.toLowerCase();
    const abstractLower = paper.abstract.toLowerCase();

    if (titleLower.includes('retraction:') || titleLower.includes('retracted:') || abstractLower.includes('has been retracted')) {
      return {
        isRetracted: true,
        type: 'RETRACTED',
        reason: 'Explicit retraction notice identified in document title/abstract.',
      };
    }

    if (titleLower.includes('erratum:') || titleLower.includes('correction:') || abstractLower.includes('expression of concern')) {
      return {
        isRetracted: true,
        type: titleLower.includes('concern') ? 'EXPRESSION_OF_CONCERN' : 'CORRECTED',
        reason: 'Formal publisher correction or expression of concern issued.',
      };
    }

    return { isRetracted: false };
  }

  /**
   * Propagate retraction status across dependent claims, relationships, and candidate research gaps
   */
  propagateRetractionImpact(
    paper: Paper,
    claims: Claim[],
    relationships: EvidenceRelationship[],
    gaps: ResearchGap[],
    reason = 'Post-publication methodological discrepancy identified.'
  ): {
    alert: RetractionAlert;
    affectedClaims: Claim[];
    affectedRelationships: EvidenceRelationship[];
    affectedGaps: ResearchGap[];
  } {
    // 1. Identify dependent claims
    const affectedClaims = claims.filter(c => c.paper_id === paper.id);
    const affectedClaimIds = new Set(affectedClaims.map(c => c.id));

    // 2. Identify affected relationships
    const affectedRelationships = relationships.filter(
      r => affectedClaimIds.has(r.source_claim_id) || affectedClaimIds.has(r.target_claim_id)
    );

    // 3. Identify affected candidate gaps
    const affectedGaps = gaps.filter(g =>
      g.supporting_papers.some(sp => sp.paper_id === paper.id)
    );

    const provenanceWarning = `PROVENANCE ALERT: Source paper "${paper.title}" is flagged as RETRACTED/CORRECTED. ${affectedClaims.length} extracted claims and ${affectedRelationships.length} evidence links require re-evaluation. Historical findings preserved for transparency.`;

    const alert: RetractionAlert = {
      id: `retract_${paper.id}`,
      paper_id: paper.id,
      paper_title: paper.title,
      status_type: 'RETRACTED',
      notice_date: new Date().toISOString().slice(0, 10),
      reason,
      affected_claim_ids: Array.from(affectedClaimIds),
      affected_gap_ids: affectedGaps.map(g => g.id),
      provenance_warning: provenanceWarning,
      created_at: new Date().toISOString(),
    };

    return {
      alert,
      affectedClaims,
      affectedRelationships,
      affectedGaps,
    };
  }
}

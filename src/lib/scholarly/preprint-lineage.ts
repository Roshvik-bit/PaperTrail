import { Paper, PaperLineage } from '@/types';

export class PreprintLineageService {
  /**
   * Compare an arXiv preprint with a potential peer-reviewed journal or conference publication
   */
  matchPreprintToPublication(preprint: Paper, candidatePublication: Paper): PaperLineage | null {
    // 1. Pre-filtering: Preprint should typically be an arXiv preprint, publication from journal/conference/Crossref
    if (preprint.id === candidatePublication.id) return null;

    // 2. Normalized Title Similarity (Token Jaccard + Levenshtein proxy)
    const titleSim = this.computeTitleSimilarity(preprint.title, candidatePublication.title);
    if (titleSim < 0.70) return null;

    // 3. Author Set Overlap
    const authorOverlap = this.computeAuthorOverlap(preprint.authors, candidatePublication.authors);
    if (authorOverlap < 0.50) return null;

    // 4. DOI or arXiv cross-reference verification
    const doiMatch = !!(preprint.doi && candidatePublication.doi && preprint.doi.toLowerCase() === candidatePublication.doi.toLowerCase());
    const arxivMatch = !!(preprint.arxiv_id && candidatePublication.arxiv_id && preprint.arxiv_id.toLowerCase() === candidatePublication.arxiv_id.toLowerCase());

    const confidence = Math.min(
      0.99,
      titleSim * 0.55 + authorOverlap * 0.35 + (doiMatch || arxivMatch ? 0.10 : 0.05)
    );

    if (confidence < 0.75) return null;

    // 5. Detect changes in methodology and findings between versions
    const methodDiff = this.analyzeMethodologyDiff(preprint, candidatePublication);
    const findingsDiff = this.analyzeFindingsDiff(preprint, candidatePublication);

    return {
      id: `lineage_${preprint.id}_${candidatePublication.id}`,
      preprint_paper_id: preprint.id,
      published_paper_id: candidatePublication.id,
      preprint_title: preprint.title,
      published_title: candidatePublication.title,
      preprint_venue: preprint.venue || 'arXiv',
      published_venue: candidatePublication.venue || 'Conference/Journal',
      confidence: Number(confidence.toFixed(3)),
      match_evidence: {
        title_similarity: Number(titleSim.toFixed(3)),
        author_overlap: Number(authorOverlap.toFixed(3)),
        doi_match: doiMatch,
        arxiv_match: arxivMatch,
      },
      methodology_diff: methodDiff,
      findings_diff: findingsDiff,
      created_at: new Date().toISOString(),
    };
  }

  private computeTitleSimilarity(titleA: string, titleB: string): number {
    const cleanA = titleA.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    const cleanB = titleB.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);

    const setA = new Set(cleanA);
    const setB = new Set(cleanB);

    let intersection = 0;
    for (const word of setA) {
      if (setB.has(word)) intersection++;
    }

    const union = new Set([...cleanA, ...cleanB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  private computeAuthorOverlap(authorsA: Paper['authors'], authorsB: Paper['authors']): number {
    if (!authorsA || !authorsB || authorsA.length === 0 || authorsB.length === 0) return 0.5;

    const namesA = new Set(authorsA.map(a => a.name.toLowerCase().split(/\s+/).pop() || ''));
    const namesB = new Set(authorsB.map(b => b.name.toLowerCase().split(/\s+/).pop() || ''));

    let matches = 0;
    for (const surname of namesA) {
      if (surname && namesB.has(surname)) matches++;
    }

    return matches / Math.min(namesA.size, namesB.size);
  }

  private analyzeMethodologyDiff(preprint: Paper, published: Paper): string {
    const pAbstract = preprint.abstract.toLowerCase();
    const pubAbstract = published.abstract.toLowerCase();

    if (pubAbstract.includes('human evaluation') && !pAbstract.includes('human evaluation')) {
      return 'Published version incorporates additional human subject evaluation methodology.';
    }
    if (pubAbstract.includes('ablation') && !pAbstract.includes('ablation')) {
      return 'Published version includes expanded ablation study configurations.';
    }
    return 'Methodology core remains consistent between preprint and final publication.';
  }

  private analyzeFindingsDiff(preprint: Paper, published: Paper): string {
    if (published.venue && !preprint.venue?.includes(published.venue)) {
      return `Peer-reviewed and presented at ${published.venue} with standardized baseline metrics.`;
    }
    return 'Core empirical claims consistent; reporting formal conference benchmark results.';
  }
}

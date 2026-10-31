import { Paper, PaperSource } from '@/types';
import { OpenAlexProvider } from './openalex';
import { SemanticScholarProvider } from './semantic-scholar';
import { CrossrefProvider } from './crossref';
import { ArxivProvider } from './arxiv';
import { TinyFishProvider, TinyFishSearchResult } from './tinyfish';
import { CURATED_EDGE_AI_PAPERS } from './curated-edge-ai';

export interface DiscoveryResult {
  papers: Paper[];
  sources_used: string[];
  total_found: number;
  external_resources: TinyFishSearchResult[];
  query_interpreted: {
    type: 'DOI' | 'ARXIV' | 'NATURAL_QUERY';
    normalized_value: string;
  };
}

export class ResearchDiscoveryService {
  private openAlex = new OpenAlexProvider();
  private semanticScholar = new SemanticScholarProvider();
  private crossref = new CrossrefProvider();
  private arxiv = new ArxivProvider();
  private tinyFish = new TinyFishProvider();

  /**
   * Main unified discovery entrypoint
   */
  async discover(query: string, options: { limit?: number; domain?: string } = {}): Promise<DiscoveryResult> {
    const trimmed = query.trim();
    const limit = options.limit || 15;
    const sourcesUsed: string[] = [];

    // 1. Detect query type
    const queryType = this.classifyQuery(trimmed);

    const papersMap = new Map<string, Paper>();
    const providerProvenance: PaperSource[] = [];
    let externalResources: TinyFishSearchResult[] = [];

    // Helper to add or merge paper
    const ingestPaper = (paper: Paper, provider: PaperSource['provider']) => {
      const key = this.getDeduplicationKey(paper);
      const existing = papersMap.get(key);

      if (!existing) {
        papersMap.set(key, paper);
      } else {
        // Merge enriched fields
        if (!existing.abstract && paper.abstract) existing.abstract = paper.abstract;
        if (!existing.doi && paper.doi) existing.doi = paper.doi;
        if (!existing.arxiv_id && paper.arxiv_id) existing.arxiv_id = paper.arxiv_id;
        if ((!existing.citation_count || existing.citation_count === 0) && paper.citation_count) {
          existing.citation_count = paper.citation_count;
        }
        if (existing.full_text_status === 'abstract_only' && paper.full_text_status === 'open_access_pdf') {
          existing.full_text_status = 'open_access_pdf';
          existing.canonical_url = paper.canonical_url || existing.canonical_url;
        }
      }

      providerProvenance.push({
        id: `prov_${Math.random().toString(36).substring(2, 9)}`,
        paper_id: paper.id,
        provider,
        external_id: paper.doi || paper.arxiv_id || paper.id,
        source_url: paper.canonical_url,
        last_checked_at: new Date().toISOString(),
      });
    };

    // 2. Specific DOI / arXiv lookup
    if (queryType.type === 'DOI') {
      const doi = queryType.normalized_value;
      sourcesUsed.push('Crossref (DOI)');
      const crPaper = await this.crossref.resolveDoi(doi);
      if (crPaper) ingestPaper(crPaper, 'crossref');

      sourcesUsed.push('OpenAlex (DOI)');
      const oaPaper = await this.openAlex.getWorkByDoi(doi);
      if (oaPaper) ingestPaper(oaPaper, 'openalex');
    } else if (queryType.type === 'ARXIV') {
      const arxivId = queryType.normalized_value;
      sourcesUsed.push('arXiv Direct');
      const axPaper = await this.arxiv.getByArxivId(arxivId);
      if (axPaper) ingestPaper(axPaper, 'arxiv');
    } else {
      // 3. Multi-source parallel search
      const searches = [
        (async () => {
          const res = await this.openAlex.search(trimmed, limit);
          if (res.length > 0) sourcesUsed.push('OpenAlex');
          return { provider: 'openalex' as const, papers: res };
        })(),
        (async () => {
          const res = await this.semanticScholar.search(trimmed, limit);
          if (res.length > 0) sourcesUsed.push('Semantic Scholar');
          return { provider: 'semantic_scholar' as const, papers: res };
        })(),
        (async () => {
          const res = await this.arxiv.search(trimmed, limit);
          if (res.length > 0) sourcesUsed.push('arXiv');
          return { provider: 'arxiv' as const, papers: res };
        })(),
        (async () => {
          const res = await this.crossref.search(trimmed, limit);
          if (res.length > 0) sourcesUsed.push('Crossref');
          return { provider: 'crossref' as const, papers: res };
        })()
      ];

      const settled = await Promise.allSettled(searches);
      for (const item of settled) {
        if (item.status === 'fulfilled' && item.value.papers) {
          for (const paper of item.value.papers) {
            ingestPaper(paper, item.value.provider);
          }
        }
      }

      // Check TinyFish for external benchmarks/datasets if configured
      if (this.tinyFish.isConfigured()) {
        sourcesUsed.push('TinyFish Autonomous Discovery');
        externalResources = await this.tinyFish.search(`${trimmed} edge benchmarks datasets`, 5);
      }
    }

    // 4. Incorporate curated peer-reviewed Edge AI papers if relevant to Edge AI / Small Models
    const queryLower = trimmed.toLowerCase();
    const isEdgeAiQuery =
      queryLower.includes('edge') ||
      queryLower.includes('quant') ||
      queryLower.includes('mobile') ||
      queryLower.includes('small language model') ||
      queryLower.includes('slm') ||
      queryLower.includes('latency') ||
      queryLower.includes('throttl') ||
      queryLower.includes('on-device') ||
      queryLower.includes('llm') ||
      queryType.type === 'NATURAL_QUERY' ||
      options.domain === 'edge_ai';

    if (isEdgeAiQuery) {
      sourcesUsed.push('Curated Edge AI Landmark Benchmark');
      for (const curated of CURATED_EDGE_AI_PAPERS) {
        // Match terms or include high-relevance foundational works
        const textToMatch = `${curated.title} ${curated.abstract}`.toLowerCase();
        const matchesQuery = queryLower.split(/\s+/).some(term => term.length > 3 && textToMatch.includes(term));
        if (matchesQuery || papersMap.size < 5) {
          ingestPaper(curated, 'arxiv');
        }
      }
    }

    const papers = Array.from(papersMap.values()).slice(0, Math.max(limit, 10));

    return {
      papers,
      sources_used: Array.from(new Set(sourcesUsed)),
      total_found: papers.length,
      external_resources: externalResources,
      query_interpreted: queryType,
    };
  }

  private classifyQuery(query: string): DiscoveryResult['query_interpreted'] {
    const doiRegex = /(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)/i;
    const arxivRegex = /(\d{4}\.\d{4,5}(v\d+)?)|(arxiv:\d{4}\.\d{4,5})/i;

    const doiMatch = query.match(doiRegex);
    if (doiMatch) {
      return { type: 'DOI', normalized_value: doiMatch[1] };
    }

    const arxivMatch = query.match(arxivRegex);
    if (arxivMatch) {
      return { type: 'ARXIV', normalized_value: arxivMatch[0].replace(/^arxiv:/i, '') };
    }

    return { type: 'NATURAL_QUERY', normalized_value: query };
  }

  private getDeduplicationKey(paper: Paper): string {
    if (paper.doi) return `doi:${paper.doi.toLowerCase().trim()}`;
    if (paper.arxiv_id) return `arxiv:${paper.arxiv_id.toLowerCase().trim()}`;
    // Normalized title key
    return `title:${paper.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  }
}


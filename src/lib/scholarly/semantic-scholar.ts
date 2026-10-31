import { Paper, Author, OpenAccessStatus } from '@/types';

export class SemanticScholarProvider {
  private baseUrl = 'https://api.semanticscholar.org/graph/v1';
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SEMANTIC_SCHOLAR_API_KEY;
  }

  async search(query: string, limit = 10): Promise<Paper[]> {
    try {
      const url = new URL(`${this.baseUrl}/paper/search`);
      url.searchParams.set('query', query);
      url.searchParams.set('limit', String(Math.min(limit, 20)));
      url.searchParams.set(
        'fields',
        'paperId,title,abstract,year,authors,venue,citationCount,isOpenAccess,openAccessPdf,externalIds,publicationDate'
      );

      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url.toString(), {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[SemanticScholar] Search failed: status ${res.status}`);
        return [];
      }

      const data = await res.json();
      const items = data.data || [];

      return items.map((item: any): Paper => {
        const authors: Author[] = (item.authors || []).map((a: any) => ({
          name: a.name,
        }));

        const doi = item.externalIds?.DOI;
        const arxiv = item.externalIds?.ArXiv;
        const isOpenAccess = item.isOpenAccess || !!item.openAccessPdf?.url;

        return {
          id: `s2_${item.paperId}`,
          title: item.title || 'Untitled Research',
          abstract: item.abstract || 'No abstract provided in Semantic Scholar record.',
          doi: doi,
          arxiv_id: arxiv,
          semantic_scholar_id: item.paperId,
          publication_date: item.publicationDate,
          year: item.year,
          venue: item.venue || 'Scholarly Archive',
          publication_type: 'journal-article',
          authors,
          canonical_url: item.openAccessPdf?.url || (doi ? `https://doi.org/${doi}` : `https://www.semanticscholar.org/paper/${item.paperId}`),
          open_access_status: (isOpenAccess ? 'gold' : 'closed') as OpenAccessStatus,
          full_text_status: item.openAccessPdf?.url ? 'open_access_pdf' : 'abstract_only',
          citation_count: item.citationCount || 0,
          metadata: {
            source_provider: 'semantic_scholar',
            pdf_url: item.openAccessPdf?.url,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
    } catch (err: any) {
      console.warn(`[SemanticScholar] Search error: ${err.message}`);
      return [];
    }
  }
}


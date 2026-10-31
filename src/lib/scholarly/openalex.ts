import { Paper, Author, OpenAccessStatus } from '@/types';

/**
 * Reconstructs natural text abstract from OpenAlex abstract_inverted_index
 */
function reconstructAbstract(invertedIndex: Record<string, number[]> | null | undefined): string {
  if (!invertedIndex || Object.keys(invertedIndex).length === 0) return '';
  const wordEntries: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordEntries.push([word, pos]);
    }
  }
  wordEntries.sort((a, b) => a[1] - b[1]);
  return wordEntries.map(([w]) => w).join(' ');
}

export class OpenAlexProvider {
  private baseUrl = 'https://api.openalex.org';
  private mailto: string;

  constructor(mailto?: string) {
    this.mailto = mailto || process.env.OPENALEX_EMAIL || 'researcher@papertrail.org';
  }

  async search(query: string, limit = 10): Promise<Paper[]> {
    try {
      const url = new URL(`${this.baseUrl}/works`);
      url.searchParams.set('search', query);
      url.searchParams.set('per_page', String(Math.min(limit, 25)));
      url.searchParams.set('mailto', this.mailto);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { 'User-Agent': `PaperTrail-ResearchEngine/1.0 (mailto:${this.mailto})` }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[OpenAlex] Search failed with status ${res.status}`);
        return [];
      }

      const data = await res.json();
      const results = data.results || [];

      return results.map((item: any): Paper => {
        const authors: Author[] = (item.authorships || []).map((a: any) => ({
          name: a.author?.display_name || 'Unknown Author',
          affiliation: a.institutions?.[0]?.display_name,
          orcid: a.author?.orcid,
        }));

        const cleanDoi = item.doi ? item.doi.replace('https://doi.org/', '') : undefined;
        const oaStatus = (item.open_access?.oa_status || (item.open_access?.is_oa ? 'gold' : 'closed')) as OpenAccessStatus;
        const abstract = reconstructAbstract(item.abstract_inverted_index);

        return {
          id: `openalex_${item.id?.replace('https://openalex.org/', '')}`,
          title: item.title || 'Untitled Work',
          abstract: abstract || 'Abstract not available in OpenAlex index.',
          doi: cleanDoi,
          openalex_id: item.id,
          publication_date: item.publication_date,
          year: item.publication_year || (item.publication_date ? parseInt(item.publication_date.slice(0, 4), 10) : undefined),
          venue: item.primary_location?.source?.display_name || item.host_venue?.display_name || 'Academic Venue',
          publication_type: item.type || 'journal-article',
          authors,
          canonical_url: item.doi || item.primary_location?.landing_page_url || item.id,
          open_access_status: oaStatus,
          full_text_status: item.open_access?.is_oa ? 'open_access_pdf' : 'abstract_only',
          citation_count: item.cited_by_count || 0,
          metadata: {
            source_provider: 'openalex',
            concepts: item.concepts?.map((c: any) => c.display_name),
            is_retracted: item.is_retracted,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
    } catch (err: any) {
      console.warn(`[OpenAlex] Search exception: ${err.message}`);
      return [];
    }
  }

  async getWorkByDoi(doi: string): Promise<Paper | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '');
      const url = `${this.baseUrl}/works/https://doi.org/${cleanDoi}?mailto=${this.mailto}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const item = await res.json();
      const authors: Author[] = (item.authorships || []).map((a: any) => ({
        name: a.author?.display_name || 'Unknown Author',
        affiliation: a.institutions?.[0]?.display_name,
        orcid: a.author?.orcid,
      }));

      return {
        id: `openalex_${item.id?.replace('https://openalex.org/', '')}`,
        title: item.title || 'Untitled Work',
        abstract: reconstructAbstract(item.abstract_inverted_index),
        doi: cleanDoi,
        openalex_id: item.id,
        publication_date: item.publication_date,
        year: item.publication_year,
        venue: item.primary_location?.source?.display_name,
        publication_type: item.type,
        authors,
        canonical_url: item.doi || item.primary_location?.landing_page_url,
        open_access_status: (item.open_access?.oa_status || 'unknown') as OpenAccessStatus,
        full_text_status: item.open_access?.is_oa ? 'open_access_pdf' : 'abstract_only',
        citation_count: item.cited_by_count || 0,
        metadata: { source_provider: 'openalex' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}


import { Paper, Author } from '@/types';

export class CrossrefProvider {
  private baseUrl = 'https://api.crossref.org';
  private mailto: string;

  constructor(mailto?: string) {
    this.mailto = mailto || process.env.CROSSREF_MAILTO || 'researcher@papertrail.org';
  }

  async search(query: string, limit = 10): Promise<Paper[]> {
    try {
      const url = new URL(`${this.baseUrl}/works`);
      url.searchParams.set('query', query);
      url.searchParams.set('rows', String(Math.min(limit, 20)));
      url.searchParams.set('mailto', this.mailto);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { 'User-Agent': `PaperTrail-Engine/1.0 (mailto:${this.mailto})` },
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];

      const data = await res.json();
      const items = data.message?.items || [];

      return items.map((item: any): Paper => {
        const authors: Author[] = (item.author || []).map((a: any) => ({
          name: [a.given, a.family].filter(Boolean).join(' ') || a.name || 'Unknown',
          affiliation: a.affiliation?.[0]?.name,
          orcid: a.ORCID,
        }));

        const year =
          item.issued?.['date-parts']?.[0]?.[0] ||
          item.published?.['date-parts']?.[0]?.[0];

        const title = Array.isArray(item.title) ? item.title[0] : (item.title || 'Untitled');
        const abstract = typeof item.abstract === 'string'
          ? item.abstract.replace(/<[^>]*>?/gm, '').trim()
          : 'Abstract available via publisher DOI landing page.';

        return {
          id: `cr_${encodeURIComponent(item.DOI || item.title || Math.random().toString())}`,
          title,
          abstract,
          doi: item.DOI,
          publication_date: year ? `${year}-01-01` : undefined,
          year,
          venue: item['container-title']?.[0] || 'Published Journal/Conference',
          publication_type: item.type || 'journal-article',
          authors,
          canonical_url: item.DOI ? `https://doi.org/${item.DOI}` : item.URL,
          open_access_status: item.link ? 'hybrid' : 'unknown',
          full_text_status: item.link ? 'open_access_pdf' : 'abstract_only',
          citation_count: item['is-referenced-by-count'] || 0,
          metadata: {
            source_provider: 'crossref',
            publisher: item.publisher,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
    } catch (err: any) {
      console.warn(`[Crossref] Search error: ${err.message}`);
      return [];
    }
  }

  async resolveDoi(doi: string): Promise<Paper | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '');
      const url = `${this.baseUrl}/works/${encodeURIComponent(cleanDoi)}?mailto=${this.mailto}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const item = data.message;
      if (!item) return null;

      const authors: Author[] = (item.author || []).map((a: any) => ({
        name: [a.given, a.family].filter(Boolean).join(' ') || a.name || 'Unknown',
      }));

      const year = item.issued?.['date-parts']?.[0]?.[0];
      const title = Array.isArray(item.title) ? item.title[0] : (item.title || 'Untitled');

      return {
        id: `cr_${encodeURIComponent(item.DOI)}`,
        title,
        abstract: typeof item.abstract === 'string' ? item.abstract.replace(/<[^>]*>?/gm, '').trim() : 'Abstract on publisher site.',
        doi: item.DOI,
        publication_date: year ? `${year}-01-01` : undefined,
        year,
        venue: item['container-title']?.[0] || 'Scholarly Publication',
        publication_type: item.type || 'journal-article',
        authors,
        canonical_url: `https://doi.org/${item.DOI}`,
        open_access_status: 'unknown',
        full_text_status: 'abstract_only',
        citation_count: item['is-referenced-by-count'] || 0,
        metadata: { source_provider: 'crossref' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}


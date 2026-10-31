import { Paper, Author } from '@/types';

export class ArxivProvider {
  private baseUrl = 'https://export.arxiv.org/api/query';

  async search(query: string, limit = 10): Promise<Paper[]> {
    try {
      const formattedQuery = encodeURIComponent(query.replace(/[^a-zA-Z0-9\s]/g, ' '));
      const url = `${this.baseUrl}?search_query=all:${formattedQuery}&start=0&max_results=${Math.min(limit, 20)}&sortBy=relevance&sortOrder=descending`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return [];

      const xml = await res.text();
      return this.parseAtomXml(xml);
    } catch (err: any) {
      console.warn(`[arXiv] Search error: ${err.message}`);
      return [];
    }
  }

  async getByArxivId(arxivId: string): Promise<Paper | null> {
    try {
      const cleanId = arxivId.replace(/^(arxiv:|\/abs\/)/i, '').trim();
      const url = `${this.baseUrl}?id_list=${encodeURIComponent(cleanId)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const xml = await res.text();
      const papers = this.parseAtomXml(xml);
      return papers[0] || null;
    } catch {
      return null;
    }
  }

  private parseAtomXml(xml: string): Paper[] {
    const papers: Paper[] = [];
    const entries = xml.split('<entry>').slice(1);

    for (const entry of entries) {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
      const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
      const doiMatch = entry.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/);
      const commentMatch = entry.match(/<arxiv:comment[^>]*>([\s\S]*?)<\/arxiv:comment>/);

      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Untitled arXiv Preprint';
      const abstract = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
      const published = publishedMatch ? publishedMatch[1].trim() : undefined;
      const rawId = idMatch ? idMatch[1].trim() : '';
      const arxivId = rawId.split('/abs/').pop()?.split('v')[0] || rawId;

      const authorMatches = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g)];
      const authors: Author[] = authorMatches.map((m) => ({
        name: m[1].trim(),
      }));

      const year = published ? parseInt(published.slice(0, 4), 10) : undefined;
      const pdfUrl = rawId.replace('/abs/', '/pdf/') + '.pdf';

      papers.push({
        id: `arxiv_${arxivId}`,
        title,
        abstract,
        arxiv_id: arxivId,
        doi: doiMatch ? doiMatch[1].trim() : undefined,
        publication_date: published ? published.slice(0, 10) : undefined,
        year,
        venue: 'arXiv Preprint',
        publication_type: 'preprint',
        authors,
        canonical_url: rawId,
        open_access_status: 'green',
        full_text_status: 'open_access_pdf',
        citation_count: 0,
        metadata: {
          source_provider: 'arxiv',
          pdf_url: pdfUrl,
          comment: commentMatch ? commentMatch[1].trim() : undefined,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return papers;
  }
}

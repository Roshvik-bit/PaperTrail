export interface TinyFishSearchResult {
  title: string;
  url: string;
  snippet: string;
  published_date?: string;
  source_type?: 'benchmark' | 'dataset' | 'lab_page' | 'repository' | 'article';
}

export interface TinyFishFetchResult {
  url: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface TinyFishInvestigationResult {
  query: string;
  summary: string;
  resources_discovered: TinyFishSearchResult[];
  experimental_findings?: string[];
  execution_mode: 'SEARCH_FETCH' | 'AUTONOMOUS_AGENT' | 'DISABLED';
}

export class TinyFishProvider {
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.TINYFISH_API_KEY;
    this.baseUrl = baseUrl || process.env.TINYFISH_BASE_URL || 'https://api.tinyfish.ai/v1';
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Search for benchmark pages, lab notes, code repos, and edge documentation
   */
  async search(query: string, limit = 5): Promise<TinyFishSearchResult[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const res = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          limit,
          categories: ['research', 'documentation', 'code_repositories', 'benchmarks'],
        }),
      });

      if (!res.ok) {
        console.warn(`[TinyFish] Search failed: HTTP ${res.status}`);
        return [];
      }

      const data = await res.json();
      return (data.results || []).map((r: any) => ({
        title: r.title || 'Discovered Resource',
        url: r.url,
        snippet: r.snippet || r.text || '',
        published_date: r.published_date,
        source_type: this.categorizeSource(r.url, r.title),
      }));
    } catch (err: any) {
      console.warn(`[TinyFish] Search error: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch rendered research content from an external lab / benchmark site
   */
  async fetchContent(url: string): Promise<TinyFishFetchResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const res = await fetch(`${this.baseUrl}/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return {
        url,
        title: data.title || '',
        content: data.markdown || data.content || '',
        metadata: data.metadata,
      };
    } catch {
      return null;
    }
  }

  /**
   * Autonomous agent navigation for finding missing hardware benchmarks or datasets
   */
  async investigateResourceTrail(
    targetPaperTitle: string,
    investigationGoal: string
  ): Promise<TinyFishInvestigationResult> {
    if (!this.isConfigured()) {
      return {
        query: `${targetPaperTitle}: ${investigationGoal}`,
        summary: 'TinyFish integration not configured. Provide TINYFISH_API_KEY in environment to enable deep external web research navigation.',
        resources_discovered: [],
        execution_mode: 'DISABLED',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: `Find independent benchmark evaluations, reproducible hardware configurations, and code repositories related to "${targetPaperTitle}". Goal: ${investigationGoal}`,
          max_steps: 4,
        }),
      });

      if (!res.ok) {
        // Fall back to simple search
        const fallback = await this.search(`${targetPaperTitle} benchmark code`);
        return {
          query: targetPaperTitle,
          summary: 'Agent call exceeded rate limit; fell back to targeted scholarly search.',
          resources_discovered: fallback,
          execution_mode: 'SEARCH_FETCH',
        };
      }

      const data = await res.json();
      return {
        query: targetPaperTitle,
        summary: data.summary || 'Investigation completed.',
        resources_discovered: (data.findings || []).map((f: any) => ({
          title: f.title || 'Independent Benchmark',
          url: f.url || '',
          snippet: f.notes || '',
          source_type: 'benchmark',
        })),
        experimental_findings: data.extracted_metrics,
        execution_mode: 'AUTONOMOUS_AGENT',
      };
    } catch (err: any) {
      return {
        query: targetPaperTitle,
        summary: `TinyFish agent navigation failed: ${err.message}`,
        resources_discovered: [],
        execution_mode: 'DISABLED',
      };
    }
  }

  private categorizeSource(url: string, title = ''): TinyFishSearchResult['source_type'] {
    const text = `${url} ${title}`.toLowerCase();
    if (text.includes('github.com') || text.includes('gitlab.com') || text.includes('huggingface.co')) return 'repository';
    if (text.includes('benchmark') || text.includes('mlperf') || text.includes('paperswithcode')) return 'benchmark';
    if (text.includes('dataset') || text.includes('kaggle')) return 'dataset';
    if (text.includes('.edu') || text.includes('lab') || text.includes('research')) return 'lab_page';
    return 'article';
  }
}

import { Dataset, Paper } from '@/types';

export class DatasetDiscoveryService {
  /**
   * Search Hugging Face and scholarly repositories for accessible benchmark datasets
   */
  async searchDatasets(query: string, limit = 5): Promise<Dataset[]> {
    const results: Dataset[] = [];

    // 1. Try Hugging Face Datasets API
    try {
      const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=${limit}&full=true`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        for (const item of (Array.isArray(data) ? data : [])) {
          results.push({
            id: `hf_${item.id.replace('/', '_')}`,
            title: item.id,
            description: item.description || `Benchmark dataset hosted on Hugging Face: ${item.id}`,
            creator: item.author || item.id.split('/')[0] || 'Community',
            license: item.license || 'open_access',
            access_url: `https://huggingface.co/datasets/${item.id}`,
            source_repository: 'huggingface',
            availability: 'PUBLIC',
            modalities: ['text', 'eval_benchmark'],
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Graceful fallback to curated repositories
    }

    // 2. Incorporate authentic curated Edge AI and SLM benchmark datasets
    const curated = this.getCuratedEdgeDatasets(query);
    for (const d of curated) {
      if (!results.some(r => r.id === d.id)) {
        results.push(d);
      }
    }

    return results.slice(0, Math.max(limit, 4));
  }

  /**
   * Match datasets to research papers based on evaluation mentions
   */
  connectDatasetsToPapers(papers: Paper[], datasets: Dataset[]): { paper_id: string; dataset_id: string; relationship: 'EVALUATES_ON' | 'INTRODUCES_DATASET' }[] {
    const connections: { paper_id: string; dataset_id: string; relationship: 'EVALUATES_ON' | 'INTRODUCES_DATASET' }[] = [];

    for (const paper of papers) {
      const text = `${paper.title} ${paper.abstract}`.toLowerCase();
      for (const dataset of datasets) {
        const datasetName = dataset.title.toLowerCase();
        if (text.includes(datasetName) || (datasetName.includes('wikitext') && text.includes('wikitext')) || (datasetName.includes('gsm8k') && text.includes('gsm8k'))) {
          connections.push({
            paper_id: paper.id,
            dataset_id: dataset.id,
            relationship: 'EVALUATES_ON',
          });
        }
      }
    }

    return connections;
  }

  private getCuratedEdgeDatasets(query = ''): Dataset[] {
    const list: Dataset[] = [
      {
        id: 'ds_wikitext2',
        title: 'wikitext-2-raw-v1',
        description: 'Standard benchmark corpus of high-quality Wikipedia articles for calculating token perplexity degradation.',
        creator: 'Salesforce Research',
        license: 'CC BY-SA 4.0',
        version: 'v1.0',
        access_url: 'https://huggingface.co/datasets/wikitext',
        source_repository: 'huggingface',
        availability: 'PUBLIC',
        modalities: ['text', 'perplexity_benchmark'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'ds_gsm8k',
        title: 'gsm8k',
        description: '8,500 diverse high quality grade school math problems used to measure multi-step quantitative reasoning in SLMs.',
        creator: 'OpenAI',
        license: 'MIT',
        version: 'v1.0',
        access_url: 'https://github.com/openai/grade-school-math',
        source_repository: 'github',
        availability: 'PUBLIC',
        modalities: ['math_reasoning', 'few_shot'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'ds_mlperf_mobile',
        title: 'MLPerf Mobile Inference Suite v4.0',
        description: 'Industry standard ML benchmark suite evaluating latency and energy efficiency on mobile and edge devices.',
        creator: 'MLCommons',
        license: 'Apache-2.0',
        version: 'v4.0',
        access_url: 'https://github.com/mlcommons/mobile_models',
        source_repository: 'paperswithcode',
        availability: 'PUBLIC',
        modalities: ['edge_telemetry', 'hardware_benchmark'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'ds_mmlu_subsets',
        title: 'cais/mmlu',
        description: 'Massive Multitask Language Understanding spanning STEM, humanities, and social sciences for zero-shot accuracy.',
        creator: 'Center for AI Safety',
        license: 'MIT',
        version: 'v1.0',
        access_url: 'https://huggingface.co/datasets/cais/mmlu',
        source_repository: 'huggingface',
        availability: 'PUBLIC',
        modalities: ['zero_shot', 'multi_subject'],
        created_at: new Date().toISOString(),
      }
    ];

    const qLower = query.toLowerCase();
    if (!qLower) return list;
    return list.filter(d => d.title.toLowerCase().includes(qLower) || d.description.toLowerCase().includes(qLower) || true);
  }
}

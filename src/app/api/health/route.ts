import { NextResponse } from 'next/server';

export async function GET() {
  const providersStatus = {
    openalex: true,
    semantic_scholar: !!process.env.SEMANTIC_SCHOLAR_API_KEY,
    crossref: true,
    arxiv: true,
    tinyfish: !!process.env.TINYFISH_API_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    llm: {
      provider: process.env.LLM_PROVIDER || 'ollama',
      model: process.env.OLLAMA_MODEL || 'gpt-oss:120b-cloud',
      ollama_url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    }
  };

  return NextResponse.json({
    status: 'healthy',
    product: 'PaperTrail',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    domain: 'Edge AI, On-Device AI, Small Language Models',
    integrations: providersStatus,
    differentiator: 'Context-Aware Scientific Evidence Investigation + Research-Gap Falsification + Experiment Feasibility'
  });
}


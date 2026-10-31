import { NextResponse } from 'next/server';

export async function GET() {
  const providersStatus = {
    openalex: true,
    semantic_scholar: !!process.env.SEMANTIC_SCHOLAR_API_KEY,
    crossref: true,
    arxiv: true,
    tinyfish: !!process.env.TINYFISH_API_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    llm: process.env.LLM_PROVIDER || 'deterministic_fallback'
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

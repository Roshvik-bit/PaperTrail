import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { ResearchDiscoveryService } from '@/lib/scholarly/research-discovery';

const repo = new PaperTrailRepository();
const discovery = new ResearchDiscoveryService();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await repo.getSession(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const query = body.query || session.research_question;
    const limit = body.limit || 12;

    const result = await discovery.discover(query, {
      limit,
      domain: session.domain,
    });

    // Save discovered papers to repository under this session
    for (const paper of result.papers) {
      await repo.savePaper(paper, session.id);
    }

    return NextResponse.json({
      session_id: session.id,
      papers: result.papers,
      total_found: result.total_found,
      sources_used: result.sources_used,
      external_resources: result.external_resources,
      query_interpreted: result.query_interpreted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

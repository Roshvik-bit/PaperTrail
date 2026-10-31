import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { CrossDomainService } from '@/lib/scholarly/cross-domain';

const repo = new PaperTrailRepository();
const crossDomainService = new CrossDomainService();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let connections = await repo.getCrossDomainForSession(params.id);

    if (connections.length === 0) {
      const papers = await repo.getPapersForSession(params.id);
      connections = crossDomainService.discoverCrossDomainConnections(papers);
      for (const c of connections) {
        c.session_id = params.id;
        await repo.saveCrossDomain(c);
      }
    }

    return NextResponse.json({ connections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

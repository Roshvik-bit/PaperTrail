import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { ResearchAnalysisService } from '@/lib/analysis/analysis-service';

const repo = new PaperTrailRepository();
const analysisService = new ResearchAnalysisService();

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await repo.getSession(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const job = await repo.createJob('CLAIM_EXTRACTION', { session_id: session.id }, session.id);
    await repo.updateJob(job.id, { status: 'EXTRACTING', progress: 20 });

    const result = await analysisService.analyzeSession(session.id);

    await repo.updateJob(job.id, {
      status: 'COMPLETED',
      progress: 100,
      result: result as any,
      completed_at: new Date().toISOString(),
    });

    const claims = await repo.getClaimsForSession(session.id);
    const disagreements = await repo.getRelationshipsForSession(session.id);
    const gaps = await repo.getGapsForSession(session.id);

    return NextResponse.json({
      success: true,
      job_id: job.id,
      analysis: result,
      claims,
      disagreements,
      gaps,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


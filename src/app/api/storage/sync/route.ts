import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository, SQLiteResearchRepository } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, overwriteConfirmed } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId parameter.' }, { status: 400 });
    }

    const cloudRepo = new PaperTrailRepository();
    const localRepo = new SQLiteResearchRepository();

    if (action === 'CLOUD_TO_LOCAL') {
      const bundle = await cloudRepo.getCompleteResearchBundle(sessionId);
      if (!bundle) {
        return NextResponse.json({ error: `Session ${sessionId} not found in cloud storage.` }, { status: 404 });
      }

      const result = await localRepo.importResearchBundle(bundle, {
        mode: overwriteConfirmed ? 'REPLACE' : 'CREATE_NEW',
        overwriteConfirmed,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized session "${bundle.session.title}" to local SQLite database.`,
        result,
      });
    }

    if (action === 'LOCAL_TO_CLOUD') {
      const bundle = await localRepo.getCompleteResearchBundle(sessionId);
      if (!bundle) {
        return NextResponse.json({ error: `Session ${sessionId} not found in local SQLite database.` }, { status: 404 });
      }

      const result = await cloudRepo.importResearchBundle(bundle, {
        mode: overwriteConfirmed ? 'REPLACE' : 'CREATE_NEW',
        overwriteConfirmed,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized session "${bundle.session.title}" from local SQLite to cloud storage.`,
        result,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Expected "CLOUD_TO_LOCAL" or "LOCAL_TO_CLOUD".' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: `Sync failed: ${err.message}` }, { status: 500 });
  }
}

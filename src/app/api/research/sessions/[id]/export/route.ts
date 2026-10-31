import { NextRequest, NextResponse } from 'next/server';
import { getResearchRepository } from '@/lib/db/repository';
import { ResearchExportService } from '@/lib/export/export-service';
import { ResearchExportFormat } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  const repo = getResearchRepository();

  const bundle = await repo.getCompleteResearchBundle(sessionId);
  if (!bundle) {
    return NextResponse.json({ error: 'Research investigation not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get('format') || 'zip').toLowerCase() as ResearchExportFormat;

  try {
    const exported = ResearchExportService.exportBundle(bundle, format);

    const headers = new Headers();
    headers.set('Content-Type', exported.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${exported.filename}"`);

    if (Buffer.isBuffer(exported.data)) {
      headers.set('Content-Length', String(exported.data.length));
      return new NextResponse(new Uint8Array(exported.data), {
        status: 200,
        headers,
      });
    }

    return new NextResponse(exported.data, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Export failed: ${err.message}` }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getResearchRepository } from '@/lib/db/repository';
import { ResearchImportService } from '@/lib/export/import-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const repo = getResearchRepository();
  const contentType = req.headers.get('content-type') || '';

  try {
    let rawBuffer: Buffer;
    let mode: 'CREATE_NEW' | 'MERGE' | 'REPLACE' = 'CREATE_NEW';
    let overwriteConfirmed = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No archive file provided in form-data ("file" key).' }, { status: 400 });
      }

      const arrayBuf = await file.arrayBuffer();
      rawBuffer = Buffer.from(arrayBuf);

      mode = (formData.get('mode') as any) || 'CREATE_NEW';
      overwriteConfirmed = formData.get('overwriteConfirmed') === 'true';
    } else {
      // JSON body
      const body = await req.json();
      if (body.bundle) {
        rawBuffer = Buffer.from(JSON.stringify(body.bundle), 'utf8');
        mode = body.mode || 'CREATE_NEW';
        overwriteConfirmed = !!body.overwriteConfirmed;
      } else {
        rawBuffer = Buffer.from(JSON.stringify(body), 'utf8');
      }
    }

    const bundle = ResearchImportService.parseArchive(rawBuffer);
    const result = await repo.importResearchBundle(bundle, {
      mode,
      overwriteConfirmed,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Import failed: ${err.message}` }, { status: 400 });
  }
}

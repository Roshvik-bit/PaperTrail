import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';

const repo = new PaperTrailRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gaps = await repo.getGapsForSession(params.id);
    return NextResponse.json({ gaps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


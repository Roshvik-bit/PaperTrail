import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';

const repo = new PaperTrailRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const claims = await repo.getClaimsForSession(params.id);
    return NextResponse.json({ claims });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

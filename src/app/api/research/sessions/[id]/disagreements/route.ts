import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';

const repo = new PaperTrailRepository();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relationships = await repo.getRelationshipsForSession(params.id);
    const disagreements = relationships.filter(
      r => r.relationship_type === 'CONTRADICTS' ||
           r.relationship_type === 'CHALLENGES' ||
           r.relationship_type === 'QUALIFIES' ||
           r.relationship_type === 'DIFFERENT_EXPERIMENTAL_CONTEXT'
    );
    return NextResponse.json({ disagreements, total: disagreements.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


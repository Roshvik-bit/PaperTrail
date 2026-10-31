import { NextRequest, NextResponse } from 'next/server';
import { EvolutionService } from '@/lib/analysis/evolution-service';

const evolutionService = new EvolutionService();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await evolutionService.checkSessionEvolution(params.id, body.seed_paper);
    return NextResponse.json({ success: true, evolution: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

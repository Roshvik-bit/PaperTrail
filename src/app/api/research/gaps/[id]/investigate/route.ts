import { NextRequest, NextResponse } from 'next/server';
import { ResearchAnalysisService } from '@/lib/analysis/analysis-service';

const analysisService = new ResearchAnalysisService();

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await analysisService.runGapFalsification(params.id);
    return NextResponse.json({ report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

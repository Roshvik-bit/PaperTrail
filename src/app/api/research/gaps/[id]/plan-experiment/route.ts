import { NextRequest, NextResponse } from 'next/server';
import { ResearchAnalysisService } from '@/lib/analysis/analysis-service';

const analysisService = new ResearchAnalysisService();

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experiment = await analysisService.planExperimentForGap(params.id);
    return NextResponse.json({ experiment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

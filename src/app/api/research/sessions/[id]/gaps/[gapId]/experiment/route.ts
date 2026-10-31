import { NextRequest, NextResponse } from 'next/server';
import { ResearchAnalysisService } from '@/lib/analysis/analysis-service';

const analysisService = new ResearchAnalysisService();

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; gapId: string } }
) {
  try {
    const experiment = await analysisService.planExperimentForGap(params.gapId);
    return NextResponse.json({ experiment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


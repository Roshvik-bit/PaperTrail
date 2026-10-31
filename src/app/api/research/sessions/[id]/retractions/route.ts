import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { RetractionIntelligenceService } from '@/lib/scholarly/retraction-intelligence';

const repo = new PaperTrailRepository();
const retractionService = new RetractionIntelligenceService();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let alerts = await repo.getRetractionAlertsForSession(params.id);

    // If none recorded yet, scan session papers for retraction flags
    if (alerts.length === 0) {
      const papers = await repo.getPapersForSession(params.id);
      const claims = await repo.getClaimsForSession(params.id);
      const relationships = await repo.getRelationshipsForSession(params.id);
      const gaps = await repo.getGapsForSession(params.id);

      for (const p of papers) {
        const retCheck = retractionService.detectRetractionStatus(p);
        if (retCheck.isRetracted) {
          const impact = retractionService.propagateRetractionImpact(
            p,
            claims,
            relationships,
            gaps,
            retCheck.reason
          );
          await repo.saveRetractionAlert(impact.alert);
          alerts.push(impact.alert);
        }
      }
    }

    return NextResponse.json({ alerts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


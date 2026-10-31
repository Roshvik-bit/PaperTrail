import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { PreprintLineageService } from '@/lib/scholarly/preprint-lineage';

const repo = new PaperTrailRepository();
const lineageService = new PreprintLineageService();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let lineages = await repo.getLineagesForSession(params.id);

    // If none recorded yet, run pairwise detection across session papers
    if (lineages.length === 0) {
      const papers = await repo.getPapersForSession(params.id);
      for (let i = 0; i < papers.length; i++) {
        for (let j = i + 1; j < papers.length; j++) {
          const match = lineageService.matchPreprintToPublication(papers[i], papers[j]) ||
                        lineageService.matchPreprintToPublication(papers[j], papers[i]);
          if (match) {
            await repo.saveLineage(match);
            lineages.push(match);
          }
        }
      }
    }

    return NextResponse.json({ lineages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

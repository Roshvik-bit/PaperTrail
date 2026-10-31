import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { DatasetDiscoveryService } from '@/lib/scholarly/dataset-discovery';

const repo = new PaperTrailRepository();
const datasetService = new DatasetDiscoveryService();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let datasets = await repo.getDatasetsForSession(params.id);

    // If none yet, search datasets matching session question and link
    if (datasets.length === 0) {
      const session = await repo.getSession(params.id);
      const papers = await repo.getPapersForSession(params.id);
      const query = session ? session.research_question : 'small language models edge benchmark';

      const found = await datasetService.searchDatasets(query, 5);
      const connections = datasetService.connectDatasetsToPapers(papers, found);

      for (const ds of found) {
        const associated = connections.filter(c => c.dataset_id === ds.id).map(c => c.paper_id);
        ds.associated_paper_ids = associated;
        await repo.saveDataset(ds, associated[0]);
      }
      datasets = found;
    }

    return NextResponse.json({ datasets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';
import { Paper } from '@/types';

const repo = new PaperTrailRepository();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, title, abstract, raw_text, doi, arxiv_id, venue, year, authors } = body;

    if (!title || (!abstract && !raw_text)) {
      return NextResponse.json(
        { error: 'Paper title and either abstract or text are required.' },
        { status: 400 }
      );
    }

    const paper: Paper = {
      id: `manual_${Math.random().toString(36).substring(2, 9)}`,
      title,
      abstract: abstract || raw_text?.slice(0, 500) || '',
      raw_full_text: raw_text,
      doi,
      arxiv_id,
      venue: venue || 'Uploaded Document',
      year: year || new Date().getFullYear(),
      authors: Array.isArray(authors) ? authors : [{ name: 'Document Author' }],
      open_access_status: 'gold',
      full_text_status: raw_text ? 'extracted_text' : 'abstract_only',
      citation_count: 0,
      metadata: { source_provider: 'manual_upload' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await repo.savePaper(paper, session_id);

    return NextResponse.json({ success: true, paper }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


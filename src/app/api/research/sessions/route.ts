import { NextRequest, NextResponse } from 'next/server';
import { PaperTrailRepository } from '@/lib/db/repository';

const repo = new PaperTrailRepository();

export async function GET() {
  try {
    const sessions = await repo.listSessions();
    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, research_question, domain } = body;

    if (!research_question || typeof research_question !== 'string') {
      return NextResponse.json(
        { error: 'research_question is required' },
        { status: 400 }
      );
    }

    const sessionTitle = title || research_question.slice(0, 60);
    const session = await repo.createSession(sessionTitle, research_question, domain || 'edge_ai');

    return NextResponse.json({ session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


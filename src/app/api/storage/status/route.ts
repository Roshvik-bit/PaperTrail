import { NextResponse } from 'next/server';
import { getResearchRepository, SQLiteResearchRepository, PaperTrailRepository } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const defaultRepo = getResearchRepository();
  const status = await defaultRepo.getStorageStatus();

  // Also check local SQLite stats if primary is Supabase
  let sqliteInfo: any = null;
  try {
    const sqliteRepo = new SQLiteResearchRepository();
    sqliteInfo = await sqliteRepo.getStorageStatus();
  } catch {}

  return NextResponse.json({
    status: 200,
    current_storage: status,
    sqlite_available: sqliteInfo?.local_database_available || false,
    sqlite_path: sqliteInfo?.local_database_path,
    sqlite_size_bytes: sqliteInfo?.local_database_size_bytes || 0,
    sqlite_sessions_count: sqliteInfo?.active_sessions_count || 0,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getFilteredReadings, type ReadingFilters } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const filters: ReadingFilters = {};
  const search = searchParams.get('search');
  const spreadType = searchParams.get('spreadType');
  const topic = searchParams.get('topic');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  if (search) filters.search = search;
  if (spreadType) filters.spreadType = spreadType;
  if (topic) filters.topic = topic;
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;

  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  const { readings, total } = await getFilteredReadings(user.id, filters, offset, limit);

  return NextResponse.json({
    readings,
    total,
    hasMore: offset + readings.length < total,
  });
}

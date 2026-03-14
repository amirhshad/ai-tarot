import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getReading, setShareToken } from '@/lib/db/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const reading = await getReading(id, user.id);
  if (!reading) {
    return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
  }

  // Return existing share token if already shared
  if (reading.share_token) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.json({ shareUrl: `${baseUrl}/s/${reading.share_token}` });
  }

  // Generate a short, URL-safe token
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  await setShareToken(id, user.id, token);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return NextResponse.json({ shareUrl: `${baseUrl}/s/${token}` });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile, updateProfile } from '@/lib/db/queries';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const allowed: (keyof Awaited<Parameters<typeof updateProfile>[1]>)[] = ['display_name', 'language'];
  const updates: Record<string, string> = {};

  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length > 0) {
    await updateProfile(user.id, updates);
  }

  const profile = await getProfile(user.id);
  return NextResponse.json({ profile });
}

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { deleteReading } from '@/lib/db/queries';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteReading(params.id, user.id);
  return NextResponse.json({ ok: true });
}

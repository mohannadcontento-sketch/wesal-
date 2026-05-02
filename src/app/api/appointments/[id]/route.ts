import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'حالة غلط' }, { status: 400 });
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Appointment PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// GET /api/events/[id] — single event details (public)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await db.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: 'الفعالية مش موجودة' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Event GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// PUT /api/events/[id] — update event (admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'الفعالية مش موجودة' }, { status: 404 });
    }

    const event = await db.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl?.trim() || null }),
        ...(body.eventDate !== undefined && { eventDate: new Date(body.eventDate) }),
        ...(body.eventTime !== undefined && { eventTime: body.eventTime?.trim() || null }),
        ...(body.location !== undefined && { location: body.location?.trim() || null }),
        ...(body.category !== undefined && { category: body.category?.trim() || 'عام' }),
        ...(body.isWesal !== undefined && { isWesal: body.isWesal }),
        ...(body.registrationUrl !== undefined && { registrationUrl: body.registrationUrl?.trim() || null }),
        ...(body.status !== undefined && { status: body.status?.trim() || 'upcoming' }),
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Event PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// DELETE /api/events/[id] — delete event (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'الفعالية مش موجودة' }, { status: 404 });
    }

    await db.event.delete({ where: { id } });
    return NextResponse.json({ message: 'تم حذف الفعالية' });
  } catch (error) {
    console.error('Event DELETE error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

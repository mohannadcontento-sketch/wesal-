import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// GET /api/events — list all events (public)
// Also auto-cleans events older than 7 days and updates past event statuses
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    // ── Auto-maintenance (runs on every public fetch) ──

    // 1. Delete events older than 7 days past their date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await db.event.deleteMany({
      where: {
        eventDate: { lt: sevenDaysAgo },
        status: { in: ['completed', 'upcoming', 'ongoing'] },
      },
    });

    // 2. Mark events that have passed as "completed"
    const now = new Date();
    await db.event.updateMany({
      where: {
        eventDate: { lt: now },
        status: 'upcoming',
      },
      data: { status: 'completed' },
    });

    // ── Fetch visible events ──
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const events = await db.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/events — create event (admin only)
export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, imageUrl, eventDate, eventTime, location, category, isWesal, registrationUrl, status } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json({ error: 'العنوان والوصف والتاريخ مطلوبين' }, { status: 400 });
    }

    // Handle date safely - use UTC to avoid timezone shifts
    const [year, month, day] = eventDate.split('-').map(Number);
    const safeDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    const event = await db.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
        eventDate: safeDate,
        eventTime: eventTime?.trim() || null,
        location: location?.trim() || null,
        category: category?.trim() || 'عام',
        isWesal: isWesal !== false,
        registrationUrl: registrationUrl?.trim() || null,
        status: status?.trim() || 'upcoming',
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

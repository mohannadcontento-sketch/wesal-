import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// DELETE /api/chat/rooms/[roomId] - Delete a chat room and all its messages
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { roomId } = await params;
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      include: { appointment: true },
    });

    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    // Only room participants or admin can delete
    if (room.patientId !== user.id && room.doctorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Delete all messages first (cascade should handle this, but explicit is safer)
    await db.chatMessage.deleteMany({ where: { roomId } });

    // Delete the room
    await db.chatRoom.delete({ where: { id: roomId } });

    return NextResponse.json({ message: 'تم حذف المحادثة' });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// PATCH /api/chat/rooms/[roomId] - Close/reopen a chat room
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { roomId } = await params;
    const room = await db.chatRoom.findUnique({ where: { id: roomId } });

    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    // Only participants or admin can close/open
    if (room.patientId !== user.id && room.doctorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !['open', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 });
    }

    const updatedRoom = await db.chatRoom.update({
      where: { id: roomId },
      data: { status },
    });

    return NextResponse.json({
      message: status === 'closed' ? 'تم إغلاق المحادثة' : 'تم فتح المحادثة',
      status: updatedRoom.status,
    });
  } catch (error) {
    console.error('Patch room error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

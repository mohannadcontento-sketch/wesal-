'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface LastMessage {
  id: string;
  content: string | null;
  messageType: string;
  createdAt: string;
  senderId: string;
}

interface Room {
  id: string;
  otherUserId: string;
  otherName: string;
  otherAvatar: string | null;
  otherRole: string;
  otherSpecialty: string;
  isVerified: boolean;
  lastMessage: LastMessage | null;
  unreadCount: number;
  appointment: {
    id: string;
    appointmentDate: string;
    status: string;
    reason: string;
  } | null;
  status: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `${diffMins} د`;

  if (diffHours < 24 && date.getDate() === now.getDate()) {
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours === 0 ? 12 : hours > 12 ? hours - 12 : hours}:${mins} ${hours >= 12 ? 'م' : 'ص'}`;
  }

  if (diffDays < 7) return 'أمس';

  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) fetchRooms();
    else if (!user) setLoading(false);
  }, [user]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms');
      const data = await res.json();
      if (res.ok) setRooms(data.rooms || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const deleteRoom = async (roomId: string) => {
    setDeletingId(roomId);
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        toast.success('تم حذف المحادثة');
        setSelectedRoom(null);
      } else toast.error('مش قادر يحذف المحادثة');
    } catch { toast.error('حصل خطأ'); }
    finally { setDeletingId(null); }
  };

  const filteredRooms = search
    ? rooms.filter(r => r.otherName.includes(search) || (r.otherSpecialty && r.otherSpecialty.includes(search)))
    : rooms;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-wesal-cream">
        <header className="bg-primary text-on-primary px-4 pt-safe-top pb-3 shadow-md">
          <div className="flex items-center gap-3 h-12">
            <div className="w-10 h-10 bg-on-primary/20 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-on-primary/20 rounded w-24 mb-1.5" />
              <div className="h-3 bg-on-primary/10 rounded w-16" />
            </div>
          </div>
        </header>
        <div className="bg-surface-bright divide-y divide-surface-container">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-12 h-12 bg-surface-container rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container rounded w-1/3" />
                <div className="h-3 bg-surface-container-low rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-wesal-cream flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-primary">forum</span>
        </div>
        <p className="text-sm text-on-surface-variant">سجل دخول الأول عشان توصل للمحادثات</p>
        <Link href="/login" className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
          سجل دخول
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-wesal-cream">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-on-primary px-4 pt-safe-top pb-3 shadow-lg shadow-primary/10">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-on-primary">forum</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">المحادثات</h1>
              <p className="text-[11px] text-on-primary/70">{rooms.length} محادثة</p>
            </div>
          </div>
          <Link href="/doctors" className="p-2 hover:bg-on-primary/10 rounded-full transition-colors active:scale-90">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </Link>
        </div>
      </header>

      {/* Search */}
      <div className="bg-surface-bright px-3 py-2 shadow-sm sticky top-[60px] sm:top-[60px] z-20">
        <div className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2.5">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المحادثات..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/60"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-on-surface-variant hover:text-on-surface active:scale-90">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-surface-bright">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-primary">chat_bubble_outline</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">
              {search ? 'مفيش نتائج' : 'مفيش محادثات لسه'}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {search ? 'جرب تبحث باسم مختلف' : 'احجز موعد مع دكتور وابدأ محادثة'}
            </p>
            {!search && (
              <Link
                href="/doctors"
                className="mt-4 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                تصفح الأطباء
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-container-low">
            {filteredRooms.map((room) => {
              const isSentByMe = room.lastMessage?.senderId === user?.userId;

              const preview = room.lastMessage
                ? room.lastMessage.messageType === 'voice'
                  ? 'رسالة صوتية'
                  : room.lastMessage.content && room.lastMessage.content.length > 45
                    ? room.lastMessage.content.substring(0, 45) + '...'
                    : room.lastMessage.content || ''
                : '';

              return (
                <div key={room.id} className="relative group/room">
                  <Link
                    href={`/chat/${room.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low/50 transition-colors active:bg-surface-container-low"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <UserAvatar
                        avatarUrl={room.otherAvatar}
                        username={room.otherName}
                        size="lg"
                        className="!w-12 !h-12 sm:!w-[50px] sm:!h-[50px]"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-wesal-sky border-2 border-surface-bright rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[15px] font-bold text-on-surface truncate">
                            {room.otherName}
                          </span>
                          {room.otherRole === 'doctor' && room.isVerified && (
                            <span className="material-symbols-outlined text-wesal-sky text-sm filled">verified</span>
                          )}
                          {room.status === 'closed' && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">مقفلة</span>
                          )}
                        </div>
                        <span className="text-[11px] text-on-surface-variant shrink-0">
                          {room.lastMessage ? timeAgo(room.lastMessage.createdAt) : ''}
                        </span>
                      </div>

                      {room.otherSpecialty && (
                        <p className="text-[11px] text-primary-container-foreground mt-0.5 font-medium">{room.otherSpecialty}</p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center gap-1 min-w-0">
                          {room.lastMessage?.messageType === 'voice' && (
                            <span className="material-symbols-outlined text-on-surface-variant text-sm shrink-0">mic</span>
                          )}
                          <p className={`text-[13px] truncate ${isSentByMe ? 'text-on-surface-variant' : 'text-on-surface/70'}`}>
                            {preview}
                          </p>
                        </div>
                        {room.unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary rounded-full text-[10px] font-bold text-on-primary px-1.5">
                            {room.unreadCount > 9 ? '9+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron - desktop only */}
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-lg shrink-0 sm:block hidden">chevron_left</span>
                  </Link>

                  {/* Delete button - swipe hint icon on mobile, hover on desktop */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedRoom(room);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 left-1 z-10 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant/40 hover:text-error hover:bg-error-container transition-all active:scale-90 sm:opacity-0 sm:group-hover/room:opacity-100"
                    title="حذف المحادثة"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Bottom Sheet */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRoom(null)} />
          <div className="relative z-10 w-full max-w-lg bg-surface-bright rounded-t-2xl shadow-2xl animate-slide-up overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-surface-container-high" />
            </div>

            {/* Room info */}
            <div className="px-5 py-3 border-b border-surface-container">
              <p className="text-sm text-on-surface-variant font-medium mb-2">حذف محادثة</p>
              <div className="flex items-center gap-3">
                <UserAvatar
                  avatarUrl={selectedRoom.otherAvatar}
                  username={selectedRoom.otherName}
                  size="sm"
                  className="!w-10 !h-10"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{selectedRoom.otherName}</p>
                  <p className="text-[11px] text-on-surface-variant">المحادثة هتمسح نهائياً مع كل الرسائل</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => deleteRoom(selectedRoom.id)}
                disabled={deletingId === selectedRoom.id}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-error hover:bg-error-container rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                  {deletingId === selectedRoom.id ? (
                    <span className="material-symbols-outlined text-error text-xl animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-error text-xl">delete_forever</span>
                  )}
                </div>
                <span>حذف المحادثة</span>
              </button>
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-on-surface hover:bg-surface-container-low rounded-xl transition-colors active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
                </div>
                إلغاء
              </button>
            </div>

            {/* Safe area */}
            <div className="pb-safe-bottom" />
          </div>
        </div>
      )}

      {/* Bottom safe area */}
      <div className="pb-safe-bottom" />
    </div>
  );
}

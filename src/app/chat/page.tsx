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

  // Check if same day
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours === 0 ? 12 : hours > 12 ? hours - 12 : hours}:${mins} ${hours >= 12 ? 'م' : 'ص'}`;
  }

  if (diffDays < 7) return `أمس`;

  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
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
        setShowConfirm(null);
      } else toast.error('مش قادر يحذف المحادثة');
    } catch { toast.error('حصل خطأ'); }
    finally { setDeletingId(null); }
  };

  const filteredRooms = search
    ? rooms.filter(r => r.otherName.includes(search) || (r.otherSpecialty && r.otherSpecialty.includes(search)))
    : rooms;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-[#075E54] text-white px-4 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-white/20 rounded w-24 mb-1" />
              <div className="h-3 bg-white/10 rounded w-16" />
            </div>
          </div>
        </header>
        <div className="space-y-0 divide-y divide-gray-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#ECE5DD] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-[#075E54]">forum</span>
        </div>
        <p className="text-sm text-gray-500">سجل دخول الأول عشان توصل للمحادثات</p>
        <Link href="/login" className="mt-4 px-6 py-2.5 bg-[#25D366] text-white rounded-lg text-sm font-bold">
          سجل دخول
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE5DD]">

      {/* WhatsApp-style Header */}
      <header className="bg-[#075E54] text-white px-4 py-3 shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">forum</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">المحادثات</h1>
              <p className="text-[11px] text-green-200">{rooms.length} محادثة</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/doctors" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="الأطباء">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-3 py-2 shadow-sm sticky top-[56px] z-20">
        <div className="flex items-center gap-2 bg-[#F0F0F0] rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المحادثات..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#111B21] placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-white">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ECE5DD] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-[#075E54]">chat_bubble_outline</span>
            </div>
            <p className="text-sm font-medium text-[#111B21]">
              {search ? 'مفيش نتائج' : 'مفيش محادثات لسه'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'جرب تبحث باسم مختلف' : 'احجز موعد مع دكتور وابدأ محادثة'}
            </p>
            {!search && (
              <Link
                href="/doctors"
                className="mt-4 px-5 py-2 bg-[#25D366] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#1EBE5A] transition-colors"
              >
                تصفح الأطباء
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredRooms.map((room) => {
              const isSentByMe = room.lastMessage?.senderId === user?.userId;
              const isConfirming = showConfirm === room.id;

              const preview = room.lastMessage
                ? room.lastMessage.messageType === 'voice'
                  ? 'رسالة صوتية'
                  : room.lastMessage.content && room.lastMessage.content.length > 45
                    ? room.lastMessage.content.substring(0, 45) + '...'
                    : room.lastMessage.content || ''
                : '';

              return (
                <div key={room.id} className="relative group">
                  <Link
                    href={`/chat/${room.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <UserAvatar
                        avatarUrl={room.otherAvatar}
                        username={room.otherName}
                        size="lg"
                        className="!w-[50px] !h-[50px]"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[15px] font-semibold text-[#111B21] truncate">
                            {room.otherName}
                          </span>
                          {room.otherRole === 'doctor' && room.isVerified && (
                            <span className="material-symbols-outlined text-[#25D366] text-sm filled">verified</span>
                          )}
                          {room.status === 'closed' && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">مقفلة</span>
                          )}
                        </div>
                        {room.lastMessage && (
                          <span className="text-[11px] text-gray-500 shrink-0">
                            {timeAgo(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {room.otherSpecialty && (
                        <p className="text-[11px] text-[#25D366] mt-0.5 font-medium">{room.otherSpecialty}</p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="flex items-center gap-1 min-w-0">
                          {room.lastMessage?.messageType === 'voice' && (
                            <span className="material-symbols-outlined text-gray-400 text-sm shrink-0">mic</span>
                          )}
                          <p className={`text-[13px] truncate ${isSentByMe ? 'text-gray-500' : 'text-gray-600'}`}>
                            {preview}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {room.unreadCount > 0 && (
                            <span className="min-w-[20px] h-5 flex items-center justify-center bg-[#25D366] rounded-full text-[10px] font-bold text-white px-1.5">
                              {room.unreadCount > 9 ? '9+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isConfirming) {
                        deleteRoom(room.id);
                      } else {
                        setShowConfirm(room.id);
                        setTimeout(() => setShowConfirm(null), 3000);
                      }
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 left-2 z-10 p-1.5 rounded-full shadow-md transition-all active:scale-90 ${
                      isConfirming
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white text-gray-400 hover:text-red-500 border border-gray-200 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isConfirming ? 'اضغط مرة تانية للحذف' : 'حذف'}
                  >
                    {deletingId === room.id ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    ) : isConfirming ? (
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom safe area spacer for mobile */}
      <div className="h-safe-bottom" />
    </div>
  );
}

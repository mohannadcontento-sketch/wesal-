'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
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
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'pending':
      return { label: 'في انتظار التأكيد', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    case 'confirmed':
      return { label: 'جلسة مؤكدة', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'completed':
      return { label: 'مكتمل', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'cancelled':
      return { label: 'ملغي', color: 'text-red-600 bg-red-50 border-red-200' };
    default:
      return { label: '', color: '' };
  }
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRooms();
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms');
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wesal-cream pt-14 pb-24 md:pb-8 md:pr-[272px]">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl">
                <div className="w-12 h-12 bg-wesal-ice rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-wesal-ice rounded w-1/3" />
                  <div className="h-3 bg-wesal-ice rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-wesal-cream pt-14 pb-24 md:pb-8 md:pr-[272px]">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-wesal-ice">
              <span className="material-symbols-outlined text-3xl text-wesal-dark">lock</span>
            </div>
            <p className="text-sm text-wesal-medium">سجل دخول الأول عشان توصل للمحادثات</p>
            <Link href="/login" className="mt-4 px-6 py-2 bg-wesal-dark text-white rounded-xl text-sm font-bold">
              سجل دخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wesal-cream pt-14 pb-24 md:pb-8 md:pr-[272px]">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-wesal-navy">المحادثات</h1>
          <p className="text-sm text-wesal-medium mt-1">محادثاتك المحفوظة مع الأطباء</p>
        </div>

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-wesal-ice">
              <span className="material-symbols-outlined text-4xl text-wesal-dark">forum</span>
            </div>
            <p className="text-base font-medium text-wesal-navy">مفيش محادثات لسه</p>
            <p className="text-sm text-wesal-medium mt-1">احجز موعد مع دكتور وابدأ محادثة</p>
            <Link
              href="/doctors"
              className="mt-4 px-6 py-2.5 bg-wesal-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-wesal-dark/20 hover:bg-wesal-navy transition-all"
            >
              تصفح الأطباء
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => {
              const statusInfo = room.appointment ? getStatusLabel(room.appointment.status) : null;
              const preview = room.lastMessage
                ? room.lastMessage.messageType === 'voice'
                  ? 'رسالة صوتية'
                  : room.lastMessage.content && room.lastMessage.content.length > 40
                    ? room.lastMessage.content.substring(0, 40) + '...'
                    : room.lastMessage.content || ''
                : 'ابدأ المحادثة...';

              const isSentByMe = room.lastMessage?.senderId === user?.userId;

              return (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-wesal-ice/50 hover:border-wesal-dark/20 hover:shadow-md transition-all group active:scale-[0.98]"
                >
                  {/* Avatar with online indicator */}
                  <div className="relative shrink-0">
                    <UserAvatar
                      avatarUrl={room.otherAvatar}
                      username={room.otherName}
                      size="lg"
                      className="!w-12 !h-12"
                    />
                    {statusInfo && room.appointment?.status === 'confirmed' && (
                      <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-wesal-navy truncate">
                          {room.otherName}
                        </span>
                        {room.otherRole === 'doctor' && room.isVerified && (
                          <span className="material-symbols-outlined text-blue-500 text-sm filled">verified</span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <span className="text-[11px] text-wesal-medium shrink-0">
                          {timeAgo(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {room.otherSpecialty && (
                      <p className="text-[11px] text-wesal-medium mt-0.5">{room.otherSpecialty}</p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-1 min-w-0">
                        {room.lastMessage?.messageType === 'voice' && (
                          <span className="material-symbols-outlined text-wesal-medium text-sm shrink-0">mic</span>
                        )}
                        <p className={`text-xs truncate ${isSentByMe ? 'text-wesal-dark/60' : 'text-wesal-medium'}`}>
                          {room.lastMessage?.messageType === 'voice' ? 'رسالة صوتية' : preview}
                        </p>
                      </div>
                      {room.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center bg-wesal-dark rounded-full text-[10px] font-bold text-white px-1.5">
                          {room.unreadCount > 9 ? '9+' : room.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    {statusInfo && statusInfo.label && (
                      <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>

                  {/* Arrow - use simple SVG instead of material icon for reliability */}
                  <svg className="w-4 h-4 text-wesal-medium/30 group-hover:text-wesal-dark transition-colors shrink-0 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface SupporterDetail {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  specialty: string;
  experience: string | null;
  certificates: string[];
  rating: number;
  totalSessions: number;
  available: boolean;
}

export default function SupporterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  const [supporter, setSupporter] = useState<SupporterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingBooking, setExistingBooking] = useState(false);

  useEffect(() => {
    fetch(`/api/supporters/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setSupporter(data);
        else toast.error(data.error || 'الداعم مش موجود');
        setLoading(false);
      })
      .catch(() => { toast.error('حصل خطأ'); setLoading(false); });

    // Check if user has existing booking
    if (user) {
      fetch('/api/supporters/bookings')
        .then(r => r.json())
        .then(data => {
          const active = (data.bookings || []).find(
            (b: { status: string }) => b.status === 'upcoming' || b.status === 'active'
          );
          if (active) setExistingBooking(true);
        })
        .catch(() => {});
    }
  }, [id, user]);

  // Min date: 8 hours from now
  const minDate = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const minDateStr = minDate.toISOString().slice(0, 10);
  const minTime = minDate.getHours().toString().padStart(2, '0') + ':' + minDate.getMinutes().toString().padStart(2, '0');

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('سجل دخول الأول'); router.push('/login'); return; }
    if (!date) { toast.error('اختار التاريخ'); return; }
    if (!time) { toast.error('اختار الوقت'); return; }

    // Validate 8 hours minimum
    const sessionDate = new Date(`${date}T${time}:00`);
    const now = new Date();
    if (sessionDate.getTime() - now.getTime() < 8 * 60 * 60 * 1000) {
      toast.error('لازم تحجز قبل 8 ساعات على الأقل');
      return;
    }

    setBooking(true);
    try {
      const res = await fetch(`/api/supporters/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate: sessionDate.toISOString(),
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success('تم الحجز بنجاح!');
        setTimeout(() => {
          if (data.booking?.chatRoomId) router.push(`/chat/${data.booking.chatRoomId}`);
        }, 2000);
      } else {
        toast.error(data.error || 'مش قادر يحجز');
      }
    } catch { toast.error('حصل خطأ'); }
    finally { setBooking(false); }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-24 rounded-lg bg-wesal-ice/60" />
            <div className="bg-white/70 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-wesal-ice/60" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 rounded-lg bg-wesal-ice/60" />
                  <div className="h-4 w-28 rounded-lg bg-wesal-ice/60" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded-lg bg-wesal-ice/60" />
                <div className="h-4 w-3/4 rounded-lg bg-wesal-ice/60" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!supporter) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-wesal-medium mb-4">person_off</span>
          <p className="text-lg font-bold text-wesal-navy">الداعم مش موجود</p>
          <Link href="/supporters" className="mt-4 inline-block px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold">
            رجع للداعمين
          </Link>
        </div>
      </MainLayout>
    );
  }

  const renderStars = (r: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-symbols-outlined text-lg ${i <= Math.round(r) ? 'filled text-amber-500' : 'text-amber-500/30'}`}>star</span>
      );
    }
    return stars;
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/supporters" className="inline-flex items-center justify-center rounded-full hover:bg-surface-container p-2 mb-6 transition-colors text-primary">
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,67,70,0.05)] mb-6">
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-l from-primary via-wesal-medium to-wesal-sky relative">
            <div className="absolute -bottom-10 right-6">
              <div className="relative">
                <UserAvatar avatarUrl={supporter.avatarUrl} username={supporter.name} size="xl" className="!w-20 !h-20 ring-4 ring-white" />
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-on-surface">{supporter.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">داعم معتمد</span>
                </div>
                <p className="text-sm text-primary-container font-medium">{supporter.specialty}</p>
                <div className="flex items-center gap-3 mt-2">
                  {supporter.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex">{renderStars(supporter.rating)}</div>
                      <span className="text-xs text-on-surface-variant font-medium">{supporter.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {supporter.totalSessions > 0 && (
                    <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>people</span>
                      {supporter.totalSessions} جلسة
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {supporter.bio && (
              <div className="mb-5">
                <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">description</span>
                  نبذة
                </h3>
                <p className="text-sm text-on-surface/80 leading-relaxed">{supporter.bio}</p>
              </div>
            )}

            {/* Experience */}
            {supporter.experience && (
              <div className="mb-5">
                <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">work</span>
                  الخبرة
                </h3>
                <p className="text-sm text-on-surface/80 leading-relaxed">{supporter.experience}</p>
              </div>
            )}

            {/* Certificates */}
            {supporter.certificates && supporter.certificates.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">workspace_premium</span>
                  الشهادات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supporter.certificates.map((cert, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-container/60 text-primary-container text-xs font-medium">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified</span>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Section */}
        {!success ? (
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,67,70,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-wesal-sky flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary">event_available</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-sm">احجز جلسة دعم</h3>
                <p className="text-xs text-on-surface-variant">الجلسات عبر الشات — لازم تحجز قبل 8 ساعات</p>
              </div>
            </div>

            {existingBooking ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-amber-500 mb-3">event_busy</span>
                <p className="text-sm font-bold text-on-surface">لديك حجز مع داعم بالفعل</p>
                <p className="text-xs text-on-surface-variant mt-1">لازم تخلص حجلك الحالي قبل ما تحجز تاني</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-5">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={minDateStr}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl text-base text-on-surface p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={time}
                    min={date === minDateStr ? minTime : undefined}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl text-base text-on-surface p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface flex items-center justify-between">
                    <span>ملاحظات (اختياري)</span>
                    <span className="text-on-surface-variant font-normal text-xs">{notes.length}/300</span>
                  </label>
                  <textarea
                    placeholder="اكتب أي ملاحظات للداعم..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={300}
                    className="w-full min-h-[100px] bg-surface-container-low border border-outline-variant rounded-xl text-base p-3 resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all leading-relaxed"
                  />
                </div>

                {/* Important notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">warning</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    الداعم مش طبيب. دوره الاستماع والدعم النفسي الأولي فقط. لو عندك حالة صحية يبقى تتوجه لطبيب متخصص.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={booking || !date || !time}
                  className="w-full py-3 rounded-xl bg-gradient-to-l from-primary to-wesal-sky text-on-primary font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      جاري الحجز...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">event_available</span>
                      تأكيد الحجز
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-8 text-center shadow-[0_8px_32px_0_rgba(0,67,70,0.05)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed/20">
              <span className="material-symbols-outlined text-4xl text-primary-container filled">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">تم الحجز بنجاح!</h3>
            <p className="text-sm text-on-surface-variant mt-2">هيتحولك على الشات دلوقتي...</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

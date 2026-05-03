'use client';

import { useState, useEffect, use } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BookDoctorPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const { doctorId } = use(params);
  const [doctor, setDoctor] = useState<{
    realName: string;
    specialty: string;
    rating?: number;
    location?: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
  } | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);
  const minDateStr = minDate.toISOString().slice(0, 10);

  useEffect(() => {
    if (doctorId) {
      fetch('/api/doctors').then(r => r.json()).then(data => {
        const doc = (data.doctors || []).find(
          (d: { id: string; profile?: { realName: string; specialty: string; rating?: number; location?: string; avatarUrl?: string | null; isVerified?: boolean } }) =>
            d.id === doctorId
        );
        if (doc?.profile) setDoctor(doc.profile);
      });
    }
  }, [doctorId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('سجل دخول الأول'); return; }
    if (!date) { toast.error('اختار التاريخ'); return; }
    if (!time) { toast.error('اختار الوقت'); return; }
    if (!reason.trim()) { toast.error('اكتب سبب الزيارة'); return; }

    setLoading(true);
    try {
      const appointmentDate = `${date}T${time}:00`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, appointmentDate, reason: reason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success('تم الحجز بنجاح!');
        setTimeout(() => {
          router.push(`/chat/${data.chatRoom.id}`);
        }, 2000);
      } else {
        toast.error(data.error || 'حصل خطأ في الحجز');
      }
    } catch {
      toast.error('حصل خطأ، جرب تاني');
    } finally {
      setLoading(false);
    }
  };

  const displayName = doctor?.realName || 'طبيب';
  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('');

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto">
        {/* Back Navigation */}
        <Link href="/doctors" className="inline-flex items-center justify-center rounded-full hover:bg-surface-container p-2 mb-6 transition-colors text-primary">
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </Link>

        {/* Doctor Info Card */}
        {doctor && (
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-5 mb-6 shadow-[0_8px_32px_0_rgba(0,67,70,0.05)]">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {doctor.avatarUrl ? (
                  <img
                    alt={displayName}
                    src={doctor.avatarUrl}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary-fixed shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center border-2 border-primary-fixed shadow-sm">
                    <span className="text-lg font-bold text-on-primary-fixed">{initials}</span>
                  </div>
                )}
                {doctor.isVerified && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-bold text-on-surface truncate text-sm">{displayName}</h2>
                  {doctor.isVerified && (
                    <span className="material-symbols-outlined filled text-primary-container text-sm">verified</span>
                  )}
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-primary text-on-primary text-xs font-medium">
                  {doctor.specialty}
                </span>
                {doctor.rating != null && doctor.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="material-symbols-outlined filled text-amber-500 text-sm">star</span>
                    <span className="text-sm text-on-surface-variant font-medium">
                      {doctor.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        {!success ? (
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,67,70,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tertiary-fixed to-primary-container flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary">stethoscope</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-sm">احجز موعد</h3>
                <p className="text-xs text-on-surface-variant">اختر الوقت المناسب لك</p>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-5">
              {/* Preferred Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-lg">calendar_today</span>
                  التاريخ المفضل
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

              {/* Preferred Time */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-lg">schedule</span>
                  الوقت المفضل
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl text-base text-on-surface p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Reason for Visit */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface flex items-center justify-between">
                  <span>سبب الزيارة</span>
                  <span className="text-on-surface-variant font-normal text-xs">
                    {reason.length}/500
                  </span>
                </label>
                <textarea
                  placeholder="اكتب سبب الحجز بالتفصيل عشان الدكتور يقدر يساعدك أحسن..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  maxLength={500}
                  className="w-full min-h-[120px] bg-surface-container-low border border-outline-variant rounded-xl text-base p-3 resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !date || !time || !reason.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-primary to-primary-container text-on-primary font-bold text-sm shadow-md hover:shadow-lg hover:from-primary-container hover:to-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
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

              <p className="text-center text-xs text-on-surface-variant">
                بالحجز، بتوافق على الشروط والأحكام
              </p>
            </form>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-8 text-center shadow-[0_8px_32px_0_rgba(0,67,70,0.05)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed/20">
              <span className="material-symbols-outlined text-4xl text-primary-container filled">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">
              تم الحجز بنجاح!
            </h3>
            <p className="text-sm text-on-surface-variant mt-2">
              هيتحولك على شات الدكتور دلوقتي...
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

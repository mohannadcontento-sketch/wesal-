'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  Star,
  MapPin,
  BadgeCheck,
} from 'lucide-react';
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
      <div className="px-4 sm:px-6 py-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Back Navigation */}
          <Link
            href="/doctors"
            className="btn btn-ghost btn-icon-sm mb-4"
          >
            <ArrowRight className="size-5" />
          </Link>

          {/* Doctor Info Card */}
          {doctor && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5 mb-6"
            >
              <div className="flex items-center gap-4">
                {doctor.avatarUrl ? (
                  <div className="avatar avatar-lg shrink-0 ring-2 ring-primary-light">
                    <img
                      src={doctor.avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className="avatar avatar-lg shrink-0 ring-2 ring-primary-light">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-h4 text-foreground font-heading truncate">
                      {displayName}
                    </h2>
                    {doctor.isVerified && (
                      <BadgeCheck className="size-5 text-success shrink-0" />
                    )}
                  </div>
                  <span className="badge badge-primary text-caption">
                    {doctor.specialty}
                  </span>
                  {doctor.rating != null && doctor.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="size-3.5 fill-warm text-warm" />
                      <span className="text-body-sm text-text-secondary font-medium">
                        {doctor.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Booking Form */}
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: 0.15 }}
                className="card p-5 sm:p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Stethoscope className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-h4 text-foreground font-heading">احجز موعد</h3>
                    <p className="text-caption text-muted-foreground">
                      اختر الوقت المناسب لك
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBook} className="space-y-5">
                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <label className="text-body-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="size-4 text-primary" />
                      التاريخ المفضل
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={minDateStr}
                      onChange={(e) => setDate(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  {/* Preferred Time */}
                  <div className="space-y-2">
                    <label className="text-body-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="size-4 text-primary" />
                      الوقت المفضل
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="input"
                      required
                    />
                  </div>

                  {/* Reason for Visit */}
                  <div className="space-y-2">
                    <label className="text-body-sm font-semibold text-foreground flex items-center justify-between">
                      <span>سبب الزيارة</span>
                      <span className="text-text-tertiary font-normal text-caption">
                        {reason.length}/500
                      </span>
                    </label>
                    <textarea
                      placeholder="اكتب سبب الحجز بالتفصيل عشان الدكتور يقدر يساعدك أحسن..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      maxLength={500}
                      className="input min-h-[120px] py-3 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={loading || !date || !time || !reason.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        جاري الحجز...
                      </>
                    ) : (
                      'تأكيد الحجز'
                    )}
                  </button>

                  <p className="text-center text-caption text-text-tertiary">
                    بالحجز، بتوافق على الشروط والأحكام
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-light"
                >
                  <CheckCircle className="size-10 text-success" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-h3 text-foreground font-heading"
                >
                  تم الحجز بنجاح!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="text-body-sm text-muted-foreground mt-2"
                >
                  هيتحولك على شات الدكتور دلوقتي...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MainLayout>
  );
}

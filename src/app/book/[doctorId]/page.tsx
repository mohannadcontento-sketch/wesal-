'use client';

import { useState, useEffect, use } from 'react';
import {
  ArrowRight,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  Star,
  BadgeCheck,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
        {/* Back Navigation */}
        <Link href="/doctors" className="inline-flex items-center justify-center rounded-md hover:bg-gray-100 p-2 mb-4 transition-colors">
          <ArrowRight className="size-5 text-gray-600" />
        </Link>

        {/* Doctor Info Card */}
        {doctor && (
          <Card className="rounded-xl shadow-sm border-gray-100 p-0 mb-6">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 shrink-0 ring-2 ring-teal-100">
                  {doctor.avatarUrl && <AvatarImage src={doctor.avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-teal-50 text-teal-700 font-bold text-base">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-bold text-gray-900 truncate text-sm">
                      {displayName}
                    </h2>
                    {doctor.isVerified && (
                      <BadgeCheck className="size-5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <Badge className="bg-teal-600 text-white hover:bg-teal-600 text-xs">
                    {doctor.specialty}
                  </Badge>
                  {doctor.rating != null && doctor.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-gray-500 font-medium">
                        {doctor.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Form / Success */}
        {!success ? (
          <Card className="rounded-xl shadow-sm border-gray-100 p-0">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Stethoscope className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">احجز موعد</h3>
                  <p className="text-xs text-gray-500">
                    اختر الوقت المناسب لك
                  </p>
                </div>
              </div>

              <form onSubmit={handleBook} className="space-y-5">
                {/* Preferred Date */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Calendar className="size-4 text-teal-600" />
                    التاريخ المفضل
                  </label>
                  <Input
                    type="date"
                    value={date}
                    min={minDateStr}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Clock className="size-4 text-teal-600" />
                    الوقت المفضل
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                {/* Reason for Visit */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                    <span>سبب الزيارة</span>
                    <span className="text-gray-400 font-normal text-xs">
                      {reason.length}/500
                    </span>
                  </label>
                  <Textarea
                    placeholder="اكتب سبب الحجز بالتفصيل عشان الدكتور يقدر يساعدك أحسن..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    maxLength={500}
                    className="min-h-[120px] py-3 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white h-11 text-sm font-semibold disabled:opacity-50"
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
                </Button>

                <p className="text-center text-xs text-gray-400">
                  بالحجز، بتوافق على الشروط والأحكام
                </p>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-xl shadow-sm border-gray-100 p-0">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="size-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                تم الحجز بنجاح!
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                هيتحولك على شات الدكتور دلوقتي...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

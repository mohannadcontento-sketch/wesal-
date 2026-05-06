'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  category: string;
  isWesal: boolean;
  registrationUrl: string | null;
  status: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('ar-EG', options);
}

function getCategoryIcon(cat: string): string {
  switch (cat) {
    case 'ورشة عمل': return 'work';
    case 'ندوة': return 'record_voice_over';
    case 'مؤتمر': return 'groups';
    case 'دعم نفسي': return 'favorite';
    case 'توعية': return 'campaign';
    case 'ويبنار': return 'videocam';
    default: return 'event';
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  const period = hours >= 12 ? 'مساءً' : 'صباحاً';
  return `${h}:${m} ${period}`;
}

function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'upcoming': return { label: 'قادمة', color: 'bg-emerald-100 text-emerald-700' };
    case 'ongoing': return { label: 'جارية الآن', color: 'bg-blue-100 text-blue-700' };
    case 'completed': return { label: 'منتهية', color: 'bg-gray-100 text-gray-500' };
    case 'cancelled': return { label: 'ملغاة', color: 'bg-red-100 text-red-600' };
    default: return { label: status, color: 'bg-gray-100 text-gray-500' };
  }
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setEvent(data.event))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-56 bg-wesal-ice/50 rounded-2xl mb-6" />
            <div className="h-6 bg-wesal-ice/50 rounded w-2/3 mb-3" />
            <div className="h-4 bg-wesal-ice/50 rounded w-1/3 mb-6" />
            <div className="h-4 bg-wesal-ice/50 rounded w-full mb-2" />
            <div className="h-4 bg-wesal-ice/50 rounded w-full mb-2" />
            <div className="h-4 bg-wesal-ice/50 rounded w-3/4" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-wesal-ice/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-wesal-medium">event_busy</span>
          </div>
          <h2 className="text-xl font-bold text-wesal-navy mb-2">الفعالية مش موجودة</h2>
          <p className="text-sm text-wesal-medium mb-6">الفعالية اللي بتدور عليها مش موجودة أو اتحذفت</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-wesal-dark text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            الرجوع للفعاليات
          </Link>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = getStatusLabel(event.status);
  const isUpcoming = new Date(event.eventDate) >= new Date();

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <ScrollReveal>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-wesal-medium hover:text-wesal-dark transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            رجوع
          </button>
        </ScrollReveal>

        {/* Hero Image */}
        <ScrollReveal delay={50}>
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6 shadow-lg">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-hero flex items-center justify-center">
                <span className="material-symbols-outlined text-[100px] text-white/20">
                  {getCategoryIcon(event.category)}
                </span>
              </div>
            )}

            {/* Overlay with status */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Title & Category */}
        <ScrollReveal delay={100}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-wesal-sky text-xl">{getCategoryIcon(event.category)}</span>
              <span className="text-sm text-wesal-medium font-medium">{event.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-wesal-navy leading-tight">{event.title}</h1>
          </div>
        </ScrollReveal>

        {/* Info Cards */}
        <ScrollReveal delay={150}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-xl border border-wesal-ice/60 p-3.5 text-center">
              <span className="material-symbols-outlined text-wesal-sky text-xl mb-1 block">calendar_today</span>
              <div className="text-xs text-wesal-medium mb-0.5">التاريخ</div>
              <div className="text-sm font-semibold text-wesal-navy">{formatDate(event.eventDate)}</div>
            </div>
            <div className="bg-white rounded-xl border border-wesal-ice/60 p-3.5 text-center">
              <span className="material-symbols-outlined text-wesal-sky text-xl mb-1 block">schedule</span>
              <div className="text-xs text-wesal-medium mb-0.5">الوقت</div>
              <div className="text-sm font-semibold text-wesal-navy">{event.eventTime ? formatTime(event.eventTime) : 'سيحدد لاحقاً'}</div>
            </div>
            <div className="bg-white rounded-xl border border-wesal-ice/60 p-3.5 text-center">
              <span className="material-symbols-outlined text-wesal-sky text-xl mb-1 block">location_on</span>
              <div className="text-xs text-wesal-medium mb-0.5">المكان</div>
              <div className="text-sm font-semibold text-wesal-navy">{event.location || 'أونلاين'}</div>
            </div>
            <div className="bg-white rounded-xl border border-wesal-ice/60 p-3.5 text-center">
              <span className="material-symbols-outlined text-wesal-sky text-xl mb-1 block">category</span>
              <div className="text-xs text-wesal-medium mb-0.5">النوع</div>
              <div className="text-sm font-semibold text-wesal-navy">{event.category}</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Description */}
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl border border-wesal-ice/60 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-wesal-navy mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-wesal-dark text-xl">description</span>
              تفاصيل الفعالية
            </h2>
            <div className="text-sm text-wesal-navy/80 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </div>
          </div>
        </ScrollReveal>

        {/* Action Buttons */}
        <ScrollReveal delay={250}>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Registration Button - opens the registration link */}
            {event.registrationUrl && isUpcoming && event.status === 'upcoming' && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-wesal-dark text-white rounded-xl font-medium shadow-lg shadow-wesal-dark/20 hover:bg-wesal-dark/90 hover:shadow-xl transition-all text-sm"
              >
                <span className="material-symbols-outlined text-xl">how_to_reg</span>
                سجّل في الفعالية
              </a>
            )}

            {/* No registration link - show coming soon */}
            {!event.registrationUrl && isUpcoming && event.status === 'upcoming' && (
              <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-200 text-gray-500 rounded-xl font-medium text-sm">
                <span className="material-symbols-outlined text-xl">event_available</span>
                التسجيل سيفتح قريباً
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('تم نسخ رابط الفعالية!');
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-wesal-dark border border-wesal-ice rounded-xl font-medium hover:bg-wesal-ice/30 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-xl">share</span>
              شارك الفعالية
            </button>
          </div>
        </ScrollReveal>

        {/* Past Event Notice */}
        {!isUpcoming && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3 mb-8">
            <span className="material-symbols-outlined text-gray-500 text-xl mt-0.5">history</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">فعالية منتهية</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                هذه الفعالية انتهت بالفعل. يمكنك تصفح الفعاليات القادمة من صفحة الفعاليات.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-xs font-medium text-wesal-dark mt-2 hover:underline"
              >
                تصفح الفعاليات القادمة
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

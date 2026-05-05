'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

interface EventItem {
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

const CATEGORIES = ['الكل', 'عام', 'ورشة عمل', 'ندوة', 'مؤتمر', 'دعم نفسي', 'توعية', 'ويبنار'];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date();
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

function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'upcoming': return { label: 'قادمة', color: 'bg-emerald-100 text-emerald-700' };
    case 'ongoing': return { label: 'جارية الآن', color: 'bg-blue-100 text-blue-700' };
    case 'completed': return { label: 'منتهية', color: 'bg-gray-100 text-gray-500' };
    case 'cancelled': return { label: 'ملغاة', color: 'bg-red-100 text-red-600' };
    default: return { label: status, color: 'bg-gray-100 text-gray-500' };
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    if (activeCategory !== 'الكل' && e.category !== activeCategory) return false;
    if (filter === 'upcoming') return isUpcoming(e.eventDate);
    if (filter === 'past') return !isUpcoming(e.eventDate);
    return true;
  });

  const upcomingCount = events.filter((e) => isUpcoming(e.eventDate)).length;
  const pastCount = events.filter((e) => !isUpcoming(e.eventDate)).length;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined filled text-wesal-dark text-3xl">event</span>
              <h1 className="text-3xl font-bold text-wesal-navy">الفعاليات</h1>
            </div>
            <p className="text-wesal-medium text-sm mt-1">
              اكتشف فعاليات وأنشطة الصحة النفسية — ورش عمل، ندوات، ودعم نفسي
            </p>
          </div>
        </ScrollReveal>

        {/* Hero Banner */}
        <ScrollReveal delay={100}>
          <div className="relative rounded-3xl overflow-hidden mb-8 gradient-hero p-8 text-white">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">فعاليات مميزة بانتظارك</h2>
              <p className="text-white/80 text-sm mb-4">
                شارك في فعاليات تثري معلوماتك وتحسن صحتك النفسية
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                  <span className="material-symbols-outlined text-lg">event_available</span>
                  <span>{upcomingCount} فعالية قادمة</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                  <span className="material-symbols-outlined text-lg">history</span>
                  <span>{pastCount} فعالية سابقة</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <span className="material-symbols-outlined absolute top-4 left-4 text-[120px]">psychology</span>
              <span className="material-symbols-outlined absolute bottom-4 left-32 text-[80px]">self_improvement</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Filter Tabs */}
        <ScrollReveal delay={150}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'upcoming', label: 'القادمة' },
              { key: 'past', label: 'السابقة' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'past')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-wesal-dark text-white shadow-md'
                    : 'bg-white text-wesal-medium hover:bg-wesal-ice border border-wesal-ice'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Category Chips */}
        <ScrollReveal delay={200}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeCategory === cat
                    ? 'bg-wesal-sky text-white shadow-sm'
                    : 'bg-white text-wesal-medium hover:bg-wesal-ice border border-wesal-ice/60'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{getCategoryIcon(cat)}</span>
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-wesal-ice/50 p-4 animate-pulse">
                <div className="h-40 bg-wesal-ice/50 rounded-xl mb-4" />
                <div className="h-4 bg-wesal-ice/50 rounded w-3/4 mb-2" />
                <div className="h-3 bg-wesal-ice/50 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-wesal-ice/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-wesal-medium">event_busy</span>
            </div>
            <h3 className="text-lg font-semibold text-wesal-navy mb-1">مفيش فعاليات</h3>
            <p className="text-sm text-wesal-medium">مفيش فعاليات في التصنيف ده حالياً، رجع تاني بعدين</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((event, index) => {
              const statusInfo = getStatusLabel(event.status);
              const upcoming = isUpcoming(event.eventDate);

              return (
                <ScrollReveal key={event.id} delay={index * 80}>
                  <Link href={`/events/${event.id}`}>
                    <div className="group bg-white rounded-2xl border border-wesal-ice/60 shadow-sm hover:shadow-lg hover:border-wesal-sky/40 transition-all duration-300 overflow-hidden cursor-pointer">
                      {/* Image or Gradient Placeholder */}
                      <div className="relative h-44 overflow-hidden">
                        {event.imageUrl ? (
                          <Image
                            src={event.imageUrl.startsWith('http') ? event.imageUrl : event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full gradient-warm flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-wesal-dark/20">
                              {getCategoryIcon(event.category)}
                            </span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Wesal Badge */}
                        {event.isWesal && (
                          <div className="absolute top-3 left-3">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-wesal-dark/90 text-white flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              وصال
                            </span>
                          </div>
                        )}

                        {/* Date Overlay */}
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-sm">
                          <div className="text-lg font-bold text-wesal-dark leading-tight">
                            {new Date(event.eventDate).getDate()}
                          </div>
                          <div className="text-[10px] text-wesal-medium font-medium">
                            {new Date(event.eventDate).toLocaleDateString('ar-EG', { month: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="material-symbols-outlined text-wesal-sky text-lg mt-0.5">
                            {getCategoryIcon(event.category)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-wesal-navy text-[15px] group-hover:text-wesal-dark transition-colors line-clamp-1">
                              {event.title}
                            </h3>
                            <span className="text-xs text-wesal-medium">{event.category}</span>
                          </div>
                        </div>

                        <p className="text-sm text-wesal-medium/80 line-clamp-2 mb-3 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-3 text-xs text-wesal-medium">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          {event.eventTime && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              <span>{event.eventTime}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">location_on</span>
                              <span className="line-clamp-1 max-w-[120px]">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Registration Indicator */}
                        {!event.isWesal && event.registrationUrl && upcoming && (
                          <div className="mt-3 pt-3 border-t border-wesal-ice/40 flex items-center gap-1 text-xs text-wesal-dark font-medium">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            <span>زر التسجيل متاح</span>
                            <span className="material-symbols-outlined text-sm mr-auto">arrow_back</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

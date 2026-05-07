'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

interface EventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  category: string;
  registrationUrl: string | null;
  status: string;
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

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  const period = hours >= 12 ? 'مساءً' : 'صباحاً';
  return `${h}:${m} ${period}`;
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date();
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'ورشة عمل': return 'bg-amber-100 text-amber-700';
    case 'ندوة': return 'bg-purple-100 text-purple-700';
    case 'مؤتمر': return 'bg-blue-100 text-blue-700';
    case 'دعم نفسي': return 'bg-rose-100 text-rose-700';
    case 'توعية': return 'bg-teal-100 text-teal-700';
    case 'ويبنار': return 'bg-indigo-100 text-indigo-700';
    default: return 'bg-gray-100 text-gray-600';
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-wesal-navy mb-1">الفعاليات</h1>
          <p className="text-wesal-medium text-sm">
            اكتشف فعاليات وأنشطة الصحة النفسية
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-wesal-ice/60 text-sm">
            <span className="material-symbols-outlined text-lg text-emerald-600">event_available</span>
            <span className="text-wesal-navy font-medium">{upcomingCount}</span>
            <span className="text-wesal-medium">قادمة</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-wesal-ice/60 text-sm">
            <span className="material-symbols-outlined text-lg text-gray-500">history</span>
            <span className="text-wesal-navy font-medium">{pastCount}</span>
            <span className="text-wesal-medium">سابقة</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'upcoming', label: 'القادمة' },
            { key: 'past', label: 'السابقة' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'past')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-wesal-dark text-white'
                  : 'bg-white text-wesal-medium hover:bg-gray-50 border border-wesal-ice/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-wesal-sky text-white'
                  : 'bg-white text-wesal-medium hover:bg-gray-50 border border-wesal-ice/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-wesal-ice/50 p-4 animate-pulse">
                <div className="h-4 bg-wesal-ice/50 rounded w-3/4 mb-2" />
                <div className="h-3 bg-wesal-ice/50 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-wesal-medium/40 mb-3 block">event_busy</span>
            <h3 className="text-base font-semibold text-wesal-navy mb-1">مفيش فعاليات</h3>
            <p className="text-sm text-wesal-medium">مفيش فعاليات في التصنيف ده حالياً</p>
          </div>
        )}

        {/* Events List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((event) => {
              const statusInfo = getStatusLabel(event.status);
              const upcoming = isUpcoming(event.eventDate);

              return (
                <Link key={event.id} href={`/events/${event.id}`} className="block">
                  <div className="group bg-white rounded-xl border border-wesal-ice/60 hover:border-wesal-sky/40 hover:shadow-md transition-all overflow-hidden cursor-pointer">
                    <div className="p-4">
                      {/* Top Row: Category + Status + Date badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {upcoming && event.registrationUrl && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            تسجيل متاح
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-wesal-navy text-base mb-2 group-hover:text-wesal-dark transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-wesal-medium/80 line-clamp-2 mb-3 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Meta Info Row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-wesal-medium">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                        {event.eventTime && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{formatTime(event.eventTime)}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

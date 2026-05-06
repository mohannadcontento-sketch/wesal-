'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

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

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  eventDate: '',
  eventTime: '',
  location: '',
  category: 'عام',
  isWesal: true,
  registrationUrl: '',
  status: 'upcoming',
};

const CATEGORIES = ['عام', 'ورشة عمل', 'ندوة', 'مؤتمر', 'دعم نفسي', 'توعية', 'ويبنار'];
const STATUSES = [
  { value: 'upcoming', label: 'قادمة' },
  { value: 'ongoing', label: 'جارية الآن' },
  { value: 'completed', label: 'منتهية' },
  { value: 'cancelled', label: 'ملغاة' },
];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = () => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (e: EventItem) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl || '',
      eventDate: e.eventDate ? new Date(e.eventDate).toISOString().split('T')[0] : '',
      eventTime: e.eventTime || '',
      location: e.location || '',
      category: e.category,
      isWesal: e.isWesal,
      registrationUrl: e.registrationUrl || '',
      status: e.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.eventDate) {
      toast.error('العنوان والوصف والتاريخ مطلوبين');
      return;
    }
    if (form.imageUrl && !form.imageUrl.match(/^https?:\/\/.+/)) {
      toast.error('رابط الصورة لازم يبدا بـ http:// أو https://');
      return;
    }
    if (!form.isWesal && form.registrationUrl && !form.registrationUrl.match(/^https?:\/\/.+/)) {
      toast.error('رابط التسجيل لازم يبدا بـ http:// أو https://');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/events/${editingId}` : '/api/events';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingId ? 'تم تحديث الفعالية' : 'تم إنشاء الفعالية');
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        loadEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('متأكد إنك عايز تحذف الفعالية دي؟')) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تم حذف الفعالية');
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.error('حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ أثناء الحذف');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    return `${h}:${m} ${period}`;
  };

  const getStatusLabel = (status: string) => {
    return STATUSES.find((s) => s.value === status)?.label || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-emerald-100 text-emerald-700';
      case 'ongoing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-500';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-white/20 rounded w-1/3 mb-3" />
            <div className="h-3 bg-white/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined filled text-4xl text-primary">event</span>
          <div>
            <h1 className="text-[32px] font-bold text-primary leading-tight">إدارة الفعاليات</h1>
            <p className="text-sm text-on-surface-variant mt-1">إضافة وتعديل وحذف الفعاليات</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          إضافة فعالية
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-gray-500">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">عنوان الفعالية *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: ورشة عمل إدارة التوتر والقلق"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  dir="rtl"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">وصف الفعالية *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب شرح تفصيلي عن الفعالية، محتواها، والهدف منها..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  dir="rtl"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">التاريخ *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">calendar_today</span>
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوقت</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">schedule</span>
                    <input
                      type="time"
                      value={form.eventTime}
                      onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">المكان</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="مثال: فندق Hilton - القاهرة أو أونلاين"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">التصنيف</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحالة</label>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.status === s.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">رابط الصورة (اختياري)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">image</span>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/event-image.jpg"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Is Wesal Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-gray-700">فعالية تابعة لوصال</div>
                  <div className="text-xs text-gray-500 mt-0.5">فعاليات وصال يتم التسجيل فيها من داخل المنصة</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isWesal: !form.isWesal })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    form.isWesal ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      form.isWesal ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                    }`}
                  />
                </button>
              </div>

              {/* Registration URL - only for non-Wesal events */}
              {!form.isWesal && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    رابط التسجيل الخارجي
                    <span className="text-xs text-gray-400 font-normal mr-1">(للفعاليات الخارجية)</span>
                  </label>
                  <input
                    type="url"
                    value={form.registrationUrl}
                    onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
                    placeholder="https://external-site.com/register"
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    dir="ltr"
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    {editingId ? 'save' : 'add_circle'}
                  </span>
                  {submitting ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إنشاء الفعالية'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">إجمالي الفعاليات</div>
          <div className="text-2xl font-bold text-primary">{events.length}</div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">قادمة</div>
          <div className="text-2xl font-bold text-emerald-600">
            {events.filter((e) => e.status === 'upcoming').length}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">جارية</div>
          <div className="text-2xl font-bold text-blue-600">
            {events.filter((e) => e.status === 'ongoing').length}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">تابعة لوصال</div>
          <div className="text-2xl font-bold text-purple-600">
            {events.filter((e) => e.isWesal).length}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-primary">كل الفعاليات</h2>
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">event_busy</span>
            <p className="text-base font-semibold text-on-surface">مفيش فعاليات</p>
            <p className="text-sm text-on-surface-variant mt-1">اضغط على &quot;إضافة فعالية&quot; عشان تبدأ</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {events.map((event) => (
              <div key={event.id} className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400 text-2xl">event</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-on-surface truncate">{event.title}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                    {event.isWesal && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
                        وصال
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {formatDate(event.eventDate)}
                    </span>
                    {event.eventTime && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {formatTime(event.eventTime)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/events/${event.id}`}
                    target="_blank"
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="عرض"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </Link>
                  <button
                    onClick={() => openEdit(event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

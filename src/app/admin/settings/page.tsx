'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [allowPosts, setAllowPosts] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [maxPostsPerDay, setMaxPostsPerDay] = useState('10');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const s = data.settings || {};
        setMaintenanceMode(s.maintenance_mode === 'true');
        setAllowRegistration(s.allow_registration === 'true');
        setAllowPosts(s.allow_posts === 'true');
        setAllowComments(s.allow_comments === 'true');
        setMaxPostsPerDay(s.max_posts_per_day || '10');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            maintenance_mode: String(maintenanceMode),
            allow_registration: String(allowRegistration),
            allow_posts: String(allowPosts),
            allow_comments: String(allowComments),
            max_posts_per_day: maxPostsPerDay,
          },
        }),
      });

      if (res.ok) {
        toast.success('تم حفظ الإعدادات');
      } else {
        toast.error('حصل خطأ في حفظ الإعدادات');
      }
    } catch {
      toast.error('حصل خطأ في الاتصال');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
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
      <div className="flex items-center gap-4 mb-6">
        <span className="material-symbols-outlined filled text-4xl text-primary">settings</span>
        <div>
          <h1 className="text-[32px] font-bold text-primary leading-tight">إعدادات النظام</h1>
          <p className="text-sm text-on-surface-variant mt-1">إدارة إعدادات المنصة العامة</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">tune</span>
            إعدادات عامة
          </h2>
        </div>
        <div className="p-5 space-y-5">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-on-surface">وضع الصيانة</div>
              <div className="text-xs text-on-surface-variant mt-0.5">تفعيله يمنع المستخدمين من الوصول للمنصة</div>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  maintenanceMode ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                }`}
              />
            </button>
          </div>

          {/* Allow Registration */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-on-surface">السماح بالتسجيل الجديد</div>
              <div className="text-xs text-on-surface-variant mt-0.5">إيقافه يمنع حسابات جديدة</div>
            </div>
            <button
              onClick={() => setAllowRegistration(!allowRegistration)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                allowRegistration ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  allowRegistration ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                }`}
              />
            </button>
          </div>

          {/* Allow Posts */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-on-surface">السماح بالنشر</div>
              <div className="text-xs text-on-surface-variant mt-0.5">إيقافه يمنع المستخدمين من إنشاء منشورات</div>
            </div>
            <button
              onClick={() => setAllowPosts(!allowPosts)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                allowPosts ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  allowPosts ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                }`}
              />
            </button>
          </div>

          {/* Allow Comments */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-on-surface">السماح بالتعليقات</div>
              <div className="text-xs text-on-surface-variant mt-0.5">إيقافه يمنع المستخدمين من التعليق</div>
            </div>
            <button
              onClick={() => setAllowComments(!allowComments)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                allowComments ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  allowComments ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                }`}
              />
            </button>
          </div>

          {/* Max Posts Per Day */}
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-sm font-semibold text-on-surface mb-2">الحد الأقصى للمنشورات يومياً</div>
            <div className="text-xs text-on-surface-variant mb-3">عدد المنشورات اللي المستخدم يقدر ينشرها في اليوم</div>
            <input
              type="number"
              value={maxPostsPerDay}
              onChange={e => setMaxPostsPerDay(e.target.value)}
              min="1"
              max="100"
              className="w-24 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">info</span>
            معلومات المنصة
          </h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-on-surface-variant">اسم المنصة</span>
            <span className="text-sm font-semibold text-on-surface">وصال</span>
          </div>
          <div className="border-t border-white/10" />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-on-surface-variant">الإصدار</span>
            <span className="text-sm font-semibold text-on-surface">1.0.0</span>
          </div>
          <div className="border-t border-white/10" />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-on-surface-variant">قاعدة البيانات</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              متصلة
            </span>
          </div>
          <div className="border-t border-white/10" />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-on-surface-variant">حالة الخادم</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              يعمل
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">
          {saving ? 'progress_activity' : 'save'}
        </span>
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
}

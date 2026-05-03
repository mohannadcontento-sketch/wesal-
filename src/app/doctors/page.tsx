'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import DoctorCard from '@/components/doctors/DoctorCard';
import type { Profile, User } from '@/types';

const filters = [
  { label: 'الكل', value: 'all' },
  { label: 'طب نفسي', value: 'psychiatry' },
  { label: 'علاج سلوكي', value: 'behavioral' },
  { label: 'إرشاد أسري', value: 'family' },
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<(User & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch('/api/doctors').then(r => r.json()).then(data => {
      setDoctors(data.doctors || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) => {
    const profile = d.profile;
    if (!profile) return false;
    const q = search.toLowerCase();

    // Search filter
    const matchesSearch =
      (profile.realName || '').toLowerCase().includes(q) ||
      (profile.specialty || '').toLowerCase().includes(q) ||
      (profile.location || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Category filter
    if (activeFilter === 'all') return true;
    const spec = (profile.specialty || '').toLowerCase();
    switch (activeFilter) {
      case 'psychiatry':
        return spec.includes('نفسي') || spec.includes('psychiatr');
      case 'behavioral':
        return spec.includes('سلوكي') || spec.includes('behavior');
      case 'family':
        return spec.includes('أسري') || spec.includes('زوجي') || spec.includes('family');
      default:
        return true;
    }
  });

  return (
    <MainLayout>
      {/* Header Section */}
      <header className="mb-12 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tertiary-fixed to-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined text-4xl text-on-primary">stethoscope</span>
            </div>
            <div>
              <h1 className="text-[40px] font-bold text-on-background leading-tight">الأطباء</h1>
              <p className="text-lg text-on-surface-variant mt-1">اكتشف نخبة من المتخصصين في الصحة النفسية</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              className="w-full bg-surface-container-high border border-outline-variant/50 focus:border-tertiary-fixed focus:ring-1 focus:ring-tertiary-fixed rounded-xl py-3 pl-4 pr-12 text-base text-on-surface transition-all shadow-sm"
              placeholder="ابحث بالاسم أو التخصص..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f.value
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
              }`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-surface-container-high shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-32 rounded-lg bg-surface-container-high" />
                  <div className="h-4 w-24 rounded-lg bg-surface-container-high" />
                  <div className="h-4 w-20 rounded-lg bg-surface-container-high" />
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <div className="h-6 w-16 rounded-full bg-surface-container-high" />
                <div className="h-6 w-20 rounded-full bg-surface-container-high" />
              </div>
              <div className="h-12 rounded-xl bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-primary-container">stethoscope</span>
          </div>
          <p className="text-lg font-bold text-on-surface">لا يوجد أطباء حالياً</p>
          <p className="text-sm text-on-surface-variant mt-1.5">
            سيظهرون هنا بمجرد تسجيلهم في المنصة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

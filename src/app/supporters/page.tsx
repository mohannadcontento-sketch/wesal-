'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import SupporterCard from '@/components/supporters/SupporterCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { StaggeredList } from '@/components/animations/StaggeredList';
import Link from 'next/link';

interface Supporter {
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
  isOnline: boolean;
}

export default function SupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch('/api/supporters')
      .then(r => r.json())
      .then(data => {
        setSupporters(data.supporters || []);
        setSpecialties(data.specialties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = supporters.filter((s) => {
    if (activeFilter !== 'all' && !s.specialty.includes(activeFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q) || (s.bio || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <MainLayout>
      {/* Header */}
      <ScrollReveal direction="up">
        <header className="mt-6 mb-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-wesal-sky flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">volunteer_activism</span>
                </div>
                <h1 className="text-2xl font-bold text-wesal-navy">الداعمون</h1>
              </div>
              <p className="text-sm text-wesal-medium mr-11">متخصصون في الاستماع والدعم النفسي — ليسوا أطباء</p>
            </div>

            <Link
              href="/supporters/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-primary to-wesal-sky text-on-primary font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition-all active:scale-95 w-fit"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              انضم كداعم
            </Link>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-96">
            <input
              className="w-full bg-white border border-wesal-ice focus:border-wesal-sky focus:ring-1 focus:ring-wesal-sky/30 rounded-xl py-3 pl-4 pr-12 text-base text-wesal-navy placeholder:text-wesal-medium/60 transition-all shadow-sm"
              placeholder="ابحث بالاسم أو التخصص..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-wesal-medium">search</span>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-wesal-dark text-white shadow-md'
                  : 'bg-white hover:bg-wesal-ice text-wesal-medium border border-wesal-ice'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              الكل
            </button>
            {specialties.map((s) => (
              <button
                key={s}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeFilter === s
                    ? 'bg-wesal-dark text-white shadow-md'
                    : 'bg-white hover:bg-wesal-ice text-wesal-medium border border-wesal-ice'
                }`}
                onClick={() => setActiveFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </header>
      </ScrollReveal>

      {/* Info Banner */}
      <div className="bg-primary-container/40 border border-primary-container rounded-2xl p-4 mb-8 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
        <div>
          <p className="text-sm text-on-surface font-medium">ما هو الداعم؟</p>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            الداعم هو شخص مؤهل (خريج علم نفس أو حاصل على شهادات معتمدة) يقدم الدعم والاستماع فقط.
            لا يشخص حالات ولا يصف علاجات — دوره هو الاستماع والدعم النفسي الأولي.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl border border-wesal-ice rounded-2xl p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-wesal-ice/60 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-32 rounded-lg bg-wesal-ice/60" />
                  <div className="h-4 w-24 rounded-lg bg-wesal-ice/60" />
                </div>
              </div>
              <div className="h-16 rounded-xl bg-wesal-ice/60" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-wesal-ice">
            <span className="material-symbols-outlined text-3xl text-wesal-medium">volunteer_activism</span>
          </div>
          <p className="text-lg font-bold text-wesal-navy">
            {search ? 'مفيش نتائج' : 'مفيش داعمين حالياً'}
          </p>
          <p className="text-sm text-wesal-medium mt-1.5">
            {search ? 'جرب تبحث بكلمة مختلفة' : 'كن أول داعم في المنصة!'}
          </p>
          {!search && (
            <Link
              href="/supporters/apply"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-lg active:scale-95 transition-transform"
            >
              انضم كداعم
            </Link>
          )}
        </div>
      ) : (
        <StaggeredList stagger={0.08} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((supporter) => (
              <SupporterCard key={supporter.id} supporter={supporter} />
            ))}
          </div>
        </StaggeredList>
      )}
    </MainLayout>
  );
}

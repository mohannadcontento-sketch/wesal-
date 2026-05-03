'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import DoctorCard from '@/components/doctors/DoctorCard';
import { Input } from '@/components/ui/input';
import type { Profile, User } from '@/types';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<(User & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    return (
      (profile.realName || '').toLowerCase().includes(q) ||
      (profile.specialty || '').toLowerCase().includes(q) ||
      (profile.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">الأطباء</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              أطباء نفسيون موثوقين وجاهزين لمساعدتك
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-[18px] text-gray-400 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن طبيب بالاسم أو التخصص..."
            className="pr-10"
          />
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                    <div className="h-9 w-28 rounded-lg bg-gray-200 animate-pulse mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
              <Stethoscope className="size-7 text-teal-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">لا يوجد أطباء حالياً</p>
            <p className="text-sm text-gray-500 mt-1.5">
              سيظهرون هنا بمجرد تسجيلهم في المنصة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

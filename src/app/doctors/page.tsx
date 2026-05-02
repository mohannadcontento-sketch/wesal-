'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import DoctorCard from '@/components/doctors/DoctorCard';
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <h1 className="text-h3 text-foreground font-heading">الأطباء</h1>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              أطباء نفسيون موثوقين وجاهزين لمساعدتك
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-[18px] text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن طبيب بالاسم أو التخصص..."
            className="input pr-10"
          />
        </motion.div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="skeleton w-14 h-14 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-9 w-28 rounded-lg mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
              <Stethoscope className="size-7 text-primary" />
            </div>
            <p className="text-h4 text-foreground font-heading">لا يوجد أطباء حالياً</p>
            <p className="text-body-sm text-muted-foreground mt-1.5">
              سيظهرون هنا بمجرد تسجيلهم في المنصة
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((doctor, i) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={i} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

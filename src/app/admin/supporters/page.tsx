'use client';

import { useState, useEffect } from 'react';
import SupporterApplications from '@/components/admin/SupporterApplications';

export default function AdminSupportersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="material-symbols-outlined text-2xl text-white">volunteer_activism</span>
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-primary leading-tight">طلبات الداعمين</h1>
          <p className="text-sm text-on-surface-variant">
            مراجعة وادارة طلبات الانضمام كداعمين
          </p>
        </div>
      </div>

      {/* Supporter Applications List */}
      <SupporterApplications />
    </div>
  );
}

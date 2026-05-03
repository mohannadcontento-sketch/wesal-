'use client';

import VerificationRequests from '@/components/admin/VerificationRequests';

export default function AdminVerificationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tertiary-fixed to-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
          <span className="material-symbols-outlined text-2xl text-on-primary">verified</span>
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-primary leading-tight">طلبات التوثيق</h1>
          <p className="text-sm text-on-surface-variant">
            مراجعة وادارة طلبات توثيق الأطباء والمتخصصين
          </p>
        </div>
      </div>

      {/* Verification Requests List */}
      <VerificationRequests />
    </div>
  );
}

'use client';

import VerificationRequests from '@/components/admin/VerificationRequests';
import { FileCheck } from 'lucide-react';

export default function AdminVerificationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <FileCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-h3 text-text-primary font-heading">
            طلبات التوثيق
          </h1>
          <p className="text-body-sm text-text-secondary">
            مراجعة وادارة طلبات توثيق الأطباء والمتخصصين
          </p>
        </div>
      </div>

      {/* Verification Requests List */}
      <VerificationRequests />
    </div>
  );
}

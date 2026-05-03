'use client';

import VerificationRequests from '@/components/admin/VerificationRequests';
import { FileCheck } from 'lucide-react';

export default function AdminVerificationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <FileCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            طلبات التوثيق
          </h1>
          <p className="text-sm text-muted-foreground">
            مراجعة وادارة طلبات توثيق الأطباء والمتخصصين
          </p>
        </div>
      </div>

      {/* Verification Requests List */}
      <VerificationRequests />
    </div>
  );
}

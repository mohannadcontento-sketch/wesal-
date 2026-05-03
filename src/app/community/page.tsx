'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function CommunityPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Community is now the home page
      router.replace('/');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-wesal-cream">
      <div className="text-center">
        <span className="material-symbols-outlined text-[32px] text-wesal-dark animate-spin">progress_activity</span>
        <p className="text-sm text-wesal-medium mt-3">جاري التحويل...</p>
      </div>
    </div>
  );
}

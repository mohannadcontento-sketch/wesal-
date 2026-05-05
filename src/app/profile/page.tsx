'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const username = user.username;
    if (username) {
      router.replace(`/profile/${username}`);
    } else {
      router.replace('/community');
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-wesal-cream">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[32px] text-wesal-dark">progress_activity</span>
        <span className="text-sm text-wesal-medium">جاري التحويل...</span>
      </div>
    </div>
  );
}

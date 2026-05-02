'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
    fetchSession();
  }, [setUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }

      // Handle specific error cases
      if (res.status === 403 && data.needsVerification) {
        return {
          success: false,
          error: data.error || 'لازم تأكد إيميلك الأول',
          needsVerification: true,
          email: data.email || email,
        };
      }

      return { success: false, error: data.error || 'الإيميل أو كلمة المرور غلط' };
    } catch {
      return { success: false, error: 'حصل خطأ في الاتصال بالسيرفر، جرب تاني' };
    }
  };

  const register = async (formData: Record<string, string>) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true, email: formData.email };
      }

      return { success: false, error: data.error || 'حصل خطأ في التسجيل' };
    } catch {
      return { success: false, error: 'حصل خطأ في الاتصال بالسيرفر، جرب تاني' };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'الرمز غلط أو انتهى' };
    } catch {
      return { success: false, error: 'حصل خطأ في الاتصال بالسيرفر، جرب تاني' };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true, message: data.message };
      }

      return { success: false, error: data.error || 'حصل خطأ في إرسال الرمز' };
    } catch {
      return { success: false, error: 'حصل خطأ في الاتصال بالسيرفر' };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    }
    logout();
  };

  return { user, loading, login, register, verifyOtp, resendOtp, logout: logoutUser };
}

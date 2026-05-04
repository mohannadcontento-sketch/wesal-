'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSession = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/session', { signal });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Don't update state if the request was aborted
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setUser(null);
    } finally {
      // Ensure loading is always set to false, even on unexpected errors
      setLoading(false);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    // Cancel any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchSession(controller.signal);

    return () => {
      controller.abort();
      abortControllerRef.current = null;
    };
  }, [fetchSession]);

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
    // Clear zustand state
    logout();
    // Force full page reload to clear any cached state
    window.location.href = '/';
  };

  return { user, loading, login, register, verifyOtp, resendOtp, logout: logoutUser };
}

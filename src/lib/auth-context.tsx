// ============================================================
// وصال (Wesal) — Session Management مع Supabase Auth
// ============================================================

import { supabase } from './supabase';

// ─── نوع الجلسة ───
export interface UserSession {
  userId: string;
  anonId: string;
  nickname: string;
  role: string; // 'patient' | 'doctor' | 'admin' | 'moderator' | 'trainee'
  avatarColor: string;
  trackerEnabled: boolean;
  followingDoctorId?: string;
  tier: string;
  streakDays: number;
  reputationScore: number;
}

// ─── Session Store ───
let _session: UserSession | null = null;

export function getSession(): UserSession | null {
  return _session;
}

export function setSession(session: UserSession | null): void {
  _session = session;
  // حفظ في localStorage كمان عشان يفضل موجود بعد refresh
  if (typeof window !== 'undefined') {
    if (session) {
      try { localStorage.setItem('wesal_session', JSON.stringify(session)); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem('wesal_session'); } catch { /* ignore */ }
    }
  }
}

export function clearSession(): void {
  _session = null;
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem('wesal_session'); } catch { /* ignore */ }
  }
}

// تحميل الجلسة من localStorage (للـ refresh)
export function loadSessionFromStorage(): UserSession | null {
  if (_session) return _session;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('wesal_session');
      if (saved) {
        _session = JSON.parse(saved);
        return _session;
      }
    } catch { /* ignore */ }
  }
  return null;
}

// ─── التحقق من Supabase Auth session ───
export async function checkAuthSession(): Promise<UserSession | null> {
  try {
    if (!supabase) return null;

    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession?.user) return null;

    // جلب الـ profile من الـ API
    const res = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${authSession.access_token}`,
      },
    });

    if (!res.ok) return null;

    const profile = await res.json();
    const session: UserSession = {
      userId: profile.userId,
      anonId: profile.anonId,
      nickname: profile.nickname,
      role: profile.role || 'patient',
      avatarColor: profile.avatarColor,
      trackerEnabled: profile.trackerEnabled,
      tier: profile.tier,
      streakDays: profile.streakDays,
      reputationScore: profile.reputationScore || 0,
    };

    setSession(session);
    return session;
  } catch {
    return null;
  }
}

// ─── Logout ───
export async function signOut(): Promise<void> {
  try {
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch { /* ignore */ }
  clearSession();
}

// ─── الحصول على الـ Access Token ───
export async function getAccessToken(): Promise<string | null> {
  try {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

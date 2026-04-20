// ============================================================
// Wesal API Client — طبقة الاتصال بالـ Backend
// ============================================================
// كل الـ API calls بتبعت الـ Auth token تلقائياً
// ============================================================

const API_BASE = '/api';

// ─── Helper: الحصول على الـ Auth token ───
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // نحاول نجيب الـ token من Supabase Auth (client-side)
    if (typeof window !== 'undefined') {
      const { supabase } = await import('./supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }
  } catch { /* ignore */ }

  return headers;
}

// ─── Auth ───
// ملاحظة: الـ OTP Auth بيتعامل معاه مباشرة من Supabase Auth Client
// في الـ AuthModal.tsx — مش محتاج API calls للـ OTP

// ─── Posts ───
export async function fetchPosts(limit = 20, offset = 0) {
  const res = await fetch(`${API_BASE}/posts?limit=${limit}&offset=${offset}`);
  return res.json();
}

export async function createPost(content: string, _userId?: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function toggleReaction(postId: string, _userId?: string, reactionType: 'like' | 'helpful' | 'save' = 'like') {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reactionType }),
  });
  return res.json();
}

export async function fetchComments(postId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
  return res.json();
}

export async function addComment(postId: string, content: string, _userId?: string, parentId?: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, parentId }),
  });
  return res.json();
}

// ─── Tracker ───
export async function submitMood(data: {
  userId?: string;
  moodScore: number;
  moodEmoji?: string;
  journalText?: string;
}) {
  const headers = await getAuthHeaders();
  const { userId: _, ...moodData } = data;
  const res = await fetch(`${API_BASE}/tracker`, {
    method: 'POST',
    headers,
    body: JSON.stringify(moodData),
  });
  return res.json();
}

export async function fetchTrackerLogs(_userId?: string, days = 7) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/tracker?days=${days}`, { headers });
  return res.json();
}

export async function analyzeMood(data: {
  journalText: string;
  moodScore: number;
  recentLogs?: number[];
}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/tracker/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Consultations ───
export async function fetchDoctors(category = 'all') {
  const res = await fetch(`${API_BASE}/consultations?category=${category}`);
  return res.json();
}

export async function bookConsultation(data: {
  patientId?: string;
  doctorId: string;
  sessionType: 'chat' | 'voice';
  selectedTime?: string;
}) {
  const headers = await getAuthHeaders();
  const { patientId: _, ...bookingData } = data;
  const res = await fetch(`${API_BASE}/consultations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(bookingData),
  });
  return res.json();
}

// ─── Events ───
export async function fetchEvents(status = 'all') {
  const res = await fetch(`${API_BASE}/events?status=${status}`);
  return res.json();
}

export async function registerForEvent(_userId: string, eventId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ eventId }),
  });
  return res.json();
}

export async function cancelEventRegistration(_userId: string, eventId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/events`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ eventId }),
  });
  return res.json();
}

// ─── Safety ───
export async function submitSafetyReport(data: {
  reporterId?: string;
  contentType: string;
  contentId?: string;
  targetUserId?: string;
  reason: string;
  riskScore?: number;
}) {
  const headers = await getAuthHeaders();
  const { reporterId: _, ...reportData } = data;
  const res = await fetch(`${API_BASE}/safety`, {
    method: 'POST',
    headers,
    body: JSON.stringify(reportData),
  });
  return res.json();
}

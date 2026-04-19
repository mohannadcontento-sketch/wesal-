// ============================================================
// Wesal API Client — طبقة الاتصال بالـ Backend
// ============================================================
// كل function بتشتغل مع Supabase لو متوصل، ومع mock data لو مش متوصل
// ============================================================

const API_BASE = '/api';

// ─── Auth ───
export async function sendOtp(phone: string, nickname?: string) {
  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, nickname }),
  });
  return res.json();
}

// ─── Posts ───
export async function fetchPosts(limit = 20, offset = 0) {
  const res = await fetch(`${API_BASE}/posts?limit=${limit}&offset=${offset}`);
  return res.json();
}

export async function createPost(content: string, userId: string) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, userId }),
  });
  return res.json();
}

export async function toggleReaction(postId: string, userId: string, reactionType: 'like' | 'helpful' | 'save') {
  const res = await fetch(`${API_BASE}/posts/${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reactionType }),
  });
  return res.json();
}

export async function fetchComments(postId: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
  return res.json();
}

export async function addComment(postId: string, userId: string, content: string, parentId?: string) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, content, parentId }),
  });
  return res.json();
}

// ─── Tracker ───
export async function submitMood(data: {
  userId: string;
  moodScore: number;
  moodEmoji?: string;
  journalText?: string;
}) {
  const res = await fetch(`${API_BASE}/tracker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchTrackerLogs(userId: string, days = 7) {
  const res = await fetch(`${API_BASE}/tracker?userId=${userId}&days=${days}`);
  return res.json();
}

export async function analyzeMood(data: {
  journalText: string;
  moodScore: number;
  recentLogs?: number[];
}) {
  const res = await fetch(`${API_BASE}/tracker/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  patientId: string;
  doctorId: string;
  sessionType: 'chat' | 'voice';
  selectedTime?: string;
}) {
  const res = await fetch(`${API_BASE}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Events ───
export async function fetchEvents(status = 'all') {
  const res = await fetch(`${API_BASE}/events?status=${status}`);
  return res.json();
}

export async function registerForEvent(userId: string, eventId: string) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventId }),
  });
  return res.json();
}

export async function cancelEventRegistration(userId: string, eventId: string) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventId }),
  });
  return res.json();
}

// ─── Safety ───
export async function submitSafetyReport(data: {
  reporterId: string;
  contentType: string;
  contentId?: string;
  targetUserId?: string;
  reason: string;
  riskScore?: number;
}) {
  const res = await fetch(`${API_BASE}/safety`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Supabase client is no longer used for auth
// Auth is now handled directly with JWT + bcrypt
// This file is kept for potential future use with Supabase Realtime or Storage

export function createClient() {
  console.warn('Supabase client is not configured. Auth is handled by JWT + bcrypt.');
  return null;
}

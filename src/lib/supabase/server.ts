// Supabase server client is no longer used for auth
// Auth is now handled directly with JWT + bcrypt
// This file is kept for potential future use with Supabase Realtime or Storage

export async function createClient() {
  console.warn('Supabase server client is not configured. Auth is handled by JWT + bcrypt.');
  return null;
}

export async function createServiceClient() {
  console.warn('Supabase service client is not configured. Auth is handled by JWT + bcrypt.');
  return null;
}

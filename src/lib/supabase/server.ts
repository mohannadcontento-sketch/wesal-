import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ─── Environment Validation ───────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// ─── Singleton clients (created once, reused across requests) ─────────────────
let _serverClient: SupabaseClient | null = null
let _serviceClient: SupabaseClient | null = null

/**
 * Supabase server client using the anon key.
 * Safe for server-side operations that don't need admin privileges.
 * Returns null if Supabase is not configured.
 */
export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (_serverClient) return _serverClient

  _serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,   // No session management — we use custom JWT auth
      autoRefreshToken: false, // No token refresh needed
    },
  })
  return _serverClient
}

/**
 * Supabase service-role client with full admin access.
 * Use for edge function invocations, admin API calls, etc.
 * Returns null if Supabase is not configured.
 */
export function getSupabaseService(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (_serviceClient) return _serviceClient

  // Prefer the service-role key for backend operations; fall back to anon key
  const key = supabaseServiceKey || supabaseAnonKey

  _serviceClient = createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return _serviceClient
}

/**
 * Check Supabase connectivity.
 * Useful for health checks and diagnostics.
 */
export async function checkSupabaseConnection(): Promise<{
  ok: boolean
  configured: boolean
  error?: string
}> {
  if (!isSupabaseConfigured) {
    return { ok: false, configured: false, error: 'Supabase env vars not set' }
  }

  try {
    const client = getSupabaseServer()
    if (!client) {
      return { ok: false, configured: true, error: 'Failed to create Supabase client' }
    }

    // Simple health check — try to fetch from the API
    const { error } = await client.from('_nonexistent_table').select('id').limit(0)
    // We expect a "does not exist" error, NOT a network/auth error
    if (error && !error.message.includes('does not exist') && !error.code) {
      return { ok: false, configured: true, error: error.message }
    }

    return { ok: true, configured: true }
  } catch (err) {
    return {
      ok: false,
      configured: true,
      error: err instanceof Error ? err.message : 'Unknown connection error',
    }
  }
}

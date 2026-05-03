import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Supabase browser/client-side client.
 * Use in client components for Supabase features (storage, realtime, etc.)
 * Returns null if Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/** Singleton instance for client-side usage */
let _client: SupabaseClient | null = null
export function getClient(): SupabaseClient | null {
  if (_client) return _client
  _client = getSupabaseClient()
  return _client
}

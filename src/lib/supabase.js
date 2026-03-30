import { createClient } from '@supabase/supabase-js'

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
// These come from environment variables set in Vercel.
// If not set, the app falls back to localStorage (demo mode).

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Quick check: is Supabase connected?
export const isSupabaseConnected = () => !!supabase

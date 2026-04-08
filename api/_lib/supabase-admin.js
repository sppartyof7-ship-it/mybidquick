// ============================================================================
// Server-side Supabase client (service_role_key — bypasses RLS)
// Shared by all API functions that need DB access
// ============================================================================
import { createClient } from '@supabase/supabase-js'

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  supabase-admin: SUPABASE_SERVICE_ROLE_KEY not set — using anon key')
}

export const supabase = createClient(process.env.VITE_SUPABASE_URL, supabaseKey)

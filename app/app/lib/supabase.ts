import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Web3Instant] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. In Web3Instant/app, copy .env.example to .env.local and set both values from Supabase → Settings → API (Project URL + anon public key).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

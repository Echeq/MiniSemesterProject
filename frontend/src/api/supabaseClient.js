import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Null when frontend/.env is missing so App can render a setup hint
// instead of crashing on createClient.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

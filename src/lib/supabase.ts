import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 없습니다. .env.example을 참고해 .env.local을 만드세요.')
}

export const supabase = createClient(url, key)

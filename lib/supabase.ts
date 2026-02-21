import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'PUT_YOUR_PROJECT_URL_HERE'
const supabaseAnonKey = 'PUT_YOUR_ANON_PUBLIC_KEY_HERE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

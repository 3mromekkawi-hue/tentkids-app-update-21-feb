import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcyljouflipbbfmwczig.supabase.co'
const supabaseAnonKey = 'sb_publishable_kDbeuvkI7xhkOSFBzV5GqQ_8fSDpA2j'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
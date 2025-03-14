import { createClient } from '@supabase/supabase-js';

// Try both Vercel naming and React naming conventions
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE') || key.includes('AMAZON')));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

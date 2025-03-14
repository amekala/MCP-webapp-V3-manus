import { createClient } from '@supabase/supabase-js';

// This allows TypeScript to understand the window.ENV property
declare global {
  interface Window {
    ENV: {
      REACT_APP_SUPABASE_URL: string;
      REACT_APP_SUPABASE_ANON_KEY: string;
      AMAZON_CLIENT_ID: string;
      AMAZON_REDIRECT_URI: string;
    };
  }
}

// Try both browser global ENV and process.env
const isBrowser = typeof window !== 'undefined';

// In the browser, use window.ENV
// In Node.js (during SSR or build), use process.env
const supabaseUrl = isBrowser 
  ? window.ENV?.REACT_APP_SUPABASE_URL
  : (process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '');

const supabaseAnonKey = isBrowser
  ? window.ENV?.REACT_APP_SUPABASE_ANON_KEY
  : (process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  if (isBrowser) {
    console.log('Browser ENV:', window.ENV);
  } else {
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE') || key.includes('AMAZON')));
  }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

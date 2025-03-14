import { createClient } from '@supabase/supabase-js';

// Helper function to get environment variables with fallbacks
const getEnv = (key, defaultValue = '') => {
  // Check browser environment first
  if (typeof window !== 'undefined' && window.ENV) {
    if (window.ENV[key]) return window.ENV[key];
    
    // Try alternate naming conventions
    const alternateKeys = [];
    if (key.startsWith('AMAZON_')) {
      alternateKeys.push('REACT_APP_' + key);
    } else if (key.startsWith('REACT_APP_AMAZON_')) {
      alternateKeys.push(key.replace('REACT_APP_', ''));
    }
    
    for (const altKey of alternateKeys) {
      if (window.ENV[altKey]) return window.ENV[altKey];
    }
  }
  
  // Then try Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
    
    // Try alternate naming conventions
    const alternateKeys = [];
    if (key.startsWith('AMAZON_')) {
      alternateKeys.push('REACT_APP_' + key);
    } else if (key.startsWith('REACT_APP_AMAZON_')) {
      alternateKeys.push(key.replace('REACT_APP_', ''));
    }
    
    for (const altKey of alternateKeys) {
      if (process.env[altKey]) return process.env[altKey];
    }
  }
  
  return defaultValue;
};

// Export configured values
export const config = {
  // Supabase
  supabaseUrl: getEnv('REACT_APP_SUPABASE_URL', 'https://hzhzejqyjotckrntykxc.supabase.co'),
  supabaseAnonKey: getEnv('REACT_APP_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aHplanF5am90Y2tybnR5a3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjE1NDQsImV4cCI6MjA1NzUzNzU0NH0.JJUqegAD086gS6vPJHWJvDR_0SUuu6ljMKlb5528DUI'),
  
  // Amazon OAuth
  amazonClientId: getEnv('AMAZON_CLIENT_ID', 'amzn1.application-oa2-client.44ed4eff7d964255af8760e45f33be05'),
  amazonRedirectUri: getEnv('AMAZON_REDIRECT_URI', 'https://v0-ads-connect-project.vercel.app/auth-callback'),
  
  // Helper method to check if all required config is available
  isConfigValid: () => {
    const missingVars = [];
    
    if (!config.supabaseUrl) missingVars.push('REACT_APP_SUPABASE_URL');
    if (!config.supabaseAnonKey) missingVars.push('REACT_APP_SUPABASE_ANON_KEY');
    if (!config.amazonClientId) missingVars.push('AMAZON_CLIENT_ID');
    if (!config.amazonRedirectUri) missingVars.push('AMAZON_REDIRECT_URI');
    
    if (missingVars.length > 0) {
      console.error(`Missing required configuration: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  }
};

// Initialize Supabase client
const isBrowser = typeof window !== 'undefined';
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

// Log configuration status
console.log('App Configuration Status:', {
  supabaseUrl: config.supabaseUrl,
  supabaseAnonKey: config.supabaseAnonKey ? '[HIDDEN]' : 'NOT SET',
  amazonClientId: config.amazonClientId ? '[HIDDEN]' : 'NOT SET',
  amazonRedirectUri: config.amazonRedirectUri,
  isValid: config.isConfigValid(),
  environment: isBrowser ? 'Browser' : 'Node.js'
});

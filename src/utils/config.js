/**
 * Configuration helper that provides access to environment variables with fallbacks
 */

// Helper function to safely get environment variables
const getEnv = (key, defaultValue = '') => {
  // Determine alternate key names for compatibility
  let alternateKeys = [];
  if (key.startsWith('AMAZON_')) {
    // If looking for AMAZON_CLIENT_ID, also check REACT_APP_AMAZON_CLIENT_ID
    alternateKeys.push('REACT_APP_' + key);
  } else if (key.startsWith('REACT_APP_AMAZON_')) {
    // If looking for REACT_APP_AMAZON_CLIENT_ID, also check AMAZON_CLIENT_ID
    alternateKeys.push(key.replace('REACT_APP_', ''));
  }

  // First try to get from window.ENV (for browser)
  if (typeof window !== 'undefined' && window.ENV) {
    if (window.ENV[key]) {
      return window.ENV[key];
    }
    
    // Try alternate keys
    for (const altKey of alternateKeys) {
      if (window.ENV[altKey]) {
        console.log(`Found environment variable using alternate key: ${altKey} instead of ${key}`);
        return window.ENV[altKey];
      }
    }
  }
  
  // Then try from process.env (for Node.js during build)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key];
    }
    
    // Try alternate keys
    for (const altKey of alternateKeys) {
      if (process.env[altKey]) {
        console.log(`Found environment variable using alternate key: ${altKey} instead of ${key}`);
        return process.env[altKey];
      }
    }
  }
  
  // If we're in development, allow manual override
  if (process.env.NODE_ENV === 'development') {
    // Add your development values here when needed
    const devValues = {
      // You can manually add values here for local testing
      // For example: AMAZON_CLIENT_ID: 'your-dev-client-id'
    };
    
    if (devValues[key]) {
      return devValues[key];
    }
    
    // Try alternate keys in devValues
    for (const altKey of alternateKeys) {
      if (devValues[altKey]) {
        return devValues[altKey];
      }
    }
  }
  
  return defaultValue;
};

// Export configured values
export const config = {
  // Supabase
  supabaseUrl: getEnv('REACT_APP_SUPABASE_URL', 'https://hzhzejqyjotckrntykxc.supabase.co'),
  supabaseAnonKey: getEnv('REACT_APP_SUPABASE_ANON_KEY', ''),
  
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

// Debug the configuration
console.log('App Configuration:', {
  supabaseUrl: config.supabaseUrl,
  supabaseAnonKey: config.supabaseAnonKey ? '[HIDDEN]' : 'NOT SET',
  amazonClientId: config.amazonClientId ? '[HIDDEN]' : 'NOT SET',
  amazonRedirectUri: config.amazonRedirectUri,
  isValid: config.isConfigValid()
}); 
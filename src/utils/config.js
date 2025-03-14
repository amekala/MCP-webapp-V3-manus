/**
 * Configuration helper that provides access to environment variables with fallbacks
 */

// Helper function to safely get environment variables
const getEnv = (key, defaultValue = '') => {
  // First try to get from window.ENV (for browser)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Then try from process.env (for Node.js during build)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // If we're in development, allow manual override
  if (process.env.NODE_ENV === 'development') {
    // Add your development values here when needed
    const devValues = {
      // You can manually add values here for local testing
      // For example: REACT_APP_AMAZON_CLIENT_ID: 'your-dev-client-id'
    };
    
    if (devValues[key]) {
      return devValues[key];
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
  amazonClientId: getEnv('REACT_APP_AMAZON_CLIENT_ID', ''),
  amazonRedirectUri: getEnv('REACT_APP_AMAZON_REDIRECT_URI', 'https://v0-ads-connect-project.vercel.app/auth-callback'),
  
  // Helper method to check if all required config is available
  isConfigValid: () => {
    const missingVars = [];
    
    if (!config.supabaseUrl) missingVars.push('REACT_APP_SUPABASE_URL');
    if (!config.supabaseAnonKey) missingVars.push('REACT_APP_SUPABASE_ANON_KEY');
    if (!config.amazonClientId) missingVars.push('REACT_APP_AMAZON_CLIENT_ID');
    if (!config.amazonRedirectUri) missingVars.push('REACT_APP_AMAZON_REDIRECT_URI');
    
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
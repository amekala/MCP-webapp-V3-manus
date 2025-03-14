const fs = require('fs');

// Read the values from environment variables - prioritize Vercel naming over React naming
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://hzhzejqyjotckrntykxc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Debug environment variables before processing
console.log('\nDEBUG - Raw Environment Variables:');
console.log('process.env keys:', Object.keys(process.env));
console.log('AMAZON_CLIENT_ID direct check:', process.env.AMAZON_CLIENT_ID);
console.log('REACT_APP_AMAZON_CLIENT_ID direct check:', process.env.REACT_APP_AMAZON_CLIENT_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

// Amazon OAuth credentials
const amazonClientId = process.env.AMAZON_CLIENT_ID || process.env.REACT_APP_AMAZON_CLIENT_ID || '';
console.log('\nDEBUG - Amazon Client ID Resolution:');
console.log('Final amazonClientId value:', amazonClientId ? 'SET (hidden)' : 'EMPTY');
console.log('amazonClientId is empty string:', amazonClientId === '');
console.log('amazonClientId is undefined:', typeof amazonClientId === 'undefined');

const amazonClientSecret = process.env.AMAZON_CLIENT_SECRET || process.env.REACT_APP_AMAZON_CLIENT_SECRET || '';
const amazonRedirectUri = process.env.AMAZON_REDIRECT_URI || process.env.REACT_APP_AMAZON_REDIRECT_URI || 'https://v0-ads-connect-project.vercel.app/auth-callback';

// Add warning for missing credentials but don't fail the build
if (!amazonClientId) {
  console.warn('\nWARNING: AMAZON_CLIENT_ID or REACT_APP_AMAZON_CLIENT_ID is not set');
  console.warn('Available environment variables:', Object.keys(process.env).filter(key => key.includes('AMAZON')));
}

if (!amazonClientSecret) {
  console.warn('WARNING: AMAZON_CLIENT_SECRET or REACT_APP_AMAZON_CLIENT_SECRET is not set');
}

// Add more detailed logging for environment variables
console.log('\nDETAILED ENVIRONMENT CHECK:');
console.log('Amazon OAuth Configuration:');
console.log('- AMAZON_CLIENT_ID:', process.env.AMAZON_CLIENT_ID ? 'SET' : 'MISSING');
console.log('- REACT_APP_AMAZON_CLIENT_ID:', process.env.REACT_APP_AMAZON_CLIENT_ID ? 'SET' : 'MISSING');
console.log('- AMAZON_REDIRECT_URI:', process.env.AMAZON_REDIRECT_URI || 'MISSING');
console.log('- REACT_APP_AMAZON_REDIRECT_URI:', process.env.REACT_APP_AMAZON_REDIRECT_URI || 'MISSING');

console.log('\nSupabase Configuration:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING');
console.log('- REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL || 'MISSING');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('- REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');

console.log('\nFinal resolved values:');
console.log('- amazonClientId:', amazonClientId ? 'SET' : 'MISSING');
console.log('- amazonRedirectUri:', amazonRedirectUri);
console.log('- supabaseUrl:', supabaseUrl);

// Create the content for .env.production
const envContent = `# Supabase Configuration
REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Amazon OAuth configuration
REACT_APP_AMAZON_CLIENT_ID=${amazonClientId}
REACT_APP_AMAZON_CLIENT_SECRET=${amazonClientSecret}
REACT_APP_AMAZON_REDIRECT_URI=${amazonRedirectUri}
`;

// Write the content to .env.production
fs.writeFileSync('.env.production', envContent);

// Create browser-accessible environment config with validation
const publicEnvContent = `window.ENV = {
  REACT_APP_SUPABASE_URL: "${supabaseUrl}",
  REACT_APP_SUPABASE_ANON_KEY: "${supabaseAnonKey}",
  REACT_APP_AMAZON_CLIENT_ID: "${amazonClientId}",
  REACT_APP_AMAZON_REDIRECT_URI: "${amazonRedirectUri}"
};

// Runtime validation
(function validateEnvironment() {
  console.log('Runtime environment check:');
  console.log('window.ENV:', JSON.stringify(window.ENV, null, 2));
  
  if (!window.ENV.REACT_APP_AMAZON_CLIENT_ID) {
    console.error('Amazon OAuth Error: Client ID is not configured. OAuth will not work.');
    console.error('Available ENV values:', Object.keys(window.ENV));
  }
  if (!window.ENV.REACT_APP_AMAZON_REDIRECT_URI) {
    console.error('Amazon OAuth Error: Redirect URI is not configured. OAuth will not work.');
  }
})();
`;

// Write to public folder to be served with the app
fs.writeFileSync('./public/env-config.js', publicEnvContent);

console.log('\nEnvironment files created:');
console.log('- .env.production');
console.log('- public/env-config.js');
console.log('\nFinal check - env-config.js content:');
console.log(publicEnvContent); 
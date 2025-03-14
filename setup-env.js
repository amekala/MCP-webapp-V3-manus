const fs = require('fs');

// Read the values from environment variables - prioritize Vercel naming over React naming
// Vercel exposes env vars to the browser if they start with NEXT_PUBLIC_ or REACT_APP_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://hzhzejqyjotckrntykxc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Debug environment variables before processing
console.log('\nDEBUG - Raw Environment Variables:');
console.log('process.env keys:', Object.keys(process.env).filter(key => 
  key.includes('AMAZON') || 
  key.includes('SUPABASE') || 
  key.includes('NEXT_PUBLIC') || 
  key.includes('REACT_APP')
));
console.log('AMAZON_CLIENT_ID direct check:', process.env.AMAZON_CLIENT_ID ? 'SET (length: ' + process.env.AMAZON_CLIENT_ID.length + ')' : 'NOT SET');
console.log('NEXT_PUBLIC_AMAZON_CLIENT_ID direct check:', process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('REACT_APP_AMAZON_CLIENT_ID direct check:', process.env.REACT_APP_AMAZON_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

// Try to get Amazon OAuth credentials with expanded prefix options
const amazonClientId = 
  process.env.AMAZON_CLIENT_ID || 
  process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID || 
  process.env.REACT_APP_AMAZON_CLIENT_ID || 
  '';

console.log('\nDEBUG - Amazon Client ID Resolution:');
console.log('Final amazonClientId value:', amazonClientId ? 'SET (length: ' + amazonClientId.length + ')' : 'EMPTY');
console.log('amazonClientId first 5 chars (if set):', amazonClientId ? amazonClientId.substring(0, 5) + '...' : 'N/A');
console.log('amazonClientId is empty string:', amazonClientId === '');
console.log('amazonClientId is undefined:', typeof amazonClientId === 'undefined');

const amazonClientSecret = 
  process.env.AMAZON_CLIENT_SECRET || 
  process.env.NEXT_PUBLIC_AMAZON_CLIENT_SECRET || 
  process.env.REACT_APP_AMAZON_CLIENT_SECRET || 
  '';

const amazonRedirectUri = 
  process.env.AMAZON_REDIRECT_URI || 
  process.env.NEXT_PUBLIC_AMAZON_REDIRECT_URI || 
  process.env.REACT_APP_AMAZON_REDIRECT_URI || 
  'https://v0-ads-connect-project.vercel.app/auth-callback';

// Add warning for missing credentials but don't fail the build
if (!amazonClientId) {
  console.warn('\nWARNING: No Amazon Client ID found in environment variables!');
  console.warn('Available environment variables with AMAZON:', Object.keys(process.env).filter(key => key.includes('AMAZON')));
  console.warn('You need to set AMAZON_CLIENT_ID in your environment variables');
}

// Add more detailed logging for environment variables
console.log('\nDETAILED ENVIRONMENT CHECK:');
console.log('Amazon OAuth Configuration:');
console.log('- AMAZON_CLIENT_ID:', process.env.AMAZON_CLIENT_ID ? 'SET' : 'MISSING');
console.log('- NEXT_PUBLIC_AMAZON_CLIENT_ID:', process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID ? 'SET' : 'MISSING');
console.log('- REACT_APP_AMAZON_CLIENT_ID:', process.env.REACT_APP_AMAZON_CLIENT_ID ? 'SET' : 'MISSING');
console.log('- AMAZON_REDIRECT_URI:', process.env.AMAZON_REDIRECT_URI || 'MISSING');
console.log('- NEXT_PUBLIC_AMAZON_REDIRECT_URI:', process.env.NEXT_PUBLIC_AMAZON_REDIRECT_URI || 'MISSING');
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
AMAZON_CLIENT_ID=${amazonClientId}
AMAZON_CLIENT_SECRET=${amazonClientSecret}
AMAZON_REDIRECT_URI=${amazonRedirectUri}
`;

// Write the content to .env.production
fs.writeFileSync('.env.production', envContent);

// Create browser-accessible environment config with validation
const publicEnvContent = `window.ENV = {
  REACT_APP_SUPABASE_URL: "${supabaseUrl}",
  REACT_APP_SUPABASE_ANON_KEY: "${supabaseAnonKey}",
  AMAZON_CLIENT_ID: "${amazonClientId}",
  AMAZON_REDIRECT_URI: "${amazonRedirectUri}"
};

// Runtime validation
(function validateEnvironment() {
  console.log('Runtime environment check:');
  console.log('window.ENV:', JSON.stringify(window.ENV, null, 2));
  
  if (!window.ENV.AMAZON_CLIENT_ID) {
    console.error('Amazon OAuth Error: Client ID is not configured. OAuth will not work.');
    console.error('Available ENV values:', Object.keys(window.ENV));
  }
  if (!window.ENV.AMAZON_REDIRECT_URI) {
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
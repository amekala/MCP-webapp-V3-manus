const fs = require('fs');

// Read the values from environment variables - prioritize Vercel naming over React naming
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://hzhzejqyjotckrntykxc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const amazonClientId = process.env.AMAZON_CLIENT_ID || process.env.REACT_APP_AMAZON_CLIENT_ID || '';
const amazonClientSecret = process.env.AMAZON_CLIENT_SECRET || process.env.REACT_APP_AMAZON_CLIENT_SECRET || '';
const amazonRedirectUri = process.env.AMAZON_REDIRECT_URI || process.env.REACT_APP_AMAZON_REDIRECT_URI || 'https://v0-ads-connect-project.vercel.app/auth-callback';

// Add more detailed logging for environment variables
console.log('DETAILED ENVIRONMENT CHECK:');
console.log('SUPABASE_URL from env:', process.env.SUPABASE_URL);
console.log('REACT_APP_SUPABASE_URL from env:', process.env.REACT_APP_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY from env:', process.env.SUPABASE_ANON_KEY ? 'PRESENT (hidden for security)' : 'MISSING');
console.log('REACT_APP_SUPABASE_ANON_KEY from env:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'PRESENT (hidden for security)' : 'MISSING');
console.log('AMAZON_CLIENT_ID from env:', process.env.AMAZON_CLIENT_ID || 'MISSING');
console.log('REACT_APP_AMAZON_CLIENT_ID from env:', process.env.REACT_APP_AMAZON_CLIENT_ID || 'MISSING');
console.log('AMAZON_REDIRECT_URI from env:', process.env.AMAZON_REDIRECT_URI || 'MISSING');
console.log('REACT_APP_AMAZON_REDIRECT_URI from env:', process.env.REACT_APP_AMAZON_REDIRECT_URI || 'MISSING');

console.log('\nFinal resolved values:');
console.log('- amazonClientId:', amazonClientId ? 'SET (value hidden)' : 'MISSING');
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

// Create browser-accessible environment config
const publicEnvContent = `window.ENV = {
  REACT_APP_SUPABASE_URL: "${supabaseUrl}",
  REACT_APP_SUPABASE_ANON_KEY: "${supabaseAnonKey}",
  REACT_APP_AMAZON_CLIENT_ID: "${amazonClientId}",
  REACT_APP_AMAZON_REDIRECT_URI: "${amazonRedirectUri}"
}`;

// Write to public folder to be served with the app
fs.writeFileSync('./public/env-config.js', publicEnvContent);

console.log('\nEnvironment files created:');
console.log('- .env.production');
console.log('- public/env-config.js'); 
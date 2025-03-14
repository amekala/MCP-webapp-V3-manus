const fs = require('fs');

// Read the values from environment variables - prioritize Vercel naming over React naming
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://hzhzejqyjotckrntykxc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const amazonClientId = process.env.AMAZON_CLIENT_ID || process.env.REACT_APP_AMAZON_CLIENT_ID || '';
const amazonClientSecret = process.env.AMAZON_CLIENT_SECRET || process.env.REACT_APP_AMAZON_CLIENT_SECRET || '';
const amazonRedirectUri = process.env.AMAZON_REDIRECT_URI || process.env.REACT_APP_AMAZON_REDIRECT_URI || 'https://v0-ads-connect-project.vercel.app/auth/callback';

console.log('Environment check:');
console.log('- SUPABASE_URL present:', !!process.env.SUPABASE_URL);
console.log('- SUPABASE_ANON_KEY present:', !!process.env.SUPABASE_ANON_KEY);
console.log('- AMAZON_CLIENT_ID present:', !!process.env.AMAZON_CLIENT_ID);
console.log('- AMAZON_CLIENT_SECRET present:', !!process.env.AMAZON_CLIENT_SECRET);
console.log('- AMAZON_REDIRECT_URI present:', !!process.env.AMAZON_REDIRECT_URI);

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

console.log('Environment variables set up for production build'); 
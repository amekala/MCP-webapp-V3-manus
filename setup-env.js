const fs = require('fs');

// Read the values from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://hzhzejqyjotckrntykxc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const amazonClientId = process.env.AMAZON_CLIENT_ID || process.env.REACT_APP_AMAZON_CLIENT_ID;
const amazonClientSecret = process.env.AMAZON_CLIENT_SECRET || process.env.REACT_APP_AMAZON_CLIENT_SECRET;
const amazonRedirectUri = process.env.AMAZON_REDIRECT_URI || 'https://adsconnect-manus.vercel.app/auth/callback';

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
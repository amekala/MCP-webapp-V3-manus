import { supabase } from '../lib/supabaseClient';

interface AmazonAuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Debug environment configuration
console.log('\nAmazon Auth Module - Environment Debug:');
console.log('Running in:', isBrowser ? 'Browser' : 'Server');
if (isBrowser) {
  console.log('window.ENV available:', !!window.ENV);
  console.log('window.ENV contents:', JSON.stringify(window.ENV, null, 2));
}

// Validate environment configuration on load
if (isBrowser) {
  console.log('\nValidating Amazon OAuth Configuration:');
  if (!window.ENV?.REACT_APP_AMAZON_CLIENT_ID) {
    console.error('Amazon OAuth Configuration Error: Client ID is not set in window.ENV');
    console.error('window.ENV state:', JSON.stringify(window.ENV, null, 2));
  }
  if (!window.ENV?.REACT_APP_AMAZON_REDIRECT_URI) {
    console.error('Amazon OAuth Configuration Error: Redirect URI is not set in window.ENV');
  }
}

export const amazonAuth = {
  /**
   * Initiates the Amazon OAuth flow by opening a popup window
   * @param userId The ID of the authenticated user
   * @returns Promise resolving to the authentication result
   */
  initiateAuth: async (userId: string): Promise<AmazonAuthResponse> => {
    try {
      console.log('\nInitiating Amazon OAuth - Environment Check:');
      console.log('isBrowser:', isBrowser);
      console.log('window.ENV available:', isBrowser && !!window.ENV);
      
      // Get credentials from environment variables
      const clientId = isBrowser 
        ? window.ENV?.REACT_APP_AMAZON_CLIENT_ID
        : (process.env.AMAZON_CLIENT_ID || process.env.REACT_APP_AMAZON_CLIENT_ID);
      
      const redirectUri = isBrowser
        ? window.ENV?.REACT_APP_AMAZON_REDIRECT_URI
        : (process.env.AMAZON_REDIRECT_URI || process.env.REACT_APP_AMAZON_REDIRECT_URI);
      
      console.log('\nAmazon OAuth Debug:');
      console.log('- clientId available:', !!clientId);
      console.log('- redirectUri available:', !!redirectUri);
      console.log('- Using clientId:', clientId || 'NOT SET');
      console.log('- Using redirectUri:', redirectUri);
      console.log('- Environment:', isBrowser ? 'Browser' : 'Server');
      console.log('- window.ENV:', isBrowser ? JSON.stringify(window.ENV, null, 2) : 'Not available');
      console.log('- Environment variables:', isBrowser ? 'Not available in browser' : process.env);
      
      if (!clientId) {
        const error = 'Amazon Client ID is not configured. Please check your environment variables.';
        console.error('\nAmazon OAuth Error:', error);
        console.error('Environment:', isBrowser ? JSON.stringify(window.ENV, null, 2) : 'Server environment');
        return { 
          success: false, 
          error 
        };
      }

      if (!redirectUri) {
        const error = 'Amazon Redirect URI is not configured. Please check your environment variables.';
        console.error('Amazon OAuth Error:', error);
        console.error('Environment:', isBrowser ? window.ENV : 'Server environment');
        return { 
          success: false, 
          error 
        };
      }

      // Get the user's JWT token to use as state parameter
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { 
          success: false, 
          error: 'User not authenticated' 
        };
      }

      const state = session.access_token;
      
      // Define OAuth parameters
      const scope = 'advertising::campaign_management';
      const responseType = 'code';
      
      // Build the authorization URL
      const authUrl = new URL('https://www.amazon.com/ap/oa');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('response_type', responseType);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('state', state);
      
      // Open the authorization URL in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      
      const popup = window.open(
        authUrl.toString(),
        'amazon-auth-popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup) {
        return { 
          success: false, 
          error: 'Popup blocked. Please allow popups for this site.' 
        };
      }
      
      // Poll the popup to check when it's closed or redirected
      return new Promise((resolve) => {
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            resolve({ 
              success: false, 
              error: 'Authentication window closed before completion' 
            });
          }
          
          try {
            // Check if we're back on our domain (callback)
            if (popup.location.href.startsWith(redirectUri)) {
              clearInterval(checkPopup);
              popup.close();
              resolve({ 
                success: true, 
                message: 'Authentication successful' 
              });
            }
          } catch (e) {
            // Cross-origin error, ignore (user is on Amazon domain)
          }
        }, 500);
      });
    } catch (error) {
      console.error('Amazon auth error:', error);
      return { 
        success: false, 
        error: 'Failed to initiate Amazon authentication' 
      };
    }
  },
  
  /**
   * Checks if the user has an active Amazon connection
   * @param userId The ID of the authenticated user
   * @returns Promise resolving to connection status
   */
  checkConnectionStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('amazon_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);
      
      if (error) {
        console.error('Connection check error:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Connection check error:', error);
      return false;
    }
  },
  
  /**
   * Disconnects the user's Amazon account
   * @param userId The ID of the authenticated user
   * @returns Promise resolving to the disconnection result
   */
  disconnect: async (userId: string): Promise<AmazonAuthResponse> => {
    try {
      const { error } = await supabase
        .from('amazon_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Disconnect error:', error);
        return { 
          success: false, 
          error: 'Failed to disconnect Amazon account' 
        };
      }
      
      return { 
        success: true, 
        message: 'Amazon account disconnected successfully' 
      };
    } catch (error) {
      console.error('Disconnect error:', error);
      return { 
        success: false, 
        error: 'Failed to disconnect Amazon account' 
      };
    }
  },
  
  /**
   * Fetches the user's Amazon advertiser profiles
   * @param userId The ID of the authenticated user
   * @returns Promise resolving to the profiles fetch result
   */
  fetchProfiles: async (userId: string): Promise<AmazonAuthResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-amazon-profiles', {
        body: { userId },
      });
      
      if (error) {
        console.error('Profile fetch error:', error);
        return { 
          success: false, 
          error: 'Failed to fetch Amazon profiles' 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully fetched ${data.profiles} Amazon profiles` 
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { 
        success: false, 
        error: 'Failed to fetch Amazon profiles' 
      };
    }
  },
  
  /**
   * Gets the user's connected Amazon advertiser accounts
   * @param userId The ID of the authenticated user
   * @returns Promise resolving to the list of advertiser accounts
   */
  getAdvertiserAccounts: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('account_name', { ascending: true });
      
      if (error) {
        console.error('Advertiser accounts error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Advertiser accounts error:', error);
      return [];
    }
  }
};

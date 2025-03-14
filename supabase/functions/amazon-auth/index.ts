import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Amazon API credentials from environment variables
    const clientId = Deno.env.get('AMAZON_CLIENT_ID') || '';
    const clientSecret = Deno.env.get('AMAZON_CLIENT_SECRET') || '';
    const redirectUri = Deno.env.get('AMAZON_REDIRECT_URI') || '';

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Amazon API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return new Response(
        JSON.stringify({ error: tokenData.error_description || 'Failed to exchange authorization code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract tokens and expiration
    const { access_token, refresh_token, expires_in } = tokenData;
    
    // Calculate expiration timestamp
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Get user ID from state (should be JWT token)
    let userId;
    try {
      // Verify the JWT from state parameter
      const { data: { user }, error: authError } = await supabase.auth.getUser(state);
      
      if (authError || !user) {
        throw new Error('Invalid authentication state');
      }
      
      userId = user.id;
    } catch (error) {
      console.error('Auth verification error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication state' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store tokens in database
    const { data: tokenData, error: insertError } = await supabase
      .from('amazon_tokens')
      .insert({
        user_id: userId,
        access_token,
        refresh_token,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        token_scope: 'advertising::campaign_management',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Token storage error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store Amazon tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trigger profile fetch in a separate request (don't wait for it)
    fetch(`${supabaseUrl}/functions/v1/fetch-amazon-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ userId }),
    }).catch(error => {
      console.error('Error triggering profile fetch:', error);
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Amazon account connected successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

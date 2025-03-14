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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's Amazon tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('amazon_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token retrieval error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'No active Amazon tokens found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    let accessToken = tokenData.access_token;
    
    if (expiresAt <= now) {
      // Token is expired, refresh it
      const clientId = Deno.env.get('AMAZON_CLIENT_ID') || '';
      const clientSecret = Deno.env.get('AMAZON_CLIENT_SECRET') || '';
      
      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: 'Amazon API credentials not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const refreshResponse = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      
      const refreshData = await refreshResponse.json();
      
      if (!refreshResponse.ok || refreshData.error) {
        console.error('Token refresh error:', refreshData);
        return new Response(
          JSON.stringify({ error: refreshData.error_description || 'Failed to refresh token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update token in database
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);
      
      const { error: updateError } = await supabase
        .from('amazon_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: newExpiresAt.toISOString(),
          last_refreshed: now.toISOString(),
        })
        .eq('id', tokenData.id);
      
      if (updateError) {
        console.error('Token update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update refreshed token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      accessToken = refreshData.access_token;
    }

    // Fetch profiles from Amazon Advertising API
    const profilesResponse = await fetch('https://advertising-api.amazon.com/v2/profiles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Amazon-Advertising-API-ClientId': Deno.env.get('AMAZON_CLIENT_ID') || '',
        'Content-Type': 'application/json',
      },
    });

    const profilesData = await profilesResponse.json();

    if (!profilesResponse.ok) {
      console.error('Profiles fetch error:', profilesData);
      return new Response(
        JSON.stringify({ error: profilesData.error || 'Failed to fetch Amazon profiles' }),
        { status: profilesResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store profiles in database
    const insertPromises = profilesData.map(async (profile: any) => {
      const { error: upsertError } = await supabase
        .from('advertisers')
        .upsert({
          user_id: userId,
          profile_id: profile.profileId,
          account_name: profile.accountName || profile.accountInfo?.name || 'Unknown Account',
          marketplace: profile.countryCode || 'unknown',
          account_type: profile.accountInfo?.type || 'seller',
          last_synced: now.toISOString(),
          status: 'active',
        }, {
          onConflict: 'user_id, profile_id',
        });

      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
      }
    });

    await Promise.all(insertPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Amazon profiles fetched and stored successfully',
        profiles: profilesData.length
      }),
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

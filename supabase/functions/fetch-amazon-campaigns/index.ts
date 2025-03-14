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
    const { userId, profileId } = await req.json();

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

    // Determine which profiles to fetch campaigns for
    let profileIds: string[] = [];
    
    if (profileId) {
      // If a specific profile ID is provided, use only that one
      profileIds = [profileId];
    } else {
      // Otherwise, fetch all profiles for the user
      const { data: profilesData, error: profilesError } = await supabase
        .from('advertisers')
        .select('profile_id')
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (profilesError) {
        console.error('Profiles fetch error:', profilesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch advertiser profiles' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      profileIds = profilesData.map(p => p.profile_id);
    }
    
    if (profileIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active advertiser profiles found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch campaigns for each profile
    const campaignResults: any[] = [];
    const campaignErrors: any[] = [];
    
    for (const currentProfileId of profileIds) {
      try {
        // Fetch campaigns from Amazon Advertising API
        const campaignsResponse = await fetch(`https://advertising-api.amazon.com/v2/campaigns?profileId=${currentProfileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Amazon-Advertising-API-ClientId': Deno.env.get('AMAZON_CLIENT_ID') || '',
            'Amazon-Advertising-API-Scope': currentProfileId,
            'Content-Type': 'application/json',
          },
        });

        const campaignsData = await campaignsResponse.json();

        if (!campaignsResponse.ok) {
          console.error(`Campaigns fetch error for profile ${currentProfileId}:`, campaignsData);
          campaignErrors.push({
            profileId: currentProfileId,
            error: campaignsData.error || 'Failed to fetch campaigns',
            status: campaignsResponse.status
          });
          continue;
        }

        // Store campaigns in database
        if (Array.isArray(campaignsData) && campaignsData.length > 0) {
          const insertPromises = campaignsData.map(async (campaign: any) => {
            const { error: upsertError } = await supabase
              .from('campaigns')
              .upsert({
                user_id: userId,
                profile_id: currentProfileId,
                campaign_id: campaign.campaignId,
                campaign_name: campaign.name,
                campaign_type: campaign.campaignType,
                targeting_type: campaign.targetingType,
                daily_budget: campaign.dailyBudget,
                start_date: campaign.startDate,
                state: campaign.state,
                last_synced: now.toISOString(),
              }, {
                onConflict: 'user_id, profile_id, campaign_id',
              });

            if (upsertError) {
              console.error('Campaign upsert error:', upsertError);
            }
          });

          await Promise.all(insertPromises);
          
          campaignResults.push({
            profileId: currentProfileId,
            campaignsCount: campaignsData.length
          });
        } else {
          campaignResults.push({
            profileId: currentProfileId,
            campaignsCount: 0
          });
        }
      } catch (error) {
        console.error(`Error processing profile ${currentProfileId}:`, error);
        campaignErrors.push({
          profileId: currentProfileId,
          error: 'Unexpected error processing profile'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Amazon campaigns fetched and stored successfully',
        results: campaignResults,
        errors: campaignErrors.length > 0 ? campaignErrors : undefined,
        profilesProcessed: profileIds.length,
        profilesWithErrors: campaignErrors.length
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

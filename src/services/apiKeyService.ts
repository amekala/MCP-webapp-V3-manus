import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface ApiKeyResponse {
  success: boolean;
  error?: string;
  message?: string;
  key?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  created_at: string;
  last_used: string | null;
  is_active: boolean;
  request_count: number;
}

export const apiKeyService = {
  /**
   * Generates a new API key for the user
   * @param userId The ID of the authenticated user
   * @param name A friendly name for the API key
   * @returns Promise resolving to the API key generation result
   */
  generateApiKey: async (userId: string, name: string): Promise<ApiKeyResponse> => {
    try {
      // Check if user has connected Amazon account
      const { data: amazonTokens, error: tokenError } = await supabase
        .from('amazon_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);
      
      if (tokenError) {
        console.error('Token check error:', tokenError);
        return { 
          success: false, 
          error: 'Failed to verify Amazon connection' 
        };
      }
      
      if (!amazonTokens || amazonTokens.length === 0) {
        return { 
          success: false, 
          error: 'You must connect your Amazon Advertising account before generating API keys' 
        };
      }
      
      // Generate a secure random API key
      const keyValue = `ak_${uuidv4().replace(/-/g, '')}`;
      
      // Store the API key in the database
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          key_value: keyValue,
          name,
          created_at: new Date().toISOString(),
          is_active: true,
          request_count: 0,
        })
        .select()
        .single();
      
      if (error) {
        console.error('API key generation error:', error);
        return { 
          success: false, 
          error: 'Failed to generate API key' 
        };
      }
      
      return { 
        success: true, 
        message: 'API key generated successfully',
        key: keyValue
      };
    } catch (error) {
      console.error('API key generation error:', error);
      return { 
        success: false, 
        error: 'Failed to generate API key' 
      };
    }
  },
  
  /**
   * Gets all API keys for the user
   * @param userId The ID of the authenticated user
   * @returns Promise resolving to the list of API keys
   */
  getApiKeys: async (userId: string): Promise<ApiKey[]> => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('API key fetch error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('API key fetch error:', error);
      return [];
    }
  },
  
  /**
   * Revokes an API key
   * @param userId The ID of the authenticated user
   * @param keyId The ID of the API key to revoke
   * @returns Promise resolving to the revocation result
   */
  revokeApiKey: async (userId: string, keyId: string): Promise<ApiKeyResponse> => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('API key revocation error:', error);
        return { 
          success: false, 
          error: 'Failed to revoke API key' 
        };
      }
      
      return { 
        success: true, 
        message: 'API key revoked successfully' 
      };
    } catch (error) {
      console.error('API key revocation error:', error);
      return { 
        success: false, 
        error: 'Failed to revoke API key' 
      };
    }
  }
};

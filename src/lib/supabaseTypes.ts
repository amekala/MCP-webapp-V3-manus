export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      amazon_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          created_at: string
          last_refreshed: string
          is_active: boolean
          token_scope: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          created_at?: string
          last_refreshed?: string
          is_active?: boolean
          token_scope?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string
          created_at?: string
          last_refreshed?: string
          is_active?: boolean
          token_scope?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_value: string
          name: string
          created_at: string
          last_used: string | null
          is_active: boolean
          request_count: number
        }
        Insert: {
          id?: string
          user_id: string
          key_value: string
          name: string
          created_at?: string
          last_used?: string | null
          is_active?: boolean
          request_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          key_value?: string
          name?: string
          created_at?: string
          last_used?: string | null
          is_active?: boolean
          request_count?: number
        }
      }
      advertisers: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          account_name: string
          marketplace: string
          account_type: string
          created_at: string
          last_synced: string | null
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          account_name: string
          marketplace: string
          account_type: string
          created_at?: string
          last_synced?: string | null
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          account_name?: string
          marketplace?: string
          account_type?: string
          created_at?: string
          last_synced?: string | null
          status?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          advertiser_id: string
          campaign_id: string
          name: string
          campaign_type: string
          budget: number
          state: string
          created_at: string
          last_updated: string
        }
        Insert: {
          id?: string
          advertiser_id: string
          campaign_id: string
          name: string
          campaign_type: string
          budget: number
          state: string
          created_at?: string
          last_updated?: string
        }
        Update: {
          id?: string
          advertiser_id?: string
          campaign_id?: string
          name?: string
          campaign_type?: string
          budget?: number
          state?: string
          created_at?: string
          last_updated?: string
        }
      }
      campaign_metrics: {
        Row: {
          id: string
          campaign_id: string
          date: string
          impressions: number
          clicks: number
          spend: number
          sales: number
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          date: string
          impressions: number
          clicks: number
          spend: number
          sales: number
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          date?: string
          impressions?: number
          clicks?: number
          spend?: number
          sales?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_by_id: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

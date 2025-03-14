-- Create tables for AdsConnect platform

-- Enable RLS (Row Level Security)
alter table if exists "public"."amazon_tokens" enable row level security;
alter table if exists "public"."api_keys" enable row level security;
alter table if exists "public"."advertisers" enable row level security;
alter table if exists "public"."campaigns" enable row level security;
alter table if exists "public"."campaign_metrics" enable row level security;
alter table if exists "public"."profiles" enable row level security;

-- Create profiles table
create table if not exists "public"."profiles" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "first_name" text not null,
    "last_name" text not null,
    "company_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    primary key ("id")
);

-- Create amazon_tokens table
create table if not exists "public"."amazon_tokens" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "access_token" text not null,
    "refresh_token" text not null,
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone not null default now(),
    "last_refreshed" timestamp with time zone not null default now(),
    "is_active" boolean not null default true,
    "token_scope" text not null default 'advertising::campaign_management',
    primary key ("id")
);

-- Create api_keys table
create table if not exists "public"."api_keys" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "key_value" text not null,
    "name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "last_used" timestamp with time zone,
    "is_active" boolean not null default true,
    "request_count" integer not null default 0,
    primary key ("id")
);

-- Create advertisers table
create table if not exists "public"."advertisers" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "profile_id" text not null,
    "account_name" text not null,
    "marketplace" text not null,
    "account_type" text not null,
    "created_at" timestamp with time zone not null default now(),
    "last_synced" timestamp with time zone,
    "status" text not null default 'active',
    primary key ("id"),
    unique ("user_id", "profile_id")
);

-- Create campaigns table
create table if not exists "public"."campaigns" (
    "id" uuid not null default uuid_generate_v4(),
    "advertiser_id" uuid not null references public.advertisers(id) on delete cascade,
    "campaign_id" text not null,
    "name" text not null,
    "campaign_type" text not null,
    "budget" numeric not null,
    "state" text not null,
    "created_at" timestamp with time zone not null default now(),
    "last_updated" timestamp with time zone not null default now(),
    primary key ("id"),
    unique ("advertiser_id", "campaign_id")
);

-- Create campaign_metrics table
create table if not exists "public"."campaign_metrics" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null references public.campaigns(id) on delete cascade,
    "date" date not null,
    "impressions" integer not null default 0,
    "clicks" integer not null default 0,
    "spend" numeric not null default 0,
    "sales" numeric not null default 0,
    "created_at" timestamp with time zone not null default now(),
    primary key ("id"),
    unique ("campaign_id", "date")
);

-- Create RLS policies

-- Profiles: Users can only read their own profile
create policy "Users can view their own profile"
    on profiles for select
    using (auth.uid() = user_id);

-- Profiles: Users can update their own profile
create policy "Users can update their own profile"
    on profiles for update
    using (auth.uid() = user_id);

-- Amazon Tokens: Users can only read their own tokens
create policy "Users can view their own tokens"
    on amazon_tokens for select
    using (auth.uid() = user_id);

-- Amazon Tokens: Users can only insert their own tokens
create policy "Users can insert their own tokens"
    on amazon_tokens for insert
    with check (auth.uid() = user_id);

-- Amazon Tokens: Users can only update their own tokens
create policy "Users can update their own tokens"
    on amazon_tokens for update
    using (auth.uid() = user_id);

-- API Keys: Users can only read their own API keys
create policy "Users can view their own API keys"
    on api_keys for select
    using (auth.uid() = user_id);

-- API Keys: Users can only insert their own API keys
create policy "Users can insert their own API keys"
    on api_keys for insert
    with check (auth.uid() = user_id);

-- API Keys: Users can only update their own API keys
create policy "Users can update their own API keys"
    on api_keys for update
    using (auth.uid() = user_id);

-- API Keys: Users can only delete their own API keys
create policy "Users can delete their own API keys"
    on api_keys for delete
    using (auth.uid() = user_id);

-- Advertisers: Users can only read their own advertisers
create policy "Users can view their own advertisers"
    on advertisers for select
    using (auth.uid() = user_id);

-- Advertisers: Users can only insert their own advertisers
create policy "Users can insert their own advertisers"
    on advertisers for insert
    with check (auth.uid() = user_id);

-- Advertisers: Users can only update their own advertisers
create policy "Users can update their own advertisers"
    on advertisers for update
    using (auth.uid() = user_id);

-- Campaigns: Users can only read campaigns from their advertisers
create policy "Users can view campaigns from their advertisers"
    on campaigns for select
    using (
        exists (
            select 1 from advertisers
            where advertisers.id = campaigns.advertiser_id
            and advertisers.user_id = auth.uid()
        )
    );

-- Campaign Metrics: Users can only read metrics from their campaigns
create policy "Users can view metrics from their campaigns"
    on campaign_metrics for select
    using (
        exists (
            select 1 from campaigns
            join advertisers on campaigns.advertiser_id = advertisers.id
            where campaign_metrics.campaign_id = campaigns.id
            and advertisers.user_id = auth.uid()
        )
    );

-- Create get_profile_by_id function
create or replace function get_profile_by_id(user_id uuid)
returns setof profiles
language sql
security definer
as $$
  select * from profiles where profiles.user_id = user_id;
$$;

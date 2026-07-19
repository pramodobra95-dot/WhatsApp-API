-- Migration: Multi-Tenant Schema and Row-Level Security (RLS) Policies
-- Created: 2026-07-19
-- Target Database: Supabase PostgreSQL / Cloud SQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. JWT CUSTOM CLAIMS ACCESS FUNCTIONS
--------------------------------------------------------------------------------
-- Extracts the tenant_id from the user's Supabase JWT custom claims.
-- During login, the Supabase Auth server injects 'tenant_id' and 'role' into the JWT.
CREATE OR REPLACE FUNCTION auth.tenant_id() 
RETURNS uuid AS $$
  SELECT 
    CASE 
      WHEN NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '') IS NOT NULL 
      THEN (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid
      ELSE NULL
    END;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Extracts the platform/tenant role from the user's Supabase JWT custom claims.
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_role', '')::text;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 2. TABLE SCHEMAS DEFINITIONS WITH tenant_id MANDATE
--------------------------------------------------------------------------------

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  plan text NOT NULL CHECK (plan IN ('growth', 'pro', 'enterprise')),
  status text NOT NULL CHECK (status IN ('active', 'suspended', 'pending')),
  whatsapp_limit integer NOT NULL DEFAULT 1000,
  ai_credits integer NOT NULL DEFAULT 1000,
  ai_used integer NOT NULL DEFAULT 0,
  phone_numbers_count integer NOT NULL DEFAULT 0,
  max_users_count integer NOT NULL DEFAULT 5,
  internal_chat_enabled boolean NOT NULL DEFAULT true,
  allowed_features text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles / Users with Roles mapped to Tenants
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'tenant_admin', 'manager', 'agent', 'viewer')),
  status text NOT NULL CHECK (status IN ('active', 'invited', 'suspended')) DEFAULT 'active',
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Phone numbers managed by tenants
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  display_phone_number text NOT NULL,
  verified_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('connected', 'disconnected', 'pending')),
  quality_rating text NOT NULL CHECK (quality_rating IN ('green', 'yellow', 'red')),
  limit_category text NOT NULL CHECK (limit_category IN ('tier1', 'tier2', 'tier3', 'unlimited')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contacts database
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  tags text[] DEFAULT '{}'::text[],
  custom_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
  segments text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_tenant_phone UNIQUE (tenant_id, phone_number)
);

-- Chats (Conversations metadata)
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('open', 'snoozed', 'resolved')) DEFAULT 'open',
  labels text[] DEFAULT '{}'::text[],
  last_message_text text,
  last_message_time timestamp with time zone DEFAULT timezone('utc'::text, now()),
  unread_count integer NOT NULL DEFAULT 0,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')) DEFAULT 'neutral',
  intent text,
  summary text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  sender text NOT NULL CHECK (sender IN ('customer', 'agent', 'bot', 'system')),
  sender_name text NOT NULL,
  text text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'document', 'audio', 'video')),
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  note_id uuid -- For internal team comments
);

-- Marketing and Utility Campaign Broadcasts
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  template_id text NOT NULL,
  segment_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  scheduled_time timestamp with time zone,
  sent_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  read_count integer NOT NULL DEFAULT 0,
  clicked_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meta Approved Message Templates
CREATE TABLE IF NOT EXISTS public.meta_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
  header_type text NOT NULL CHECK (header_type IN ('NONE', 'TEXT', 'IMAGE', 'DOCUMENT', 'VIDEO')),
  body_text text NOT NULL,
  footer_text text,
  buttons jsonb DEFAULT '[]'::jsonb,
  media_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Interactive Chatbots Builder Configurations
CREATE TABLE IF NOT EXISTS public.chatbots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'inactive',
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sales Pipeline Deals (CRM)
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  title text NOT NULL,
  value numeric(12, 2) NOT NULL DEFAULT 0.00,
  stage text NOT NULL CHECK (stage IN ('lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid,
  user_name text NOT NULL,
  action text NOT NULL,
  details text NOT NULL,
  ip_address text,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) ACTIVATION
--------------------------------------------------------------------------------

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


--------------------------------------------------------------------------------
-- 4. TENANT-ISOLATED SECURITY POLICIES (RLS POLICIES)
--------------------------------------------------------------------------------

-- Helper Check: Is Super Admin?
-- If user_role matches 'super_admin' they bypass standard tenant filtering.
-- This keeps the platform manageable from the central Super Admin portal.

-- Tenant Row Policies
CREATE POLICY tenant_isolation_policy ON public.tenants
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    id = auth.tenant_id()
  );

-- Profile / User Row Policies
CREATE POLICY profile_isolation_policy ON public.profiles
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Phone Numbers Policies
CREATE POLICY phone_numbers_isolation_policy ON public.phone_numbers
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Contacts Policies
CREATE POLICY contacts_isolation_policy ON public.contacts
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Chats Policies
CREATE POLICY chats_isolation_policy ON public.chats
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Messages Policies
CREATE POLICY messages_isolation_policy ON public.messages
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Campaigns Policies
CREATE POLICY campaigns_isolation_policy ON public.campaigns
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Meta Templates Policies
CREATE POLICY meta_templates_isolation_policy ON public.meta_templates
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Chatbots Policies
CREATE POLICY chatbots_isolation_policy ON public.chatbots
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- CRM Deals Policies
CREATE POLICY deals_isolation_policy ON public.deals
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );

-- Audit Logs Policies
CREATE POLICY audit_logs_isolation_policy ON public.audit_logs
  FOR ALL
  USING (
    auth.user_role() = 'super_admin' OR 
    tenant_id = auth.tenant_id()
  );


--------------------------------------------------------------------------------
-- 5. GRANULAR ROLE-BASED ACCESS CONTROL (RBAC) POLICIES
--    Allows fine-grained restrictions inside a single tenant.
--------------------------------------------------------------------------------

-- Example: Agent and Viewer can only SELECT, they can't DELETE.
-- Here we add target filters restricting writes based on the role claim.

-- Reject profile updates or deletes for non-admin/non-managers
CREATE POLICY rbac_restrict_writes_profiles ON public.profiles
  FOR UPDATE
  USING (
    auth.user_role() IN ('super_admin', 'tenant_admin', 'manager')
  );

-- Restrict Delete on Contacts to only admins and managers
CREATE POLICY rbac_restrict_delete_contacts ON public.contacts
  FOR DELETE
  USING (
    auth.user_role() IN ('super_admin', 'tenant_admin', 'manager')
  );

-- Restrict Template edits to only Admins & Managers
CREATE POLICY rbac_restrict_write_templates ON public.meta_templates
  FOR INSERT WITH CHECK (auth.user_role() IN ('super_admin', 'tenant_admin', 'manager'))
  USING (auth.user_role() IN ('super_admin', 'tenant_admin', 'manager'));

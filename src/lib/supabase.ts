import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Known default / project identifier placeholder if not set
export const SUPABASE_PROJECT_NAME = "mpgaprojeto-code's Project";

// Check whether valid Supabase configuration is present
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    envUrl &&
    envUrl.startsWith('http') &&
    envAnonKey &&
    envAnonKey.length > 20
  );
};

// Create the Supabase client instance (or a fallback dummy if not configured yet)
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? envUrl : 'https://placeholder-mpgaprojeto-code.supabase.co',
  isSupabaseConfigured() ? envAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);

export interface SupabaseRegisteredChildRow {
  id: string;
  sequence_number: number;
  credential_code: string;
  child_name: string;
  age: number;
  birth_date: string | null;
  guardian_name: string | null;
  city_neighborhood: string | null;
  whatsapp_phone: string | null;
  referral_source: string | null;
  registered_at: string;
  created_at?: string;
}

export interface SupabaseSorteioStateRow {
  id: string;
  winners: any;
  absent_ids: any;
  replacement_logs: any;
  updated_at: string;
}

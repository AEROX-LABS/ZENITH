import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sanitize URL by removing trailing slashes or accidental /rest/v1 suffixes
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // Remove /rest/v1 or /rest/v1/ suffix if mistakenly added to base URL
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

const supabaseUrl = cleanSupabaseUrl(rawUrl);
const supabaseAnonKey = rawAnonKey.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

// Create the client with safe fallback
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : (createClient('https://mock-instance.supabase.co', 'mock-key', {
      auth: { persistSession: false },
    }));

export default supabase;

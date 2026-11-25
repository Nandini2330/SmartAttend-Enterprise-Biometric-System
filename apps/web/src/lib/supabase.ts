import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const cleanUrl = (url: string): string => {
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const rawUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || getEnv('SUPABASE_ANON_KEY');

const supabaseUrl = cleanUrl(rawUrl) || 'https://demo-smartattend.supabase.co';
const supabaseAnonKey = rawKey || 'demo-anon-key';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  !rawUrl.includes('demo') &&
  !rawUrl.includes('your-project-id') &&
  rawKey &&
  !rawKey.includes('...') &&
  rawKey.length > 20
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

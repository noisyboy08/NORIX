import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseAuthConfigured = Boolean(url && anon && anon.startsWith('eyJ'));

export const supabase =
  isSupabaseAuthConfigured
    ? createClient(url!, anon!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;


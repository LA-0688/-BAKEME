import { createClient } from '@supabase/supabase-js';

export const createSharedSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required to initialize the client.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

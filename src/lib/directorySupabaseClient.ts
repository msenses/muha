import { createClient } from '@supabase/supabase-js';

// Merkezi (directory) Supabase projesine bağlanan client
// URL ve anon key .env.local içindeki NEXT_PUBLIC_ değişkenlerinden gelir.
const directorySupabaseUrl = process.env.NEXT_PUBLIC_DIRECTORY_SUPABASE_URL!;
const directorySupabaseAnonKey = process.env.NEXT_PUBLIC_DIRECTORY_SUPABASE_ANON_KEY!;

export const directorySupabase = createClient(
  directorySupabaseUrl,
  directorySupabaseAnonKey,
);

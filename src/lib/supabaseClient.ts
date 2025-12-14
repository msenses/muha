import { createClient } from '@supabase/supabase-js';

// Uygulama (firma) veritabanı için Supabase client
// Bu URL ve anon key, khkthwtgvydnvujfgruv projesine aittir.
const supabaseUrl = 'https://khkthwtgvydnvujfgruv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoa3Rod3RndnlkbnZ1amZncnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDMzMDYsImV4cCI6MjA4MTI3OTMwNn0.OT3DtvE3jf5FNEEEx5AEm0IgDYiuHr_NKYiVhDWHWRk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


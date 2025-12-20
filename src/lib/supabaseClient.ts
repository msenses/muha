import { createClient } from '@supabase/supabase-js';

// Uygulama (firma) veritabanı için Supabase client
// Bu URL ve anon key, smhxlmonoqiwmogtknie projesine aittir.
const supabaseUrl = 'https://smhxlmonoqiwmogtknie.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaHhsbW9ub3Fpd21vZ3RrbmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDkwOTgsImV4cCI6MjA4MTgyNTA5OH0.HRt3nGdUa6xaN2DFOXjbtBw8Z-Y9Kp54MG4p-i2VbfY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


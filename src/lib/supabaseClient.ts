import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısını doğrudan proje URL ve anon key ile kuruyoruz.
// Anon key public olduğu için client tarafında tutulmasında sakınca yoktur.
// Böylece Vercel ortam değişkeni hatalarından etkilenmeden her zaman doğru projeye bağlanırız.
const supabaseUrl = 'https://ithjtcgfsyqfljwyaynw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aGp0Y2dmc3lxZmxqd3lheW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTgzMDAsImV4cCI6MjA4MDY3NDMwMH0.s9WplBqXnCaDo_iacbfEikuDrmitp3bQJ00nmRmsKVU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


import { createClient } from '@supabase/supabase-js';

// Build-time'da env yoksa placeholder kullan, runtime'da kontrol edilecek
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Runtime'da env kontrolü
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('⚠️ UYARI: Supabase environment variables eksik! Lütfen Vercel Dashboard > Settings > Environment Variables bölümünden ekleyin:');
    console.error('NEXT_PUBLIC_SUPABASE_URL');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}



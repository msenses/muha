import { createClient } from '@supabase/supabase-js';

// Env yoksa prod'da UI'ı gezebilmek için "demo modu" açılır.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || 'https://example.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 'dummy-anon-key';
const demoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (demoMode) {
  console.warn('Supabase env değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (DEMO MODU AÇIK)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo modunda Auth metodlarını oturum varmış gibi cevaplayalım
if (demoMode) {
  const anySb = supabase as any;
  const fakeSession = {
    access_token: 'demo-token',
    token_type: 'bearer',
    user: { id: 'demo-user', email: 'demo@local' },
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };
  anySb.auth.getSession = async () => ({ data: { session: fakeSession }, error: null });
  anySb.auth.onAuthStateChange = (_cb: any) => ({
    data: { subscription: { unsubscribe() {} } },
    error: null,
  });
  anySb.auth.signInWithPassword = async () => ({ data: { session: fakeSession }, error: null });
  anySb.auth.signUp = async () => ({ data: { user: fakeSession.user }, error: null });
  anySb.auth.signOut = async () => ({ error: null });
}



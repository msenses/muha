import { supabase } from '@/lib/supabaseClient';

export async function fetchCurrentCompanyId(): Promise<string | null> {
  try {
    // Önce session'dan user ID'yi al
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user?.id) {
      return null;
    }

    // User profile'dan company_id'yi çek
    const { data, error } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', sessionData.session.user.id)
      .single();

    if (error || !data) {
      console.error('Company ID alınamadı:', error);
      return null;
    }

    return data.company_id ?? null;
  } catch (err) {
    console.error('fetchCurrentCompanyId hatası:', err);
    return null;
  }
}



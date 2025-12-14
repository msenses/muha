import { supabase } from '@/lib/supabaseClient';
import { SINGLE_COMPANY_MODE } from '@/lib/config';

let cachedCompanyId: string | null = null;

export async function fetchCurrentCompanyId(): Promise<string | null> {
  try {
    // Önce session'dan user ID'yi al (oturum yoksa null döndür)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user?.id) {
      return null;
    }

    // Tek firma modu: tüm kullanıcılar aynı firmaya bağlı kabul edilir
    if (SINGLE_COMPANY_MODE) {
      if (cachedCompanyId) {
        return cachedCompanyId;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        console.error('Tek firma modunda company ID alınamadı:', error);
        return null;
      }

      cachedCompanyId = data.id;
      return cachedCompanyId;
    }

    // Çoklu firma modu: user_profiles üzerinden company_id çöz
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



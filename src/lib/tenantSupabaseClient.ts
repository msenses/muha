import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { directorySupabase } from '@/lib/directorySupabaseClient';

// Her tenant (firma) için oluşturulmuş Supabase client'larını hafızada tutarız
const tenantClientCache: Record<string, SupabaseClient> = {};

/**
 * Mevcut seçili tenant (firma) için Supabase client'ı döner.
 *
 * Notlar:
 * - Sadece client-side kullanılmalıdır (localStorage kullandığı için).
 * - Login sonrasında `localStorage.currentTenantId` ve `currentTenantName` set edilmiş olmalı.
 */
export async function getTenantSupabaseClient(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') {
    // Server ortamında bu helper kullanılmamalı
    return null;
  }

  const tenantId = window.localStorage.getItem('currentTenantId');
  if (!tenantId) {
    console.warn('currentTenantId localStorage içinde bulunamadı.');
    return null;
  }

  // Daha önce oluşturduysak cache'den döndür
  if (tenantClientCache[tenantId]) {
    return tenantClientCache[tenantId];
  }

  // Merkezi veritabanından bu tenant'a ait Supabase URL + anon key bilgilerini al
  const { data, error } = await directorySupabase
    .from('tenant_databases')
    .select('supabase_url, supabase_anon_key')
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    console.error('Tenant veritabanı bilgileri alınamadı:', error);
    return null;
  }

  const client = createClient(data.supabase_url, data.supabase_anon_key);
  tenantClientCache[tenantId] = client;
  return client;
}

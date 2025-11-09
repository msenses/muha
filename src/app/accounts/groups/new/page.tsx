'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function AccountGroupNewPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
    };
    init();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const trimmed = name.trim();
      if (!trimmed) throw new Error('Grup adı zorunlu');
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      const { error } = await supabase.from('account_groups').insert({ company_id: companyId, name: trimmed });
      if (error) throw error;
      router.push('/accounts/groups');
    } catch (e: any) {
      setErr(e?.message ?? 'Grup oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <div style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', maxWidth: 720 }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700 }}>Yeni Cari Grubu Oluştur</div>
          <form onSubmit={submit} style={{ padding: 16 }}>
            <div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
              <input placeholder="Grup adı" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => router.push('/accounts/groups')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
                <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #12b3c5', background: '#12b3c5', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function StockUnitNewPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
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
      if (!trimmed) throw new Error('Birim adı zorunlu');
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      const { error } = await supabase.from('product_units').insert({
        company_id: companyId,
        name: trimmed,
        short_name: shortName.trim() || null,
      });
      if (error) throw error;
    router.push(('/stock/units') as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Birim kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Birimler / Yeni</div>

        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', maxWidth: 520 }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>Yeni Stok Birimi Oluştur</div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Birim Adı</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Adet, Kg, Kutu"
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Kısa Ad</span>
              <input
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="Örn: Ad, Kg, Kt"
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
            </label>
            {err && <div style={{ color: '#ffb4b4', fontSize: 12 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.push(('/stock/units') as Route)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
              >
                Vazgeç
              </button>
              <button
                disabled={loading}
                type="submit"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}



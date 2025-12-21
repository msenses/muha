'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function StockPackageGroupNewPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      if (!trimmed) throw new Error('Paket grup adı zorunlu');
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      const { error } = await supabase.from('package_groups').insert({
        company_id: companyId,
        name: trimmed,
        description: description.trim() || null,
      });
      if (error) throw error;
    router.push(('/stock/package-groups') as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Paket grup kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Stok Paket Grupları / Yeni</div>

        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', maxWidth: 640 }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>Stok Paket Grup Ekle</div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Paket Grup Adı</span>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Açıklama</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </label>

            {err && <div style={{ color: '#ffb4b4', fontSize: 12 }}>{err}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.push(('/stock/package-groups') as Route)}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
              >
                Vazgeç
              </button>
              <button
                disabled={loading}
                type="submit"
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e74c3c', background: '#e74c3c', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
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



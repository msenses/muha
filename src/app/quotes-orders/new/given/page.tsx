'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type AccountRow = { id: string; title: string; officer: string | null };

export default function GivenQuoteSelectAccountPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setAccounts([]);
          return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          console.warn('Company ID bulunamadı (Verilen teklif cari seçimi)');
          if (active) setAccounts([]);
          return;
        }
        const { data, error } = await supabase
          .from('accounts')
          .select('id, name, contact_name')
          .eq('company_id', companyId)
          .order('name', { ascending: true });
        if (!active) return;
        if (error) {
          console.error('Cari listesi yüklenemedi (Verilen Teklif):', error);
          setAccounts([]);
        } else {
          setAccounts(
            ((data ?? []) as any[]).map((a) => ({
              id: a.id as string,
              title: (a.name as string) ?? '',
              officer: (a.contact_name as string) ?? null,
            })),
          );
        }
      } catch (err) {
        if (!active) return;
        console.error('Cari listesi yüklenirken beklenmeyen hata (Verilen Teklif):', err);
        setAccounts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return accounts.filter(a => `${a.title} ${a.officer ?? ''}`.toLowerCase().includes(hay));
  }, [q, accounts]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Başlık ve arama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#12b3c5', color: 'white', padding: 8 }}>
            <div style={{ fontWeight: 700 }}>Verilen Teklif Cari Seçimi</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 320, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.18)', color: 'white' }}>🔍</button>
            </div>
          </div>

          {/* Liste */}
          <div style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', width: 80 }}></th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Ünvan</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Yetkili</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>Yükleniyor…</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '10px 12px' }}>Cari bulunamadı</td>
                  </tr>
                )}
                {!loading && filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => router.push((`/quotes-orders/new/given/form?account=${a.id}`) as Route)}
                        style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}
                      >+ Seç</button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{a.title}</td>
                    <td style={{ padding: '10px 12px' }}>{a.officer ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



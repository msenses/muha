'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
};

export default function IncomeExpensePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReports, setOpenReports] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const companyId = await fetchCurrentCompanyId();
      if (!companyId) {
        console.warn('Company ID bulunamadı');
        setLoading(false);
        return;
      }
      const query = supabase
        .from('income_expense_categories')
        .select('id, name, type, description')
        .eq('company_id', companyId)
        .order('name', { ascending: true });
      if (typeFilter !== 'all') {
        query.eq('type', typeFilter);
      }
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        console.error('Gelir/gider kategorileri yüklenemedi', error);
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Category[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [router, typeFilter]);

  const filteredRows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.description ?? ''}`.toLowerCase().includes(t),
    );
  }, [rows, q]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst araç çubuğu */}
      <header style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button disabled style={{ opacity: 0.6, cursor: 'not-allowed', padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>+ Ekle (yakında)</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenReports((v) => !v)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Raporlar ▾</button>
          {openReports && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240, background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 14px 35px rgba(0,0,0,0.35)', zIndex: 20 }}>
              <button onClick={() => { setOpenReports(false); router.push('/income-expense/reports/balance'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Gelir Gider Bakiye Raporu</button>
              <button onClick={() => { setOpenReports(false); router.push('/income-expense/reports/detail'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Gelir Gider Detaylı Raporu</button>
            </div>
          )}
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık + filtreler */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>GELİR GİDER KATEGORİLERİ</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara..."
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              >
                <option value="all">Hepsi</option>
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>Ad</th>
                  <th style={{ padding: '10px 8px' }}>Tip</th>
                  <th style={{ padding: '10px 8px' }}>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((it) => (
                  <tr key={it.id} style={{ color: 'white' }}>
                    <td style={{ padding: '8px' }}>{it.name}</td>
                    <td style={{ padding: '8px' }}>{it.type === 'income' ? 'Gelir' : 'Gider'}</td>
                    <td style={{ padding: '8px' }}>{it.description || '-'}</td>
                  </tr>
                ))}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Kayıt yok</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Yükleniyor…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



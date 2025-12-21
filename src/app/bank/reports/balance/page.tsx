'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = {
  id: string;
  bank: string;
  branch: string;
  balance: number;
};

export default function BankBalanceReportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setLoading(false);
          return;
        }

        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          console.warn('Company ID bulunamadı');
          if (active) setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('bank_accounts')
          .select('id, bank_name, branch_name, balance')
          .eq('company_id', companyId)
          .order('bank_name', { ascending: true });

        if (error) {
          console.error('Banka bakiye raporu için banka listesi yüklenemedi', error);
          if (active) setRows([]);
          return;
        }

        const mapped: Row[] = (data ?? []).map((b: any) => ({
          id: b.id as string,
          bank: (b.bank_name as string | null) ?? 'Banka',
          branch: (b.branch_name as string | null) ?? 'Merkez',
          balance: Number(b.balance ?? 0),
        }));

        if (active) setRows(mapped);
      } catch (err) {
        console.error('Banka bakiye raporu yüklenirken hata', err);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => rows.reduce((s, r) => s + r.balance, 0), [rows]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Üst araç çubuğu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>✉ Email Gönder</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🗂</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
            </div>
          </div>

          {/* Başlık */}
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>BANKA RAPORU</div>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#e5f3f4', color: '#111827' }}>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #cbd5e1' }}>Banka Adı</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #cbd5e1' }}>Şube</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #cbd5e1' }}>Bakiye</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{r.bank}</td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{r.branch}</td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{r.balance.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>Kayıt bulunamadı.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={3} style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>Yükleniyor…</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Toplam */}
            <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 180px' }}>
              <div style={{ padding: '8px', color: '#6b7280' }}>BANKA HESAPLARI TOPLAMI :</div>
              <div style={{ padding: '8px', textAlign: 'right' }}>{total.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


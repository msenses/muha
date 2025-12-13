'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type CashLedger = {
  id: string;
  name: string;
  description: string | null;
  balance: number | null;
};

export default function CashListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CashLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('2025-01-01');
  const [reportEnd, setReportEnd] = useState('2025-12-31');

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
      const { data, error } = await supabase
        .from('cash_ledgers')
        .select('id, name, description, balance')
        .eq('company_id', companyId)
        .order('name', { ascending: true });
      if (!active) return;
      if (error) {
        console.error('Kasa listesi yüklenemedi', error);
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as CashLedger[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst araç çubuğu */}
      <header style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button onClick={() => router.push('/cash/new')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+ Ekle</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Raporlar ▾</button>
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>KASA LİSTESİ</div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>İşlem</th>
                  <th style={{ padding: '10px 8px' }}>Kasa Ad</th>
                  <th style={{ padding: '10px 8px' }}>Açıklama</th>
                  <th style={{ padding: '10px 8px' }}>Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((it) => (
                  <tr key={it.id} style={{ color: 'white' }}>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => { router.push((`/cash/${it.id}`) as Route); }}
                        style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}
                      >
                        ➕ Detaya Git
                      </button>
                    </td>
                    <td style={{ padding: '8px' }}>{it.name}</td>
                    <td style={{ padding: '8px' }}>{it.description ?? '-'}</td>
                    <td style={{ padding: '8px' }}>{Number(it.balance ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Kayıt yok</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Yükleniyor…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Raporla Modal */}
      {showReport && (
        <div onClick={() => setShowReport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 620, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>İşlem</strong>
              <button onClick={() => setShowReport(false)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
                <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input id="alltime" type="checkbox" checked={reportAllTime} onChange={(e) => setReportAllTime(e.target.checked)} />
                  <label htmlFor="alltime" style={{ userSelect: 'none', cursor: 'pointer' }}>Tüm Zamanlar</label>
                </div>

                <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Başlangıç Tarihi</span>
                    <input value={reportStart} onChange={(e) => setReportStart(e.target.value)} disabled={reportAllTime} type="date" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Bitiş Tarihi</span>
                    <input value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} disabled={reportAllTime} type="date" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                </div>

                <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowReport(false); router.push(('/cash/reports/balance') as Route); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>≡ Kasa Raporu Getir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

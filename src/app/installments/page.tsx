'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = { id: string; title: string; total: number; collected: number };

export default function InstallmentsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('22.11.2022');
  const [reportEnd, setReportEnd] = useState('22.11.2022');
  const [reportKind, setReportKind] = useState<'TÜMÜ' | 'VADESİ GEÇEN TAKSİTLER' | 'BEKLEYEN TAKSİTLER' | 'ÖDENEN TAKSİTLER'>('VADESİ GEÇEN TAKSİTLER');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setLoading(false);
          router.replace('/login');
          return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) {
            setError('Şirket bilgisi alınamadı');
            setRows([]);
          }
          return;
        }
        const { data, error: qErr } = await supabase
          .from('installment_plans')
          .select('id, total_amount, accounts ( name ), installments ( paid_amount )')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
        if (!active) return;
        if (qErr) {
          console.error('Taksit planları yüklenemedi:', qErr);
          setError('Taksit planları yüklenirken hata oluştu');
          setRows([]);
          return;
        }
        const mapped: Row[] = (data ?? []).map((p: any) => {
          const insts = Array.isArray(p.installments) ? p.installments : [];
          const collected = insts.reduce((s, it) => s + Number(it.paid_amount ?? 0), 0);
          return {
            id: p.id as string,
            title: (Array.isArray(p.accounts) ? p.accounts[0]?.name : p.accounts?.name) ?? '',
            total: Number(p.total_amount ?? 0),
            collected,
          };
        });
        setRows(mapped);
      } catch (err: any) {
        if (!active) return;
        console.error('Taksit planları yüklenirken beklenmeyen hata:', err);
        setError(err?.message ?? 'Beklenmeyen bir hata oluştu');
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return rows.filter((r) => `${r.id} ${r.title} ${r.total} ${r.collected}`.toLowerCase().includes(hay));
  }, [rows, q]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        {/* Üst bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => router.push(('/installments/new') as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+ Yeni Taksit Oluştur</button>
          <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#1f2937', cursor: 'pointer' }}>📄 Gelişmiş Rapor</button>
        </div>

        <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi ve arama */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Taksit Listesi</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.18)', color: 'white' }}>🔍</button>
            </div>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '8px' }}></th>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Ünvan</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Tahsilat</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Kalan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const remaining = r.total - r.collected;
                  return (
                    <tr key={r.id} style={{ color: 'white' }}>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => router.push((`/installments/${r.id}`) as Route)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                      </td>
                      <td style={{ padding: '8px' }}>{r.id.slice(0, 8)}</td>
                      <td style={{ padding: '8px' }}>{r.title || '-'}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{r.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{r.collected.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '8px', textAlign: 'center', opacity: 0.8 }}>Kayıt yok</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ padding: '8px', textAlign: 'center', opacity: 0.8 }}>Yükleniyor…</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#fecaca' }}>{error}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Gelişmiş Rapor Modal */}
      {showReport && (
        <div onClick={() => setShowReport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 680, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
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
                    <input value={reportStart} onChange={(e) => setReportStart(e.target.value)} disabled={reportAllTime} placeholder="22.11.2022" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Bitiş Tarihi</span>
                    <input value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} disabled={reportAllTime} placeholder="22.11.2022" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                </div>
                <div style={{ padding: '0 12px 12px' }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Listeleme istediğiniz Taksit Türünü Seçiniz :</span>
                    <select value={reportKind} onChange={(e) => setReportKind(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                      <option>VADESİ GEÇEN TAKSİTLER</option>
                      <option>BEKLEYEN TAKSİTLER</option>
                      <option>ÖDENEN TAKSİTLER</option>
                      <option>TÜMÜ</option>
                    </select>
                  </label>
                </div>
                <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowReport(false)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>≡ Taksit Raporu Getir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



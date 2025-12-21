'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = { id: string; date: string; due: string; firm: string; status: string; amount: number };

export default function ChequeNotePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState<'Sıralama' | 'Tarihi Yeniden Eskiye' | 'Tarihi Eskiden Yeniye' | 'Vade Eskiden Yeniye' | 'Vade Yeniden Eskiye'>('Sıralama');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rapor modalı
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportType, setReportType] = useState<'HEPSİ' | 'MÜŞTERİ EVRAĞI' | 'KENDİ EVRAĞIMIZ'>('HEPSİ');
  const [reportStatus, setReportStatus] = useState<'HEPSİ' | 'BEKLEMEDE' | 'ÖDENDİ' | 'TAHSİL EDİLDİ'>('HEPSİ');

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
          .from('cheques_notes')
          .select('id, issue_date, due_date, amount, status, direction, accounts ( name )')
          .eq('company_id', companyId)
          .order('issue_date', { ascending: false });
        if (!active) return;
        if (qErr) {
          console.error('Çek/senet listesi yüklenemedi:', qErr);
          setError('Çek/senet listesi yüklenirken hata oluştu');
          setRows([]);
          return;
        }
        const mapStatus = (s?: string | null): string => {
          switch (s) {
            case 'pending':
              return 'BEKLEMEDE';
            case 'paid':
              return 'ÖDENDİ';
            case 'bounced':
              return 'KARŞILIKSIZ';
            case 'endorsed':
              return 'CİROLU';
            case 'cancelled':
              return 'İPTAL';
            case 'in_bank':
              return 'BANKADA';
            default:
              return s ?? '';
          }
        };
        const fmtDate = (d?: string | null): string => {
          if (!d) return '';
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return '';
          return dt.toLocaleDateString('tr-TR');
        };
        const mapped: Row[] = (data ?? []).map((r: any) => ({
          id: r.id as string,
          date: fmtDate(r.issue_date),
          due: fmtDate(r.due_date),
          firm: r.accounts?.name ?? '',
          status: mapStatus(r.status),
          amount: Number(r.amount ?? 0),
        }));
        setRows(mapped);
      } catch (err: any) {
        if (!active) return;
        console.error('Çek/senet listesi yüklenirken beklenmeyen hata:', err);
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
    const q = query.toLowerCase();
    let list = rows.filter((r) => `${r.id} ${r.date} ${r.due} ${r.firm} ${r.status} ${r.amount}`.toLowerCase().includes(q));
    const parse = (d: string) => {
      if (!d) return 0;
      const [dd, mm, yyyy] = d.split('.');
      if (!dd || !mm || !yyyy) {
        const dt = new Date(d);
        return dt.getTime() || 0;
      }
      const iso = `${yyyy}-${mm}-${dd}`;
      return new Date(iso).getTime();
    };
    if (sortMode === 'Tarihi Eskiden Yeniye') list = list.slice().sort((a, b) => parse(a.date) - parse(b.date));
    if (sortMode === 'Tarihi Yeniden Eskiye') list = list.slice().sort((a, b) => parse(b.date) - parse(a.date));
    if (sortMode === 'Vade Eskiden Yeniye') list = list.slice().sort((a, b) => parse(a.due) - parse(b.due));
    if (sortMode === 'Vade Yeniden Eskiye') list = list.slice().sort((a, b) => parse(b.due) - parse(a.due));
    return list;
  }, [query, sortMode, rows]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 10 }}>
              <button onClick={() => router.push(('/cheque-note/new') as Route)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Yeni Verilen ÇEK/SENET</button>
              <button
                onClick={() => router.push(('/cheque-note/new?direction=incoming') as Route)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#f59e0b', color: '#1f2937' }}
              >
                Yeni Alınan ÇEK/SENET
              </button>
            </div>
            <div style={{ marginTop: 16, color: 'white', opacity: 0.9, fontWeight: 700 }}>Raporlar</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', width: '100%', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>≡ Raporla</button>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div>
            {/* Üst bar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#12b3c5', borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontWeight: 700, padding: '8px 10px' }}>Çek Senet Listesi</div>
              {/* Sıralama butonu ve açılır menü */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setSortOpen(v => !v)}
                  style={{ marginLeft: 8, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.95)', color: '#111827', cursor: 'pointer' }}
                >
                  {sortMode} ▾
                </button>
                {sortOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: 220, background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 10px 24px rgba(0,0,0,0.25)', zIndex: 30 }}>
                    {(['Sıralama','Tarihi Yeniden Eskiye','Tarihi Eskiden Yeniye','Vade Eskiden Yeniye','Vade Yeniden Eskiye'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortMode(opt); setSortOpen(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input placeholder="Ara..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 220, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                <button style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.18)', color: 'white' }}>🔍</button>
              </div>
            </div>

            {/* Liste */}
            <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ padding: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                      <th style={{ padding: '8px' }}></th>
                      <th style={{ padding: '8px' }}>#</th>
                      <th style={{ padding: '8px' }}>Tarih</th>
                      <th style={{ padding: '8px' }}>Vade</th>
                      <th style={{ padding: '8px' }}>Firma</th>
                      <th style={{ padding: '8px' }}>Durumu</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} style={{ color: 'white' }}>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => router.push((`/cheque-note/${r.id}`) as Route)}
                            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}
                          >
                            🔍
                          </button>
                        </td>
                        <td style={{ padding: '8px' }}>{r.id.slice(0, 8)}</td>
                        <td style={{ padding: '8px' }}>{r.date || '-'}</td>
                        <td style={{ padding: '8px' }}>{r.due || '-'}</td>
                        <td style={{ padding: '8px' }}>{r.firm || '-'}</td>
                        <td style={{ padding: '8px' }}>{r.status || '-'}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
                      </tr>
                    )}
                    {loading && (
                      <tr>
                        <td colSpan={7} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Yükleniyor…</td>
                      </tr>
                    )}
                    {error && !loading && (
                      <tr>
                        <td colSpan={7} style={{ padding: 12, textAlign: 'center', color: '#fecaca' }}>{error}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Yüzen buton */}
            <button title="Menü" style={{ position: 'fixed', right: 24, bottom: 24, width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.25)', color: 'white' }}>☰</button>
          </div>
        </div>
      </section>

      {/* Raporla Modal */}
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
                    <input value={reportStart} onChange={(e) => setReportStart(e.target.value)} disabled={reportAllTime} placeholder="27.11.2022" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Bitiş Tarihi</span>
                    <input value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} disabled={reportAllTime} placeholder="27.11.2022" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                </div>

                <div style={{ padding: '0 12px 12px', display: 'grid', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Listelemek İstediğiniz Çek Türünü Seçiniz.</span>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                      <option>HEPSİ</option>
                      <option>MÜŞTERİ EVRAĞI</option>
                      <option>KENDİ EVRAĞIMIZ</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Listelemek İstediğiniz Çek Durumunu Seçiniz.</span>
                    <select value={reportStatus} onChange={(e) => setReportStatus(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
                      <option>HEPSİ</option>
                      <option>BEKLEMEDE</option>
                      <option>ÖDENDİ</option>
                      <option>TAHSİL EDİLDİ</option>
                    </select>
                  </label>
                </div>

                <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowReport(false); router.push(('/cheque-note/reports/list') as Route); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>≡ Çek/Senet Raporu Getir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



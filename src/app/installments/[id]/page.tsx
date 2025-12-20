'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = { id: string; date: string; desc: string; amount: number; paid: number; remaining: number; status: 'Bekliyor' | 'Ödendi' | 'Kısmi' | 'Vadesi Geçmiş' };

export default function InstallmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [header, setHeader] = useState<{
    title: string;
    installmentNo: number;
    txnDate: string;
    total: number;
    down: number;
    collected: number;
    remaining: number;
    firstDate: string;
    count: number;
    period: string;
    note: string;
  } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('22.11.2022');
  const [reportEnd, setReportEnd] = useState('22.11.2022');
  const [reportKind, setReportKind] = useState<'TÜMÜ' | 'VADESİ GEÇEN TAKSİTLER' | 'BEKLEYEN TAKSİTLER' | 'ÖDENEN TAKSİTLER'>('VADESİ GEÇEN TAKSİTLER');
  // Tahsil Et modalı
  const [showCollect, setShowCollect] = useState(false);
  const [collectAmount, setCollectAmount] = useState('2450');
  const [collectDate, setCollectDate] = useState('22.11.2022');
  const [collectMethod, setCollectMethod] = useState<string>('Seç');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace('/login');
          return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) setError('Şirket bilgisi alınamadı');
          return;
        }
        const [{ data: plan, error: planErr }, { data: insts, error: instErr }] = await Promise.all([
          supabase
            .from('installment_plans')
            .select('id, total_amount, installment_count, start_date, notes, accounts ( name )')
            .eq('company_id', companyId)
            .eq('id', params.id)
            .single(),
          supabase
            .from('installments')
            .select('id, installment_no, amount, due_date, paid_date, paid_amount, status')
            .eq('installment_plan_id', params.id)
            .order('installment_no', { ascending: true }),
        ]);
        if (!active) return;
        if (planErr) {
          console.error('Taksit planı bulunamadı:', planErr);
          setError('Taksit planı bulunamadı');
          setRows([]);
          return;
        }
        const installments = (insts ?? []) as any[];
        const collected = installments.reduce((s, it) => s + Number(it.paid_amount ?? 0), 0);
        const total = Number((plan as any).total_amount ?? 0);
        const remaining = total - collected;
        const firstDue =
          installments.length && installments[0].due_date
            ? new Date(installments[0].due_date as string).toLocaleDateString('tr-TR')
            : '';
        const fmtDate = (d?: string | null) => {
          if (!d) return '';
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return '';
          return dt.toLocaleDateString('tr-TR');
        };
        setHeader({
          title:
            (Array.isArray((plan as any).accounts) ? (plan as any).accounts[0]?.name : (plan as any).accounts?.name) ??
            '',
          installmentNo: (plan as any).installment_count ?? installments.length ?? 0,
          txnDate: fmtDate((plan as any).start_date),
          total,
          down: 0,
          collected,
          remaining,
          firstDate: firstDue,
          count: (plan as any).installment_count ?? installments.length ?? 0,
          period: '(30 GÜN) Aylık',
          note: ((plan as any).notes as string) ?? '',
        });
        const mapStatus = (s?: string | null): Row['status'] => {
          switch (s) {
            case 'paid':
              return 'Ödendi';
            case 'partial':
              return 'Kısmi';
            case 'overdue':
              return 'Vadesi Geçmiş';
            default:
              return 'Bekliyor';
          }
        };
        setRows(
          installments.map((it: any) => {
            const amt = Number(it.amount ?? 0);
            const paid = Number(it.paid_amount ?? 0);
            return {
              id: it.id as string,
              date: fmtDate(it.due_date),
              desc: `${it.installment_no}. Taksit`,
              amount: amt,
              paid,
              remaining: amt - paid,
              status: mapStatus(it.status),
            };
          }),
        );
        if (instErr) {
          console.error('Taksitler yüklenirken hata:', instErr);
        }
      } catch (err: any) {
        if (!active) return;
        console.error('Taksit detayı yüklenirken beklenmeyen hata:', err);
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
  }, [router, params.id]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 8 }}>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff' }}>Düzenle</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>Sil</button>
              <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#f59e0b', color: '#1f2937' }}>Gelişmiş Rapor</button>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div>
            {/* Taksit detayları üst panel */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff', marginBottom: 12 }}>
              <div style={{ background: '#f3f4f6', padding: '10px 12px', fontWeight: 700 }}>Taksit Detayları</div>
              {header ? (
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 200px 1fr', rowGap: 10, columnGap: 16, padding: 12 }}>
                  <div>Ünvan :</div><div>{header.title}</div>
                  <div>Taksit No :</div><div>{header.installmentNo}</div>
                  <div>İşlem Tarihi :</div><div>{header.txnDate}</div>
                  <div>Toplam Tutar :</div><div>₺{header.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                  <div>Peşinat :</div><div>₺{header.down.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                  <div>Toplam Tahsilat :</div><div>₺{header.collected.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                  <div>Kalan Bakiye :</div><div>₺{header.remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                  <div>İlk Taksit Tarihi :</div><div>{header.firstDate}</div>
                  <div>Taksit Sayısı :</div><div>{header.count}</div>
                  <div>Taksit Periyodu :</div><div>{header.period}</div>
                  <div>Açıklama :</div><div>{header.note || '-'}</div>
                </div>
              ) : (
                <div style={{ padding: 12 }}>{loading ? 'Yükleniyor…' : error || 'Kayıt bulunamadı'}</div>
              )}
            </div>

            {/* Taksit listesi alt tablo */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ background: '#12b3c5', color: 'white', padding: '8px 10px', fontWeight: 700 }}>Taksit Listesi</div>
              <div style={{ padding: 12 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#111827', opacity: 0.9 }}>
                        <th style={{ padding: '8px' }}>İşlemler</th>
                        <th style={{ padding: '8px' }}>Tarih</th>
                        <th style={{ padding: '8px' }}>Açıklama</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Tahsilat</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Kalan</th>
                        <th style={{ padding: '8px' }}>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} style={{ color: '#111827' }}>
                          <td style={{ padding: '8px', position: 'relative' }}>
                            <button
                              onClick={() => setOpenActionRowId(prev => prev === r.id ? null : r.id)}
                              style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}
                            >
                              İşlemler ▾
                            </button>
                            {openActionRowId === r.id && (
                              <div style={{ position: 'absolute', top: 36, left: 8, minWidth: 180, background: 'white', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 32px rgba(0,0,0,0.25)', zIndex: 50 }}>
                                <button
                                  onClick={() => { setOpenActionRowId(null); router.push((`/installments/${params.id}/receipt`) as Route); }}
                                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                  🖨 Makbuz Bas
                                </button>
                                <div style={{ height: 1, background: '#e5e7eb' }} />
                                <button
                                  onClick={() => { setOpenActionRowId(null); setShowCollect(true); }}
                                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                  ✏ Tahsil Et
                                </button>
                                <div style={{ height: 1, background: '#e5e7eb' }} />
                                <button
                                  disabled
                                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#9ca3af', cursor: 'not-allowed' }}
                                >
                                  🗑 İptal Et
                                </button>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '8px' }}>{r.date}</td>
                          <td style={{ padding: '8px' }}>{r.desc}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{r.paid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{r.remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px' }}>{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tahsil Et Modal */}
      {showCollect && (
        <div onClick={() => setShowCollect(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>
              1. Taksitlendirme için tahsilat girişi
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar</span>
                <input value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih</span>
                <input value={collectDate} onChange={(e) => setCollectDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli</span>
                <select value={collectMethod} onChange={(e) => setCollectMethod(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Seç</option>
                  <option>Nakit</option>
                  <option>Havale</option>
                  <option>Kredi Kartı</option>
                </select>
              </label>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { /* demo submit */ setShowCollect(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Tahsilat Yap</button>
            </div>
          </div>
        </div>
      )}

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
                  <button onClick={() => { setShowReport(false); router.push((`/installments/${params.id}/reports/view`) as Route); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>≡ Taksit Raporu Getir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

type Row = { id: number; date: string; desc: string; amount: number; paid: number; remaining: number; status: 'Bekliyor' | 'Ödendi' };

export default function InstallmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const header = useMemo(() => {
    return {
      title: 'Mustafa Bey',
      installmentNo: 4,
      txnDate: '22.11.2022',
      total: 50000,
      down: 20000,
      collected: 0,
      remaining: 30000,
      firstDate: '29.11.2022',
      count: 10,
      period: '(30 GÜN) Aylık',
      note: '',
    };
  }, [params.id]);

  const rows: Row[] = Array.from({ length: 10 }).map((_, i) => {
    const amount = 3000;
    const paid = 0;
    const remaining = amount - paid;
    return {
      id: i + 1,
      date: ['29.11.2022','29.12.2022','29.01.2023','28.02.2023','29.03.2023','29.04.2023','29.05.2023','29.06.2023','29.07.2023','29.08.2023'][i] || '29.11.2022',
      desc: `${i + 1}. Taksitlendirme`,
      amount,
      paid,
      remaining,
      status: 'Bekliyor',
    };
  });

  const [openActionRowId, setOpenActionRowId] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('22.11.2022');
  const [reportEnd, setReportEnd] = useState('22.11.2022');
  const [reportKind, setReportKind] = useState<'TÜMÜ' | 'VADESİ GEÇEN TAKSİTLER' | 'BEKLEYEN TAKSİTLER' | 'ÖDENEN TAKSİTLER'>('VADESİ GEÇEN TAKSİTLER');

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
                                <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Tahsilat Yap</button>
                                <div style={{ height: 1, background: '#e5e7eb' }} />
                                <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Düzenle</button>
                                <div style={{ height: 1, background: '#e5e7eb' }} />
                                <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Sil</button>
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



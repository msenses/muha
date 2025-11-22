'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Row = { id: string; date: string; type: 'GİRİŞ(+) ' | 'ÇIKIŞ(-)'; amount: number; title: string; note: string };

export default function CashDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const cashName = useMemo(() => {
    // basit isimlendirme
    const slug = (params.id || '').toLowerCase();
    if (slug.includes('varsayilan') || slug.includes('varsayılan')) return 'Varsayılan Kasa';
    return params.id;
  }, [params.id]);

  const [startDate, setStartDate] = useState('01.01.2022');
  const [endDate, setEndDate] = useState('14.11.2022');
  const [q, setQ] = useState('');

  const rows: Row[] = [
    { id: '1', date: '14.11.2022', type: 'GİRİŞ(+) ', amount: 500, title: '', note: '' },
    { id: '2', date: '14.11.2022', type: 'GİRİŞ(+) ', amount: 250, title: '', note: '' },
    { id: '3', date: '14.11.2022', type: 'GİRİŞ(+) ', amount: 100, title: '', note: '' },
    { id: '4', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 63, title: 'Mehmet Bey', note: 'Alış' },
    { id: '5', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 90, title: 'Mehmet Bey', note: 'Alış' },
    { id: '6', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 100, title: 'Mehmet Bey', note: 'Alış' },
    { id: '7', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 0, title: 'Mehmet Bey', note: 'Alış' },
    { id: '8', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 7.18, title: 'Mehmet Bey', note: 'ALIŞ FATURASI İADESİ' },
    { id: '9', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 3, title: 'Mehmet Bey', note: 'SATIŞ FATURASI İADESİ' },
    { id: '10', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 8.47, title: 'Mehmet Bey', note: 'Alış' },
  ];

  const filtered = rows.filter((r) => {
    const hay = `${r.date} ${r.type} ${r.amount} ${r.title} ${r.note}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 10 }}>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Giriş Yap (+)</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>Çıkış Yap (-)</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff' }}>Bankaya Virman</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Kasadan Kasaya Virman</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937' }}>Raporla</button>
            </div>

            <div style={{ marginTop: 12, borderRadius: 10, background: 'rgba(255,255,255,0.08)', padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Belirtilen Tarih Aralığındaki</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div>Toplam Giriş: <b>1.042.616,88 ₺</b></div>
                <div>Toplam Çıkış: <b>76.794,47 ₺</b></div>
                <div>Kasa Bakiyesi: <b>965.822,41 ₺</b></div>
                <div>Toplam Kasa Bakiyesi: <b>965.822,41 ₺</b></div>
              </div>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Kasa : <span style={{ opacity: 0.9 }}>{cashName}</span></div>
              <button onClick={() => router.push(('/cash') as Route)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>← Liste</button>
            </header>

            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ marginRight: 8 }}>KASA HAREKETLERİ</strong>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>Başlangıç Tarihi:</span>
                  <input value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: 120, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <span>Bitiş Tarihi:</span>
                  <input value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: 120, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <button style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 180, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <button style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ overflow: 'auto', maxHeight: 'calc(100dvh - 260px)' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                        <th style={{ padding: '8px' }}>İşlemler</th>
                        <th style={{ padding: '8px' }}>Tarih</th>
                        <th style={{ padding: '8px' }}>Tip</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                        <th style={{ padding: '8px' }}>Ünvan</th>
                        <th style={{ padding: '8px' }}>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.id} style={{ color: 'white' }}>
                          <td style={{ padding: '8px' }}>
                            <button style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>İşlemler ▾</button>
                          </td>
                          <td style={{ padding: '8px' }}>{r.date}</td>
                          <td style={{ padding: '8px' }}>{r.type}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px' }}>{r.title || '-'}</td>
                          <td style={{ padding: '8px' }}>{r.note || '-'}</td>
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
    </main>
  );
}
*** End Patch``` }>>ని 어요… (invalid JSON) ***!


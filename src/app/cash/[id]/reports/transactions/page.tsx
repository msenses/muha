'use client';
export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';

type Txn = {
  date: string;
  doc?: string;
  title?: string;
  desc?: string;
  type: 'GİRİŞ(+)' | 'ÇIKIŞ(-)';
  amount: number;
};

export default function CashTransactionsReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const sp = useSearchParams();

  const cashName = useMemo(() => {
    const slug = (params.id || '').toLowerCase();
    if (slug.includes('varsayilan') || slug.includes('varsayılan')) return 'Varsayılan Kasa';
    return params.id;
  }, [params.id]);

  const rows: Txn[] = [
    { date: '14.11.2022', type: 'GİRİŞ(+)', amount: 100 },
    { date: '14.11.2022', type: 'GİRİŞ(+)', amount: 250 },
    { date: '14.11.2022', type: 'GİRİŞ(+)', amount: 500 },
    { date: '14.11.2022', type: 'GİRİŞ(+)', amount: 150 },
    { date: '14.11.2022', type: 'ÇIKIŞ(-)', title: 'Mustafa Bey', amount: 650 },
    { date: '14.11.2022', type: 'ÇIKIŞ(-)', desc: 'Varsayılan Kasa Kasasından', amount: 4000 },
    { date: '14.11.2022', type: 'ÇIKIŞ(-)', desc: 'Kasa2 Kasasına Virman Aktarımı', amount: 50 },
  ];

  const totalIn = rows.filter(r => r.type === 'GİRİŞ(+)').reduce((s, r) => s + r.amount, 0);
  const totalOut = rows.filter(r => r.type === 'ÇIKIŞ(-)').reduce((s, r) => s + r.amount, 0);
  const balance = totalIn - totalOut;

  const start = sp.get('start') || '';
  const end = sp.get('end') || '';

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa', border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}>
          <input placeholder="✉ Email Gönder" style={{ flex: '0 0 280px', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }} />
          <button title="Yazdır" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>🖨</button>
          <button title="Dışa Aktar" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>📄</button>
          <button title="Yenile" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>↻</button>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => router.push((`/cash/${params.id}`) as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Kasa</button>
          </div>
        </div>

        {/* Başlık */}
        <h1 style={{ margin: '16px 0 10px', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Kasa İşlem Raporu</h1>

        {/* Üst bilgi bandı */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 0 }}>
          <div style={{ background: '#64748b', color: '#fff', padding: '10px 12px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr auto', columnGap: 16 }}>
            <div>Kasa Adı: <b>{cashName}</b></div>
            <div>Açıklama: <b>-</b></div>
            <div style={{ textAlign: 'right' }}>Bakiye: <b>{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</b></div>
          </div>

          {/* Tarih aralığı gösterimi */}
          {(start || end) && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
              Tarih Aralığı: <b>{start || '—'}</b> - <b>{end || '—'}</b>
            </div>
          )}

          {/* Detay tablo */}
          <div style={{ padding: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#94a3b8', color: '#fff' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Tarih</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Evrak No</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Unvan</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Açıklama</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Tip</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 10px' }}>{r.date}</td>
                      <td style={{ padding: '8px 10px' }}>{r.doc || '0'}</td>
                      <td style={{ padding: '8px 10px' }}>{r.title || (r.type === 'ÇIKIŞ(-)' ? 'Mustafa Bey' : '-')}</td>
                      <td style={{ padding: '8px 10px' }}>{r.desc || '-'}</td>
                      <td style={{ padding: '8px 10px' }}>{r.type}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Özet kutuları */}
            <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ width: 320, background: '#334155', color: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Giriş:</span>
                  <strong>{totalIn.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Çıkış:</span>
                  <strong>{totalOut.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                  <span>Toplam Bakiye:</span>
                  <strong>{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <div style={{ width: 320, background: '#334155', color: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Giriş:</span>
                  <strong>{totalIn.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Çıkış:</span>
                  <strong>{totalOut.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                  <span>Toplam Bakiye:</span>
                  <strong>{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



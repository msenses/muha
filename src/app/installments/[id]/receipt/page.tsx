'use client';
export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function InstallmentReceiptPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const data = useMemo(() => {
    return {
      firm: 'TEST BİLSOFT',
      period: '2022',
      customer: 'Mustafa Bey',
      date: '21.11.2022',
      totals: {
        totalInstallment: 47550,
        totalCount: 19,
        remaining: 46550,
      },
      row: { desc: '2. Taksitlendirme', status: 'Bekliyor', amount: 2450, collected: 0, remaining: 2450 },
    };
  }, [params.id]);

  const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa', border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}>
          <input placeholder="✉ Email Gönder" style={{ flex: '0 0 280px', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }} />
          <button title="Yazdır" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
          <button title="Dışa Aktar" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>📄</button>
          <button title="Yenile" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => router.push((`/installments/${params.id}`) as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Detaya Dön</button>
          </div>
        </div>

        {/* Gövde */}
        <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontWeight: 800 }}>TAKSİT MAKBUZU</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>{data.firm}</div>
              <div>DÖNEM : {data.period}</div>
            </div>
          </div>

          <div style={{ background: '#334155', color: '#fff', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 10 }}>
              <div>
                <div style={{ opacity: 0.8 }}>CARİ BİLGİLERİ :</div>
                <div style={{ fontWeight: 700 }}>{data.customer}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ opacity: 0.8 }}>TAKSİT BİLGİLERİ</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 4 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>TOPLAM TAKSİT TUTARI</div>
                    <div style={{ fontWeight: 700 }}>₺{fmt(data.totals.totalInstallment)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>TOPLAM TAKSİT SAYISI</div>
                    <div style={{ fontWeight: 700 }}>{data.totals.totalCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>KALAN TUTAR</div>
                    <div style={{ fontWeight: 700 }}>₺{fmt(data.totals.remaining)}</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>İşlem Tarihi : {data.date}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Açıklama</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Durum</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px' }}>Tutar</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px' }}>Tahsilat</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px' }}>Kalan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px' }}>{data.row.desc}</td>
                  <td style={{ padding: '6px 8px' }}>{data.row.status}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₺{fmt(data.row.amount)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₺{fmt(data.row.collected)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₺{fmt(data.row.remaining)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



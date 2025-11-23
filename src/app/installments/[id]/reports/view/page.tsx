'use client';
export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function InstallmentReportViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const header = useMemo(() => {
    return {
      firm: 'TEST BİLSOFT',
      customer: 'Mustafa Bey',
      reportDate: '21.11.2022',
      count: 20,
      period: '(30 GÜN) Aylık Gün',
    };
  }, [params.id]);

  const rows = Array.from({ length: 20 }).map((_, i) => ({
    date: '21.11.' + (i < 9 ? '2022' : i < 19 ? '2023' : '2024'),
    desc: `${i + 1}. Taksitlendirme`,
    amount: 2450,
    paid: 0,
    remaining: 2450,
    status: 'Bekliyor',
  }));

  const sum = (key: 'amount' | 'paid' | 'remaining') => rows.reduce((s, r) => s + r[key], 0);
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

        {/* Rapor gövdesi */}
        <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 18 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>TAKSİT RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>Firma : {header.firm}</div>
          <div style={{ height: 2, background: '#0ea5e9', width: 200, margin: '8px auto 12px' }} />

          <div style={{ background: '#e5e7eb', padding: '8px 10px', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
            <div><b>{header.customer}</b></div>
            <div style={{ textAlign: 'center' }}>Taksit Tarihi : {header.reportDate}</div>
            <div style={{ textAlign: 'right' }}>Taksit Sayısı : {header.count}  •  Periyot : {header.period}</div>
          </div>

          <div style={{ marginTop: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#94a3b8', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>VADE TARİHİ</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>AÇIKLAMA</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>TUTAR</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>TAHSİL EDİLEN</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>KALAN</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>DURUM</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px' }}>{r.date}</td>
                    <td style={{ padding: '8px 10px' }}>{r.desc}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.amount)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.paid)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.remaining)}</td>
                    <td style={{ padding: '8px 10px' }}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ background: '#e5e7eb', borderRadius: 6, padding: 8, textAlign: 'center' }}>
              <div>Toplam Taksit Tutarı</div>
              <div style={{ fontWeight: 700 }}>{fmt(sum('amount'))}</div>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 6, padding: 8, textAlign: 'center' }}>
              <div>Toplam Tahsil Edilen</div>
              <div style={{ fontWeight: 700 }}>{fmt(sum('paid'))}</div>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 6, padding: 8, textAlign: 'center' }}>
              <div>Toplam Kalan Bakiye</div>
              <div style={{ fontWeight: 700 }}>{fmt(sum('remaining'))}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



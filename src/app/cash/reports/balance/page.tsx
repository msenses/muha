'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function CashBalanceReportPage() {
  const router = useRouter();

  const rows = [
    { name: 'Varsayılan Kasa', note: '-', in: 1042766.88, out: 80894.47, balance: 961872.41 },
    { name: 'Kasa2', note: '-', in: 50.0, out: 0.0, balance: 50.0 },
  ];

  const totalIn = rows.reduce((s, r) => s + r.in, 0);
  const totalOut = rows.reduce((s, r) => s + r.out, 0);
  const totalBalance = rows.reduce((s, r) => s + r.balance, 0);

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
            <button onClick={() => router.push(('/cash') as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Kasa Listesi</button>
          </div>
        </div>

        {/* Başlık */}
        <h1 style={{ margin: '16px 0 10px', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Kasa Bakiye Raporu</h1>

        {/* Rapor gövdesi */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#94a3b8', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Kasa Adı</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Açıklama</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Giriş</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Çıkış</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px' }}>{r.note}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.in.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.out.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Özet kutusu */}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
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
                <strong>{totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



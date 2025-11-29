'use client';
export const dynamic = 'force-dynamic';

export default function BankBalanceReportPage() {
  const rows = [
    { bank: 'Varsayılan', branch: 'Merkez', balance: 23223.77 },
    { bank: 'Banka2', branch: 'Banka2', balance: 100.0 },
  ];
  const total = rows.reduce((s, r) => s + r.balance, 0);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Üst araç çubuğu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>✉ Email Gönder</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🗂</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
            </div>
          </div>

          {/* Başlık */}
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>BANKA RAPORU</div>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#e5f3f4', color: '#111827' }}>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #cbd5e1' }}>Banka Adı</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #cbd5e1' }}>Şube</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #cbd5e1' }}>Bakiye</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{r.bank}</td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{r.branch}</td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{r.balance.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Toplam */}
            <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 180px' }}>
              <div style={{ padding: '8px', color: '#6b7280' }}>BANKA HESAPLARI TOPLAMI :</div>
              <div style={{ padding: '8px', textAlign: 'right' }}>{total.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


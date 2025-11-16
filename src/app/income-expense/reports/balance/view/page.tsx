'use client';
export const dynamic = 'force-dynamic';

export default function IncomeExpenseBalanceReportViewPage() {
  return (
    <main style={{ minHeight: '100dvh', background: '#fff' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>✉ Email Gönder</button>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🗋</button>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
        <input placeholder="" style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', flex: '0 0 260px' }} />
      </div>
      <section style={{ padding: 16 }}>
        <h2 style={{ textAlign: 'center', margin: '18px 0' }}>Gider Bakiye Raporu</h2>
        <div style={{ maxWidth: 820, margin: '0 auto', border: '1px solid #cbd5e1' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#334155', color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>AboneNo</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Gider Adı</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Gider Açıklama</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Gelir</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Gider</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ padding: 8 }}>123456789</td>
                <td style={{ padding: 8 }}>Elektrik</td>
                <td style={{ padding: 8 }}>Deneme</td>
                <td style={{ padding: 8, textAlign: 'right' }}>450,00</td>
                <td style={{ padding: 8, textAlign: 'right' }}>52.000,00</td>
                <td style={{ padding: 8, textAlign: 'right' }}>52.000,00</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'grid', gap: 6, width: 320, marginLeft: 'auto', marginTop: 10 }}>
            <div style={{ background: '#94a3b8', color: '#fff', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <strong>Toplam Gelir:</strong>
              <span>450,00</span>
            </div>
            <div style={{ background: '#94a3b8', color: '#fff', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <strong>Toplam Gider:</strong>
              <span>52.000,00</span>
            </div>
            <div style={{ background: '#cbd5e1', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Genel Toplam:</span>
              <span>-51.550,00</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



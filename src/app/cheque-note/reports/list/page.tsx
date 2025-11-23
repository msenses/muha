'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function ChequeNoteReportListPage() {
  const router = useRouter();

  const rows = [
    { date: '27.11.2022', due: '27.11.2022', bank: 'Banka2', account: 'Mehmet Bey', docType: 'KENDİ EVRAĞIMIZ', status: 'ÖDENDİ', amount: 10000 },
    { date: '27.11.2022', due: '27.11.2022', bank: 'Banka2', account: 'Mustafa Bey', docType: 'MÜŞTERİ EVRAĞI', status: 'BEKLEMEDE', amount: 20000 },
    { date: '27.11.2022', due: '27.11.2022', bank: 'Banka2', account: 'Mustafa Bey', docType: 'KENDİ EVRAĞIMIZ', status: 'BEKLEMEDE', amount: 50000 },
  ];

  const sum = (filter: (r: typeof rows[number]) => boolean) =>
    rows.filter(filter).reduce((s, r) => s + r.amount, 0);

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
            <button onClick={() => router.push(('/cheque-note') as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Listeye Dön</button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginTop: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>ÇEK / SENET RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>Firma : TEST BİLSOFT</div>
          <div style={{ height: 2, background: '#0ea5e9', width: 200, margin: '8px auto 12px' }} />
          <div style={{ opacity: 0.8, marginBottom: 12 }}>Tarih Aralığı : 27.11.2022 - 27.11.2022</div>

          {/* Tablo */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0ea5e9', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Tarih</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Vade Tarihi</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Banka Adı</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Cari Hesap</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Evrak Türü</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Durumu</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px' }}>{r.date}</td>
                    <td style={{ padding: '8px 10px' }}>{r.due}</td>
                    <td style={{ padding: '8px 10px' }}>{r.bank}</td>
                    <td style={{ padding: '8px 10px' }}>{r.account}</td>
                    <td style={{ padding: '8px 10px' }}>{r.docType}</td>
                    <td style={{ padding: '8px 10px' }}>{r.status}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Özet blokları */}
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>BEKLEYEN KENDİ EVRAĞIMIZ</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum(r => r.docType === 'KENDİ EVRAĞIMIZ' && r.status === 'BEKLEMEDE'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>BEKLEYEN MÜŞTERİ EVRAĞI</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum(r => r.docType === 'MÜŞTERİ EVRAĞI' && r.status === 'BEKLEMEDE'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>BANKADA OLAN EVRAK</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(0)}</div>
            </div>

            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>ÖDENEN KENDİ EVRAĞIMIZ</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum(r => r.docType === 'KENDİ EVRAĞIMIZ' && r.status === 'ÖDENDİ'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>ÖDENEN MÜŞTERİ EVRAĞI</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum(r => r.docType === 'MÜŞTERİ EVRAĞI' && r.status === 'ÖDENDİ'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>CİROLU OLAN EVRAK</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(0)}</div>
            </div>

            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>TOPLAM KENDİ EVRAĞIMIZ</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum(r => r.docType === 'KENDİ EVRAĞIMIZ'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>TOPLAM MÜŞTERİ EVRAĞI</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum(r => r.docType === 'MÜŞTERİ EVRAĞI'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>GENEL TOPLAM</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                {fmt(sum(() => true))}
                <div style={{ opacity: 0.8, marginTop: 4, fontSize: 12 }}>Borçlusunuz</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



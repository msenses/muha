'use client';
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function StockMovementsReportViewPage() {
  const router = useRouter();
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // useSearchParams statik dışa aktarımda build-time'da hata verebildiği için
  // parametreleri yalnızca istemci tarafında, mount sonrası okuyalım.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const isAll = sp.get('all') === '1';
    const s = sp.get('start') ?? '';
    const e = sp.get('end') ?? '';
    setAll(isAll);
    setStart(s);
    setEnd(e);
  }, []);

  return (
    <main style={{ minHeight: '100dvh', background: '#eef3f7', color: '#2c3e50' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>✉ Email Gönder</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="PDF" style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', background: 'white', cursor: 'pointer' }}>📄</button>
          <button title="Yenile" onClick={() => router.back()} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', background: 'white', cursor: 'pointer' }}>↩</button>
        </div>

        {/* Rapor gövdesi */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#21618c' }}>STOK HAREKETLERİ RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>Firma : TEST BİLSOFT</div>
          <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, color: '#7f8c8d' }}>
            Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`}
          </div>

          {/* Ürün blokları — demo statik içerik, daha sonra gerçek verilerle doldurulacak */}
          {[
            { code: 'EKM', name: 'Ekmek', group: 'Ekmek/Gıda', rows: [{ date: '08.11.2022', qty: -1, type: 'ÇIKIŞ', price: '50,00', person: 'Mehmet Bey' }] },
            { code: 'BUG', name: 'Buğday Ekmek', group: 'TEMEL GIDA', rows: [{ date: '08.11.2022', qty: -1, type: 'ÇIKIŞ', price: '3,00', person: 'Mehmet Bey' }, { date: '08.11.2022', qty: 1, type: 'GİRİŞ', price: '131,36', person: 'Mehmet Bey' }] },
            { code: '12', name: 'Monitör', group: 'Hırdavat', rows: [{ date: '08.11.2022', qty: 20, type: 'GİRİŞ', price: '100,00', person: '' }, { date: '08.11.2022', qty: 50, type: 'GİRİŞ', price: '100,00', person: '' }] },
          ].map((blk) => (
            <div key={blk.code} style={{ marginTop: 14, border: '1px solid #dfe6ee', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ background: '#5d6d7e', color: 'white', padding: '8px 10px', fontWeight: 700, display: 'grid', gridTemplateColumns: '140px 1fr 200px' }}>
                <div>ÜRÜN KODU {blk.code}</div>
                <div>ÜRÜN ADI {blk.name}</div>
                <div style={{ textAlign: 'right' }}>ÜRÜN GRUBU {blk.group}</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#ecf0f1' }}>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Tarih</th>
                    <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Miktar</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>İşlem Tipi</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Açıklama</th>
                    <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Alış/Satış Fiyatı</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Ünvan</th>
                  </tr>
                </thead>
                <tbody>
                  {blk.rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f3f7' }}>
                      <td style={{ padding: 8 }}>{r.date}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{r.qty}</td>
                      <td style={{ padding: 8 }}>{r.type}</td>
                      <td style={{ padding: 8 }}></td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{r.price}</td>
                      <td style={{ padding: 8 }}>{r.person}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 10, borderTop: '1px solid #e5e8ec', background: '#fafbfc' }}>
                <div>GİRİŞ : 0</div>
                <div>MALİYET : 0,00</div>
                <div>KALAN : {blk.rows.reduce((s, r) => s + r.qty, 0)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}



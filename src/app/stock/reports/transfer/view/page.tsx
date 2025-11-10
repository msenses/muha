'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default function WarehouseTransferReportViewPage() {
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setAll(sp.get('all') === '1');
    setStart(sp.get('start') ?? '');
    setEnd(sp.get('end') ?? '');
  }, []);

  return (
    <main style={{ minHeight: '100dvh', background: '#eef3f7', color: '#2c3e50' }}>
      <section style={{ padding: 12 }}>
        {/* Araç çubuğu */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>✉ Email Gönder</button>
          <button title="Kaydet" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>💾</button>
          <button title="Bul" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🔍</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="Yenile" onClick={() => window.location.reload()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>↻</button>
        </div>

        {/* Rapor */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#21618c' }}>DEPO AKTARIM</div>
              <div style={{ fontWeight: 800, color: '#21618c' }}>RAPORU</div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#7f8c8d' }}>
                Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>TEST BİLSOFT</div>
              <div style={{ marginTop: 4 }}>DÖNEM : 2022</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#5d6d7e', color: 'white' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>Çıkan Depo</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Giren Depo</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Barkod</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Miktar</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: 8 }}>Merkez</td>
                <td style={{ padding: 8 }}>Merkez</td>
                <td style={{ padding: 8 }}>12345678</td>
                <td style={{ padding: 8 }}>5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}



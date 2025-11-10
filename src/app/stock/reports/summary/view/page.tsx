'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default function StockSummaryReportViewPage() {
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [groupBy, setGroupBy] = useState<'product' | 'group' | 'warehouse'>('product');
  const [zeros, setZeros] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setAll(sp.get('all') === '1');
    setStart(sp.get('start') ?? '');
    setEnd(sp.get('end') ?? '');
    setGroupBy((sp.get('groupBy') as any) || 'product');
    setZeros(sp.get('zeros') === '1');
  }, []);

  const rows = [
    { code: '-', shelf: '-', name: 'İçim Peynir', group: 'TEMEL GIDA', inQty: 0, outQty: 0 },
    { code: '-', shelf: '-', name: 'Buğday Ekmek', group: 'TEMEL GIDA', inQty: 1, outQty: 1 },
    { code: '-', shelf: '-', name: 'Çamlıca Beyaz', group: 'BİTKİSEL ÜRÜN', inQty: 0, outQty: 0 },
    { code: '-', shelf: '-', name: 'Çaykur Çiçek', group: 'TEMEL GIDA', inQty: 0, outQty: 0 },
    { code: '-', shelf: '-', name: 'Brown', group: 'TEMEL GIDA', inQty: 0, outQty: 0 },
  ].filter((r) => (zeros ? true : r.inQty - r.outQty !== 0));

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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button title="Önceki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer', opacity: 0.5 }}>◀</button>
            <div style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #c8d1dc', background: 'white' }}>1 / 3</div>
            <button title="Sonraki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#d32f2f', color: 'white', cursor: 'pointer' }}>▶</button>
          </div>
        </div>

        {/* Rapor */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, padding: 16 }}>
          <div style={{ textAlign: 'center', color: '#21618c', fontWeight: 800, fontSize: 18 }}>TOPLU STOK RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>Firma : TEST BİLSOFT</div>
          <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, color: '#7f8c8d' }}>
            Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#5d6d7e', color: 'white' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>KOD</th>
                <th style={{ textAlign: 'left', padding: 8 }}>RAF</th>
                <th style={{ textAlign: 'left', padding: 8 }}>AD</th>
                <th style={{ textAlign: 'left', padding: 8 }}>GRUP</th>
                <th style={{ textAlign: 'left', padding: 8 }}>GİREN</th>
                <th style={{ textAlign: 'left', padding: 8 }}>ÇIKAN</th>
                <th style={{ textAlign: 'left', padding: 8 }}>KALAN</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const remain = r.inQty - r.outQty;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: 8 }}>{r.code}</td>
                    <td style={{ padding: 8 }}>{r.shelf}</td>
                    <td style={{ padding: 8 }}>{r.name}</td>
                    <td style={{ padding: 8 }}>{r.group}</td>
                    <td style={{ padding: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
                        <span>Maliyet:</span>
                        <span>0,00</span>
                      </div>
                      <div style={{ color: '#7f8c8d' }}>{r.inQty.toFixed(2)} Adet</div>
                    </td>
                    <td style={{ padding: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
                        <span>Maliyet:</span>
                        <span>0,00</span>
                      </div>
                      <div style={{ color: '#7f8c8d' }}>{r.outQty.toFixed(2)} Adet</div>
                    </td>
                    <td style={{ padding: 8 }}>
                      <div style={{ color: '#7f8c8d' }}>{remain.toFixed(2)} Adet</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}



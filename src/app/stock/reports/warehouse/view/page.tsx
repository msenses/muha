'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default function WarehouseMovementReportViewPage() {
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [warehouse, setWarehouse] = useState('Merkez');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setAll(sp.get('all') === '1');
    setStart(sp.get('start') ?? '');
    setEnd(sp.get('end') ?? '');
    setWarehouse(sp.get('warehouse') ?? 'Merkez');
  }, []);

  const blocks = [
    {
      product: 'Buğday Ekmek',
      rows: [
        { date: '08.11.2022', note: '', qty: -1, price: '3,00' },
        { date: '08.11.2022', note: '', qty: 1, price: '131,36' },
      ],
    },
    {
      product: 'Ekmek',
      rows: [{ date: '08.11.2022', note: '', qty: -1, price: '10,00' }],
    },
    {
      product: 'Monitör',
      rows: [
        { date: '08.11.2022', note: '', qty: 50, price: '150,00' },
        { date: '10.11.2022', note: '', qty: 20, price: '100,00' },
      ],
    },
  ];

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
              <div style={{ fontWeight: 800, color: '#21618c' }}>DEPO-STOK</div>
              <div style={{ fontWeight: 800, color: '#21618c' }}>HAREKETLERİ RAPORU</div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#7f8c8d' }}>
                Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>TEST BİLSOFT</div>
              <div style={{ marginTop: 4 }}>DÖNEM : 2022</div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontWeight: 800, background: '#5d6d7e', color: 'white', padding: '8px 10px' }}>
            DEPO ADI : {warehouse}
          </div>

          {blocks.map((blk, idx) => {
            const total = blk.rows.reduce((s, r) => s + r.qty, 0);
            return (
              <div key={idx} style={{ marginTop: 12, border: '1px solid #ecf0f1', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ background: '#ecf0f1', padding: '8px 10px', fontWeight: 700 }}>Stok Adı : {blk.product}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    {blk.rows.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f6f9' }}>
                        <td style={{ padding: 8, width: 140 }}>Tarih : {r.date}</td>
                        <td style={{ padding: 8, width: 220 }}>Açıklama :</td>
                        <td style={{ padding: 8, width: 180, textAlign: 'right' }}>Miktar : {r.qty}</td>
                        <td style={{ padding: 8, width: 220, textAlign: 'right' }}>Alış/Satış Fiyatı : {r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: 8, background: '#ecf0f1' }}>
                  <div>Toplam : {total}</div>
                  <div>Maliyet : 13,00</div>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#5d6d7e', color: 'white', padding: '6px 10px', borderRadius: 4 }}>Toplam Maliyet : 13,00</div>
          </div>
        </div>
      </section>
    </main>
  );
}



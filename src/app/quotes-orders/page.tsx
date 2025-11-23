'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';

type Row = {
  id: number;
  type: 'VERİLEN TEKLİF' | 'ALINAN TEKLİF' | 'VERİLEN SİPARİŞ' | 'ALINAN SİPARİŞ';
  date: string;
  no: string;
  flow: string; // işlem durumu
  stage: string; // tek/sip durumu
  title: string; // ünvan
  total: number;
  note: string;
};

export default function QuotesOrdersPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'Hepsi' | 'Teklif' | 'Sipariş'>('Hepsi');
  const [openRow, setOpenRow] = useState<number | null>(null);

  const rows: Row[] = [
    { id: 1, type: 'VERİLEN TEKLİF', date: '27.11.2022', no: '1', flow: 'Verilen Teklif => Verilen Sipariş', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: 'KDV dahildir' },
    { id: 2, type: 'VERİLEN TEKLİF', date: '22.11.2022', no: '1', flow: 'Verilen Teklif => Alış Siparişi', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: 'KDV dahildir' },
    { id: 3, type: 'VERİLEN SİPARİŞ', date: '28.10.2022', no: '1', flow: 'Verilen Sipariş => ALIŞ FATURASI', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: '' },
    { id: 4, type: 'ALINAN SİPARİŞ', date: '28.10.2022', no: '1', flow: 'Alınan Sipariş => IRSALİYE', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: '' },
    { id: 5, type: 'ALINAN TEKLİF', date: '28.10.2022', no: '1', flow: 'Alınan Teklif => Verilen Sipariş', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: '' },
  ];

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    let list = rows.filter(r => `${r.type} ${r.date} ${r.no} ${r.flow} ${r.stage} ${r.title} ${r.note}`.toLowerCase().includes(hay));
    if (filter === 'Teklif') list = list.filter(r => r.type.includes('TEKLİF'));
    if (filter === 'Sipariş') list = list.filter(r => r.type.includes('SİPARİŞ'));
    return list;
  }, [q, filter]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
          {/* Sol: liste */}
          <div style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Teklif Liste</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                <button style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} style={{ width: 160, padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Hepsi</option>
                  <option>Teklif</option>
                  <option>Sipariş</option>
                </select>
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: '#12b3c5', color: 'white' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>İŞLEM</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TEK/SİP TÜRÜ</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TARİH</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TEK/SİP NO</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>İŞLEM DURUMU</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TEK/SİP DURUMU</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>ÜNVAN</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>GENEL TOPLAM</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>AÇIKLAMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td style={{ padding: '8px', position: 'relative' }}>
                          <button onClick={() => setOpenRow(prev => prev === r.id ? null : r.id)} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>İŞLEM ▾</button>
                          {openRow === r.id && (
                            <div style={{ position: 'absolute', top: 36, left: 8, minWidth: 160, background: 'white', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 32px rgba(0,0,0,0.25)', zIndex: 50 }}>
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Görüntüle</button>
                              <div style={{ height: 1, background: '#e5e7eb' }} />
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Düzenle</button>
                              <div style={{ height: 1, background: '#e5e7eb' }} />
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Sil</button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>{r.type}</td>
                        <td style={{ padding: '8px' }}>{r.date}</td>
                        <td style={{ padding: '8px' }}>{r.no}</td>
                        <td style={{ padding: '8px' }}>{r.flow}</td>
                        <td style={{ padding: '8px' }}>{r.stage}</td>
                        <td style={{ padding: '8px' }}>{r.title}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{r.total.toLocaleString('tr-TR')}</td>
                        <td style={{ padding: '8px' }}>{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sağ menü */}
          <aside style={{ display: 'grid', gap: 10 }}>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ padding: 10, background: '#f3f4f6', fontWeight: 700 }}>Teklif</div>
              <div style={{ padding: 10, display: 'grid', gap: 8 }}>
                <button onClick={() => { window.location.href = '/quotes-orders/new/given'; }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>➕ Yeni Verilen Teklif</button>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>➕ Yeni Alınan Teklif</button>
              </div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ padding: 10, background: '#f3f4f6', fontWeight: 700 }}>Sipariş</div>
              <div style={{ padding: 10, display: 'grid', gap: 8 }}>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>➕ Yeni Verilen Sipariş</button>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>➕ Yeni Alınan Sipariş</button>
              </div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ padding: 10, background: '#f3f4f6', fontWeight: 700 }}>Raporlar</div>
              <div style={{ padding: 10 }}>
                <button style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937' }}>🗂 Rapor Al</button>
              </div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ padding: 10 }}>
                <button style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>Açıklama Tanımlama</button>
              </div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ padding: 10 }}>
                <button style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>Durum Tanımlama</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';

type Row = { id: number; date: string; due: string; firm: string; status: 'BEKLEMEDE' | 'ÖDENDİ' | 'TAHSİL EDİLDİ'; amount: number };

export default function ChequeNotePage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<'Sıralama' | 'Tarih' | 'Tutar'>('Sıralama');

  const rows: Row[] = [
    { id: 1, date: '22.11.2022', due: '22.11.2022', firm: 'Mustafa Bey', status: 'BEKLEMEDE', amount: 100000 },
    { id: 2, date: '22.11.2022', due: '22.11.2022', firm: 'Mustafa Bey', status: 'BEKLEMEDE', amount: 100000 },
  ];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = rows.filter(r => `${r.id} ${r.date} ${r.due} ${r.firm} ${r.status} ${r.amount}`.toLowerCase().includes(q));
    if (order === 'Tarih') list = list.slice().sort((a, b) => a.date.localeCompare(b.date));
    if (order === 'Tutar') list = list.slice().sort((a, b) => a.amount - b.amount);
    return list;
  }, [query, order]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 10 }}>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Yeni Verilen ÇEK/SENET</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#f59e0b', color: '#1f2937' }}>Yeni Alınan ÇEK/SENET</button>
            </div>
            <div style={{ marginTop: 16, color: 'white', opacity: 0.9, fontWeight: 700 }}>Raporlar</div>
            <div style={{ marginTop: 8 }}>
              <button style={{ padding: '10px 12px', width: '100%', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>≡ Raporla</button>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div>
            {/* Üst bar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#12b3c5', borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontWeight: 700, padding: '8px 10px' }}>Çek Senet Listesi</div>
              <select value={order} onChange={(e) => setOrder(e.target.value as any)} style={{ marginLeft: 8, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.95)', color: '#111827' }}>
                <option>Sıralama</option>
                <option>Tarih</option>
                <option>Tutar</option>
              </select>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input placeholder="Ara..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 220, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                <button style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.18)', color: 'white' }}>🔍</button>
              </div>
            </div>

            {/* Liste */}
            <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ padding: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                      <th style={{ padding: '8px' }}></th>
                      <th style={{ padding: '8px' }}>#</th>
                      <th style={{ padding: '8px' }}>Tarih</th>
                      <th style={{ padding: '8px' }}>Vade</th>
                      <th style={{ padding: '8px' }}>Firma</th>
                      <th style={{ padding: '8px' }}>Durumu</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} style={{ color: 'white' }}>
                        <td style={{ padding: '8px' }}><button style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button></td>
                        <td style={{ padding: '8px' }}>{r.id}</td>
                        <td style={{ padding: '8px' }}>{r.date}</td>
                        <td style={{ padding: '8px' }}>{r.due}</td>
                        <td style={{ padding: '8px' }}>{r.firm}</td>
                        <td style={{ padding: '8px' }}>{r.status}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Yüzen buton */}
            <button title="Menü" style={{ position: 'fixed', right: 24, bottom: 24, width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.25)', color: 'white' }}>☰</button>
          </div>
        </div>
      </section>
    </main>
  );
}



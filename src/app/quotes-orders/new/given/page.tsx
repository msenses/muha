'use client';
export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';

export default function GivenQuoteSelectAccountPage() {
  const [q, setQ] = useState('');
  const accounts = [
    { id: '1', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
    { id: '2', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
    { id: '3', title: 'MYSOFT Dijital Dönüşüm (E-BELGE)', officer: '-' },
  ];

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return accounts.filter(a => `${a.title} ${a.officer}`.toLowerCase().includes(hay));
  }, [q]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Başlık ve arama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#12b3c5', color: 'white', padding: 8 }}>
            <div style={{ fontWeight: 700 }}>Verilen Teklif Cari Seçimi</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 320, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.18)', color: 'white' }}>🔍</button>
            </div>
          </div>

          {/* Liste */}
          <div style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', width: 80 }}></th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Ünvan</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>Yetkili</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <button style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>+ Seç</button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{a.title}</td>
                    <td style={{ padding: '10px 12px' }}>{a.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



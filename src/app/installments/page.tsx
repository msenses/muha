'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

type Row = { id: number; title: string; total: number; collected: number };

export default function InstallmentsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [rows] = useState<Row[]>([
    { id: 1, title: 'Mustafa Bey', total: 50000, collected: 1000 },
    { id: 2, title: 'Mehmet Bey', total: 10000, collected: 100 },
  ]);

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    return rows.filter(r => `${r.id} ${r.title} ${r.total} ${r.collected}`.toLowerCase().includes(hay));
  }, [rows, q]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        {/* Üst bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+ Yeni Taksit Oluştur</button>
          <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#1f2937', cursor: 'pointer' }}>📄 Gelişmiş Rapor</button>
        </div>

        <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi ve arama */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Taksit Listesi</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button style={{ padding: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.18)', color: 'white' }}>🔍</button>
            </div>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '8px' }}></th>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Ünvan</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Tahsilat</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Kalan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const remaining = r.total - r.collected;
                  return (
                    <tr key={r.id} style={{ color: 'white' }}>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => router.push((`/installments/${r.id}`) as Route)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                      </td>
                      <td style={{ padding: '8px' }}>{r.id}</td>
                      <td style={{ padding: '8px' }}>{r.title}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{r.total.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{r.collected.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{remaining.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



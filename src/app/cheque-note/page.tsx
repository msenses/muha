'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

type Row = { id: number; date: string; due: string; firm: string; status: 'BEKLEMEDE' | 'ÖDENDİ' | 'TAHSİL EDİLDİ'; amount: number };

export default function ChequeNotePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState<'Sıralama' | 'Tarihi Yeniden Eskiye' | 'Tarihi Eskiden Yeniye' | 'Vade Eskiden Yeniye' | 'Vade Yeniden Eskiye'>('Sıralama');

  const rows: Row[] = [
    { id: 1, date: '22.11.2022', due: '22.11.2022', firm: 'Mustafa Bey', status: 'BEKLEMEDE', amount: 100000 },
    { id: 2, date: '22.11.2022', due: '22.11.2022', firm: 'Mustafa Bey', status: 'BEKLEMEDE', amount: 100000 },
  ];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = rows.filter(r => `${r.id} ${r.date} ${r.due} ${r.firm} ${r.status} ${r.amount}`.toLowerCase().includes(q));
    const parse = (d: string) => {
      // dd.mm.yyyy -> yyyy-mm-dd
      const [dd, mm, yyyy] = d.split('.');
      const iso = `${yyyy}-${mm}-${dd}`;
      return new Date(iso).getTime();
    };
    if (sortMode === 'Tarihi Eskiden Yeniye') list = list.slice().sort((a, b) => parse(a.date) - parse(b.date));
    if (sortMode === 'Tarihi Yeniden Eskiye') list = list.slice().sort((a, b) => parse(b.date) - parse(a.date));
    if (sortMode === 'Vade Eskiden Yeniye') list = list.slice().sort((a, b) => parse(a.due) - parse(b.due));
    if (sortMode === 'Vade Yeniden Eskiye') list = list.slice().sort((a, b) => parse(b.due) - parse(a.due));
    return list;
  }, [query, sortMode]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 10 }}>
              <button onClick={() => router.push(('/cheque-note/new') as Route)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Yeni Verilen ÇEK/SENET</button>
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
              {/* Sıralama butonu ve açılır menü */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setSortOpen(v => !v)}
                  style={{ marginLeft: 8, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.95)', color: '#111827', cursor: 'pointer' }}
                >
                  {sortMode} ▾
                </button>
                {sortOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: 220, background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 10px 24px rgba(0,0,0,0.25)', zIndex: 30 }}>
                    {(['Sıralama','Tarihi Yeniden Eskiye','Tarihi Eskiden Yeniye','Vade Eskiden Yeniye','Vade Yeniden Eskiye'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortMode(opt); setSortOpen(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                        <td style={{ padding: '8px' }}><button onClick={() => router.push((`/cheque-note/${r.id}`) as Route)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button></td>
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



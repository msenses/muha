'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

type Unit = { id: string; name: string };

export default function StockUnitsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  // Şimdilik sadece UI: örnek birimler
  const [rows] = useState<Unit[]>([
    { id: '1', name: 'Adet' },
    { id: '2', name: 'Kg' },
    { id: '3', name: 'Kutu' },
  ]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
    };
    init();
  }, [router]);

  const filtered = useMemo(() => {
    const t = q.trim().toLocaleLowerCase('tr-TR');
    if (!t) return rows;
    return rows.filter((u) => u.name.toLocaleLowerCase('tr-TR').includes(t));
  }, [rows, q]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Birimler</div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => router.push(('/stock/units/new') as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>
            + Yeni Birim Oluştur
          </button>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <button onClick={() => setQ((prev) => prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ara</button>
          </div>

          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>#</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Birim Adı</th>
                  <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <td style={{ padding: 10 }}>{idx + 1}</td>
                    <td style={{ padding: 10 }}>{u.name}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>
                      <button title="Düzenle" style={{ marginRight: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>✎</button>
                      <button title="Sil" style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #c0392b', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>🗑</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



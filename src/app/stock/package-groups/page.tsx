'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

type Pkg = {
  id: string;
  name: string;
  barcode: string;
  stockBarcode: string;
  qty: number;
  branch: string;
};

export default function StockPackageGroupsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  // Şimdilik sadece UI — örnek kayıt
  const [rows] = useState<Pkg[]>([
    { id: '1', name: 'Deneme', barcode: '1', stockBarcode: '81', qty: 0, branch: 'Merkez' },
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
    return rows.filter((r) => r.name.toLocaleLowerCase('tr-TR').includes(t) || r.barcode.includes(t));
  }, [rows, q]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Stok Paket Grupları</div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => router.push(('/stock/package-groups/new') as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e74c3c', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>
            + Yeni Paket Grup
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
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>İşlemler</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Paket Adı</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Barkod</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Stok Barkod</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Miktar</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Şube Adı</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <td style={{ padding: 10 }}>
                      <button style={{ marginRight: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>İşlemler ▾</button>
                    </td>
                    <td style={{ padding: 10 }}>{r.name}</td>
                    <td style={{ padding: 10 }}>{r.barcode}</td>
                    <td style={{ padding: 10 }}>{r.stockBarcode}</td>
                    <td style={{ padding: 10 }}>{r.qty}</td>
                    <td style={{ padding: 10 }}>{r.branch}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
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



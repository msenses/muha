'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';

type Product = {
  id: string;
  sku: string | null;
  name: string;
  unit: string;
  price: number;
};

export default function StockPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Oturum kontrolü
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      // Ürünleri çek
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, unit, price')
        .order('name', { ascending: true })
        .limit(200);

      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Product[]);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const text = q.trim().toLocaleLowerCase('tr-TR');
    if (!text) return rows;
    return rows.filter((p) => {
      const name = p.name.toLocaleLowerCase('tr-TR');
      const sku = (p.sku ?? '').toLocaleLowerCase('tr-TR');
      return name.includes(text) || sku.includes(text);
    });
  }, [rows, q]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>#</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Kodu</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Stok Adı</th>
          <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Fiyatı</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Birim</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((p, idx) => (
          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <td style={{ padding: 10, opacity: 0.9 }}>{idx + 1}</td>
            <td style={{ padding: 10, opacity: 0.9 }}>{p.sku ?? '-'}</td>
            <td style={{ padding: 10 }}>{p.name}</td>
            <td style={{ padding: 10, textAlign: 'right' }}>{Number(p.price ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style={{ padding: 10 }}>{p.unit}</td>
          </tr>
        ))}
        {!loading && filtered.length === 0 && (
          <tr>
            <td colSpan={5} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [filtered, loading]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>STOK KART LİSTESİ</div>

          <div style={{ display: 'flex', gap: 8, padding: 12, alignItems: 'center' }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara... (Ad, Kod)"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
            <button onClick={() => setQ((prev) => prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ara</button>
          </div>

          <div style={{ padding: 12 }}>
            {loading ? 'Yükleniyor…' : table}
          </div>
        </div>
      </section>
    </main>
  );
}



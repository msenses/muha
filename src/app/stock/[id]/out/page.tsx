'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

type Product = { id: string; name: string; sku: string | null };

export default function StockOutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [warehouse, setWarehouse] = useState('Merkez');
  const [qty, setQty] = useState<number>(0);
  const [note, setNote] = useState('Stok Çıkışı');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: p } = await supabase.from('products').select('id, name, sku').eq('id', productId).single();
      setProduct((p ?? null) as any);
    };
    init();
  }, [router, productId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: Şimdilik sadece UI; daha sonra veritabanına stok çıkışı eklenecek
    alert('Demo: Stok çıkışı kaydedilecek');
    router.push((`/stock/${productId}`) as Route);
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Detay / Stok Çıkışı</div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>Stok Çıkışı</div>

          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, padding: 12, alignItems: 'center' }}>
            <div>Stok Adı :</div>
            <div>{product?.name ?? '-'}</div>

            <div>Barkod :</div>
            <div>{product?.sku ?? '-'}</div>

            <div>Tarih :</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Depo :</div>
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
              <option value="Merkez">Merkez</option>
            </select>

            <div>Miktar :</div>
            <input type="number" step="0.001" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Açıklama :</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #b50a0a', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>
                ⊖ Çıkış Yap
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}



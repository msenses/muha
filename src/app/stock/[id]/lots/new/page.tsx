'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

type Product = { id: string; name: string; sku: string | null };

export default function NewLotPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [openingQty, setOpeningQty] = useState<number>(0);
  const [openingWarehouse, setOpeningWarehouse] = useState('Merkez');

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
    alert('Demo: Yeni lot kaydedilecek');
    router.push((`/stock/${productId}/lots`) as Route);
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Detay / Stok Lot Bilgileri / Yeni</div>

        <form onSubmit={submit} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ padding: 12, fontWeight: 700 }}>Stok Lot Ekle</div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, alignItems: 'center' }}>
            <div>Adı :</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Tarih :</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Açılış Bakiye Miktar :</div>
            <input type="number" step="0.001" value={openingQty} onChange={(e) => setOpeningQty(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Açılış Deposu :</div>
            <select value={openingWarehouse} onChange={(e) => setOpeningWarehouse(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
              <option value="Merkez">Merkez</option>
            </select>

            <div />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>
                Kaydet
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}



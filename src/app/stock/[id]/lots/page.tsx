'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

type Product = { id: string; name: string; sku: string | null };

export default function StockLotsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);

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

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={() => router.push((`/stock/${productId}`) as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>← Stok Detayı</button>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Ana Sayfa / Stok Kartları / Detay / Stok Lot Bilgileri</div>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{product?.name ?? '-'}</div>
            <button onClick={() => router.push((`/stock/${productId}/lots/new`) as Route)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e74c3c', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>+ Yeni Lot</button>
          </div>

          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>İşlemler</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Stok ID</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Açıklama</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Tarih</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Şube Adı</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Product = { id: string; name: string; sku: string | null };

export default function NewStockPricePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [orderNo, setOrderNo] = useState<number>(0);
  const [group, setGroup] = useState('MÜŞTERİLER');
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [desc, setDesc] = useState('Buraya açıklama yazabilirsiniz.');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
      const { data: p } = await supabase.from('products').select('id, name, sku, price, cost_price').eq('id', productId).single();
      setProduct((p ?? null) as any);
      if (p?.price != null) setSellPrice(Number(p.price));
      if (p?.cost_price != null) setBuyPrice(Number(p.cost_price));
    };
    init();
  }, [router, productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!companyId) {
      setErr('Şirket bilgisi alınamadı');
      return;
    }
    if (!product) {
      setErr('Ürün bilgisi alınamadı');
      return;
    }
    if (sellPrice <= 0) {
      setErr('Satış fiyatı 0 dan büyük olmalıdır');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          price: sellPrice,
          cost_price: buyPrice || null,
          description: desc || null,
        })
        .eq('id', product.id)
        .eq('company_id', companyId);
      if (error) throw error;
    router.push((`/stock/${productId}/prices`) as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Fiyat kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Detay / Satış Fiyatları / Yeni</div>

        <form onSubmit={submit} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Üst bilgi satırı */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 120px 1fr', gap: 10, padding: 12, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>Stok Adı :</div>
            <div>{product?.name ?? '-'}</div>
            <div>Barkod :</div>
            <div>{product?.sku ?? '-'}</div>
          </div>

          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, alignItems: 'center' }}>
            <div>Sıra Numarası :</div>
            <input type="number" value={orderNo} onChange={(e) => setOrderNo(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Grup :</div>
            <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
              <option value="MÜŞTERİLER">MÜŞTERİLER</option>
              <option value="TOPTAN">TOPTAN</option>
              <option value="PERAKENDE">PERAKENDE</option>
            </select>

            <div>Alış Fiyat :</div>
            <input type="number" step="0.01" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Satış Fiyat :</div>
            <input type="number" step="0.01" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Açıklama :</div>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Buraya açıklama yazabilirsiniz." style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>{err && <div style={{ color: '#ffb4b4', fontSize: 12 }}>{err}</div>}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                disabled={loading}
                type="submit"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}



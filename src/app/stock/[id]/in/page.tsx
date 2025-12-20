'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Product = { id: string; name: string; sku: string | null };
type Warehouse = { id: string; name: string };

export default function StockInPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [qty, setQty] = useState<number>(0);
  const [note, setNote] = useState('Stok Girişi');
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
      const [{ data: p }, { data: ws }] = await Promise.all([
        supabase.from('products').select('id, name, sku').eq('id', productId).single(),
        cid
          ? supabase
              .from('warehouses')
              .select('id, name')
              .eq('company_id', cid)
              .order('created_at', { ascending: true })
          : Promise.resolve({ data: null }),
      ]);
      setProduct((p ?? null) as any);
      const wList = ((ws ?? []) as any[]).map((w) => ({ id: w.id, name: w.name }));
      setWarehouses(wList);
      if (!warehouseId && wList.length > 0) {
        setWarehouseId(wList[0].id);
      }
    };
    init();
  }, [router, productId, warehouseId]);

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
    if (!qty || qty <= 0) {
      setErr('Miktar 0 dan büyük olmalıdır');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        company_id: companyId,
        product_id: product.id,
        move_type: 'in',
        qty,
        description: note || null,
      };
      if (warehouseId) payload.warehouse_id = warehouseId;
      if (date) payload.created_at = new Date(date).toISOString();

      const { error } = await supabase.from('stock_movements').insert(payload);
      if (error) throw error;
      router.push((`/stock/${productId}`) as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Stok girişi kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Detay / Stok Girişi</div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>Stok Girişi</div>

          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, padding: 12, alignItems: 'center' }}>
            <div>Stok Adı :</div>
            <div>{product?.name ?? '-'}</div>

            <div>Barkod :</div>
            <div>{product?.sku ?? '-'}</div>

            <div>Tarih :</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Depo :</div>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
              {warehouses.length === 0 && <option value="">Depo tanımlı değil</option>}
            </select>

            <div>Miktar :</div>
            <input type="number" step="0.001" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>Açıklama :</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

            <div>{err && <div style={{ color: '#ffb4b4', fontSize: 12 }}>{err}</div>}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                disabled={loading}
                type="submit"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Kaydediliyor…' : '⊕ Giriş Yap'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}



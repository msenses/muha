'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

type Product = { id: string; sku: string | null; name: string; unit: string; vat_rate?: number; price?: number };
type Movement = { id: string; created_at: string; move_type: 'in' | 'out'; qty: number; /* warehouse?: string */ };

export default function StockDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [moves, setMoves] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [type, setType] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('products').select('id, sku, name, unit, vat_rate, price').eq('id', productId).single(),
        supabase
          .from('stock_movements')
          .select('id, created_at, move_type, qty, product_id')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(200),
      ]);
      if (!active) return;
      setProduct((p ?? null) as any);
      setMoves(((m ?? []) as any).map((x: any) => ({ id: x.id, created_at: x.created_at, move_type: x.move_type, qty: x.qty })));
      setLoading(false);
    };
    init();
    return () => {
      active = false;
    };
  }, [router, productId]);

  const balance = useMemo(() => moves.reduce((s, r) => s + (r.move_type === 'in' ? 1 : -1) * Number(r.qty ?? 0), 0), [moves]);

  const filtered = useMemo(() => {
    return moves.filter((r) => {
      if (type !== 'all' && r.move_type !== type) return false;
      if (from && new Date(r.created_at) < new Date(from)) return false;
      if (to && new Date(r.created_at) > new Date(to)) return false;
      return true;
    });
  }, [moves, type, from, to]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={() => router.push(('/stock') as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>← Stok Listesi</button>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Ana Sayfa / Stok Kartları / Detay</div>
        </div>

        {/* Üst alan: sol bilgiler, sağ aksiyonlar ve görsel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 6, columnGap: 12 }}>
              <div>Stok Adı :</div><div>{product?.name ?? '-'}</div>
              <div>Barkod :</div><div>{'-'}</div>
              <div>Stok Kodu :</div><div>{product?.sku ?? '-'}</div>
              <div>Stokta Rafı :</div><div>{'-'}</div>
              <div>Grup :</div><div>{'TEMEL GIDA'}</div>
              <div>Alış Fiyatı :</div><div>{(0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div>Satış Fiyatı :</div><div>{Number(product?.price ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div>Kdv Oranı :</div><div>{Number(product?.vat_rate ?? 0)}</div>
              <div>Stokta Kalan :</div><div>{`${balance} ${product?.unit ?? 'Adet'}`}</div>
            </div>
          </div>
          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
              <div style={{ border: '1px dashed rgba(255,255,255,0.3)', borderRadius: 8, height: 180, display: 'grid', placeItems: 'center', opacity: 0.8 }}>
                RESİM MEVCUT DEĞİL
              </div>
              <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Stok Girişi</button>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Stok Çıkışı</button>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Şube Aktarım</button>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Depo Aktarım</button>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Resim Linki Ekle</button>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Yeni Satış Fiyatı Ekle</button>
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>● Stok Lot Bilgileri</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stok İşlemler */}
        <div style={{ marginTop: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '10px 12px', fontWeight: 700 }}>STOK İŞLEMLER</div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 200px 40px', gap: 8 }}>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
              <option value="all">HEPSİ</option>
              <option value="in">GİRİŞ</option>
              <option value="out">ÇIKIŞ</option>
            </select>
            <button onClick={() => {}} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>🔍</button>
          </div>
          <div style={{ padding: 12 }}>
            {loading ? 'Yükleniyor…' : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>İşlemler</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Tarih</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>İşlem Türü</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Açıklama</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Depo</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Miktar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <td style={{ padding: 8 }}>
                        <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>İşlemler ▾</button>
                      </td>
                      <td style={{ padding: 8 }}>{new Date(r.created_at).toLocaleDateString('tr-TR')}</td>
                      <td style={{ padding: 8 }}>{r.move_type === 'in' ? 'GİRİŞ' : 'ÇIKIŞ'}</td>
                      <td style={{ padding: 8 }}></td>
                      <td style={{ padding: 8 }}>Merkez</td>
                      <td style={{ padding: 8 }}>{r.qty}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}



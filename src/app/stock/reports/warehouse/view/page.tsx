'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Block = {
  productId: string;
  productName: string;
  rows: {
    date: string;
    note: string;
    qty: number;
    unitCost: number | null;
  }[];
};

export default function WarehouseMovementReportViewPage() {
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [warehouseName, setWarehouseName] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const isAll = sp.get('all') === '1';
        const s = sp.get('start') ?? '';
        const e = sp.get('end') ?? '';
        const wid = sp.get('warehouseId') ?? '';

        if (!active) return;
        setAll(isAll);
        setStart(s);
        setEnd(e);

        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) router.replace('/login');
          return;
        }

        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) setError('Şirket bilgisi alınamadı (user_profiles / companies).');
          return;
        }

        if (!wid) {
          if (active) setError('Depo bilgisi eksik.');
          return;
        }

        // Depo adı
        const { data: wh, error: whErr } = await supabase
          .from('warehouses')
          .select('name')
          .eq('id', wid)
          .eq('company_id', companyId)
          .single();
        if (!active) return;
        if (whErr) {
          console.error('Depo bilgisi alınamadı:', whErr);
          setError('Depo bilgisi alınamadı.');
          setBlocks([]);
          return;
        }
        setWarehouseName(wh?.name ?? '-');

        // Hareketler (seçili depoya göre)
        let q = supabase
          .from('stock_movements')
          .select('product_id, qty, move_type, created_at, description, unit_cost, products ( name )')
          .eq('company_id', companyId)
          .eq('warehouse_id', wid)
          .order('created_at', { ascending: true });

        if (!isAll) {
          if (s) q = q.gte('created_at', s);
          if (e) q = q.lte('created_at', e + 'T23:59:59');
        }

        const { data: moves, error: movesErr } = await q;
        if (!active) return;
        if (movesErr) {
          console.error('Depo stok hareketleri alınamadı:', movesErr);
          setError('Depo hareketleri alınırken hata oluştu.');
          setBlocks([]);
          return;
        }

        const map = new Map<string, Block>();
        for (const m of (moves ?? []) as any[]) {
          const pid: string | null = m.product_id;
          if (!pid) continue;
          const prodName: string = m.products?.name ?? '(Ürün adı yok)';
          if (!map.has(pid)) {
            map.set(pid, {
              productId: pid,
              productName: prodName,
              rows: [],
            });
          }
          const blk = map.get(pid)!;
          blk.rows.push({
            date: m.created_at,
            note: m.description ?? '',
            qty: Number(m.qty ?? 0) * (m.move_type === 'out' ? -1 : 1),
            unitCost: m.unit_cost ?? null,
          });
        }

        setBlocks(Array.from(map.values()));
      } catch (e: any) {
        console.error('Depo hareket raporu yüklenirken beklenmeyen hata:', e);
        if (active) {
          setError(e?.message ?? 'Beklenmeyen bir hata oluştu.');
          setBlocks([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main style={{ minHeight: '100dvh', background: '#eef3f7', color: '#2c3e50' }}>
      <section style={{ padding: 12 }}>
        {/* Araç çubuğu */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>✉ Email Gönder</button>
          <button title="Kaydet" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>💾</button>
          <button title="Bul" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🔍</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="Yenile" onClick={() => window.location.reload()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>↻</button>
        </div>

        {/* Rapor */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#21618c' }}>DEPO-STOK</div>
              <div style={{ fontWeight: 800, color: '#21618c' }}>HAREKETLERİ RAPORU</div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#7f8c8d' }}>
                Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>{/* Firma adı istenirse eklenebilir */}</div>
              <div style={{ marginTop: 4 }}>DÖNEM : -</div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontWeight: 800, background: '#5d6d7e', color: 'white', padding: '8px 10px' }}>
            DEPO ADI : {warehouseName || '—'}
          </div>

          {error && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: '#fdecea', color: '#c0392b', border: '1px solid #f5b7b1' }}>
              {error}
            </div>
          )}
          {loading && !error && <div style={{ marginTop: 10, fontSize: 13, color: '#7f8c8d' }}>Yükleniyor…</div>}
          {!loading && !error && blocks.length === 0 && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#7f8c8d' }}>Bu kriterlere uygun depo hareketi bulunamadı.</div>
          )}

          {!loading &&
            !error &&
            blocks.map((blk, idx) => {
              const total = blk.rows.reduce((s, r) => s + r.qty, 0);
              const totalCost = blk.rows.reduce((s, r) => s + (r.unitCost ? r.unitCost * r.qty : 0), 0);
              return (
                <div key={idx} style={{ marginTop: 12, border: '1px solid #ecf0f1', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ background: '#ecf0f1', padding: '8px 10px', fontWeight: 700 }}>Stok Adı : {blk.productName}</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <tbody>
                      {blk.rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f6f9' }}>
                          <td style={{ padding: 8, width: 140 }}>
                            Tarih : {new Date(r.date).toLocaleDateString('tr-TR')}
                          </td>
                          <td style={{ padding: 8, width: 220 }}>Açıklama : {r.note}</td>
                          <td style={{ padding: 8, width: 180, textAlign: 'right' }}>Miktar : {r.qty}</td>
                          <td style={{ padding: 8, width: 220, textAlign: 'right' }}>
                            Birim Maliyet :{' '}
                            {r.unitCost != null ? r.unitCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: 8, background: '#ecf0f1' }}>
                    <div>Toplam Miktar : {total}</div>
                    <div>
                      Toplam Maliyet :{' '}
                      {totalCost ? totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </main>
  );
}



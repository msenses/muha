'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type SummaryRow = {
  productId: string;
  code: string;
  shelf: string;
  name: string;
  groupName: string;
  inQty: number;
  outQty: number;
};

export default function StockSummaryReportViewPage() {
  const router = useRouter();
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [groupBy, setGroupBy] = useState<'product' | 'group' | 'warehouse'>('product');
  const [zeros, setZeros] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
        const isAll = sp.get('all') === '1';
        const s = sp.get('start') ?? '';
        const e = sp.get('end') ?? '';
        const gb = (sp.get('groupBy') as any) || 'product';
        const z = sp.get('zeros') === '1';

        if (!active) return;
        setAll(isAll);
        setStart(s);
        setEnd(e);
        setGroupBy(gb);
        setZeros(z);

        setLoading(true);
        setError(null);

        // Oturum kontrolü
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

        // Firma adı
        const { data: companyRow } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        if (active && companyRow?.name) {
          setCompanyName(companyRow.name);
        }

        // Ürünler ve gruplar
        const [{ data: products, error: prodErr }, { data: groups, error: grpErr }] = await Promise.all([
          supabase.from('products').select('id, sku, name, group_id').eq('company_id', companyId),
          supabase.from('product_groups').select('id, name').eq('company_id', companyId),
        ]);
        if (!active) return;
        if (prodErr || grpErr) {
          console.error('Toplu stok raporu ürünler/gruplar alınamadı:', prodErr || grpErr);
          setError('Ürün veya grup bilgileri alınırken hata oluştu.');
          setRows([]);
          return;
        }

        const productMap = new Map<string, { sku: string | null; name: string; groupId: string | null }>();
        for (const p of (products ?? []) as any[]) {
          productMap.set(p.id, {
            sku: p.sku ?? null,
            name: p.name ?? '',
            groupId: p.group_id ?? null,
          });
        }

        const groupMap = new Map<string, string>();
        for (const g of (groups ?? []) as any[]) {
          groupMap.set(g.id, g.name ?? '');
        }

        // Hareketler
        let q = supabase
          .from('stock_movements')
          .select('product_id, qty, move_type, created_at')
          .eq('company_id', companyId);

        if (!isAll) {
          if (s) q = q.gte('created_at', s);
          if (e) q = q.lte('created_at', e + 'T23:59:59');
        }

        const { data: moves, error: movesErr } = await q;
        if (!active) return;
        if (movesErr) {
          console.error('Toplu stok raporu hareketleri alınamadı:', movesErr);
          setError('Stok hareketleri alınırken hata oluştu.');
          setRows([]);
          return;
        }

        const summaryMap = new Map<string, SummaryRow>();
        for (const m of (moves ?? []) as any[]) {
          const pid: string | null = m.product_id;
          if (!pid) continue;
          const qty = Number(m.qty ?? 0);
          if (!qty) continue;
          const prod = productMap.get(pid);
          const key = pid;
          if (!summaryMap.has(key)) {
            const groupId = prod?.groupId ?? null;
            const groupName = groupId ? groupMap.get(groupId) ?? '-' : '-';
            summaryMap.set(key, {
              productId: pid,
              code: prod?.sku ?? '',
              shelf: '-',
              name: prod?.name ?? '(Ürün adı yok)',
              groupName,
              inQty: 0,
              outQty: 0,
            });
          }
          const row = summaryMap.get(key)!;
          if (m.move_type === 'in') row.inQty += qty;
          else if (m.move_type === 'out') row.outQty += qty;
        }

        let result = Array.from(summaryMap.values());
        if (!z) {
          result = result.filter((r) => r.inQty - r.outQty !== 0);
        }

        setRows(result);
      } catch (e: any) {
        console.error('Toplu stok raporu yüklenirken beklenmeyen hata:', e);
        if (active) {
          setError(e?.message ?? 'Beklenmeyen bir hata oluştu.');
          setRows([]);
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button title="Önceki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer', opacity: 0.5 }}>◀</button>
            <div style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #c8d1dc', background: 'white' }}>1 / 1</div>
            <button title="Sonraki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#d32f2f', color: 'white', cursor: 'pointer' }}>▶</button>
          </div>
        </div>

        {/* Rapor */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, padding: 16 }}>
          <div style={{ textAlign: 'center', color: '#21618c', fontWeight: 800, fontSize: 18 }}>TOPLU STOK RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>Firma : {companyName || '—'}</div>
          <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, color: '#7f8c8d' }}>
            Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`} ({groupBy === 'product' ? 'Ürün bazında' : groupBy === 'group' ? 'Ürün grubu bazında' : 'Depo bazında'})
          </div>

          {error && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: '#fdecea', color: '#c0392b', border: '1px solid #f5b7b1' }}>
              {error}
            </div>
          )}
          {loading && !error && <div style={{ marginTop: 10, fontSize: 13, color: '#7f8c8d' }}>Yükleniyor…</div>}
          {!loading && !error && rows.length === 0 && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#7f8c8d' }}>Bu kriterlere uygun stok hareketi bulunamadı.</div>
          )}

          {!loading && !error && rows.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#5d6d7e', color: 'white' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>KOD</th>
                <th style={{ textAlign: 'left', padding: 8 }}>RAF</th>
                <th style={{ textAlign: 'left', padding: 8 }}>AD</th>
                <th style={{ textAlign: 'left', padding: 8 }}>GRUP</th>
                <th style={{ textAlign: 'left', padding: 8 }}>GİREN</th>
                <th style={{ textAlign: 'left', padding: 8 }}>ÇIKAN</th>
                <th style={{ textAlign: 'left', padding: 8 }}>KALAN</th>
              </tr>
            </thead>
            <tbody>
                {rows.map((r) => {
                const remain = r.inQty - r.outQty;
                return (
                    <tr key={r.productId} style={{ borderBottom: '1px solid #ecf0f1' }}>
                      <td style={{ padding: 8 }}>{r.code || '-'}</td>
                      <td style={{ padding: 8 }}>{r.shelf || '-'}</td>
                    <td style={{ padding: 8 }}>{r.name}</td>
                      <td style={{ padding: 8 }}>{r.groupName || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
                          <span>Miktar:</span>
                          <span>{r.inQty.toFixed(2)} Adet</span>
                      </div>
                    </td>
                    <td style={{ padding: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
                          <span>Miktar:</span>
                          <span>{r.outQty.toFixed(2)} Adet</span>
                      </div>
                    </td>
                    <td style={{ padding: 8 }}>
                      <div style={{ color: '#7f8c8d' }}>{remain.toFixed(2)} Adet</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </section>
    </main>
  );
}



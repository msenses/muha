'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type MovementRow = {
  date: string;
  qty: number;
  typeLabel: string;
  description: string | null;
};

type ProductBlock = {
  productId: string;
  code: string;
  name: string;
  rows: MovementRow[];
};

export default function StockMovementsReportViewPage() {
  const router = useRouter();
  const [all, setAll] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [companyName, setCompanyName] = useState<string>('');
  const [blocks, setBlocks] = useState<ProductBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parametreleri ve gerçek veriyi yalnızca istemci tarafında, mount sonrası oku.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
    if (typeof window === 'undefined') return;

        // 1) URL parametrelerini oku
    const sp = new URLSearchParams(window.location.search);
    const isAll = sp.get('all') === '1';
    const s = sp.get('start') ?? '';
    const e = sp.get('end') ?? '';
        if (!active) return;
    setAll(isAll);
    setStart(s);
    setEnd(e);

        setLoading(true);
        setError(null);

        // 2) Oturum ve company_id
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

        // 3) Firma adını al
        const { data: companyRow } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        if (active && companyRow?.name) {
          setCompanyName(companyRow.name);
        }

        // 4) Stok hareketlerini veritabanından oku
        let q = supabase
          .from('stock_movements')
          .select('product_id, qty, move_type, description, created_at, products ( name, sku )')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });

        if (!isAll) {
          if (s) q = q.gte('created_at', s);
          if (e) q = q.lte('created_at', e + 'T23:59:59');
        }

        const { data: moves, error: movesError } = await q;
        if (!active) return;
        if (movesError) {
          console.error('Stok hareketleri raporu yüklenemedi:', movesError);
          setError('Stok hareketleri yüklenirken hata oluştu.');
          setBlocks([]);
          return;
        }

        // 5) Ürün bazında grupla
        const map = new Map<string, ProductBlock>();
        for (const m of (moves ?? []) as any[]) {
          const pid: string = m.product_id;
          const prod = m.products ?? {};
          const key = pid || `unknown-${prod.name ?? ''}`;
          if (!map.has(key)) {
            map.set(key, {
              productId: pid,
              code: prod.sku ?? '',
              name: prod.name ?? '(Ürün adı yok)',
              rows: [],
            });
          }
          const blk = map.get(key)!;
          blk.rows.push({
            date: m.created_at,
            qty: Number(m.qty ?? 0),
            typeLabel: m.move_type === 'in' ? 'GİRİŞ' : 'ÇIKIŞ',
            description: m.description ?? null,
          });
        }

        setBlocks(Array.from(map.values()));
      } catch (err: any) {
        console.error('Stok hareketleri raporu yüklenirken beklenmeyen hata:', err);
        if (active) {
          setError(err?.message ?? 'Beklenmeyen bir hata oluştu.');
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
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>✉ Email Gönder</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="PDF" style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', background: 'white', cursor: 'pointer' }}>📄</button>
          <button title="Geri" onClick={() => router.back()} style={{ padding: 6, borderRadius: 6, border: '1px solid #bbb', background: 'white', cursor: 'pointer' }}>↩</button>
        </div>

        {/* Rapor gövdesi */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#21618c' }}>STOK HAREKETLERİ RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            Firma : {companyName || '—'}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, color: '#7f8c8d' }}>
            Tarih Aralığı : {all ? '-' : `${start || '-'} - ${end || '-'}`}
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: '#fdecea', color: '#c0392b', border: '1px solid #f5b7b1' }}>
              {error}
            </div>
          )}

          {loading && !error && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#7f8c8d' }}>Yükleniyor…</div>
          )}

          {!loading && !error && blocks.length === 0 && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#7f8c8d' }}>Bu kriterlere uygun stok hareketi bulunamadı.</div>
          )}

          {/* Ürün bazlı hareket listesi */}
          {blocks.map((blk) => {
            const totalQty = blk.rows.reduce((sum, r) => sum + r.qty, 0);
            return (
              <div key={blk.productId || blk.name} style={{ marginTop: 14, border: '1px solid #dfe6ee', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ background: '#5d6d7e', color: 'white', padding: '8px 10px', fontWeight: 700, display: 'grid', gridTemplateColumns: '140px 1fr 200px' }}>
                  <div>ÜRÜN KODU {blk.code || '-'}</div>
                <div>ÜRÜN ADI {blk.name}</div>
                  <div style={{ textAlign: 'right' }}>ÜRÜN GRUBU -</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#ecf0f1' }}>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Tarih</th>
                    <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Miktar</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>İşlem Tipi</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e8ec' }}>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {blk.rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f3f7' }}>
                        <td style={{ padding: 8 }}>{new Date(r.date).toLocaleDateString('tr-TR')}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{r.qty}</td>
                        <td style={{ padding: 8 }}>{r.typeLabel}</td>
                        <td style={{ padding: 8 }}>{r.description || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 10, borderTop: '1px solid #e5e8ec', background: '#fafbfc' }}>
                  <div>GİRİŞ / ÇIKIŞ TOPLAM : {totalQty}</div>
                  <div>MALİYET : -</div>
                  <div>KALAN : {/* Kalan stok için ayrı raporlar kullanılabilir */}</div>
              </div>
            </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}


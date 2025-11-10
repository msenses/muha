'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';

type Product = { id: string; sku: string | null; name: string; unit: string; vat_rate: number; price: number };

export default function StockPriceListReportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: prods } = await supabase
        .from('products')
        .select('id, sku, name, unit, vat_rate, price')
        .order('name', { ascending: true })
        .limit(500);
      setRows((prods ?? []) as any);
      setLoading(false);
    };
    init();
  }, [router]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#5d6d7e', color: 'white' }}>
          <th style={{ textAlign: 'left', padding: 8 }}>KOD</th>
          <th style={{ textAlign: 'left', padding: 8 }}>RAF</th>
          <th style={{ textAlign: 'left', padding: 8 }}>BARKOD</th>
          <th style={{ textAlign: 'left', padding: 8 }}>GRUP</th>
          <th style={{ textAlign: 'left', padding: 8 }}>STOK ADI</th>
          <th style={{ textAlign: 'left', padding: 8 }}>KDV ORAN</th>
          <th style={{ textAlign: 'left', padding: 8 }}>KDV DAHİL</th>
          <th style={{ textAlign: 'right', padding: 8 }}>S. FİYAT</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
            <td style={{ padding: 8 }}>{p.sku ?? '-'}</td>
            <td style={{ padding: 8 }}>-</td>
            <td style={{ padding: 8 }}>-</td>
            <td style={{ padding: 8 }}>TEMEL GIDA</td>
            <td style={{ padding: 8 }}>{p.name}</td>
            <td style={{ padding: 8 }}>{Number(p.vat_rate ?? 0)}%</td>
            <td style={{ padding: 8 }}>Kdv Dahil</td>
            <td style={{ padding: 8, textAlign: 'right' }}>{Number(p.price ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        ))}
        {!loading && rows.length === 0 && (
          <tr>
            <td colSpan={8} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [rows, loading]);

  return (
    <main style={{ minHeight: '100dvh', background: '#eef3f7', color: '#2c3e50' }}>
      <section style={{ padding: 12 }}>
        {/* Araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>✉ Email Gönder</button>
          <button title="Kaydet" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>💾</button>
          <button title="Bul" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🔍</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="Yenile" onClick={() => router.refresh()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>↻</button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button title="Önceki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer', opacity: 0.5 }}>◀</button>
            <div style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #c8d1dc', background: 'white' }}>1 / 2</div>
            <button title="Sonraki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#d32f2f', color: 'white', cursor: 'pointer' }}>▶</button>
          </div>
        </div>

        {/* Rapor başlığı */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, padding: 16 }}>
          <div style={{ textAlign: 'center', color: '#21618c', fontWeight: 800, fontSize: 18 }}>STOK FİYAT LİSTESİ RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>Firma : TEST BİLSOFT</div>

          {loading ? <div style={{ padding: 12 }}>Yükleniyor…</div> : table}
        </div>
      </section>
    </main>
  );
}



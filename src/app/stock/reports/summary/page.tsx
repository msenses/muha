'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';

export default function StockSummaryReportPage() {
  const router = useRouter();
  const [allTime, setAllTime] = useState(true);
  const [start, setStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState<'product' | 'group' | 'warehouse'>('product');
  const [showZeros, setShowZeros] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
      }
    };
    init();
  }, [router]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Raporlar / Toplu Stok Raporu</div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>İşlem</div>

          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input checked={allTime} onChange={(e) => setAllTime(e.target.checked)} type="checkbox" />
              <span>Tüm Zamanlar</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Başlangıç Tarihi</span>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  disabled={allTime}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Bitiş Tarihi</span>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  disabled={allTime}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Gruplama Türü Seçiniz :</span>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                <option value="product">Ürüne göre</option>
                <option value="group">Gruba göre</option>
                <option value="warehouse">Depoya göre</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input checked={showZeros} onChange={(e) => setShowZeros(e.target.checked)} type="checkbox" />
              <span>Sıfırları Göster</span>
            </label>

            <div>
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (allTime) params.set('all', '1');
                  else {
                    params.set('start', start);
                    params.set('end', end);
                  }
                  params.set('groupBy', groupBy);
                  if (showZeros) params.set('zeros', '1');
                  params.set('ts', Date.now().toString());
                  router.push(`/stock/reports/summary/view?${params.toString()}`);
                }}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}
              >
                ☰ Toplu Stok Raporu
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



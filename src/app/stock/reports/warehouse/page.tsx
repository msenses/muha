'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Warehouse = { id: string; name: string };

export default function WarehouseMovementReportPage() {
  const router = useRouter();
  const [allTime, setAllTime] = useState(true);
  const [start, setStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace('/login');
          return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) setError('Şirket bilgisi alınamadı');
          return;
        }
        const { data: list, error: listErr } = await supabase
          .from('warehouses')
          .select('id, name')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });
        if (!active) return;
        if (listErr) {
          console.error('Depolar alınamadı:', listErr);
          setError('Depo listesi alınırken hata oluştu');
          setWarehouses([]);
        } else {
          const ws = ((list ?? []) as any[]).map((w) => ({ id: w.id, name: w.name }));
          setWarehouses(ws);
          if (!warehouseId && ws.length > 0) {
            setWarehouseId(ws[0].id);
          }
        }
      } catch (e: any) {
        if (!active) return;
        console.error('Depo listesi yüklenirken beklenmeyen hata:', e);
        setError(e?.message ?? 'Beklenmeyen bir hata oluştu');
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Raporlar / Depo Hareket Raporu</div>

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
              <span style={{ fontSize: 12, opacity: 0.85 }}>Depo Seçiniz :</span>
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
              </select>
            </label>

            {error && <div style={{ color: '#ffb4b4', fontSize: 12 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  if (!warehouseId) {
                    window.alert('Lütfen bir depo seçiniz.');
                    return;
                  }
                  const params = new URLSearchParams();
                  if (allTime) params.set('all', '1');
                  else {
                    params.set('start', start);
                    params.set('end', end);
                  }
                  params.set('warehouseId', warehouseId);
                  params.set('ts', Date.now().toString());
                  router.push(`/stock/reports/warehouse/view?${params.toString()}`);
                }}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}
              >
                ☰ Depo Hareket Raporu
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



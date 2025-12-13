'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Product = {
  id: string;
  sku: string | null;
  name: string;
  unit: string;
  price: number;
};

export default function StockPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [reportsOpen, setReportsOpen] = useState(false);
  const [scope, setScope] = useState<'name' | 'sku' | 'barcode'>('name');
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        // Oturum kontrolü
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setLoading(false);
          router.replace('/login');
          return;
        }

        // Company ID'yi al
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          console.warn('Company ID bulunamadı');
          if (active) {
            setRows([]);
            setBalances({});
          }
          return;
        }

        // Ürünleri çek (sadece bu firmaya ait)
        const { data, error } = await supabase
          .from('products')
          .select('id, sku, name, unit, price')
          .eq('company_id', companyId)
          .order('name', { ascending: true })
          .limit(200);

        if (!active) return;
        if (error) {
          console.error('Stok listesi yüklenemedi:', error);
          setRows([]);
        } else {
          setRows((data ?? []) as unknown as Product[]);
        }

        // Stok bakiyelerini (giriş-çıkış) hesapla — client tarafında gruplayalım
        const { data: moves, error: movesError } = await supabase
          .from('stock_movements')
          .select('product_id, move_type, qty')
          .limit(10000);
        if (!active) return;
        if (movesError) {
          console.error('Stok hareketleri yüklenemedi:', movesError);
          setBalances({});
        } else {
          const map: Record<string, number> = {};
          for (const m of (moves ?? []) as any[]) {
            const pid = m.product_id as string;
            const qty = Number(m.qty ?? 0);
            const sign = m.move_type === 'in' ? 1 : -1;
            map[pid] = (map[pid] ?? 0) + sign * qty;
          }
          setBalances(map);
        }
      } catch (err) {
        console.error('Stoklar yüklenirken beklenmeyen hata:', err);
        if (active) {
          setRows([]);
          setBalances({});
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

  const filtered = useMemo(() => {
    const text = q.trim().toLocaleLowerCase('tr-TR');
    if (!text) return rows;
    return rows.filter((p) => {
      const name = p.name.toLocaleLowerCase('tr-TR');
      const sku = (p.sku ?? '').toLocaleLowerCase('tr-TR');
      const barcode = ''; // Şimdilik veritabanında yok
      const haystack = scope === 'name' ? name : scope === 'sku' ? sku : barcode;
      return haystack.includes(text);
    });
  }, [rows, q, scope]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>#</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Kodu</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Barkod</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Stok Adı</th>
          <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Fiyatı</th>
          <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Bakiye</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((p, idx) => {
          const balance = balances[p.id] ?? 0;
          return (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <td style={{ padding: 10 }}>
                <button
                  title="İncele"
                  onClick={() => router.push((`/stock/${p.id}`) as Route)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
                >
                  🔍
                </button>
              </td>
              <td style={{ padding: 10, opacity: 0.9 }}>{p.sku ?? '-'}</td>
              <td style={{ padding: 10, opacity: 0.9 }}>{'-'}</td>
              <td style={{ padding: 10 }}>{p.name}</td>
              <td style={{ padding: 10, textAlign: 'right' }}>{Number(p.price ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ padding: 10 }}>{`${balance} ${p.unit || 'Adet'}`}</td>
            </tr>
          );
        })}
        {!loading && filtered.length === 0 && (
          <tr>
            <td colSpan={6} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [filtered, loading, balances]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        {/* Üst breadcrumb ve aksiyon butonları */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <button
              onClick={() => router.push(('/stock/new') as Route)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #0b5ed7', background: '#0d6efd', color: 'white', cursor: 'pointer' }}
            >
              Yeni Stok (F5)
            </button>
            <button onClick={() => router.push(('/stock/groups') as Route)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>
              Gruplar
            </button>
            <button onClick={() => router.push(('/stock/units') as Route)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>
              Birimler
            </button>
            <button onClick={() => router.push(('/stock/warehouses') as Route)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>
              Depolar
            </button>
            <button onClick={() => router.push(('/stock/package-groups') as Route)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>
              Stok Paket Grupları
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setReportsOpen((v) => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: '1px solid #d4ac0d', background: '#f1c40f', color: '#2c3e50', cursor: 'pointer' }}>
                Raporlar <span style={{ fontSize: 12 }}>▾</span>
              </button>
              {reportsOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 220, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.15)', background: 'white', color: '#2c3e50', boxShadow: '0 10px 24px rgba(0,0,0,0.2)', zIndex: 10 }}>
                  <button onClick={() => router.push(('/stock/reports/movements') as Route)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>🧾 Stok Hareketleri</button>
                  <button onClick={() => router.push(('/stock/reports/labels') as Route)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>🏷️ Stok Etiket Bas</button>
                  <button onClick={() => router.push(('/stock/reports/summary') as Route)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>📦 Toplu Stok Raporu</button>
                  <button onClick={() => router.push(('/stock/reports/warehouse') as Route)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>📈 Depo Hareket Raporu</button>
                  <button onClick={() => router.push(('/stock/reports/transfer') as Route)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>🔁 Depo Aktarım Raporu</button>
                  <button onClick={() => router.push(('/stock/reports/pricelist') as Route)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 0, cursor: 'pointer' }}>💲 Fiyat Listesi</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi + sağda arama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#12b3c5', color: 'white', padding: '10px 12px', fontWeight: 700, letterSpacing: 0.2 }}>
            <div style={{ flex: 1 }}>Stok Kart Listesi</div>
            <select value={scope} onChange={(e) => setScope(e.target.value as any)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
              <option value="name">Stok Adı</option>
              <option value="sku">Kodu</option>
              <option value="barcode">Barkod</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara..."
                style={{ width: 220, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              />
              <button onClick={() => setQ((prev) => prev)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>🔍</button>
            </div>
          </div>

          <div style={{ padding: 12 }}>
            {loading ? 'Yükleniyor…' : table}
          </div>
        </div>
      </section>
    </main>
  );
}



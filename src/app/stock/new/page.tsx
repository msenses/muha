'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function StockNewPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('ADET');
  const [vatRate, setVatRate] = useState<number>(20);
  const [price, setPrice] = useState<number>(0);

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
    };
    init();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error('Stok adı zorunlu');
      const { error } = await supabase.from('products').insert({
        company_id: companyId,
        sku: sku || null,
        name: trimmedName,
        unit,
        vat_rate: Number.isFinite(vatRate) ? vatRate : 0,
        price: Number.isFinite(price) ? price : 0,
      });
      if (error) throw error;
      router.push(('/stock') as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Yeni</div>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 18, marginBottom: 12 }}>Stok Kartı Ekle</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Kodu</span>
                <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Örn: PRD-0001" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Birim</span>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="ADET">Adet</option>
                  <option value="KG">Kg</option>
                  <option value="LT">Lt</option>
                  <option value="PAKET">Paket</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Adı</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ürün adı" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>KDV Oranı (%)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Satış Fiyatı</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
              </label>
            </div>

            {err && <div style={{ marginTop: 10, color: '#ffdddd' }}>{err}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => router.push(('/stock') as Route)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>
                Vazgeç
              </button>
              <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #27ae60', background: '#2ecc71', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}



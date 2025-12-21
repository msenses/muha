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
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [shelf, setShelf] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Temel Gıda');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [price, setPrice] = useState<number>(0); // Satış fiyatı
  const [vatRate, setVatRate] = useState<number>(20);
  const [vatMode, setVatMode] = useState<'dahil' | 'haric'>('dahil');
  const [otvRate, setOtvRate] = useState<number>(0);
  const [otvMode, setOtvMode] = useState<'dahil' | 'haric'>('dahil');
  const [unit, setUnit] = useState('ADET');
  const [openingQty, setOpeningQty] = useState<number>(0);
  const [custom1, setCustom1] = useState('');
  const [custom2, setCustom2] = useState('');
  const [custom3, setCustom3] = useState('');
  const [custom4, setCustom4] = useState('');

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
        sku: sku || null, // Stok kodu
        name: trimmedName,
        unit,
        vat_rate: Number.isFinite(vatRate) ? vatRate : 0,
        price: Number.isFinite(price) ? price : 0,          // Satış fiyatı
        cost_price: Number.isFinite(purchasePrice) ? purchasePrice : 0, // Alış maliyeti
      });
      if (error) throw error;
      router.push(('/stock') as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = () => {
    // Basit 13 haneli barkod üretimi (yalnızca UI için)
    const base = Date.now().toString().slice(-12);
    const candidate = `9${base}`;
    setBarcode(candidate);
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Yeni</div>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 860 }}>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 18, marginBottom: 12 }}>Stok Kartı Ekle</div>

            {/* Barkod ve otomatik barkod */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end', marginBottom: 8 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Barkod</span>
                <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <button type="button" onClick={generateBarcode} style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>
                Otomatik Barkod
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Kodu</span>
                <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Örn: PRD-0001" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Rafı</span>
                <input value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
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
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Grup</span>
                <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="Temel Gıda">Temel Gıda</option>
                  <option value="Gıda Dışı">Gıda Dışı</option>
                  <option value="İçecek">İçecek</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Alış Fiyatı</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
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
                <span style={{ fontSize: 12, opacity: 0.85 }}>Kdv Durumu</span>
                <select value={vatMode} onChange={(e) => setVatMode(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="dahil">Kdv Dahil</option>
                  <option value="haric">Kdv Hariç</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Ötv Oranı (%)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={otvRate}
                  onChange={(e) => setOtvRate(Number(e.target.value))}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Ötv Durumu</span>
                <select value={otvMode} onChange={(e) => setOtvMode(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="dahil">Ötv Dahil</option>
                  <option value="haric">Ötv Hariç</option>
                </select>
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
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Giriş Bakiyesi</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={openingQty}
                  onChange={(e) => setOpeningQty(Number(e.target.value))}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Özel Alan 1</span>
                <input value={custom1} onChange={(e) => setCustom1(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Özel Alan 2</span>
                <input value={custom2} onChange={(e) => setCustom2(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Özel Alan 3</span>
                <input value={custom3} onChange={(e) => setCustom3(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </label>
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Özel Alan 4</span>
                <input value={custom4} onChange={(e) => setCustom4(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
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



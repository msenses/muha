'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

export default function StockPackageGroupNewPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [stockBarcode, setStockBarcode] = useState('');
  const [qty, setQty] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
      }
    };
    init();
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Şimdilik sadece UI — daha sonra veritabanına kaydedilecek
    router.push(('/stock/package-groups') as Route);
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Stok Paket Grupları / Yeni</div>

        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', maxWidth: 640 }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>Stok Paket Grup Ekle</div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Paket Adı</span>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Paket Barkod</span>
              <input value={barcode} onChange={(e) => setBarcode(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Stok Barkod</span>
              <input value={stockBarcode} onChange={(e) => setStockBarcode(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Miktar</span>
              <input type="number" step="1" min="0" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </label>

            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => router.push(('/stock/package-groups') as Route)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>
                Vazgeç
              </button>
              <button type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e74c3c', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}



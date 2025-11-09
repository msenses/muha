'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';

export default function WarehouseNewPage() {
  const router = useRouter();
  const [name, setName] = useState('');

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
    // Şimdilik sadece UI — kayıt daha sonra eklenecek
    router.push(('/stock/warehouses') as Route);
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Depolar / Yeni</div>

        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', maxWidth: 520 }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>Stok Depo Ekle</div>

          <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Depo adı"
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
            <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>
              Kaydet
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}



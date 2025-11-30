'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function EInvoicePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        router.replace('/login' as Route);
        return;
      }
      setReady(true);
    };
    init();
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'white' }}>
        Yükleniyor…
      </main>
    );
  }

  const navBtnStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 6,
    background: '#4fd1c5',
    border: '1px solid #38b2ac',
    color: '#0f172a',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
    whiteSpace: 'nowrap',
  };

  const createDemoAndOpen = async () => {
    try {
      setCreating(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login' as Route);
        return;
      }
      const companyId = await fetchCurrentCompanyId();
      const unique = Math.random().toString(36).slice(2, 7).toUpperCase();
      const { data: ins, error } = await supabase
        .from('accounts')
        .insert({
          company_id: companyId,
          code: `DNM-${unique}`,
          name: `Deneme Cari ${unique}`,
          phone: null,
          email: 'demo@example.com',
          address: 'Merkez',
        })
        .select('id')
        .single();
      if (error) throw error;
      const newId = (ins as any).id as string;
      router.push((`/invoices/new?sales=1&account=${newId}`) as Route);
    } catch {
      // no-op: üretim dışı basit demo
    } finally {
      setCreating(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst menü (görseldeki buton şeridi) */}
      <section style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={navBtnStyle} onClick={() => router.push('/dashboard' as Route)}>Anasayfa</button>
          <button style={navBtnStyle} onClick={() => void 0}>Taslaklar</button>
          <button style={navBtnStyle} onClick={() => void 0}>Giden Faturalar ▾</button>
          <button style={navBtnStyle} onClick={() => void 0}>Gelen Faturalar ▾</button>
          <button style={navBtnStyle} onClick={() => void 0}>Mükellef Kontrol</button>
          <button style={navBtnStyle} onClick={() => void 0}>Ayarlar ▾</button>
          <button style={navBtnStyle} onClick={() => router.push('/accounts?selectFor=sales' as Route)}>Fatura Oluştur</button>
          <button style={{ ...navBtnStyle, background: '#fbbf24', border: '1px solid #f59e0b' }} onClick={createDemoAndOpen} disabled={creating}>
            {creating ? 'Oluşturuluyor…' : 'Deneme Cari ile Aç'}
          </button>
          <button style={navBtnStyle} onClick={() => void 0}>Kontör Yükle</button>
        </div>

        {/* Başlık şeridi */}
        <div
          style={{
            marginTop: 12,
            width: '100%',
            background: '#25bcd6',
            color: '#0f172a',
            fontWeight: 800,
            padding: '10px 12px',
            borderRadius: 6,
            letterSpacing: 0.5,
          }}
        >
          E-FATURA
        </div>
      </section>

      {/* İçerik alanı (şimdilik boş, ileride detaylar eklenecek) */}
      <section style={{ padding: 16 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            minHeight: 240,
          }}
        >
          Bu alan e-Fatura işlemleri için kullanılacaktır.
        </div>
      </section>
    </main>
  );
}



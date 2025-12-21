'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import type { Route } from 'next';

export default function Sidebar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        padding: 16,
        borderRight: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexShrink: 0 }}>
        <Image src="/finova_logo_2.png" alt="Finova" width={160} height={40} style={{ height: 24, width: 'auto' }} />
      </div>
      <nav
        style={{
          display: 'grid',
          gap: 8,
          flex: 1,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        <button onClick={() => router.push(('/dashboard') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Giriş Ekranı</button>
        <button onClick={() => router.push(('/accounts?selectFor=sales') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Satış Yap</button>
        <button onClick={() => router.push(('/accounts') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Cari Hesaplar</button>
        <button onClick={() => router.push(('/stock') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Stok Kartları</button>
        <button onClick={() => router.push(('/invoices') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Faturalar</button>
        <button onClick={() => router.push(('/e-fatura') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>E-Fatura</button>
        <button onClick={() => router.push(('/e-irsaliye') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>E-İrsaliye</button>
        <button onClick={() => router.push(('/income-expense') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Gelir Gider</button>
        <button onClick={() => router.push(('/cash') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Kasa</button>
        <button onClick={() => router.push(('/bank') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Banka</button>
        <button onClick={() => router.push(('/cheque-note') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Çek/Senet</button>
        <button onClick={() => router.push(('/installments') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Taksit Takip</button>
        <button onClick={() => router.push(('/quotes-orders') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Teklif Sipariş</button>
        <button onClick={() => router.push(('/agenda') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Ajanda</button>
        <button onClick={() => router.push(('/reports') as Route)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Raporlar</button>
      </nav>
      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.8, flexShrink: 0 }}>Oturum: {email ?? '-'}</div>
      <button
        onClick={signOut}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.12)',
          color: 'white',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Çıkış
      </button>
    </aside>
  );
}



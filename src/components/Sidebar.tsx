'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

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
    <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, padding: 16, borderRight: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(6px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Image src="/finova_logo_2.png" alt="Finova" width={160} height={40} style={{ height: 24, width: 'auto' }} />
        <strong>Finova</strong>
      </div>
      <nav style={{ display: 'grid', gap: 8 }}>
        <button onClick={() => router.push('/dashboard')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Genel Bakış</button>
        <button onClick={() => router.push('/accounts')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Cariler</button>
        <button onClick={() => router.push('/invoices')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Faturalar</button>
        <button onClick={() => router.push('/stock')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Stok</button>
        <button onClick={() => router.push('/cash')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Kasa/Banka</button>
        <button onClick={() => router.push('/reports')} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>Raporlar</button>
      </nav>
      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.8 }}>Oturum: {email ?? '-'}</div>
      <button onClick={signOut} style={{ marginTop: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Çıkış</button>
    </aside>
  );
}



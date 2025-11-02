'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!mounted) return;
      if (!session) {
        router.replace('/login');
        return;
      }
      setEmail(session.user.email ?? null);
      setReady(true);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (!ready) {
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
        Yükleniyor…
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      {/* Sol menü */}
      <aside style={{ padding: 16, borderRight: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Image src="/finova_logo_arkaplan_yok.png" alt="Finova" width={24} height={24} />
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

      {/* İçerik */}
      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Hızlı Başlangıç</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>Sol menüden modüllere ulaşabilirsiniz. İlk adım olarak Cariler ve Faturalar önerilir.</div>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Cariler</div>
            <button onClick={() => router.push('/accounts')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Cari Listesine Git</button>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Faturalar</div>
            <button onClick={() => router.push('/invoices')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Fatura Modülüne Git</button>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Stok</div>
            <button onClick={() => router.push('/stock')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Stok Modülüne Git</button>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Kasa/Banka</div>
            <button onClick={() => router.push('/cash')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Kasa/Banka Modülüne Git</button>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Raporlar</div>
            <button onClick={() => router.push('/reports')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Raporlara Git</button>
          </div>
        </div>
      </section>
    </main>
  );
}



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
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/finova_logo.png" alt="Finova" width={28} height={28} />
          <strong>Finova</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, opacity: 0.9 }}>
          <span>{email}</span>
          <button onClick={signOut} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Çıkış</button>
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Hızlı Başlangıç</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>Sol üstte logo, sağda oturum. Buradan Cariler ve Faturalar modüllerini ekleyeceğiz.</div>
          </div>
        </div>
      </section>
    </main>
  );
}



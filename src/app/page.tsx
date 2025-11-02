"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)' }}>
      <div style={{ width: 560, maxWidth: '90%', padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Image src="/finova_logo.png" alt="Finova" width={40} height={40} />
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Finova</h1>
        </div>
        <p style={{ marginTop: 0, opacity: 0.9 }}>Ön muhasebe uygulaması için başlangıç iskeleti hazır. Supabase bağlantısını .env.local ile yapılandırın ve Vercel’e dağıtın.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {hasSession ? (
            <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Dashboard’a Git</button>
          ) : (
            <button onClick={() => router.push('/login')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Giriş Yap</button>
          )}
        </div>
      </div>
    </main>
  );
}



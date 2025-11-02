'use client';

import { useRouter } from 'next/navigation';

export default function CashPage() {
  const router = useRouter();
  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Kasa / Banka</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Bu sayfa yakında kasa/banka işlemleriyle doldurulacak.</div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Dashboard'a Dön</button>
          </div>
        </div>
      </section>
    </main>
  );
}



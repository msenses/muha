'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Login akışı tamamen devre dışı – bu sayfa sadece bilgi amaçlı
export default function LoginPage() {
  const router = useRouter();

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)' }}>
      <div style={{ width: 400, maxWidth: '92%', textAlign: 'center', color: 'white' }}>
        <div style={{ marginBottom: 16 }}>
          <Image src="/finova_logo_2.png" alt="Finova" width={1200} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Giriş Ekranı Devre Dışı</h1>
        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
          Bu demo aşamasında uygulama giriş yapmadan çalışacak şekilde ayarlandı.
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Dashboard&apos;a Git
        </button>
      </div>
    </main>
  );
}


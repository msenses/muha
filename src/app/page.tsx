'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Uygulama artık login istemiyor; açılışta doğrudan dashboard'a yönlendiriyoruz
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#0b2161,#0e3aa3)',
      color: 'white',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Dashboard&apos;a yönlendiriliyor...</div>
      </div>
    </div>
  );
}


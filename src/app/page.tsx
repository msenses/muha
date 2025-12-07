'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // İlk açılışta login sayfasına yönlendir
    router.replace('/login');
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#0b2161,#0e3aa3)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Yönlendiriliyor...</div>
      </div>
    </div>
  );
}



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/dashboard');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setInfo('Kayıt oluşturuldu. E-posta doğrulaması gerekiyorsa gelen kutunuzu kontrol edin.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)' }}>
      <div style={{ width: 400, maxWidth: '92%' }}>
        <div style={{ marginBottom: 12 }}>
          <Image src="/finova_logo_2.png" alt="Finova" width={1200} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%', padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>E-posta</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="ornek@finova.app" style={{ width: '100%', marginTop: 6, marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
        <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Şifre</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" style={{ width: '100%', marginTop: 6, marginBottom: 16, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />

        {error && <div style={{ marginBottom: 12, color: '#ffb4b4' }}>{error}</div>}
        {info && <div style={{ marginBottom: 12, color: '#b4ffd6' }}>{info}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>
          {loading ? 'İşleniyor…' : mode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          {mode === 'signin' ? (
            <span>Hesabın yok mu? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} style={{ color: '#cde1ff' }}>Kayıt ol</a></span>
          ) : (
            <span>Hesabın var mı? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signin'); }} style={{ color: '#cde1ff' }}>Giriş yap</a></span>
          )}
        </div>
      </form>
      </div>
    </main>
  );
}



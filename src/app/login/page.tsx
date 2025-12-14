'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { directorySupabase } from '@/lib/directorySupabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Merkezi projede login
      const { error: signInError } = await directorySupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // 2) Kullanıcının bağlı olduğu firmaları (tenant'ları) çek
      const { data: tenants, error: tenantsError } = await directorySupabase
        .from('current_user_tenants')
        .select('*');

      if (tenantsError) {
        setError(`Firma bilgileri alınırken hata oluştu: ${tenantsError.message}`);
        setLoading(false);
        return;
      }

      if (!tenants || tenants.length === 0) {
        setError('Bu kullanıcıya tanımlı bir firma bulunamadı.');
        setLoading(false);
        return;
      }

      // 3) Şimdilik tek firma varsayımı: default olanı ya da ilkini seç
      const selectedTenant =
        tenants.find((t: any) => t.is_default) ?? tenants[0];

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('currentTenantId', selectedTenant.tenant_id);
        if (selectedTenant.tenant_name) {
          window.localStorage.setItem('currentTenantName', selectedTenant.tenant_name);
        }
      }

      // 4) Dashboard'a yönlendir
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg,#0b2161,#0e3aa3)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: 400,
          maxWidth: '100%',
          textAlign: 'center',
          color: 'white',
          padding: '24px 20px',
          borderRadius: 16,
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Image
            src="/finova_logo_2.png"
            alt="Finova"
            width={1200}
            height={400}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Finova Giriş</h1>
        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
          Email ve şifrenizle merkezi sisteme giriş yapın.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              marginBottom: 12,
            }}
          />

          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
            Şifre
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              marginBottom: 16,
            }}
          />

          {error && (
            <div
              style={{
                marginBottom: 12,
                fontSize: 13,
                color: '#ffd1d1',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.2)',
              background: loading
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(255,255,255,0.18)',
              color: 'white',
              cursor: loading ? 'default' : 'pointer',
              fontWeight: 500,
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </main>
  );
}


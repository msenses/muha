'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type ProfileInfo = {
  email: string;
  role: string | null;
  companyName: string | null;
  createdAt: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        if (!session) {
          if (active) router.replace('/login');
          return;
        }

        const user = session.user;
        const email = user.email ?? '';
        const createdAt = user.created_at ?? null;

        const companyId = await fetchCurrentCompanyId();

        let companyName: string | null = null;
        if (companyId) {
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', companyId)
            .single();
          companyName = (company as any)?.name ?? null;
        }

        let role: string | null = null;
        if (user.id) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          role = (prof as any)?.role ?? null;
        }

        if (!active) return;
        setProfile({
          email,
          role,
          companyName,
          createdAt,
        });
      } catch (err: any) {
        if (!active) return;
        console.error('Profil yüklenemedi:', err);
        setError(err?.message ?? 'Profil bilgileri yüklenemedi');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('tr-TR');
  };

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: 16,
        color: 'white',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 600,
          marginTop: 40,
          borderRadius: 20,
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(148,163,184,0.4)',
          boxShadow: '0 24px 60px rgba(15,23,42,0.7)',
          padding: 20,
          display: 'grid',
          gap: 16,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(248,250,252,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {profile?.email?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Kullanıcı Profili</span>
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                Oturum açan kullanıcının temel bilgileri ve bağlı olduğu şirket.
              </span>
            </div>
          </div>
        </header>

        {loading && (
          <div style={{ fontSize: 13, opacity: 0.8 }}>Profil bilgileri yükleniyor…</div>
        )}

        {!loading && error && (
          <div style={{ fontSize: 13, color: '#fecaca' }}>{error}</div>
        )}

        {!loading && !error && profile && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr)',
              gap: 14,
            }}
          >
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.4)',
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.8 }}>Oturum Bilgileri</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ opacity: 0.7 }}>E-posta</span>
                  <span>{profile.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ opacity: 0.7 }}>Rol</span>
                  <span>{profile.role ?? '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ opacity: 0.7 }}>Kayıt Tarihi</span>
                  <span>{formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.4)',
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.8 }}>Şirket Bilgisi</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                <span style={{ opacity: 0.7 }}>Aktif Şirket</span>
                <span>{profile.companyName ?? '-'}</span>
              </div>
            </div>
          </div>
        )}

        <footer style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid rgba(148,163,184,0.6)',
              background: 'rgba(15,23,42,0.9)',
              color: 'white',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Geri Dön
          </button>
        </footer>
      </section>
    </main>
  );
}


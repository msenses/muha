'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

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

        let companyName: string | null = null;
        let role: string | null = null;

        if (user.id) {
          // user_profiles üzerinden hem rolü hem de bağlı olduğu şirketi al
          const { data: prof } = await supabase
            .from('user_profiles')
            .select('role, company_id')
            .eq('user_id', user.id)
            .maybeSingle();

          role = (prof as any)?.role ?? null;
          const companyId = (prof as any)?.company_id ?? null;

          if (companyId) {
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', companyId)
              .single();
            companyName = (company as any)?.name ?? null;
          }
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

  const handlePasswordChange = async () => {
    setPwError(null);
    setPwSuccess(null);
    if (!profile?.email) {
      setPwError('Kullanıcı e-posta bilgisi alınamadı.');
      return;
    }
    if (!currentPw || !newPw || !newPw2) {
      setPwError('Tüm şifre alanlarını doldurun.');
      return;
    }
    if (newPw !== newPw2) {
      setPwError('Yeni şifre ve tekrarı eşleşmiyor.');
      return;
    }
    if (newPw.length < 6) {
      setPwError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setPwLoading(true);
    try {
      // Mevcut şifreyi doğrula
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPw,
      });
      if (signInErr) {
        setPwError('Mevcut şifre hatalı.');
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) {
        setPwError(updateErr.message ?? 'Şifre güncellenemedi.');
        return;
      }

      setPwSuccess('Şifreniz başarıyla güncellendi.');
      setCurrentPw('');
      setNewPw('');
      setNewPw2('');
    } catch (err: any) {
      setPwError(err?.message ?? 'Şifre güncellenemedi.');
    } finally {
      setPwLoading(false);
    }
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

            {/* Şifre Değiştirme */}
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(248,250,252,0.08)',
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.8 }}>Şifre Değiştir</div>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ opacity: 0.8 }}>Mevcut Şifre</span>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(148,163,184,0.6)',
                      background: 'rgba(15,23,42,0.9)',
                      color: 'white',
                      fontSize: 13,
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ opacity: 0.8 }}>Yeni Şifre</span>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(148,163,184,0.6)',
                      background: 'rgba(15,23,42,0.9)',
                      color: 'white',
                      fontSize: 13,
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ opacity: 0.8 }}>Yeni Şifre (Tekrar)</span>
                  <input
                    type="password"
                    value={newPw2}
                    onChange={(e) => setNewPw2(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(148,163,184,0.6)',
                      background: 'rgba(15,23,42,0.9)',
                      color: 'white',
                      fontSize: 13,
                    }}
                  />
                </label>
                {pwError && (
                  <div style={{ fontSize: 12, color: '#fecaca' }}>{pwError}</div>
                )}
                {pwSuccess && (
                  <div style={{ fontSize: 12, color: '#bbf7d0' }}>{pwSuccess}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={pwLoading}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 999,
                      border: '1px solid rgba(34,197,94,0.6)',
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      color: 'white',
                      fontSize: 12,
                      cursor: 'pointer',
                      opacity: pwLoading ? 0.7 : 1,
                    }}
                  >
                    {pwLoading ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
                  </button>
                </div>
              </div>
            </div>

            {profile.role === 'admin' && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(59,130,246,0.7)',
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.8 }}>Admin Araçları</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => router.push('/users')}
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
                    Kullanıcı Listesi
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/users/new')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 999,
                      border: '1px solid rgba(59,130,246,0.7)',
                      background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                      color: 'white',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Yeni Kullanıcı Ekle
                  </button>
                </div>
              </div>
            )}
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


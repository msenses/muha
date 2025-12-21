'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type CurrentUserProfile = {
  role: string | null;
};

export default function NewUserPage() {
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState<CurrentUserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

        const userId = session.user.id;

        const { data: me } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (!active) return;

        setCurrentProfile({ role: (me as any)?.role ?? null });
      } catch (err: any) {
        if (!active) return;
        console.error('Kullanıcı rolü alınamadı:', err);
        setError(err?.message ?? 'Kullanıcı rolü alınamadı.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [router]);

  const isAdmin = currentProfile?.role === 'admin';

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!isAdmin) {
      setError('Bu işlem sadece admin kullanıcılar tarafından yapılabilir.');
      return;
    }

    if (!name || !email || !password || !password2) {
      setError('Kullanıcı adı, e-posta ve şifre alanlarını doldurun.');
      return;
    }

    if (password !== password2) {
      setError('Şifre ve tekrarı eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setSaving(true);
    try {
      // 1) Yeni auth kullanıcısını oluştur (RLS'den etkilenmez)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        console.error('Yeni kullanıcı oluşturulamadı:', signUpError);
        setError(signUpError.message ?? 'Yeni kullanıcı oluşturulamadı.');
        setSaving(false);
        return;
      }

      const newUser = signUpData.user;
      if (!newUser?.id) {
        setError('Yeni kullanıcı oluşturulamadı (ID alınamadı).');
        setSaving(false);
        return;
      }

      // 2) Admin'in firması için user_profiles kaydını SECURITY DEFINER fonksiyon ile oluştur
      const { error: rpcError } = await supabase.rpc('create_user_with_profile', {
        p_user_id: newUser.id,
        p_role: role,
      });

      if (rpcError) {
        console.error('create_user_with_profile hatası:', rpcError);
        setError(rpcError.message ?? 'Kullanıcı profili oluşturulamadı.');
        setSaving(false);
        return;
      }

      setSuccess('Yeni kullanıcı başarıyla oluşturuldu.');
      setName('');
      setEmail('');
      setPassword('');
      setPassword2('');
    } catch (err: any) {
      console.error('Yeni kullanıcı oluşturulamadı:', err);
      setError(err?.message ?? 'Yeni kullanıcı oluşturulamadı.');
    } finally {
      setSaving(false);
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
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Yeni Kullanıcı</span>
            <span style={{ fontSize: 12, opacity: 0.75 }}>
              Sisteme yeni bir kullanıcı ekleyin (sadece admin).
            </span>
          </div>
        </header>

        {loading && (
          <div style={{ fontSize: 13, opacity: 0.8 }}>Yetki bilgileri kontrol ediliyor…</div>
        )}

        {!loading && !isAdmin && (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: 'rgba(127,29,29,0.75)',
              border: '1px solid rgba(248,113,113,0.7)',
              fontSize: 13,
            }}
          >
            Bu sayfa sadece <strong>admin</strong> rolüne sahip kullanıcılar tarafından
            görüntülenebilir.
          </div>
        )}

        {!loading && isAdmin && (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(148,163,184,0.4)',
              display: 'grid',
              gap: 10,
              fontSize: 13,
            }}
          >
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ opacity: 0.8 }}>Kullanıcı Adı</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <span style={{ opacity: 0.8 }}>E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <span style={{ opacity: 0.8 }}>Şifre</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <span style={{ opacity: 0.8 }}>Şifre (Tekrar)</span>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
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
              <span style={{ opacity: 0.8 }}>Rol</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.6)',
                  background: 'rgba(15,23,42,0.9)',
                  color: 'white',
                  fontSize: 13,
                }}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {error && <div style={{ fontSize: 12, color: '#fecaca' }}>{error}</div>}
            {success && <div style={{ fontSize: 12, color: '#bbf7d0' }}>{success}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, gap: 8 }}>
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
                İptal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(34,197,94,0.6)',
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Kaydediliyor…' : 'Kullanıcı Oluştur'}
              </button>
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


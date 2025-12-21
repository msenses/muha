'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type CurrentUserProfile = {
  role: string | null;
};

type UserRow = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string | null;
};

export default function UsersPage() {
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState<CurrentUserProfile | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
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

        const userId = session.user.id;

        // Mevcut kullanıcının rolünü user_profiles tablosundan çek
        const { data: me, error: meError } = await supabase
          .from('user_profiles')
          .select('role, company_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (meError) {
          console.error('Kullanıcı rolü alınamadı:', meError);
        }

        const myRole = (me as any)?.role ?? null;
        const myCompanyId: string | null = (me as any)?.company_id ?? null;

        if (!active) return;

        setCurrentProfile({ role: myRole });

        if (myRole !== 'admin') {
          setLoading(false);
          return;
        }

        // Firma ID yoksa tek firma modundan çöz
        const companyId = myCompanyId || (await fetchCurrentCompanyId());

        if (!companyId) {
          setError('Firma bilgisi alınamadı.');
          setLoading(false);
          return;
        }

        // Aynı firmaya bağlı tüm kullanıcı profillerini listele
        const { data: rows, error: listError } = await supabase
          .from('user_profiles')
          .select('id, user_id, role, status, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });

        if (listError) {
          console.error('Kullanıcı listesi alınamadı:', listError);
          setError(listError.message ?? 'Kullanıcı listesi yüklenemedi.');
          setLoading(false);
          return;
        }

        setUsers((rows as UserRow[]) || []);
        setLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error('Kullanıcı listesi yüklenemedi:', err);
        setError(err?.message ?? 'Kullanıcı listesi yüklenemedi.');
        setLoading(false);
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

  const isAdmin = currentProfile?.role === 'admin';

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
          maxWidth: 900,
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
            <span style={{ fontSize: 18, fontWeight: 700 }}>Kullanıcı Yönetimi</span>
            <span style={{ fontSize: 12, opacity: 0.75 }}>
              Tanımlı kullanıcıları görüntüleyin ve yönetin (sadece admin).
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => router.push('/users/new')}
              disabled={!isAdmin}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid rgba(59,130,246,0.7)',
                background: isAdmin
                  ? 'linear-gradient(135deg,#3b82f6,#2563eb)'
                  : 'rgba(51,65,85,0.8)',
                color: 'white',
                fontSize: 12,
                cursor: isAdmin ? 'pointer' : 'not-allowed',
                opacity: isAdmin ? 1 : 0.5,
              }}
            >
              + Yeni Kullanıcı
            </button>
          </div>
        </header>

        {loading && (
          <div style={{ fontSize: 13, opacity: 0.8 }}>Kullanıcı listesi yükleniyor…</div>
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

        {!loading && error && (
          <div style={{ fontSize: 13, color: '#fecaca' }}>{error}</div>
        )}

        {!loading && isAdmin && !error && (
          <div
            style={{
              borderRadius: 14,
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(148,163,184,0.4)',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(15,23,42,0.95)',
                    borderBottom: '1px solid rgba(55,65,81,0.9)',
                  }}
                >
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontWeight: 500,
                      opacity: 0.8,
                    }}
                  >
                    Kullanıcı ID
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontWeight: 500,
                      opacity: 0.8,
                    }}
                  >
                    Rol
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontWeight: 500,
                      opacity: 0.8,
                    }}
                  >
                    Durum
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontWeight: 500,
                      opacity: 0.8,
                    }}
                  >
                    Oluşturulma
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        opacity: 0.7,
                      }}
                    >
                      Henüz tanımlı kullanıcı bulunmuyor.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: '1px solid rgba(31,41,55,0.9)',
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 10px',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        fontSize: 12,
                      }}
                    >
                      {u.user_id}
                    </td>
                    <td style={{ padding: '8px 10px', textTransform: 'lowercase' }}>
                      {u.role}
                    </td>
                    <td style={{ padding: '8px 10px' }}>{u.status}</td>
                    <td style={{ padding: '8px 10px' }}>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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


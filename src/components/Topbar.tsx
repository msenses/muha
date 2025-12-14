'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Branch = {
  id: string;
  name: string;
};

export default function Topbar() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>('Firma');
  const [branches] = useState<Branch[]>([
    { id: '1', name: 'Merkez' },
    { id: '2', name: 'Şube 2' },
  ]);
  const [activeBranchId, setActiveBranchId] = useState<string>('1');
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        // 1) Login'de localStorage'a yazılan tenant adını oku
        if (typeof window !== 'undefined') {
          const storedName = window.localStorage.getItem('currentTenantName');
          if (storedName) {
            setCompanyName(storedName);
          }
        }

        // 2) (Opsiyonel) Uygulama Supabase oturumundan kullanıcı mailini al
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setUserEmail(null);
        } else {
          if (active) setUserEmail(sessionData.session.user.email ?? null);
        }
      } catch (err) {
        console.error('Topbar: bilgiler yüklenirken hata', err);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const years = (() => {
    const now = new Date();
    const base = now.getFullYear();
    return [base - 1, base, base + 1];
  })();

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleSelectBranch = (branch: Branch) => {
    setActiveBranchId(branch.id);
    setBranchMenuOpen(false);
  };

  const handleSelectYear = (year: number) => {
    setActiveYear(year);
    setYearMenuOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 240,
      right: 0,
      height: 60,
      background: 'rgba(0,0,0,0.2)',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 24,
      paddingRight: 24,
      zIndex: 999,
      backdropFilter: 'blur(10px)',
    }}>
      {/* Sol boşluk */}
      <div style={{ flex: 1 }} />
      
      {/* Orta - Firma Adı */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        <div style={{
          padding: '8px 20px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
          }} />
          <span style={{
            color: 'white',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.3px',
          }}>
            {companyName}
          </span>
        </div>
      </div>
      
      {/* Sağ - Kısayollar + Kullanıcı Bilgisi */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        position: 'relative',
      }}>
        {/* Geri Dön */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13 }}>↩</span>
          <span>Geri Dön</span>
        </button>

        {/* Şube seçimi */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setBranchMenuOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 12,
              color: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 12 }}>🏢</span>
            <span>{activeBranch?.name || 'Şube'}</span>
            <span style={{ fontSize: 10 }}>▾</span>
          </button>

          {branchMenuOpen && branches.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 34,
                right: 0,
                minWidth: 140,
                background: 'rgba(15,23,42,0.98)',
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.5)',
                boxShadow: '0 12px 30px rgba(15,23,42,0.6)',
                padding: 6,
                zIndex: 1000,
              }}
            >
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleSelectBranch(branch)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: 8,
                    border: 'none',
                    background:
                      activeBranchId === branch.id
                        ? 'rgba(59,130,246,0.35)'
                        : 'transparent',
                    color: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dönem (yıl) seçimi */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setYearMenuOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 12,
              color: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
            }}
          >
            <span>{activeYear}</span>
            <span style={{ fontSize: 10 }}>▾</span>
          </button>

          {yearMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 34,
                right: 0,
                minWidth: 80,
                background: 'rgba(15,23,42,0.98)',
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.5)',
                boxShadow: '0 12px 30px rgba(15,23,42,0.6)',
                padding: 6,
                zIndex: 1000,
              }}
            >
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: 8,
                    border: 'none',
                    background:
                      activeYear === year ? 'rgba(59,130,246,0.35)' : 'transparent',
                    color: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {userEmail && (
          <div style={{
            fontSize: 13,
            opacity: 0.9,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: 'white',
            }}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 12 }}>{userEmail}</span>
            <span style={{ fontSize: 10, opacity: 0.8 }}>▾</span>
          </div>
        )}
      </div>
    </div>
  );
}

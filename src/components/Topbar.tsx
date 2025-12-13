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
  const [companyName, setCompanyName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);

  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCompanyInfo = async () => {
      try {
        // Session kontrolü
        const { data: sessionData } = await supabase.auth.getSession();
        if (!mounted || !sessionData.session) {
          setLoading(false);
          return;
        }

        setUserEmail(sessionData.session.user.email || '');

        // Company ID'yi al
        const companyId = await fetchCurrentCompanyId();
        if (!mounted || !companyId) {
          setLoading(false);
          return;
        }

        // Company bilgilerini çek
        const { data: company } = await supabase
          .from('companies')
          .select('name, trade_name')
          .eq('id', companyId)
          .single();

        if (mounted && company) {
          setCompanyName(company.trade_name || company.name || '');
        }

        // Şubeleri yükle
        let { data: branchRows } = await supabase
          .from('branches')
          .select('id, name')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });

        // Hiç şube yoksa otomatik "Merkez" oluştur
        if (mounted && (!branchRows || branchRows.length === 0)) {
          const { data: insertedBranch, error: insertErr } = await supabase
            .from('branches')
            .insert({ company_id: companyId, name: 'Merkez' })
            .select('id, name')
            .single();

          if (!insertErr && insertedBranch) {
            branchRows = [insertedBranch];
          }
        }

        if (mounted && branchRows && branchRows.length > 0) {
          setBranches(branchRows as Branch[]);

          if (typeof window !== 'undefined') {
            const storedBranchId = window.localStorage.getItem('activeBranchId');
            const existing = branchRows.find((b) => b.id === storedBranchId);
            const selected = existing || branchRows[0];

            setActiveBranchId(selected.id);
            window.localStorage.setItem('activeBranchId', selected.id);
            window.localStorage.setItem('activeBranchName', selected.name);
          } else {
            setActiveBranchId(branchRows[0].id);
          }
        }

        // Aktif yılı yükle
        if (mounted) {
          const now = new Date();
          const currentYear = now.getFullYear();
          let yearToUse = currentYear;

          if (typeof window !== 'undefined') {
            const storedYear = window.localStorage.getItem('activeYear');
            const parsed = storedYear ? parseInt(storedYear, 10) : NaN;
            if (!Number.isNaN(parsed)) {
              yearToUse = parsed;
            } else {
              window.localStorage.setItem('activeYear', String(currentYear));
            }
          }

          setActiveYear(yearToUse);
        }
      } catch (error) {
        console.error('Company bilgisi yüklenirken hata:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCompanyInfo();

    // Auth state değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        // Company bilgisini yeniden yükle
        const companyId = await fetchCurrentCompanyId();
        if (companyId) {
          const { data: company } = await supabase
            .from('companies')
            .select('name, trade_name')
            .eq('id', companyId)
            .single();

          if (company) {
            setCompanyName(company.trade_name || company.name || '');
          }
        }
      } else {
        setUserEmail('');
        setCompanyName('');
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login ve test-connection sayfalarında topbar gösterme
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path === '/login' || path === '/test-connection') {
      return null;
    }
  }

  if (loading) {
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
        justifyContent: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        zIndex: 999,
      }}>
        <div style={{ fontSize: 14, opacity: 0.6, color: 'white' }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!companyName) {
    return null;
  }

  const years = (() => {
    const now = new Date();
    const base = now.getFullYear();
    return [base - 1, base, base + 1];
  })();

  const activeBranch = branches.find((b) => b.id === activeBranchId) || null;

  const handleSelectBranch = (branch: Branch) => {
    setActiveBranchId(branch.id);
    setBranchMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activeBranchId', branch.id);
      window.localStorage.setItem('activeBranchName', branch.name);
    }
  };

  const handleSelectYear = (year: number) => {
    setActiveYear(year);
    setYearMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activeYear', String(year));
    }
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
            <span>{activeYear ?? new Date().getFullYear()}</span>
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

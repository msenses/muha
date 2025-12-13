'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function Topbar() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

        {/* Merkez seçimi */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.9)',
        }}>
          <span style={{ fontSize: 12 }}>⚙</span>
          <span>Merkez</span>
          <span style={{ fontSize: 10 }}>▾</span>
        </div>

        {/* Yıl seçimi (placeholder) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.9)',
        }}>
          <span>2025</span>
          <span style={{ fontSize: 10 }}>▾</span>
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

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function Topbar() {
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
      
      {/* Sağ - Kullanıcı Bilgisi */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
      }}>
        {userEmail && (
          <div style={{
            fontSize: 13,
            opacity: 0.8,
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
            <span>{userEmail}</span>
          </div>
        )}
      </div>
    </div>
  );
}

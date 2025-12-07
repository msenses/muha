'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function TestConnectionPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const tests: any[] = [];

      // Test 1: Supabase URL
      tests.push({
        test: 'Supabase URL',
        result: process.env.NEXT_PUBLIC_SUPABASE_URL || 'ENV variable tanımlı değil',
        status: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'
      });

      // Test 2: Session kontrolü
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        tests.push({
          test: 'Auth Session',
          result: sessionError 
            ? `Hata: ${sessionError.message}` 
            : sessionData.session 
              ? `✅ Kullanıcı: ${sessionData.session.user.email}`
              : '❌ Session yok',
          status: sessionData.session && !sessionError ? '✅' : '❌',
          details: sessionData.session ? {
            user_id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            exp: new Date(sessionData.session.expires_at! * 1000).toLocaleString('tr-TR')
          } : null
        });

        // Test 3: User Profile kontrolü
        if (sessionData.session) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, company_id')
            .eq('user_id', sessionData.session.user.id)
            .single();

          tests.push({
            test: 'User Profile',
            result: profileError 
              ? `❌ Hata: ${profileError.message}` 
              : profile 
                ? `✅ Profile ID: ${profile.id}`
                : '❌ Profile bulunamadı',
            status: profile && !profileError ? '✅' : '❌',
            details: profile
          });

          // Test 4: Company kontrolü
          if (profile?.company_id) {
            const { data: company, error: companyError } = await supabase
              .from('companies')
              .select('id, name, tax_id')
              .eq('id', profile.company_id)
              .single();

            tests.push({
              test: 'Company',
              result: companyError 
                ? `❌ Hata: ${companyError.message}` 
                : company 
                  ? `✅ ${company.name} (VKN: ${company.tax_id})`
                  : '❌ Company bulunamadı',
              status: company && !companyError ? '✅' : '❌',
              details: company
            });
          } else {
            tests.push({
              test: 'Company',
              result: '❌ User profile\'de company_id yok',
              status: '❌'
            });
          }

          // Test 5: fetchCurrentCompanyId fonksiyonu
          try {
            const companyId = await fetchCurrentCompanyId();
            tests.push({
              test: 'fetchCurrentCompanyId()',
              result: companyId ? `✅ Company ID: ${companyId}` : '❌ Null döndü',
              status: companyId ? '✅' : '❌'
            });
          } catch (err: any) {
            tests.push({
              test: 'fetchCurrentCompanyId()',
              result: `❌ Hata: ${err.message}`,
              status: '❌'
            });
          }

          // Test 6: Accounts tablosu okuma
          const { data: accounts, error: accountsError, count } = await supabase
            .from('accounts')
            .select('*', { count: 'exact', head: false })
            .limit(5);

          tests.push({
            test: 'Accounts Tablosu',
            result: accountsError 
              ? `❌ Hata: ${accountsError.message}` 
              : `✅ ${count} kayıt bulundu (ilk 5 gösteriliyor)`,
            status: !accountsError ? '✅' : '❌',
            details: accounts
          });

          // Test 7: Products tablosu okuma
          const { data: products, error: productsError, count: pCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: false })
            .limit(5);

          tests.push({
            test: 'Products Tablosu',
            result: productsError 
              ? `❌ Hata: ${productsError.message}` 
              : `✅ ${pCount} kayıt bulundu (ilk 5 gösteriliyor)`,
            status: !productsError ? '✅' : '❌',
            details: products
          });

          // Test 8: Companies tablosu okuma
          const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .limit(5);

          tests.push({
            test: 'Companies Tablosu',
            result: companiesError 
              ? `❌ Hata: ${companiesError.message}` 
              : companies && companies.length > 0
                ? `✅ ${companies.length} firma bulundu`
                : '⚠️ Firma kaydı yok (seed data çalıştırılmamış olabilir)',
            status: !companiesError ? '✅' : '❌',
            details: companies
          });
        }
      } catch (err: any) {
        tests.push({
          test: 'Genel Hata',
          result: `❌ ${err.message}`,
          status: '❌'
        });
      }

      setResults(tests);
      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: 24, paddingLeft: 264, minHeight: '100vh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
        <h1 style={{ marginBottom: 24 }}>🔍 Bağlantı Testi Yapılıyor...</h1>
      </main>
    );
  }

  const allPassed = results.every(r => r.status === '✅');

  return (
    <main style={{ padding: 24, paddingLeft: 264, minHeight: '100vh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <h1 style={{ marginBottom: 12 }}>🔍 Supabase Bağlantı Testi</h1>
      <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: allPassed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${allPassed ? '#22c55e' : '#ef4444'}` }}>
        <strong>{allPassed ? '✅ Tüm testler başarılı!' : '❌ Bazı testler başarısız'}</strong>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {results.map((test, idx) => (
          <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{test.status}</span>
              <strong style={{ fontSize: 16 }}>{test.test}</strong>
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: test.details ? 12 : 0 }}>
              {test.result}
            </div>
            {test.details && (
              <details style={{ fontSize: 12, opacity: 0.8 }}>
                <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Detaylar</summary>
                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 300 }}>
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <h3 style={{ marginBottom: 12 }}>📋 Çözüm Önerileri</h3>
        <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
          <li><strong>Session yoksa:</strong> Login sayfasına gidin ve giriş yapın</li>
          <li><strong>User Profile yoksa:</strong> Supabase Dashboard'da user_profiles tablosuna manuel kayıt ekleyin</li>
          <li><strong>Company yoksa:</strong> seed/002_production_seed.sql dosyasını Supabase'de çalıştırın</li>
          <li><strong>Company_id bağlantısı yoksa:</strong> user_profiles tablosunda company_id'yi güncelleyin</li>
          <li><strong>Tablolar okunamıyorsa:</strong> RLS policy'leri kontrol edin veya geçici olarak devre dışı bırakın</li>
        </ul>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button 
          onClick={() => window.location.reload()} 
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
        >
          🔄 Testleri Yeniden Çalıştır
        </button>
        <button 
          onClick={() => window.location.href = '/dashboard'} 
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
        >
          🏠 Dashboard'a Dön
        </button>
      </div>
    </main>
  );
}


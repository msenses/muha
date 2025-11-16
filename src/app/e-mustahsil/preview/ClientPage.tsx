'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Account = { id: string; name: string; address?: string | null; tax_id?: string | null };

export default function EMustahsilPreviewClientPage() {
  const router = useRouter();
  const search = useSearchParams();
  const accountId = typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('account') ?? '');

  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        router.replace('/login');
        return;
      }
      if (accountId) {
        const { data } = await supabase.from('accounts').select('id, name, address, tax_id').eq('id', accountId).single();
        setAccount((data as any) ?? null);
      }
      setReady(true);
    };
    init();
  }, [router, accountId]);

  if (!ready) {
    return <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'white' }}>Yükleniyor…</main>;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #16a085', background: '#16a085', color: 'white' }}>Makbuz Bas</button>
        <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #2980b9', background: '#2980b9', color: 'white' }}>Müstahsil Yazdır</button>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
          {/* Sol üst bilgiler */}
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)', fontWeight: 700 }}>FATURA</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {([
                  ['Fatura No', '35'],
                  ['Fatura Tarihi', today],
                  ['Sevk Tarihi', today],
                  ['Firma Ünvan', account?.name ?? '-'],
                  ['Yetkili', 'Ahmet Bey'],
                  ['Adres', account?.address ?? 'Merkez'],
                  ['İlçe/İl', 'Merkez/Düzce'],
                  ['Vergi D./V.No', `Üsküdar/${account?.tax_id ?? '12345678'}`],
                  ['E‑Mail', 'mail@mail.com'],
                ] as Array<[string, string]>).map(([k, v]) => (
                  <tr key={k} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: 8, opacity: 0.9 }}>{k} :</td>
                    <td style={{ padding: 8 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sağ üst özet */}
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {([
                  ['Telefon', '5428099590'],
                  ['Fatura Türü', 'MÜSTAHŞİL'],
                  ['Ödeme Şekli', 'Nakit'],
                ] as Array<[string, string]>).map(([k, v]) => (
                  <tr key={k} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: 8, opacity: 0.9 }}>{k} :</td>
                    <td style={{ padding: 8 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ürün tablosu */}
        <div style={{ marginTop: 16, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>KODU</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Ürün Adı</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Miktar</th>
                <th style={{ padding: 8, textAlign: 'left' }}>B.Fiyat</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Top.Fiyat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8 }}>-</td>
                <td style={{ padding: 8 }}>Patates</td>
                <td style={{ padding: 8 }}>1.0 Adet</td>
                <td style={{ padding: 8 }}>$100,00</td>
                <td style={{ padding: 8 }}>$100,00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Alt kısımlar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['İskonto', '$0,00'],
                  ['Ara Toplam', '$100,00'],
                  ['Kdv', '$0,00'],
                  ['Ötv', '$0,00'],
                  ['Genel Toplam', '$90,00'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: 8 }}>{k} :</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['G.V. Stopajı', '10'],
                  ['Mera Fonu', '0'],
                  ['Borsa Tescil Ücreti', '0'],
                  ['SGK Prim Kesintisi', '0'],
                  ['Toplam Kesinti Tutarı', '10'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: 8 }}>{k} :</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InvoiceNewLite() {
  const router = useRouter();
  const sp = useSearchParams();
  const isEInvoice = sp.get('eInvoice') === '1';
  const [invoiceKind, setInvoiceKind] = useState<'SATIS' | 'IHRACKAYITLI'>('SATIS');
  const [scenario, setScenario] = useState<'TEMELFATURA' | 'TICARIFATURA' | 'KAMU' | 'EARSIVFATURA'>('TEMELFATURA');

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ padding: 16, fontWeight: 800 }}>Satış Faturası (Lite)</header>
      <section style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 12 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Fatura Tipi</div>
            <select value={invoiceKind} onChange={(e) => setInvoiceKind(e.target.value as any)} style={{ width: '100%', padding: 10, borderRadius: 8 }}>
              <option value="SATIS">SATIS</option>
              <option value="IHRACKAYITLI">IHRACKAYITLI</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Fatura Senaryosu</div>
            <select value={scenario} onChange={(e) => setScenario(e.target.value as any)} style={{ width: '100%', padding: 10, borderRadius: 8 }}>
              {isEInvoice ? (
                <>
                  <option value="TEMELFATURA">TEMELFATURA</option>
                  <option value="TICARIFATURA">TICARIFATURA</option>
                  <option value="KAMU">KAMU</option>
                </>
              ) : (
                <option value="EARSIVFATURA">EARSIVFATURA</option>
              )}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/invoices')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Geri</button>
          <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: '#22b8cf', color: '#0f172a' }}>Kaydet (Demo)</button>
        </div>
      </section>
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function BankNewPage() {
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [branchNo, setBranchNo] = useState('');
  const [iban, setIban] = useState('');

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ padding: 12, fontWeight: 700 }}>Yeni Banka Oluştur</div>
          <div style={{ padding: 12, background: '#fff', color: '#111827', borderTop: '1px solid #e5e7eb', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Banka Adı :</span>
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Şube :</span>
                <input value={branch} onChange={(e) => setBranch(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Hesap No :</span>
                <input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Şube No :</span>
                <input value={branchNo} onChange={(e) => setBranchNo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>IBAN :</span>
                <input value={iban} onChange={(e) => setIban(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>💾 Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


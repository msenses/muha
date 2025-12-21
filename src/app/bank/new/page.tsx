'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function BankNewPage() {
  const router = useRouter();
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [branchNo, setBranchNo] = useState('');
  const [iban, setIban] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    setErr(null);
    const trimmedBank = bankName.trim();
    if (!trimmedBank) {
      setErr('Banka adı zorunludur.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }

      const companyId = await fetchCurrentCompanyId();
      if (!companyId) throw new Error('Şirket bilgisi alınamadı.');

      const { error } = await supabase.from('bank_accounts').insert({
        company_id: companyId,
        bank_name: trimmedBank,
        branch_name: branch || null,
        account_no: accountNo || null,
        iban: iban || null,
        balance: 0,
      });

      if (error) throw error;
      router.push('/bank');
    } catch (e: any) {
      setErr(e?.message ?? 'Banka hesabı kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ padding: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Yeni Banka Oluştur</span>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #0ea5e9',
                background: '#0ea5e9',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Kaydediliyor…' : '💾 Kaydet'}
            </button>
          </div>
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

              {err && (
                <div style={{ color: '#b91c1c', fontSize: 12 }}>
                  {err}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

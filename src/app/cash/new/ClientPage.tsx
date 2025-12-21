'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function ClientPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Merkez');
  const [desc, setDesc] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    setErr(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErr('Kasa adı zorunludur.');
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

      const opening = Number(
        (openingBalance ?? '0')
          .toString()
          .replace(',', '.')
      );

      const { error } = await supabase
        .from('cash_ledgers')
        .insert({
          company_id: companyId,
          name: trimmedName,
          description: desc ? `${desc}${branch ? ` (Şube: ${branch})` : ''}` : null,
          balance: Number.isFinite(opening) ? opening : 0,
        });

      if (error) throw error;
      router.push('/cash');
    } catch (e: any) {
      setErr(e?.message ?? 'Kasa kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#12b3c5' }}>
            <strong>YENİ KASA</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => router.back()} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Geri</button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #22c55e',
                  background: '#22c55e',
                  color: '#fff',
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </header>

          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Kasa Adı</div>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Şube</div>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                <option>Merkez</option>
                <option>Şube 2</option>
                <option>Şube 3</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Açıklama</div>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Açılış Bakiyesi</div>
              <input value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
          </div>

          {err && (
            <div style={{ padding: '0 16px 16px', color: '#fecaca', fontSize: 12 }}>
              {err}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


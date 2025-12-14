'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AccountEditPage() {
  const params = useParams();
  const id = (params?.id as string) ?? '';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: rec, error } = await supabase
        .from('accounts')
        .select('code, name, tax_id, phone, email, address, tax_office, city, district, contact_name')
        .eq('id', id)
        .single();
      if (error) {
        setErr(error.message);
      } else if (rec) {
        setCode((rec as any).code ?? '');
        setName((rec as any).name ?? '');
        setTaxId((rec as any).tax_id ?? '');
        setPhone((rec as any).phone ?? '');
        setEmail((rec as any).email ?? '');
        setAddress((rec as any).address ?? '');
        setTaxOffice((rec as any).tax_office ?? '');
        setCity((rec as any).city ?? '');
        setDistrict((rec as any).district ?? '');
        setContactName((rec as any).contact_name ?? '');
      }
      setLoading(false);
    };
    if (id) init();
  }, [id, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (!name.trim()) throw new Error('Ad zorunlu');
      const { error } = await supabase
        .from('accounts')
        .update({
          code: code || null,
          name: name.trim(),
          tax_id: taxId || null,
          tax_office: taxOffice || null,
          contact_name: contactName || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          city: city || null,
          district: district || null,
        })
        .eq('id', id);
      if (error) throw error;
      router.push('/accounts');
    } catch (e: any) {
      setErr(e?.message ?? 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>Cari Düzenle</strong>
      </header>
      <section style={{ padding: 16 }}>
        <form onSubmit={submit} style={{ maxWidth: 560, padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          {loading ? (
            'Yükleniyor…'
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Kod</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Ad</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Vergi No/TCKN</label>
                  <input value={taxId} onChange={(e) => setTaxId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Telefon</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Vergi Dairesi</label>
                  <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Yetkili</label>
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>E-posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>İl</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>İlçe</label>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Adres</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => router.push('/accounts')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Geri</button>
                <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Güncelle'}</button>
              </div>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}



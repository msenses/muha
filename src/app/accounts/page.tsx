'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Account = {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  balance: number;
};

export default function AccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Account[]>([]);
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const query = supabase
        .from('accounts')
        .select('id, code, name, phone, email, balance')
        .order('name', { ascending: true })
        .limit(50);
      if (q.trim()) {
        // Basit arama: name ilike veya code ilike
        // Supabase'de text search icin or kullanimi
        // Not: filter zinciri OR ile string olarak kurulur
        query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Account[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [q, router]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
          <th style={{ padding: '10px 8px' }}>Kod</th>
          <th style={{ padding: '10px 8px' }}>Ad</th>
          <th style={{ padding: '10px 8px' }}>Telefon</th>
          <th style={{ padding: '10px 8px' }}>E-posta</th>
          <th style={{ padding: '10px 8px', textAlign: 'right' }}>Bakiye</th>
          <th style={{ padding: '10px 8px' }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} style={{ color: 'white' }}>
            <td style={{ padding: '8px' }}>{r.code ?? '-'}</td>
            <td style={{ padding: '8px' }}>{r.name}</td>
            <td style={{ padding: '8px' }}>{r.phone ?? '-'}</td>
            <td style={{ padding: '8px' }}>{r.email ?? '-'}</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{Number(r.balance ?? 0).toFixed(2)}</td>
            <td style={{ padding: '8px' }}>
              <button onClick={() => router.push(`/accounts/${r.id}/edit`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Düzenle</button>
            </td>
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td colSpan={6} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Kayıt yok</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [rows, router]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>Cariler</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara (Ad/Kod)" style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          <button onClick={() => setShowNew(true)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Yeni Cari</button>
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          {loading ? 'Yükleniyor…' : table}
        </div>
      </section>

      {showNew && (
        <NewAccountModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            // tetiklemek için q değerini aynı değere set ederek yükleme çağır
            setLoading(true);
            setQ((prev) => prev);
          }}
        />
      )}
    </main>
  );
}

function NewAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
    };
    init();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      if (!name.trim()) throw new Error('Ad zorunlu');
      const { error } = await supabase.from('accounts').insert({
        company_id: companyId,
        code: code || null,
        name: name.trim(),
        tax_id: taxId || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
      });
      if (error) throw error;
      onCreated();
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ width: 560, maxWidth: '92%', padding: 16, borderRadius: 16, background: 'rgba(15,27,73,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Yeni Cari</strong>
          <button type="button" onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Kapat</button>
        </div>
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
          <div>
            <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Adres</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          </div>
          {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
            <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}



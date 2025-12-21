'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type AccountPick = { id: string; title: string; officer: string | null };

export default function ChequeNoteNewPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState<string | null>(null);

  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('0');
  const [number, setNumber] = useState('');
  const [kind, setKind] = useState<'KENDİ EVRAĞIMIZ' | 'MÜŞTERİ ÇEKİ/SENEDİ'>('KENDİ EVRAĞIMIZ');
  const [status, setStatus] = useState<'BEKLEMEDE' | 'ÖDENDİ' | 'TAHSİL EDİLDİ'>('BEKLEMEDE');
  const [note, setNote] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<'ASIL EVRAK' | 'CİROLU EVRAK'>('ASIL EVRAK');

  // Cari seçim modalı
  const [openAccountPick, setOpenAccountPick] = useState(false);
  const [accountPickQuery, setAccountPickQuery] = useState('');
  const [accounts, setAccounts] = useState<AccountPick[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Cirolu evrak için: Asıl Borçlu
  const [principalDebtor, setPrincipalDebtor] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace('/login');
          return;
        }
        const cid = await fetchCurrentCompanyId();
        if (!cid) return;
        if (active) setCompanyId(cid);
        const { data: accs, error } = await supabase
          .from('accounts')
          .select('id, name, contact_name')
          .eq('company_id', cid)
          .order('name', { ascending: true });
        if (!active) return;
        if (error) {
          console.error('Cari listesi yüklenemedi:', error);
          setAccounts([]);
        } else {
          setAccounts(
            ((accs ?? []) as any[]).map((a) => ({
              id: a.id as string,
              title: a.name as string,
              officer: (a.contact_name as string) ?? null,
            })),
          );
        }
      } catch (err) {
        if (!active) return;
        console.error('Cari listesi yüklenirken beklenmeyen hata:', err);
        setAccounts([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [router]);

  // URL query'sine göre varsayılan çek yönünü ayarla (ör: /cheque-note/new?direction=incoming)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const dir = sp.get('direction');
      if (dir === 'incoming') {
        setKind('MÜŞTERİ ÇEKİ/SENEDİ');
      } else if (dir === 'outgoing') {
        setKind('KENDİ EVRAĞIMIZ');
      }
    } catch {
      // sessizce yut
    }
  }, []);

  const handleSave = async () => {
    setSaveError(null);
    if (!companyId) {
      setSaveError('Şirket bilgisi alınamadı');
      return;
    }
    if (!selectedAccountId) {
      setSaveError('Cari seçmelisiniz');
      return;
    }
    const amt = Number(amount.replace(',', '.'));
    if (!amt || amt <= 0) {
      setSaveError('Tutar 0 dan büyük olmalıdır');
      return;
    }
    if (!number.trim()) {
      setSaveError('Çek/Senet numarası zorunludur');
      return;
    }
    setSaving(true);
    try {
      const toEnumStatus = (s: typeof status): 'pending' | 'paid' | 'bounced' | 'endorsed' | 'cancelled' => {
        if (s === 'BEKLEMEDE') return 'pending';
        if (s === 'ÖDENDİ') return 'paid';
        if (s === 'TAHSİL EDİLDİ') return 'paid';
        return 'pending';
      };
      const direction = kind === 'KENDİ EVRAĞIMIZ' ? 'outgoing' : 'incoming';
      const payload: any = {
        company_id: companyId,
        account_id: selectedAccountId,
        type: 'cheque',
        status: toEnumStatus(status),
        direction,
        document_no: number.trim(),
        amount: amt,
        issue_date: txnDate || new Date().toISOString().slice(0, 10),
        due_date: dueDate || txnDate || new Date().toISOString().slice(0, 10),
        bank_name: bankName.trim() || null,
        bank_branch: bankBranch.trim() || null,
        drawer_name: docType === 'CİROLU EVRAK' ? principalDebtor.trim() || null : title.trim() || null,
        notes: note.trim() || null,
      };
      const { error } = await supabase.from('cheques_notes').insert(payload);
      if (error) throw error;
      router.push(('/cheque-note') as Route);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Çek/senet kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <header style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Çek Ekle</header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Sol panel */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>İşlem Tarihi :</span>
              <input type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Vade Tarihi :</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Tutar :</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Çek/Senet No :</span>
              <input value={number} onChange={(e) => setNumber(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Çek/Senet Türü :</span>
              <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>KENDİ EVRAĞIMIZ</option>
                <option>MÜŞTERİ ÇEKİ/SENEDİ</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Çek/Senet Durumu :</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>BEKLEMEDE</option>
                <option>ÖDENDİ</option>
                <option>TAHSİL EDİLDİ</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Açıklama :</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
          </div>

          {/* Sağ panel */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Banka Adı :</span>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Banka Şubesi :</span>
              <input value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Hesap No :</span>
              <input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>ÜNVAN :</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                <button onClick={() => setOpenAccountPick(true)} title="Cari Seç" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
              </div>
            </div>
            <label style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
              <span>Evrak Türü :</span>
              <select value={docType} onChange={(e) => setDocType(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>ASIL EVRAK</option>
                <option>CİROLU EVRAK</option>
              </select>
            </label>
            {docType === 'CİROLU EVRAK' && (
              <label style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
                <span>Asıl Borçlu :</span>
                <input value={principalDebtor} onChange={(e) => setPrincipalDebtor(e.target.value)} placeholder="" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
            )}
            {saveError && <div style={{ marginBottom: 10, color: '#b91c1c', fontSize: 12 }}>{saveError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => router.push(('/cheque-note') as Route)}
                style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#111827' }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', opacity: saving ? 0.7 : 1, cursor: 'pointer' }}
              >
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cari Seç Modal */}
      {openAccountPick && (
        <div onClick={() => setOpenAccountPick(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>CARI SEÇ
              <button onClick={() => setOpenAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>
            <div style={{ padding: 12 }}>
              <input value={accountPickQuery} onChange={(e) => setAccountPickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Cari Ünvan</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Yetkili</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = accounts.filter((r) => {
                      const hay = `${r.title} ${r.officer ?? ''}`.toLowerCase();
                      return hay.includes(accountPickQuery.toLowerCase());
                    });
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3} style={{ padding: '8px 10px' }}>Cari bulunamadı</td>
                        </tr>
                      );
                    }
                    return filtered.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 10px' }}>{r.title}</td>
                        <td style={{ padding: '8px 10px' }}>{r.officer ?? '-'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedAccountId(r.id);
                              setTitle(r.title);
                              setOpenAccountPick(false);
                            }}
                            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}
                          >
                            Seç
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setOpenAccountPick(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



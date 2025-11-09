'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CashPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [debitId, setDebitId] = useState('');
  const [creditId, setCreditId] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [docNo, setDocNo] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<null | 'debit' | 'credit'>(null);
  const [pickQ, setPickQ] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: accs } = await supabase.from('accounts').select('id, name').order('name', { ascending: true }).limit(500);
      setAccounts((accs ?? []) as any);
    };
    load();
  }, [router]);

  const canSave = useMemo(() => {
    return !!debitId && !!creditId && debitId !== creditId && typeof amount === 'number' && amount > 0 && !!date;
  }, [debitId, creditId, amount, date]);

  const filteredAccounts = useMemo(() => {
    const q = pickQ.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(q));
  }, [accounts, pickQ]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!canSave) {
      setErr('Zorunlu alanları doldurun');
      return;
    }
    setSaving(true);
    try {
      // Not: Bu demo, mahsup fişini veri tabanına yazmaz. Entegrasyon istendiğinde ilgili tabloya insert edilecektir.
      alert(`Mahsup fişi hazır:\nBorç: ${accounts.find(a=>a.id===debitId)?.name}\nAlacak: ${accounts.find(a=>a.id===creditId)?.name}\nTutar: ${amount}\nTarih: ${date}\nEvrak: ${docNo}\nAçıklama: ${desc}`);
      router.push('/accounts');
    } catch (e: any) {
      setErr(e?.message ?? 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <div style={{ padding: 16 }}>
        <div style={{ width: 560, maxWidth: '95%', background: 'white', color: '#222', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 24px rgba(0,0,0,0.2)', padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Mahsup Fişi</div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Borçlandırılacak Cari :</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: 8 }}>
                <select value={debitId} onChange={(e) => setDebitId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#f3f6f9' }}>
                  <option value="">Cari Seçiniz</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <button type="button" onClick={() => setPickerOpen('debit')} title="Cari Seç" style={{ borderRadius: 8, border: '1px solid #d0d7de', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}>▾</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Alacaklandırılacak Cari :</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: 8 }}>
                <select value={creditId} onChange={(e) => setCreditId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#f3f6f9' }}>
                  <option value="">Cari Seçiniz</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <button type="button" onClick={() => setPickerOpen('credit')} title="Cari Seç" style={{ borderRadius: 8, border: '1px solid #d0d7de', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}>▾</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Açıklama:</div>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Tutar :</div>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Tutar Giriniz" style={{ width: 240, padding: '10px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Tarih</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 240, padding: '10px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Evrak Numarası :</div>
              <input value={docNo} onChange={(e) => setDocNo(e.target.value)} placeholder="Evrak Numarası Giriniz" style={{ width: 240, padding: '10px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#fff' }} />
            </div>

            {err && <div style={{ color: '#e74c3c' }}>{err}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button disabled={!canSave || saving} type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #12b3c5', background: '#12b3c5', color: 'white', cursor: 'pointer', opacity: !canSave || saving ? 0.7 : 1 }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Cari Seç Modal */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 2000 }} onClick={() => setPickerOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(760px,96%)', background: 'white', color: '#222', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '10px 14px', background: '#12b3c5', color: 'white', fontWeight: 700 }}>Cari Seç</div>
            <div style={{ padding: 12, background: '#f8f9fb' }}>
              <input value={pickQ} onChange={(e) => setPickQ(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de', marginBottom: 8 }} />
              <div style={{ overflow: 'auto', maxHeight: 360 }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#0e3aa3' }}>
                      <th style={{ padding: '8px' }}>İşlem</th>
                      <th style={{ padding: '8px' }}>Grup</th>
                      <th style={{ padding: '8px' }}>Yetkili</th>
                      <th style={{ padding: '8px' }}>Unvan</th>
                      <th style={{ padding: '8px' }}>Mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((a) => (
                      <tr key={a.id}>
                        <td style={{ padding: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (pickerOpen === 'debit') setDebitId(a.id);
                              if (pickerOpen === 'credit') setCreditId(a.id);
                              setPickerOpen(null);
                            }}
                            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #1ea7fd', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}
                          >
                            Seç
                          </button>
                        </td>
                        <td style={{ padding: '8px' }}>{'MÜŞTERİLER'}</td>
                        <td style={{ padding: '8px' }}>{'-'}</td>
                        <td style={{ padding: '8px' }}>{a.name}</td>
                        <td style={{ padding: '8px' }}>{'-'}</td>
                      </tr>
                    ))}
                    {!filteredAccounts.length && (
                      <tr>
                        <td colSpan={5} style={{ padding: 16, color: '#666' }}>Kayıt yok</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setPickerOpen(null)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d0d7de', background: '#fff', color: '#333', cursor: 'pointer' }}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



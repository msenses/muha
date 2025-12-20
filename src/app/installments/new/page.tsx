'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type AccountPick = { id: string; title: string; officer: string | null };

export default function InstallmentsNewPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState('0');
  const [downPayment, setDownPayment] = useState('0');
  const [cash, setCash] = useState('Varsayılan Kasa');
  const [firstInstallment, setFirstInstallment] = useState(() => new Date().toISOString().slice(0, 10));
  const [count, setCount] = useState('2');
  const [period, setPeriod] = useState('(30 GÜN) Aylık');
  const [desc, setDesc] = useState('');

  const [openAccountPick, setOpenAccountPick] = useState(false);
  const [accountQuery, setAccountQuery] = useState('');
  const [accounts, setAccounts] = useState<AccountPick[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const parseNumber = (val: string) => {
    const n = Number(String(val).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const addDays = (iso: string, days: number) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

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
    const totalAmount = parseNumber(total);
    const down = parseNumber(downPayment);
    if (!totalAmount || totalAmount <= 0) {
      setSaveError('Toplam tutar 0 dan büyük olmalıdır');
      return;
    }
    if (down < 0 || down > totalAmount) {
      setSaveError('Peşinat tutarı 0 ile toplam tutar arasında olmalıdır');
      return;
    }
    const installmentsCount = parseInt(count || '0', 10);
    if (!installmentsCount || installmentsCount <= 0) {
      setSaveError('Taksit sayısı 0 dan büyük olmalıdır');
      return;
    }
    const netInstallmentTotal = totalAmount - down;
    if (netInstallmentTotal <= 0) {
      setSaveError('Taksitlere bölünecek tutar 0 dan büyük olmalıdır');
      return;
    }
    setSaving(true);
    try {
      const { data: plan, error: planErr } = await supabase
        .from('installment_plans')
        .insert({
          company_id: companyId,
          account_id: selectedAccountId,
          total_amount: totalAmount,
          installment_count: installmentsCount,
          start_date: date || new Date().toISOString().slice(0, 10),
          notes: desc.trim() || null,
        })
        .select('id')
        .single();
      if (planErr) throw planErr;
      const planId = (plan as any).id as string;

      const baseAmount = Math.floor((netInstallmentTotal / installmentsCount) * 100) / 100;
      const remainder = Number((netInstallmentTotal - baseAmount * installmentsCount).toFixed(2));
      const periodDays = period.startsWith('(7') ? 7 : period.startsWith('(15') ? 15 : 30;
      const startIso = firstInstallment || date || new Date().toISOString().slice(0, 10);

      const items = Array.from({ length: installmentsCount }).map((_, i) => {
        const isLast = i === installmentsCount - 1;
        const amount = baseAmount + (isLast ? remainder : 0);
        const dueDate = addDays(startIso, periodDays * i);
        return {
          installment_plan_id: planId,
          installment_no: i + 1,
          amount,
          due_date: dueDate,
        };
      });

      const { error: instErr } = await supabase.from('installments').insert(items);
      if (instErr) throw instErr;

      router.push(('/installments') as Route);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Taksit planı kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <header style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Yeni Taksit Oluştur</header>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 12, maxWidth: 740 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>ÜNVAN :</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              <button onClick={() => setOpenAccountPick(true)} title="Cari Seç" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
            </div>
          </div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Tarih :</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Toplam Tutar :</span>
            <input value={total} onChange={(e) => setTotal(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Peşinat Tutarı :</span>
            <input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Kasa Seçimi :</span>
            <select value={cash} onChange={(e) => setCash(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
              <option>Varsayılan Kasa</option>
              <option>Kasa2</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>İlk Taksit Tarihi :</span>
            <input type="date" value={firstInstallment} onChange={(e) => setFirstInstallment(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Taksit Sayısı :</span>
            <input value={count} onChange={(e) => setCount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Taksit Periyodu :</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
              <option>(30 GÜN) Aylık</option>
              <option>(7 GÜN) Haftalık</option>
              <option>(15 GÜN) İki Haftada Bir</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Açıklama :</span>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          {saveError && <div style={{ color: '#b91c1c', fontSize: 12 }}>{saveError}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => router.push(('/installments') as Route)} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#111827' }}>
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', opacity: saving ? 0.7 : 1, cursor: 'pointer' }}
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>
      </section>

      {/* Cari Seç Modal */}
      {openAccountPick && (
        <div onClick={() => setOpenAccountPick(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Cari Seç</strong>
              <button onClick={() => setOpenAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>✖</button>
            </div>
            <div style={{ padding: 12 }}>
              <input value={accountQuery} onChange={(e) => setAccountQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
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
                      return hay.includes(accountQuery.toLowerCase());
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
                            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}
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
          </div>
        </div>
      )}
    </main>
  );
}



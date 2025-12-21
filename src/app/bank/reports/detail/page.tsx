'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Txn = {
  date: string;
  type: 'GİRİŞ' | 'ÇIKIŞ';
  desc: string;
  method: string;
  docNo: string | number | '-';
  amount: number;
};

type BankSection = {
  id: string;
  bank: string;
  accountNo: string;
  branch: string;
  branchNo: string;
  iban: string;
  txns: Txn[];
};

function Currency({ value }: { value: number }) {
  return <span>{value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>;
}

function BankDetailReportInner() {
  const sp = useSearchParams();
  const allTime = sp.get('alltime') === '1';
  const start = sp.get('start');
  const end = sp.get('end');

  const [sections, setSections] = useState<BankSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setLoading(false);
          return;
        }

        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          console.warn('Company ID bulunamadı');
          if (active) setLoading(false);
          return;
        }

        const { data: banks, error: bankErr } = await supabase
          .from('bank_accounts')
          .select('id, bank_name, account_no, branch_name, iban, balance')
          .eq('company_id', companyId)
          .order('bank_name', { ascending: true });

        if (bankErr) {
          console.error('Banka listesi rapor için yüklenemedi', bankErr);
          if (active) setSections([]);
          return;
        }

        const bankList =
          (banks ?? []) as {
            id: string;
            bank_name: string | null;
            account_no: string | null;
            branch_name: string | null;
            iban: string | null;
            balance: number | null;
          }[];

        if (bankList.length === 0) {
          if (active) setSections([]);
          return;
        }

        const bankIds = bankList.map((b) => b.id);

        let trxQuery = supabase
          .from('bank_transactions')
          .select('id, bank_account_id, amount, flow, description, trx_date');

        if (bankIds.length > 0) {
          trxQuery = trxQuery.in('bank_account_id', bankIds);
        }

        if (!allTime) {
          if (start) trxQuery = trxQuery.gte('trx_date', start);
          if (end) trxQuery = trxQuery.lte('trx_date', end);
        }

        const { data: trxData, error: trxErr } = await trxQuery;
        if (trxErr) {
          console.error('Banka hareketleri rapor için yüklenemedi', trxErr);
        }

        const byBank = new Map<string, Txn[]>();
        for (const t of trxData ?? []) {
          const id = (t as any).bank_account_id as string;
          const amount = Number((t as any).amount ?? 0);
          const flow = (t as any).flow as 'in' | 'out';
          const trxDate = String((t as any).trx_date ?? '');
          if (!id || !Number.isFinite(amount)) continue;
          const list = byBank.get(id) ?? [];
          list.push({
            date: trxDate,
            type: flow === 'in' ? 'GİRİŞ' : 'ÇIKIŞ',
            desc: (t as any).description ?? '',
            method: '', // Şimdilik boş, istenirse ödeme şekli eklenecek
            docNo: '-',
            amount,
          });
          byBank.set(id, list);
        }

        const sectionsMapped: BankSection[] = bankList.map((b) => ({
          id: b.id,
          bank: b.bank_name ?? 'Banka',
          accountNo: b.account_no ?? '',
          branch: b.branch_name ?? 'Merkez',
          branchNo: '',
          iban: b.iban ?? '',
          txns: byBank.get(b.id) ?? [],
        }));

        if (active) setSections(sectionsMapped);
      } catch (err) {
        console.error('Banka detaylı rapor yüklenirken hata', err);
        if (active) setSections([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [allTime, start, end]);

  const totals = useMemo(
    () =>
      sections.map((s) => {
        let inSum = 0;
        let outSum = 0;
        for (const t of s.txns) {
          if (t.type === 'GİRİŞ') inSum += t.amount;
          else outSum += t.amount;
        }
        return { inSum, outSum, balance: inSum - outSum };
      }),
    [sections],
  );

  const periodTotal = useMemo(() => totals.reduce((s, t) => s + t.balance, 0), [totals]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Üst araç çubuğu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>✉ Email Gönder</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🗂</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
            </div>
          </div>

          {/* Başlık */}
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>BANKA RAPORU</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              <div>Firma : </div>
              <div>
                Tarih Aralığı :{' '}
                {allTime ? (
                  <b>Tüm Zamanlar</b>
                ) : (
                  <>
                    <b>{start || '—'}</b> - <b>{end || '—'}</b>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Banka bölümleri */}
          <div style={{ padding: 12, display: 'grid', gap: 16 }}>
          {sections.map((s, idx) => (
            <div key={s.id} style={{ display: 'grid', gap: 8 }}>
                {/* Banka info header */}
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: '#94a3b8', color: '#fff' }}>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Banka Adı</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Hesap No</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Şube</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Şube No</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>IBAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.bank}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.accountNo || '-'}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.branch}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.branchNo || '-'}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.iban || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Txn table */}
                <div style={{ overflowX: 'auto', background: '#fff', color: '#111827', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tarih</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tip</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Açıklama</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Ödeme Şekli</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Evrak No</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.txns.map((t, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px' }}>{t.date}</td>
                          <td style={{ padding: '8px' }}>{t.type}</td>
                          <td style={{ padding: '8px' }}>{t.desc}</td>
                          <td style={{ padding: '8px' }}>{t.method}</td>
                          <td style={{ padding: '8px' }}>{t.docNo}</td>
                          <td style={{ padding: '8px' }}><Currency value={t.amount} /></td>
                        </tr>
                      ))}
                      {!loading && s.txns.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#6b7280' }}>Bu banka için hareket bulunamadı.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Banka özeti */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  <div style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc' }}>
                    Giriş : <Currency value={totals[idx].inSum} />
                  </div>
                  <div style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc' }}>
                    Çıkış : <Currency value={totals[idx].outSum} />
                  </div>
                  <div style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc' }}>
                    Kalan : <Currency value={totals[idx].balance} />
                  </div>
                </div>
              </div>
            ))}

            {/* Alt toplamlar */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 220px' }}>
              <div style={{ padding: 8, color: '#6b7280' }}>{allTime ? 'TÜM ZAMANLAR BANKA HESAPLARI TOPLAMI :' : 'Seçili Tarih Aralığı Banka Hesapları Toplamı :'}</div>
              <div style={{ padding: 8, textAlign: 'right' }}><Currency value={periodTotal} /></div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 220px' }}>
              <div style={{ padding: 8, color: '#6b7280' }}>TÜM BANKALAR TOPLAMI :</div>
              <div style={{ padding: 8, textAlign: 'right' }}><Currency value={periodTotal} /></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function BankDetailReportPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}><section style={{ padding: 12 }}>Yükleniyor…</section></main>}>
      <BankDetailReportInner />
    </Suspense>
  );
}


'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Txn = {
  date: string;
  doc?: string;
  title?: string;
  desc?: string;
  type: 'GİRİŞ(+)' | 'ÇIKIŞ(-)';
  amount: number;
};

function CashTransactionsReportInner({ params }: { params: { id: string } }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [rows, setRows] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [ledgerName, setLedgerName] = useState<string>('');
  const [ledgerDesc, setLedgerDesc] = useState<string | null>(null);

  const allTime = sp.get('alltime') === '1';
  const start = sp.get('start') || '';
  const end = sp.get('end') || '';

  const cashName = useMemo(() => {
    if (ledgerName) return ledgerName;
    const slug = (params.id || '').toLowerCase();
    if (slug.includes('varsayilan') || slug.includes('varsayılan')) return 'Varsayılan Kasa';
    return params.id;
  }, [ledgerName, params.id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setLoading(false);
          router.replace('/login');
          return;
        }

        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          console.warn('Company ID bulunamadı');
          if (active) setLoading(false);
          return;
        }

        const ledgerId = params.id;

        const [{ data: ledger, error: ledgerErr }, trxResult] = await Promise.all([
          supabase
            .from('cash_ledgers')
            .select('id, name, description')
            .eq('company_id', companyId)
            .eq('id', ledgerId)
            .single(),
          (async () => {
            let q = supabase
              .from('cash_transactions')
              .select('id, amount, flow, description, trx_date')
              .eq('cash_ledger_id', ledgerId);

            if (!allTime) {
              if (start) q = q.gte('trx_date', start);
              if (end) q = q.lte('trx_date', end);
            }

            return q;
          })(),
        ]);

        if (ledgerErr) {
          console.error('Kasa bilgisi rapor için yüklenemedi', ledgerErr);
        } else if (ledger) {
          if (active) {
            setLedgerName((ledger as any).name ?? '');
            setLedgerDesc((ledger as any).description ?? null);
          }
        }

        const { data: trxData, error: trxErr } = trxResult;
        if (trxErr) {
          console.error('Kasa hareketleri rapor için yüklenemedi', trxErr);
          if (active) setRows([]);
          return;
        }

        const mapped: Txn[] =
          (trxData ?? []).map((t: any) => ({
            date: t.trx_date,
            doc: undefined,
            title: undefined,
            desc: t.description ?? '',
            type: t.flow === 'in' ? 'GİRİŞ(+)' : 'ÇIKIŞ(-)',
            amount: Number(t.amount ?? 0),
          })) ?? [];

        if (active) setRows(mapped);
      } catch (err) {
        console.error('Kasa işlem raporu yüklenirken hata', err);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router, params.id, allTime, start, end]);

  const totalIn = useMemo(
    () => rows.filter((r) => r.type === 'GİRİŞ(+)').reduce((s, r) => s + r.amount, 0),
    [rows],
  );
  const totalOut = useMemo(
    () => rows.filter((r) => r.type === 'ÇIKIŞ(-)').reduce((s, r) => s + r.amount, 0),
    [rows],
  );
  const balance = totalIn - totalOut;

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa', border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}>
          <input placeholder="✉ Email Gönder" style={{ flex: '0 0 280px', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }} />
          <button title="Yazdır" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>🖨</button>
          <button title="Dışa Aktar" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>📄</button>
          <button title="Yenile" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>↻</button>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => router.push((`/cash/${params.id}`) as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Kasa</button>
          </div>
        </div>

        {/* Başlık */}
        <h1 style={{ margin: '16px 0 10px', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Kasa İşlem Raporu</h1>

        {/* Üst bilgi bandı */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 0 }}>
          <div style={{ background: '#64748b', color: '#fff', padding: '10px 12px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr auto', columnGap: 16 }}>
            <div>Kasa Adı: <b>{cashName}</b></div>
            <div>Açıklama: <b>{ledgerDesc || '-'}</b></div>
            <div style={{ textAlign: 'right' }}>Bakiye: <b>{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</b></div>
          </div>

          {/* Tarih aralığı gösterimi */}
          {(start || end || allTime) && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
              Tarih Aralığı:{' '}
              {allTime ? (
                <b>Tüm Zamanlar</b>
              ) : (
                <>
                  <b>{start || '—'}</b> - <b>{end || '—'}</b>
                </>
              )}
            </div>
          )}

          {/* Detay tablo */}
          <div style={{ padding: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#94a3b8', color: '#fff' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Tarih</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Evrak No</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Unvan</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Açıklama</th>
                    <th style={{ textAlign: 'left', padding: '8px 10px' }}>Tip</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 10px' }}>{r.date}</td>
                      <td style={{ padding: '8px 10px' }}>{r.doc || '0'}</td>
                      <td style={{ padding: '8px 10px' }}>{r.title || '-'}</td>
                      <td style={{ padding: '8px 10px' }}>{r.desc || '-'}</td>
                      <td style={{ padding: '8px 10px' }}>{r.type}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '8px 10px', textAlign: 'center', color: '#6b7280' }}>Kayıt bulunamadı.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={6} style={{ padding: '8px 10px', textAlign: 'center', color: '#6b7280' }}>Yükleniyor…</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Özet kutuları */}
            <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ width: 320, background: '#334155', color: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Giriş:</span>
                  <strong>{totalIn.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Çıkış:</span>
                  <strong>{totalOut.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                  <span>Toplam Bakiye:</span>
                  <strong>{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <div style={{ width: 320, background: '#334155', color: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Giriş:</span>
                  <strong>{totalIn.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>Toplam Çıkış:</span>
                  <strong>{totalOut.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                  <span>Toplam Bakiye:</span>
                  <strong>{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CashTransactionsReportPage(props: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
          <section style={{ padding: 12 }}>Yükleniyor…</section>
        </main>
      }
    >
      <CashTransactionsReportInner {...props} />
    </Suspense>
  );
}

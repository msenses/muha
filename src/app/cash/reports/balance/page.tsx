'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = {
  id: string;
  name: string;
  note: string | null;
  inSum: number;
  outSum: number;
  balance: number;
};

export default function CashBalanceReportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

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

        const { data: ledgers, error: ledgerErr } = await supabase
          .from('cash_ledgers')
          .select('id, name, description, balance')
          .eq('company_id', companyId)
          .order('name', { ascending: true });

        if (ledgerErr) {
          console.error('Kasa listesi rapor için yüklenemedi', ledgerErr);
          if (active) setRows([]);
          return;
        }

        const ledgerList = (ledgers ?? []) as { id: string; name: string; description: string | null; balance: number | null }[];
        if (ledgerList.length === 0) {
          if (active) setRows([]);
          return;
        }

        const ledgerIds = ledgerList.map((l) => l.id);

        const { data: trxData, error: trxErr } = await supabase
          .from('cash_transactions')
          .select('cash_ledger_id, amount, flow')
          .in('cash_ledger_id', ledgerIds);

        if (trxErr) {
          console.error('Kasa hareketleri rapor için yüklenemedi', trxErr);
        }

        const sumsByLedger = new Map<
          string,
          {
            inSum: number;
            outSum: number;
          }
        >();

        for (const t of trxData ?? []) {
          const id = (t as any).cash_ledger_id as string;
          const amount = Number((t as any).amount ?? 0);
          const flow = (t as any).flow as 'in' | 'out';
          if (!id || !Number.isFinite(amount)) continue;
          const current = sumsByLedger.get(id) ?? { inSum: 0, outSum: 0 };
          if (flow === 'in') current.inSum += amount;
          else current.outSum += amount;
          sumsByLedger.set(id, current);
        }

        const mapped: Row[] = ledgerList.map((l) => {
          const sums = sumsByLedger.get(l.id) ?? { inSum: 0, outSum: 0 };
          return {
            id: l.id,
            name: l.name,
            note: l.description,
            inSum: sums.inSum,
            outSum: sums.outSum,
            balance: Number(l.balance ?? sums.inSum - sums.outSum),
          };
        });

        if (active) setRows(mapped);
      } catch (err) {
        console.error('Kasa bakiye raporu yüklenirken hata', err);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  const { totalIn, totalOut, totalBalance } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    let bal = 0;
    for (const r of rows) {
      inSum += r.inSum;
      outSum += r.outSum;
      bal += r.balance;
    }
    return { totalIn: inSum, totalOut: outSum, totalBalance: bal };
  }, [rows]);

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
            <button onClick={() => router.push(('/cash') as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Kasa Listesi</button>
          </div>
        </div>

        {/* Başlık */}
        <h1 style={{ margin: '16px 0 10px', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Kasa Bakiye Raporu</h1>

        {/* Rapor gövdesi */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#94a3b8', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Kasa Adı</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Açıklama</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Giriş</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Çıkış</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px' }}>{r.name}</td>
                    <td style={{ padding: '8px 10px' }}>{r.note ?? '-'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.inSum.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.outSum.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{r.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280' }}>Kayıt bulunamadı.</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280' }}>Yükleniyor…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Özet kutusu */}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
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
                <strong>{totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



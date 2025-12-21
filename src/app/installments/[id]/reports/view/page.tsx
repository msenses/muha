'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = {
  date: string;
  desc: string;
  amount: number;
  paid: number;
  remaining: number;
  status: string;
};

export default function InstallmentReportViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [header, setHeader] = useState<{ firm: string; customer: string; reportDate: string; count: number; period: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace('/login');
          return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) setError('Şirket bilgisi alınamadı');
          return;
        }
        const [{ data: comp, error: compErr }, { data: plan, error: planErr }, { data: insts, error: instErr }] = await Promise.all([
          supabase.from('companies').select('name').eq('id', companyId).single(),
          supabase
            .from('installment_plans')
            .select('id, total_amount, installment_count, start_date, notes, accounts ( name )')
            .eq('company_id', companyId)
            .eq('id', params.id)
            .single(),
          supabase
            .from('installments')
            .select('id, installment_no, amount, due_date, paid_date, paid_amount, status')
            .eq('installment_plan_id', params.id)
            .order('installment_no', { ascending: true }),
        ]);
        if (!active) return;
        if (!compErr && comp?.name) {
          setHeader((prev) => ({
            firm: comp.name,
            customer: prev?.customer ?? '',
            reportDate: prev?.reportDate ?? '',
            count: prev?.count ?? 0,
            period: prev?.period ?? '',
          }));
        }
        if (planErr) {
          console.error('Taksit planı bulunamadı:', planErr);
          setError('Taksit planı bulunamadı');
          setRows([]);
          return;
        }
        const fmtDate = (d?: string | null): string => {
          if (!d) return '';
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return '';
          return dt.toLocaleDateString('tr-TR');
        };
        const mappedRows: Row[] = (insts ?? []).map((it: any) => {
          const amt = Number(it.amount ?? 0);
          const paid = Number(it.paid_amount ?? 0);
          const remaining = amt - paid;
          const mapStatus = (s?: string | null): string => {
            switch (s) {
              case 'paid':
                return 'Ödendi';
              case 'partial':
                return 'Kısmi';
              case 'overdue':
                return 'Vadesi Geçmiş';
              default:
                return 'Bekliyor';
            }
          };
    return {
            date: fmtDate(it.due_date),
            desc: `${it.installment_no}. Taksitlendirme`,
            amount: amt,
            paid,
            remaining,
            status: mapStatus(it.status),
    };
        });
        setRows(mappedRows);
        const reportDate = fmtDate((plan as any).start_date);
        const customer =
          (Array.isArray((plan as any).accounts) ? (plan as any).accounts[0]?.name : (plan as any).accounts?.name) ?? '';
        const count = (plan as any).installment_count ?? mappedRows.length ?? 0;
        setHeader({
          firm: comp?.name ?? '',
          customer: customer || '',
          reportDate: reportDate || '',
          count,
          period: '(30 GÜN) Aylık',
        });
        if (instErr) {
          console.error('Taksitler yüklenirken hata:', instErr);
        }
      } catch (err: any) {
        if (!active) return;
        console.error('Taksit raporu yüklenirken beklenmeyen hata:', err);
        setError(err?.message ?? 'Beklenmeyen bir hata oluştu');
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [router, params.id]);

  const sum = useMemo(
    () => (key: 'amount' | 'paid' | 'remaining') =>
      rows.reduce((s, r) => s + r[key], 0),
    [rows],
  );

  const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa', border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}>
          <input placeholder="✉ Email Gönder" style={{ flex: '0 0 280px', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }} />
          <button title="Yazdır" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
          <button title="Dışa Aktar" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>📄</button>
          <button title="Yenile" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => router.push((`/installments/${params.id}`) as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Detaya Dön</button>
          </div>
        </div>

        {/* Rapor gövdesi */}
        <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 18 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>TAKSİT RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>Firma : {header?.firm || '—'}</div>
          <div style={{ height: 2, background: '#0ea5e9', width: 200, margin: '8px auto 12px' }} />

          {error && (
            <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {header && (
          <div style={{ background: '#e5e7eb', padding: '8px 10px', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
            <div><b>{header.customer}</b></div>
            <div style={{ textAlign: 'center' }}>Taksit Tarihi : {header.reportDate}</div>
            <div style={{ textAlign: 'right' }}>Taksit Sayısı : {header.count}  •  Periyot : {header.period}</div>
          </div>
          )}

          <div style={{ marginTop: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#94a3b8', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>VADE TARİHİ</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>AÇIKLAMA</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>TUTAR</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>TAHSİL EDİLEN</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>KALAN</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>DURUM</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px' }}>{r.date}</td>
                    <td style={{ padding: '8px 10px' }}>{r.desc}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.amount)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.paid)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.remaining)}</td>
                    <td style={{ padding: '8px 10px' }}>{r.status}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '8px 10px', textAlign: 'center' }}>Kayıt bulunamadı</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ padding: '8px 10px', textAlign: 'center' }}>Yükleniyor…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ background: '#e5e7eb', borderRadius: 6, padding: 8, textAlign: 'center' }}>
              <div>Toplam Taksit Tutarı</div>
              <div style={{ fontWeight: 700 }}>{fmt(sum('amount'))}</div>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 6, padding: 8, textAlign: 'center' }}>
              <div>Toplam Tahsil Edilen</div>
              <div style={{ fontWeight: 700 }}>{fmt(sum('paid'))}</div>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 6, padding: 8, textAlign: 'center' }}>
              <div>Toplam Kalan Bakiye</div>
              <div style={{ fontWeight: 700 }}>{fmt(sum('remaining'))}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



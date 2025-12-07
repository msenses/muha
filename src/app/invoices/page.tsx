'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Invoice = {
  id: string;
  invoice_no: string | null;
  invoice_date: string;
  type: 'sales' | 'purchase';
  net_total: number;
  vat_total: number;
  total: number;
  accounts: { name: string } | null;
};

export default function InvoicesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'sales' | 'purchase' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [queryText, setQueryText] = useState<string>('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      
      // Company ID'yi al
      const companyId = await fetchCurrentCompanyId();
      if (!companyId) {
        console.warn('Company ID bulunamadı');
        setLoading(false);
        return;
      }
      
      const query = supabase
        .from('invoices')
        .select('id, invoice_no, invoice_date, type, net_total, vat_total, total, accounts(name)')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false })
        .limit(200);
      if (type !== 'all') {
        query.eq('type', type);
      }
      if (startDate) query.gte('invoice_date', startDate);
      if (endDate) query.lte('invoice_date', endDate);
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Invoice[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [router, type, startDate, endDate]);

  const filteredRows = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = `${r.invoice_no ?? ''} ${r.accounts?.name ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, queryText]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
          <th style={{ padding: '10px 8px' }}></th>
          <th style={{ padding: '10px 8px' }}>Ünvan</th>
          <th style={{ padding: '10px 8px' }}>Yetkili</th>
          <th style={{ padding: '10px 8px' }}>Tarih</th>
          <th style={{ padding: '10px 8px' }}>Saat</th>
          <th style={{ padding: '10px 8px', textAlign: 'right' }}>G.Toplam</th>
          <th style={{ padding: '10px 8px' }}>Türü</th>
          <th style={{ padding: '10px 8px' }}>Ödeme Şekli</th>
          <th style={{ padding: '10px 8px' }}>Açıklama</th>
          <th style={{ padding: '10px 8px' }}></th>
        </tr>
      </thead>
      <tbody>
        {filteredRows.map((r) => {
          const dateStr = r.invoice_date?.slice(0, 10) ?? '';
          return (
            <tr key={r.id} style={{ color: 'white' }}>
              <td style={{ padding: '8px' }}>
                <button onClick={() => router.push(`/invoices/${r.id}/edit`)} style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>🔍</button>
              </td>
              <td style={{ padding: '8px' }}>{r.accounts?.name ?? '-'}</td>
              <td style={{ padding: '8px' }}>-</td>
              <td style={{ padding: '8px' }}>{dateStr}</td>
              <td style={{ padding: '8px' }}>-</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{Number(r.total ?? 0).toFixed(2)}</td>
              <td style={{ padding: '8px' }}>{r.type === 'sales' ? 'SATIŞ FATURASI' : 'ALIŞ FATURASI'}</td>
              <td style={{ padding: '8px' }}>-</td>
              <td style={{ padding: '8px' }}>-</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => router.push(`/invoices/${r.id}/edit`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Düzenle</button>
              </td>
            </tr>
          );
        })}
        {!filteredRows.length && (
          <tr>
            <td colSpan={10} style={{ padding: 16, color: 'white', opacity: 0.8 }}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [filteredRows, router, loading]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'grid', gap: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/invoices/new?sales=1')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e74c3c', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>Yeni Satış Faturası</button>
          <button onClick={() => router.push('/accounts?selectFor=purchase')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #1abc9c', background: '#1abc9c', color: 'white', cursor: 'pointer' }}>Yeni Alış Faturası</button>
          <button onClick={() => router.push('/accounts?selectFor=dispatch')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #bdc3c7', background: '#bdc3c7', color: '#2c3e50', cursor: 'pointer' }}>Satış İrsaliyesi</button>
          <button onClick={() => router.push('/accounts?selectFor=dispatch_purchase')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #95a5a6', background: '#95a5a6', color: '#2c3e50', cursor: 'pointer' }}>Alış İrsaliyesi</button>
          <button onClick={() => router.push('/accounts?selectFor=purchase_return')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f1c40f', background: '#f1c40f', color: '#2c3e50', cursor: 'pointer' }}>Alış İade</button>
          <button onClick={() => router.push('/accounts?selectFor=sales_return')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f39c12', background: '#f39c12', color: 'white', cursor: 'pointer' }}>Satış İade</button>
          <button onClick={() => router.push(('/e-fatura') as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e74c3c', background: 'transparent', color: 'white', cursor: 'pointer' }}>E-Fatura</button>
          <button onClick={() => router.push(('/e-mustahsil') as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e74c3c', background: 'transparent', color: 'white', cursor: 'pointer' }}>E-Müstahsil</button>
          <button disabled style={{ opacity: 0.7, cursor: 'not-allowed', padding: '10px 12px', borderRadius: 8, border: '1px solid #3498db', background: 'transparent', color: 'white' }}>Fatura Rapor</button>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600, background: '#10a3b1', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}>FATURA LİSTESİ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Başlangıç Tarihi</div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Bitiş Tarihi</div>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div style={{ width: 260 }}>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ara…</div>
              <input placeholder="Ünvan / Fatura No" value={queryText} onChange={(e) => setQueryText(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Tür</div>
              <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                <option value="all">HEPSİ</option>
                <option value="sales">SATIŞ</option>
                <option value="purchase">ALIŞ</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      <section style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          {table}
        </div>
      </section>
    </main>
  );
}



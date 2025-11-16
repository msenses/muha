'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  id: string;
  account_id?: string | null;
  name: string | null; // cari ünvan
  contact: string | null;
  date: string; // YYYY-MM-DD
  time: string | null;
  total: number;
  type: string; // MÜSTAHŞİL
  status: 'taslak' | 'gönderildi' | 'iptal' | 'beklemede';
};

export default function EMustahsilPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      // Placeholder veri kaynağı: invoices tablosundan çek, tip ve tarih aralığına göre
      const query = supabase
        .from('invoices')
        .select('id, account_id, invoice_date, total, accounts(name)')
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .order('invoice_date', { ascending: false })
        .limit(100);
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        const mapped: Row[] = (data ?? []).map((d: any) => ({
          id: d.id,
          account_id: d.account_id ?? null,
          name: d.accounts?.name ?? '-',
          contact: '-',
          date: d.invoice_date,
          time: null,
          total: Number(d.total ?? 0),
          type: 'MÜSTAHŞİL',
          status: 'taslak',
        }));
        setRows(mapped);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [router, startDate, endDate]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => `${r.name} ${r.contact} ${r.type}`.toLowerCase().includes(t));
  }, [rows, q]);

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
          <th style={{ padding: '10px 8px' }}>E-Müstahsil Durum</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((r) => (
          <tr key={r.id} style={{ color: 'white' }}>
            <td style={{ padding: '8px' }}>
              <button onClick={() => r.account_id && router.push((`/e-mustahsil/preview?account=${r.account_id}`) as any)} style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>🔍</button>
            </td>
            <td style={{ padding: '8px' }}>{r.name}</td>
            <td style={{ padding: '8px' }}>{r.contact}</td>
            <td style={{ padding: '8px' }}>{r.date?.slice(0, 10) ?? ''}</td>
            <td style={{ padding: '8px' }}>{r.time ?? '-'}</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{r.total.toFixed(2)}</td>
            <td style={{ padding: '8px' }}>{r.type}</td>
            <td style={{ padding: '8px' }}>{r.status === 'taslak' ? 'Taslak' : r.status}</td>
          </tr>
        ))}
        {!filtered.length && (
          <tr>
            <td colSpan={8} style={{ padding: 16, color: 'white', opacity: 0.8 }}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [filtered, loading]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => router.push('/accounts?selectFor=emustahsil')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2ecc71', background: '#2ecc71', color: 'white', cursor: 'pointer' }}>+ Yeni Müstahsil</button>
        <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d4a40c', background: '#d4a40c', color: 'white', cursor: 'pointer' }}>Durum Güncelle</button>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          {/* Üst filtre barı */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 220px auto 40px', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <button style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>🔍</button>
          </div>

          {table}
        </div>
      </section>
    </main>
  );
}



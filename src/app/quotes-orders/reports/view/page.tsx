'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = {
  title: string;
  date: string;
  total: number;
  vat: number;
  grand: number;
  payment: string;
  type: 'VERİLEN TEKLİF' | 'ALINAN TEKLİF' | 'VERİLEN SİPARİŞ' | 'ALINAN SİPARİŞ';
};

export default function QuotesOrdersReportViewPage() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [period, setPeriod] = useState<string>(new Date().getFullYear().toString());
  const [listType, setListType] = useState<'Hepsi' | 'Teklif' | 'Sipariş'>('Hepsi');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (typeof window === 'undefined') return;
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get('start') ?? '';
      const e = sp.get('end') ?? '';
      setStart(s);
      setEnd(e);
      setListType((sp.get('list') as any) ?? 'Hepsi');
      const y = new Date().getFullYear().toString();
      setPeriod(sp.get('period') ?? y);

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

        const q = supabase
          .from('quotes_orders')
          .select('id, quote_order_date, type, total, vat_total, net_total, accounts(name)')
          .eq('company_id', companyId)
          .order('quote_order_date', { ascending: true });

        if (s) q.gte('quote_order_date', s);
        if (e) q.lte('quote_order_date', e);

        const { data, error } = await q;
        if (!active) return;
        if (error) {
          console.error('Teklif/Sipariş raporu yüklenemedi:', error);
          setRows([]);
        } else {
          const mapped: Row[] = (data ?? []).map((r: any) => {
            let typeText: Row['type'];
            if (r.type === 'quote_given') typeText = 'VERİLEN TEKLİF';
            else if (r.type === 'quote_received') typeText = 'ALINAN TEKLİF';
            else if (r.type === 'order_given') typeText = 'VERİLEN SİPARİŞ';
            else typeText = 'ALINAN SİPARİŞ';

            return {
              title: r.accounts?.name ?? '-',
              date: r.quote_order_date
                ? new Date(r.quote_order_date).toLocaleDateString('tr-TR')
                : '',
              total: Number(r.total ?? 0),
              vat: Number(r.vat_total ?? 0),
              grand: Number(r.net_total ?? 0),
              payment: '-', // Şimdilik ödeme şekli alanı yok
              type: typeText,
            };
          });
          setRows(mapped);
        }
      } catch (err) {
        console.error('Teklif/Sipariş raporu yüklenirken beklenmeyen hata:', err);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (listType === 'Teklif') {
      return rows.filter((d) => d.type.includes('TEKLİF'));
    }
    if (listType === 'Sipariş') {
      return rows.filter((d) => d.type.includes('SİPARİŞ'));
    }
    return rows;
  }, [rows, listType]);

  const sum = (filter: (r: Row) => boolean) =>
    filteredRows.filter(filter).reduce((s, r) => s + r.grand, 0);

  const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main style={{ minHeight: '100dvh', background: '#eef3f7', color: '#2c3e50' }}>
      <section style={{ padding: 12 }}>
        {/* Araç çubuğu */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button title="Kaydet" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>💾</button>
          <button title="Bul" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🔍</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="Yenile" onClick={() => window.location.reload()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>↻</button>
        </div>

        {/* Rapor başlık kutusu */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', background: '#f5f7fa' }}>
            <strong style={{ fontSize: 14 }}>TEKLİF SİPARİŞ RAPORU</strong>
            <div style={{ marginLeft: 8, fontSize: 12, color: '#374151' }}>
              {start && end ? `${start} - ${end} Arası Rapor` : 'Tüm Zamanlar'}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#374151' }}>DÖNEM: {period}</div>
          </div>

          {/* İçerik */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e8edf3' }}>
                  <th style={{ textAlign: 'left', padding: 6, border: '1px solid #e5e7eb' }}>ÜNVAN</th>
                  <th style={{ textAlign: 'left', padding: 6, border: '1px solid #e5e7eb' }}>TARİH</th>
                  <th style={{ textAlign: 'right', padding: 6, border: '1px solid #e5e7eb' }}>TOPLAM</th>
                  <th style={{ textAlign: 'right', padding: 6, border: '1px solid #e5e7eb' }}>KDV</th>
                  <th style={{ textAlign: 'right', padding: 6, border: '1px solid #e5e7eb' }}>GEN.TOP.</th>
                  <th style={{ textAlign: 'left', padding: 6, border: '1px solid #e5e7eb' }}>ÖD.ŞEK.</th>
                  <th style={{ textAlign: 'left', padding: 6, border: '1px solid #e5e7eb' }}>TEK/SİP TÜRÜ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 ? '#fbfdff' : 'white' }}>
                    <td style={{ padding: 6, border: '1px solid #eef0f3' }}>{r.title}</td>
                    <td style={{ padding: 6, border: '1px solid #eef0f3' }}>{r.date}</td>
                    <td style={{ padding: 6, border: '1px solid #eef0f3', textAlign: 'right' }}>{fmt(r.total)}</td>
                    <td style={{ padding: 6, border: '1px solid #eef0f3', textAlign: 'right' }}>{fmt(r.vat)}</td>
                    <td style={{ padding: 6, border: '1px solid #eef0f3', textAlign: 'right' }}>{fmt(r.grand)}</td>
                    <td style={{ padding: 6, border: '1px solid #eef0f3' }}>{r.payment}</td>
                    <td style={{ padding: 6, border: '1px solid #eef0f3' }}>{r.type}</td>
                  </tr>
                ))}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 8, textAlign: 'center', fontSize: 13 }}>
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ padding: 8, textAlign: 'center', fontSize: 13 }}>
                      Yükleniyor…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Alt toplamlar */}
            <div style={{ marginTop: 10, fontSize: 13, display: 'grid', gap: 4 }}>
              <div>VERİLEN TEKLİF TOPLAMI: {fmt(sum(r => r.type === 'VERİLEN TEKLİF'))}</div>
              <div>ALINAN TEKLİF TOPLAMI: {fmt(sum(r => r.type === 'ALINAN TEKLİF'))}</div>
              <div>VERİLEN SİPARİŞ TOPLAMI: {fmt(sum(r => r.type === 'VERİLEN SİPARİŞ'))}</div>
              <div>ALINAN SİPARİŞ TOPLAMI: {fmt(sum(r => r.type === 'ALINAN SİPARİŞ'))}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



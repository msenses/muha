'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';

type Row = {
  title: string;
  date: string;
  total: number;
  vat: number;
  grand: number;
  payment: string;
  type: 'VERİLEN TEKLİF' | 'ALINAN TEKLİF' | 'VERİLEN SİPARİŞ' | 'ALINAN SİPARİŞ';
  place: string;
};

export default function QuotesOrdersReportViewPage() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [period, setPeriod] = useState<string>(new Date().getFullYear().toString());
  const [listType, setListType] = useState<'Hepsi' | 'Teklif' | 'Sipariş'>('Hepsi');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setStart(sp.get('start') ?? '');
    setEnd(sp.get('end') ?? '');
    setListType((sp.get('list') as any) ?? 'Hepsi');
    const y = new Date().getFullYear().toString();
    setPeriod(sp.get('period') ?? y);
  }, []);

  // Demo veri — görseldeki yapıyı temsil eder
  const rows = useMemo<Row[]>(() => {
    const demo: Row[] = [
      { title: 'Mehmet Bey', date: '27.11.2022', total: 14.00, vat: 0.00, grand: 14.00, payment: 'Nakit', type: 'VERİLEN TEKLİF', place: 'Depo' },
      { title: 'Patates', date: '27.11.2022', total: 52.45, vat: 6.46, grand: 58.91, payment: 'Nakit', type: 'VERİLEN TEKLİF', place: 'Merkez' },
      { title: 'Buğday Ekmek', date: '27.11.2022', total: 5.24, vat: 0.94, grand: 6.18, payment: 'Nakit', type: 'ALINAN TEKLİF', place: 'Depo' },
      { title: 'Çubuk Kraker', date: '27.11.2022', total: 12.34, vat: 2.22, grand: 14.56, payment: 'Kredi Kartı', type: 'ALINAN SİPARİŞ', place: 'Depo' },
      { title: 'Mehmet Bey', date: '28.10.2022', total: 8.05, vat: 1.45, grand: 9.50, payment: 'Nakit', type: 'VERİLEN SİPARİŞ', place: 'Depo' },
    ];
    if (listType === 'Teklif') return demo.filter(d => d.type.includes('TEKLİF'));
    if (listType === 'Sipariş') return demo.filter(d => d.type.includes('SİPARİŞ'));
    return demo;
  }, [listType]);

  const sum = (filter: (r: Row) => boolean) =>
    rows.filter(filter).reduce((s, r) => s + r.grand, 0);

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
                {rows.map((r, i) => (
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



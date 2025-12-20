'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = {
  issueDate: string;
  dueDate: string;
  bank: string;
  account: string;
  docType: 'KENDİ EVRAĞIMIZ' | 'MÜŞTERİ EVRAĞI';
  status: string;
  amount: number;
};

export default function ChequeNoteReportListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [companyName, setCompanyName] = useState<string>('');
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
        const [{ data: comp, error: compErr }, { data: ch, error: chErr }] = await Promise.all([
          supabase.from('companies').select('name').eq('id', companyId).single(),
          supabase
            .from('cheques_notes')
            .select('issue_date, due_date, bank_name, amount, status, direction, accounts ( name )')
            .eq('company_id', companyId)
            .order('issue_date', { ascending: true }),
        ]);
        if (!active) return;
        if (!compErr && comp?.name) setCompanyName(comp.name);
        if (chErr) {
          console.error('Çek/senet raporu hareketleri alınamadı:', chErr);
          setError('Çek/senet raporu oluşturulurken hata oluştu');
          setRows([]);
          return;
        }
        const fmtDate = (d?: string | null): string => {
          if (!d) return '';
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return '';
          return dt.toLocaleDateString('tr-TR');
        };
        const mapStatus = (s?: string | null): string => {
          switch (s) {
            case 'pending':
              return 'BEKLEMEDE';
            case 'paid':
              return 'ÖDENDİ';
            case 'bounced':
              return 'KARŞILIKSIZ';
            case 'endorsed':
              return 'CİROLU';
            case 'cancelled':
              return 'İPTAL';
            default:
              return s ?? '';
          }
        };
        const mapped: Row[] = (ch ?? []).map((r: any) => {
          const direction = (r.direction as string | null) ?? 'outgoing';
          const docType: Row['docType'] = direction === 'incoming' ? 'MÜŞTERİ EVRAĞI' : 'KENDİ EVRAĞIMIZ';
          return {
            issueDate: fmtDate(r.issue_date),
            dueDate: fmtDate(r.due_date),
            bank: r.bank_name ?? '',
            account: r.accounts?.name ?? '',
            docType,
            status: mapStatus(r.status),
            amount: Number(r.amount ?? 0),
          };
        });
        setRows(mapped);
      } catch (err: any) {
        if (!active) return;
        console.error('Çek/senet raporu yüklenirken beklenmeyen hata:', err);
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
  }, [router]);

  const sum = useMemo(
    () => (filter: (r: Row) => boolean) =>
      rows.filter(filter).reduce((s, r) => s + r.amount, 0),
    [rows],
  );

  const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  const dateRangeText = useMemo(() => {
    if (!rows.length) return '-';
    const dates = rows
      .map((r) => r.dueDate || r.issueDate)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime())
      .filter((t) => !Number.isNaN(t));
    if (!dates.length) return '-';
    const min = new Date(Math.min(...dates)).toLocaleDateString('tr-TR');
    const max = new Date(Math.max(...dates)).toLocaleDateString('tr-TR');
    return `${min} - ${max}`;
  }, [rows]);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa', border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}>
          <input placeholder="✉ Email Gönder" style={{ flex: '0 0 280px', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }} />
          <button title="Yazdır" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
          <button title="Dışa Aktar" style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>📄</button>
          <button title="Yenile" onClick={() => window.location.reload()} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => router.push(('/cheque-note') as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Listeye Dön</button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginTop: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>ÇEK / SENET RAPORU</div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>Firma : {companyName || '—'}</div>
          <div style={{ height: 2, background: '#0ea5e9', width: 200, margin: '8px auto 12px' }} />
          <div style={{ opacity: 0.8, marginBottom: 12 }}>Tarih Aralığı : {dateRangeText}</div>

          {error && (
            <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {/* Tablo */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0ea5e9', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Tarih</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Vade Tarihi</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Banka Adı</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Cari Hesap</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Evrak Türü</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px' }}>Durumu</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px' }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px' }}>{r.issueDate}</td>
                    <td style={{ padding: '8px 10px' }}>{r.dueDate}</td>
                    <td style={{ padding: '8px 10px' }}>{r.bank}</td>
                    <td style={{ padding: '8px 10px' }}>{r.account}</td>
                    <td style={{ padding: '8px 10px' }}>{r.docType}</td>
                    <td style={{ padding: '8px 10px' }}>{r.status}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '8px 10px', textAlign: 'center' }}>Kayıt bulunamadı</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ padding: '8px 10px', textAlign: 'center' }}>Yükleniyor…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Özet blokları */}
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>BEKLEYEN KENDİ EVRAĞIMIZ</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum((r) => r.docType === 'KENDİ EVRAĞIMIZ' && r.status === 'BEKLEMEDE'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>BEKLEYEN MÜŞTERİ EVRAĞI</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum((r) => r.docType === 'MÜŞTERİ EVRAĞI' && r.status === 'BEKLEMEDE'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>BANKADA OLAN EVRAK</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(0)}</div>
            </div>

            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>ÖDENEN KENDİ EVRAĞIMIZ</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum((r) => r.docType === 'KENDİ EVRAĞIMIZ' && r.status === 'ÖDENDİ'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>ÖDENEN MÜŞTERİ EVRAĞI</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum((r) => r.docType === 'MÜŞTERİ EVRAĞI' && r.status === 'ÖDENDİ'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>CİROLU OLAN EVRAK</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(0)}</div>
            </div>

            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>TOPLAM KENDİ EVRAĞIMIZ</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum((r) => r.docType === 'KENDİ EVRAĞIMIZ'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>TOPLAM MÜŞTERİ EVRAĞI</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>{fmt(sum((r) => r.docType === 'MÜŞTERİ EVRAĞI'))}</div>
            </div>
            <div>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>GENEL TOPLAM</div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                {fmt(sum(() => true))}
                <div style={{ opacity: 0.8, marginTop: 4, fontSize: 12 }}>Borçlusunuz</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



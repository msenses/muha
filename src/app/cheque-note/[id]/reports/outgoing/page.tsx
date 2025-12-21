'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type SlipData = {
  title: string;
  address: string;
  taxInfo: string;
  no: string;
  due: string;
  owner: string;
  bank: string;
  branch: string;
  account: string;
  amountText: string;
  date: string;
  time: string;
};

export default function ChequeOutgoingSlipPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<SlipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          if (active) {
            setError('Şirket bilgisi alınamadı');
          }
          return;
        }

        const { data: ch, error: chErr } = await supabase
          .from('cheques_notes')
          .select('id, amount, document_no, due_date, bank_name, bank_branch, drawer_name, accounts ( name, district, city, tax_office, tax_id )')
          .eq('company_id', companyId)
          .eq('id', params.id)
          .single();

        if (chErr) {
          console.error('Çek/senet bordrosu verisi alınamadı', chErr);
          if (active) setError('Kayıt bulunamadı');
          return;
        }

        const anyCh = ch as any;
        const acc =
          Array.isArray(anyCh.accounts) && anyCh.accounts.length > 0
            ? anyCh.accounts[0]
            : anyCh.accounts || null;

        const title = (acc?.name as string) ?? '';
        const addressParts: string[] = [];
        if (acc?.district) addressParts.push(String(acc.district));
        if (acc?.city) addressParts.push(String(acc.city));
        const address = addressParts.join(' / ');

        const taxOffice = acc?.tax_office ? String(acc.tax_office) : '';
        const taxId = acc?.tax_id ? String(acc.tax_id) : '';
        const taxInfo =
          taxOffice || taxId ? [taxOffice || '', taxId || ''].filter(Boolean).join(' / ') : '';

        const amountNum = Number(anyCh.amount ?? 0);
        const amountText = `₺${amountNum.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

        const dueDate = anyCh.due_date ? new Date(anyCh.due_date) : null;
        const due = dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toLocaleDateString('tr-TR') : '';

        const now = new Date();
        const slip: SlipData = {
          title,
          address,
          taxInfo,
          no: (anyCh.document_no as string) ?? '',
          due,
          owner: (anyCh.drawer_name as string) ?? '',
          bank: (anyCh.bank_name as string) ?? '',
          branch: (anyCh.bank_branch as string) ?? '',
          account: '', // ayrı hesap alanı yok, drawer_name kullanılıyor
          amountText,
          date: now.toLocaleDateString('tr-TR'),
          time: now.toLocaleTimeString('tr-TR'),
        };

        if (active) {
          setData(slip);
        }
      } catch (err: any) {
        console.error('Çek/senet bordrosu raporu yüklenirken hata', err);
        if (active) setError(err?.message ?? 'Beklenmeyen bir hata oluştu');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router, params.id]);

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, marginBottom: 6 }}>
      <div style={{ opacity: 0.8 }}>{k}</div>
      <div>: {v}</div>
    </div>
  );

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
            <button onClick={() => router.push((`/cheque-note/${params.id}`) as Route)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>← Detaya Dön</button>
          </div>
        </div>

        {/* Rapor gövdesi */}
        <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 18 }}>
          {loading && <div>Yükleniyor…</div>}
          {error && !loading && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && data && (
            <>
          <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 700, marginTop: 4, marginBottom: 16 }}>ÇEK ÇIKIŞ BORDROSU</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>ÜNVAN</div>
              <div style={{ display: 'grid', gap: 2, marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{data.title || '-'}</div>
                <div>{data.address || '-'}</div>
              </div>
              <div style={{ marginTop: 6 }}>VERGİ D. - No : {data.taxInfo || '-'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Tarih : {data.date}</div>
              <div>{data.time}</div>
            </div>
          </div>

          <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0 14px' }} />

          <div style={{ maxWidth: 560 }}>
            <Row k="Çek No" v={data.no || '-'} />
            <Row k="Vade Tarihi" v={data.due || '-'} />
            <Row k="Çek Sahibi" v={data.owner || '-'} />
            <Row k="Banka" v={data.bank || '-'} />
            <Row k="Şube" v={data.branch || '-'} />
            <Row k="Hesap No" v={data.account || '-'} />
            <Row k="Tutar" v={data.amountText} />
          </div>

          <div style={{ marginTop: 16 }}>
            Firmanızın nezdimizdeki Cari Hesabına {data.amountText} BORÇ olarak işlenmiştir.
          </div>

          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textDecoration: 'underline' }}>Düzenleyen</div>
            <div style={{ textDecoration: 'underline' }}>Teslim Alan</div>
          </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}



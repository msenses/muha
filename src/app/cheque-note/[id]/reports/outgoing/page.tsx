'use client';
export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function ChequeOutgoingSlipPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const d = useMemo(() => {
    // Demo veri
    return {
      title: 'Mehmet Bey',
      address: 'Merkez / Düzce',
      taxInfo: 'Üsküdar / 9012345678',
      no: '123',
      due: '27.11.2022',
      owner: 'Mehmet Bey',
      bank: 'Banka2',
      branch: 'Merkez',
      account: '987654321',
      amount: '₺10,000.00 (OnBin TL)',
      date: '27.11.2022',
      time: '18:21:28',
    };
  }, [params.id]);

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
          <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 700, marginTop: 4, marginBottom: 16 }}>ÇEK ÇIKIŞ BORDROSU</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>ÜNVAN</div>
              <div style={{ display: 'grid', gap: 2, marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{d.title}</div>
                <div>{d.address}</div>
              </div>
              <div style={{ marginTop: 6 }}>VERGİ D. - No : {d.taxInfo}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Tarih : {d.date}</div>
              <div>{d.time}</div>
            </div>
          </div>

          <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0 14px' }} />

          <div style={{ maxWidth: 560 }}>
            <Row k="Çek No" v={d.no} />
            <Row k="Vade Tarihi" v={d.due} />
            <Row k="Çek Sahibi" v={d.owner} />
            <Row k="Banka" v={d.bank} />
            <Row k="Şube" v={d.branch} />
            <Row k="Hesap No" v={d.account} />
            <Row k="Tutar" v={d.amount} />
          </div>

          <div style={{ marginTop: 16 }}>
            Firmanızın nezdimizdeki Cari Hesabına 10000 TL (OnBin TL) BORÇ olarak işlenmiştir.
          </div>

          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textDecoration: 'underline' }}>Düzenleyen</div>
            <div style={{ textDecoration: 'underline' }}>Teslim Alan</div>
          </div>
        </div>
      </section>
    </main>
  );
}



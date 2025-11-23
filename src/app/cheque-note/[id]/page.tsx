'use client';
export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function ChequeNoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const data = useMemo(() => {
    // Demo verisi
    return {
      txnDate: '27.11.2022',
      dueDate: '27.11.2022',
      amount: '₺10,000.00',
      firm: 'Mehmet Bey',
      number: '123',
      kind: 'KENDİ EVRAĞIMIZ',
      docType: 'ASIL EVRAK',
      status: 'BEKLEMEDE',
      bank: 'Banka2',
      branch: 'Merkez',
      account: '987654321',
      principal: '',
      note: '',
    };
  }, [params.id]);

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ opacity: 0.75 }}>{label} :</div>
      <div>{value}</div>
    </div>
  );

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <header style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Çek Bilgileri</header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          {/* Sol bilgi paneli */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <Row label="İşlem Tarihi" value={data.txnDate} />
            <Row label="Vade Tarihi" value={data.dueDate} />
            <Row label="Tutar" value={data.amount} />
            <Row label="Firma" value={data.firm} />
            <Row label="Çek/Senet No" value={data.number} />
            <Row label="Çek/Senet Türü" value={data.kind} />
            <Row label="Evrak Türü" value={data.docType} />
            <Row label="Evrak Durumu" value={data.status} />
            <Row label="Banka Adı" value={data.bank} />
            <Row label="Banka Şubesi" value={data.branch} />
            <Row label="Hesap No" value={data.account} />
            <Row label="Asıl Borçlu" value={data.principal || ''} />
            <Row label="Açıklama" value={data.note || ''} />
          </div>

          {/* Sağ işlem paneli */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 8, alignContent: 'start' }}>
            {[
              'DÜZELT',
              'İADE YAP',
              'TAHSİLAT YAP',
              'ÖDEME YAP',
              'CİRO ET',
              'BANKAYA VER',
              'VERİLEN ÇEK/SENET BORDROSU',
              'ALINAN ÇEK/SENET BORDROSU',
              'RAPORLA',
            ].map((t) => (
              <button key={t} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
            <button style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}>
              SİL
            </button>
            <button onClick={() => router.push(('/cheque-note') as Route)} style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>
              ← Listeye Dön
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}



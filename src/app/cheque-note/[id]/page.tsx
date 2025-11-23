'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';
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

  // Ödeme Yap modalı
  const [showPay, setShowPay] = useState(false);
  const [payDate, setPayDate] = useState('27.11.2022');
  const [payAmount, setPayAmount] = useState('10000');
  const [payMethod, setPayMethod] = useState<'Kasadan' | 'Bankadan'>('Kasadan');
  const [selectedCash, setSelectedCash] = useState<'Varsayılan Kasa' | 'Kasa2'>('Varsayılan Kasa');
  // Tahsilat modalı
  const [showCollect, setShowCollect] = useState(false);
  const [collectDate, setCollectDate] = useState('27.11.2022');
  const [collectAmount, setCollectAmount] = useState('20000');
  const [collectMethod, setCollectMethod] = useState<'Kasaya' | 'Bankaya'>('Kasaya');
  const [selectedCollectCash, setSelectedCollectCash] = useState<'Varsayılan Kasa' | 'Kasa2'>('Varsayılan Kasa');
  // Ciro Et modalı
  const [showEndorse, setShowEndorse] = useState(false);
  const [endorseDate, setEndorseDate] = useState('27.11.2022');
  const [endorseCompany, setEndorseCompany] = useState('');
  const [openEndorsePick, setOpenEndorsePick] = useState(false);
  const [endorsePickQuery, setEndorsePickQuery] = useState('');
  // Bankaya Ver modalı
  const [showGiveBank, setShowGiveBank] = useState(false);
  const [giveBankDate, setGiveBankDate] = useState('27.11.2022');
  const [selectedBank, setSelectedBank] = useState<'Varsayılan' | 'Banka2'>('Varsayılan');

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
            {(() => {
              const statusUpper = (data.status || '').toUpperCase();
              const isUnpaid = statusUpper === 'BEKLEMEDE';
              const isPaid = statusUpper === 'ÖDENDİ';
              const isCustomerDoc = (data.kind || '').toUpperCase().includes('MÜŞTERİ');
              const getEnabled = (label: string) => {
                // Ödendi öncelikli kural
                if (isPaid) {
                  return label === 'VERİLEN ÇEK/SENET BORDROSU' || label === 'RAPORLA';
                }
                // Alınan çek kuralları
                if (isCustomerDoc) {
                  return (
                    label === 'DÜZELT' ||
                    label === 'İADE YAP' ||
                    label === 'TAHSİLAT YAP' ||
                    label === 'CİRO ET' ||
                    label === 'BANKAYA VER' ||
                    label === 'ALINAN ÇEK/SENET BORDROSU' ||
                    label === 'RAPORLA' ||
                    label === 'SİL'
                  );
                }
                if (isUnpaid) {
                  return (
                    label === 'DÜZELT' ||
                    label === 'ÖDEME YAP' ||
                    label === 'VERİLEN ÇEK/SENET BORDROSU' ||
                    label === 'RAPORLA'
                  );
                }
                return true;
              };
              const actions: Array<{ label: string; onClick?: () => void }> = [
                { label: 'DÜZELT' },
                { label: 'İADE YAP' },
                { label: 'TAHSİLAT YAP', onClick: () => setShowCollect(true) },
                { label: 'ÖDEME YAP', onClick: () => setShowPay(true) },
                { label: 'CİRO ET', onClick: () => setShowEndorse(true) },
                { label: 'BANKAYA VER', onClick: () => setShowGiveBank(true) },
                { label: 'VERİLEN ÇEK/SENET BORDROSU', onClick: () => router.push((`/cheque-note/${params.id}/reports/outgoing`) as Route) },
                { label: 'ALINAN ÇEK/SENET BORDROSU' },
                { label: 'RAPORLA' },
              ];
              return actions.map(({ label, onClick }) => (
                <button
                  key={label}
                  disabled={!getEnabled(label)}
                  onClick={getEnabled(label) ? onClick : undefined}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    cursor: getEnabled(label) ? 'pointer' : 'not-allowed',
                    opacity: getEnabled(label) ? 1 : 0.5,
                  }}
                >
                  {label}
                </button>
              ));
            })()}
            {(() => {
              const statusUpper = (data.status || '').toUpperCase();
              const isCustomerDoc = (data.kind || '').toUpperCase().includes('MÜŞTERİ');
              const canDelete = statusUpper !== 'ÖDENDİ' || isCustomerDoc;
              return (
                <button
                  disabled={!canDelete}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #fca5a5',
                    background: '#fee2e2',
                    color: '#991b1b',
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                    opacity: canDelete ? 1 : 0.5,
                  }}
                >
                  SİL
                </button>
              );
            })()}
            <button onClick={() => router.push(('/cheque-note') as Route)} style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>
              ← Listeye Dön
            </button>
          </div>
        </div>
      </section>

      {/* Ödeme Yap Modal */}
      {showPay && (
        <div onClick={() => setShowPay(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Ödeme Yap</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={payDate} onChange={(e) => setPayDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as 'Kasadan' | 'Bankadan')} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Kasadan</option>
                  <option>Bankadan</option>
                </select>
              </label>
              {payMethod === 'Kasadan' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Varsayılan Kasa</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" checked={selectedCash === 'Varsayılan Kasa'} onChange={() => setSelectedCash('Varsayılan Kasa')} />
                    <span>Varsayılan Kasa</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" checked={selectedCash === 'Kasa2'} onChange={() => setSelectedCash('Kasa2')} />
                    <span>Kasa2</span>
                  </label>
                </div>
              )}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <button onClick={() => { /* demo submit */ setShowPay(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Ödeme Yap</button>
              <button onClick={() => setShowPay(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
      {/* Bankaya Ver Modal */}
      {showGiveBank && (
        <div onClick={() => setShowGiveBank(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Bankaya Ver</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={giveBankDate} onChange={(e) => setGiveBankDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Varsayılan</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" checked={selectedBank === 'Varsayılan'} onChange={() => setSelectedBank('Varsayılan')} />
                  <span>Varsayılan</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" checked={selectedBank === 'Banka2'} onChange={() => setSelectedBank('Banka2')} />
                  <span>Banka2</span>
                </label>
              </div>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <button onClick={() => { /* demo */ setShowGiveBank(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Bankaya Ver</button>
              <button onClick={() => setShowGiveBank(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
      {/* Ciro Et Modal */}
      {showEndorse && (
        <div onClick={() => setShowEndorse(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Çek Ciro Et</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={endorseDate} onChange={(e) => setEndorseDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Ciro Yapılacak Firma :</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <input value={endorseCompany} onChange={(e) => setEndorseCompany(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                  <button onClick={() => setOpenEndorsePick(true)} title="Cari Seç" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>
              </div>
            </div>
            <div style={{ padding: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => setShowEndorse(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
              <button onClick={() => { /* demo */ setShowEndorse(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Cirola</button>
            </div>
          </div>

          {/* Cari seçimi */}
          {openEndorsePick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 720, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Cari Seç</strong>
                  <button onClick={() => setOpenEndorsePick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={endorsePickQuery} onChange={(e) => setEndorsePickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Cari Ünvan</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Yetkili</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px' }}>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const all = [
                          { id: '1', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
                          { id: '2', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
                        ];
                        const filtered = all.filter((r) => {
                          const hay = `${r.title} ${r.officer}`.toLowerCase();
                          return hay.includes(endorsePickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>{r.title}</td>
                            <td style={{ padding: '8px 10px' }}>{r.officer}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                              <button onClick={() => { setEndorseCompany(r.title); setOpenEndorsePick(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Tahsilat Yap Modal */}
      {showCollect && (
        <div onClick={() => setShowCollect(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Çek Tahsilat</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={collectDate} onChange={(e) => setCollectDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select value={collectMethod} onChange={(e) => setCollectMethod(e.target.value as 'Kasaya' | 'Bankaya')} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Kasaya</option>
                  <option>Bankaya</option>
                </select>
              </label>
              {collectMethod === 'Kasaya' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Varsayılan Kasa</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" checked={selectedCollectCash === 'Varsayılan Kasa'} onChange={() => setSelectedCollectCash('Varsayılan Kasa')} />
                    <span>Varsayılan Kasa</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" checked={selectedCollectCash === 'Kasa2'} onChange={() => setSelectedCollectCash('Kasa2')} />
                    <span>Kasa2</span>
                  </label>
                </div>
              )}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <button onClick={() => { /* demo submit */ setShowCollect(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Tahsilat Yap</button>
              <button onClick={() => setShowCollect(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useMemo, useState } from 'react';

type Row = { id: string; date: string; type: 'GİRİŞ(+) ' | 'ÇIKIŞ(-)'; amount: number; title: string; note: string };

export default function CashDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const cashName = useMemo(() => {
    // basit isimlendirme
    const slug = (params.id || '').toLowerCase();
    if (slug.includes('varsayilan') || slug.includes('varsayılan')) return 'Varsayılan Kasa';
    return params.id;
  }, [params.id]);

  const [startDate, setStartDate] = useState('01.01.2022');
  const [endDate, setEndDate] = useState('14.11.2022');
  const [q, setQ] = useState('');

  // Giriş modal durumu ve alanlar
  const [showIncome, setShowIncome] = useState(false);
  const [incomeDate, setIncomeDate] = useState<string>(() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return '2022-11-14';
    }
  });
  const [incomeAccount, setIncomeAccount] = useState<string | null>(null);
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeDocNo, setIncomeDocNo] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('0.00');
  const [openAccountPick, setOpenAccountPick] = useState(false);
  const [accountPickQuery, setAccountPickQuery] = useState('');

  // Çıkış modal durumu ve alanlar
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeDate, setOutcomeDate] = useState<string>(() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return '2022-11-14';
    }
  });
  const [outcomeAccount, setOutcomeAccount] = useState<string | null>(null);
  const [outcomeDesc, setOutcomeDesc] = useState('');
  const [outcomeDocNo, setOutcomeDocNo] = useState('');
  const [outcomeAmount, setOutcomeAmount] = useState('0.00');
  const [openOutcomeAccountPick, setOpenOutcomeAccountPick] = useState(false);
  const [outcomeAccountPickQuery, setOutcomeAccountPickQuery] = useState('');

  // Bankaya Virman modalı durumları
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [bankTransferDate, setBankTransferDate] = useState<string>(() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return '2022-11-14';
    }
  });
  const [bankTransferDesc, setBankTransferDesc] = useState('');
  const [bankTransferDocNo, setBankTransferDocNo] = useState('');
  const [bankTransferAmount, setBankTransferAmount] = useState('0.00');
  const [bankName, setBankName] = useState<string | null>(null);
  const [openBankPick, setOpenBankPick] = useState(false);
  const [bankPickQuery, setBankPickQuery] = useState('');

  // Kasadan Kasaya Virman modalı durumları
  const [showCashTransfer, setShowCashTransfer] = useState(false);
  const [cashTransferDate, setCashTransferDate] = useState<string>(() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return '2022-11-14';
    }
  });
  const [sourceCashName, setSourceCashName] = useState<string | null>(null);
  const [targetCashName, setTargetCashName] = useState<string | null>(null);
  const [cashTransferDesc, setCashTransferDesc] = useState('');
  const [cashTransferAmount, setCashTransferAmount] = useState('0.00');
  const [openSourceCashPick, setOpenSourceCashPick] = useState(false);
  const [openTargetCashPick, setOpenTargetCashPick] = useState(false);
  const [sourceCashPickQuery, setSourceCashPickQuery] = useState('');
  const [targetCashPickQuery, setTargetCashPickQuery] = useState('');

  // Liste satır "İşlemler" açılır menü durumu
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);

  // Raporla modalı
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('14.11.2022');
  const [reportEnd, setReportEnd] = useState('14.11.2022');

  const rows: Row[] = [
    { id: '1', date: '14.11.2022', type: 'GİRİŞ(+) ', amount: 500, title: '', note: '' },
    { id: '2', date: '14.11.2022', type: 'GİRİŞ(+) ', amount: 250, title: '', note: '' },
    { id: '3', date: '14.11.2022', type: 'GİRİŞ(+) ', amount: 100, title: '', note: '' },
    { id: '4', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 63, title: 'Mehmet Bey', note: 'Alış' },
    { id: '5', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 90, title: 'Mehmet Bey', note: 'Alış' },
    { id: '6', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 100, title: 'Mehmet Bey', note: 'Alış' },
    { id: '7', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 0, title: 'Mehmet Bey', note: 'Alış' },
    { id: '8', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 7.18, title: 'Mehmet Bey', note: 'ALIŞ FATURASI İADESİ' },
    { id: '9', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 3, title: 'Mehmet Bey', note: 'SATIŞ FATURASI İADESİ' },
    { id: '10', date: '14.11.2022', type: 'ÇIKIŞ(-)', amount: 8.47, title: 'Mehmet Bey', note: 'Alış' },
  ];

  const filtered = rows.filter((r) => {
    const hay = `${r.date} ${r.type} ${r.amount} ${r.title} ${r.note}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 10 }}>
              <button onClick={() => setShowIncome(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Giriş Yap (+)</button>
              <button onClick={() => setShowOutcome(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>Çıkış Yap (-)</button>
              <button onClick={() => setShowBankTransfer(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff' }}>Bankaya Virman</button>
              <button onClick={() => setShowCashTransfer(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Kasadan Kasaya Virman</button>
              <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937' }}>Raporla</button>
            </div>

            <div style={{ marginTop: 12, borderRadius: 10, background: 'rgba(255,255,255,0.08)', padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Belirtilen Tarih Aralığındaki</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div>Toplam Giriş: <b>1.042.616,88 ₺</b></div>
                <div>Toplam Çıkış: <b>76.794,47 ₺</b></div>
                <div>Kasa Bakiyesi: <b>965.822,41 ₺</b></div>
                <div>Toplam Kasa Bakiyesi: <b>965.822,41 ₺</b></div>
              </div>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Kasa : <span style={{ opacity: 0.9 }}>{cashName}</span></div>
              <button onClick={() => router.push(('/cash') as Route)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>← Liste</button>
            </header>

            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ marginRight: 8 }}>KASA HAREKETLERİ</strong>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>Başlangıç Tarihi:</span>
                  <input value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: 120, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <span>Bitiş Tarihi:</span>
                  <input value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: 120, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <button style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 180, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                  <button style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ overflow: 'auto', maxHeight: 'calc(100dvh - 260px)' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                        <th style={{ padding: '8px' }}>İşlemler</th>
                        <th style={{ padding: '8px' }}>Tarih</th>
                        <th style={{ padding: '8px' }}>Tip</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Tutar</th>
                        <th style={{ padding: '8px' }}>Ünvan</th>
                        <th style={{ padding: '8px' }}>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                      <tr key={r.id} style={{ color: 'white' }}>
                          <td style={{ padding: '8px', position: 'relative' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenActionRowId(prev => prev === r.id ? null : r.id); }}
                              style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}
                            >
                              İşlemler ▾
                            </button>
                            {openActionRowId === r.id && (
                              <div style={{ position: 'absolute', top: 36, left: 8, minWidth: 140, background: 'white', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 10px 32px rgba(0,0,0,0.25)', zIndex: 50 }}>
                                <button
                                  onClick={() => { setOpenActionRowId(null); }}
                                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                  Düzenle
                                </button>
                                <div style={{ height: 1, background: '#e5e7eb' }} />
                                <button
                                  onClick={() => { setOpenActionRowId(null); }}
                                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                >
                                  Sil
                                </button>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '8px' }}>{r.date}</td>
                          <td style={{ padding: '8px' }}>{r.type}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{r.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px' }}>{r.title || '-'}</td>
                          <td style={{ padding: '8px' }}>{r.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yeni Giriş Ekle Modal */}
      {showIncome && (
        <div onClick={() => setShowIncome(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Yeni Giriş Ekle</strong>
              <button onClick={() => setShowIncome(false)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              {/* Tip */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tip:</span>
                <input value="GİRİŞ(+)" readOnly style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f3f4f6' }} />
              </label>

              {/* Tarih */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih:</span>
                <input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Cari Ünvan */}
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Cari Ünvan:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                  <input readOnly value={incomeAccount ?? 'Henüz seçilmiş bir cari yok'} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb' }} />
                  <button type="button" onClick={() => setOpenAccountPick(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #1ea7fd', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}>Carilerden Seç</button>
                  <button type="button" onClick={() => setIncomeAccount(null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Temizle</button>
                </div>
              </div>

              {/* Açıklama */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama:</span>
                <input value={incomeDesc} onChange={(e) => setIncomeDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Evrak No */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak No:</span>
                <input value={incomeDocNo} onChange={(e) => setIncomeDocNo(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Tutar */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar:</span>
                <input value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowIncome(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
              <button onClick={() => { /* demo ekle */ setShowIncome(false); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>Ekle</button>
            </div>
          </div>

          {/* Cari seçim modalı */}
          {openAccountPick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 780, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Cari Seç</strong>
                  <button onClick={() => setOpenAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>

                {/* Arama girişi */}
                <div style={{ padding: 12 }}>
                  <input value={accountPickQuery} onChange={(e) => setAccountPickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>

                {/* Tablo */}
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>İşlem</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Grup</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Yetkili</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Unvan</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Mail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const all = [
                          { id: '1', group: 'MÜŞTERİLER', officer: 'Ahmet Bey', title: 'Mehmet Bey', mail: 'mail@mail.com' },
                          { id: '2', group: 'MÜŞTERİLER', officer: 'Mustafa Bey', title: 'Mustafa Bey', mail: 'mail@mail.com' },
                          { id: '3', group: 'TEDARİKÇİ', officer: 'Ayşe Hanım', title: 'Ayşe LTD', mail: 'info@ayse.com' },
                        ];
                        const filtered = all.filter((r) => {
                          const hay = `${r.group} ${r.officer} ${r.title} ${r.mail}`.toLowerCase();
                          return hay.includes(accountPickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <button onClick={() => { setIncomeAccount(r.title); setOpenAccountPick(false); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                            <td style={{ padding: '8px 10px' }}>{r.group}</td>
                            <td style={{ padding: '8px 10px' }}>{r.officer}</td>
                            <td style={{ padding: '8px 10px' }}>{r.title}</td>
                            <td style={{ padding: '8px 10px' }}>{r.mail}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setOpenAccountPick(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kasadan Kasaya Virman Modal */}
      {showCashTransfer && (
        <div onClick={() => setShowCashTransfer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 620, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Kasadan Kasaya Virman İşlemi</strong>
              <button onClick={() => setShowCashTransfer(false)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              {/* Tarih */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih:</span>
                <input type="date" value={cashTransferDate} onChange={(e) => setCashTransferDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Kaynak Kasa Adı */}
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Kaynak Kasa Adı:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                  <input readOnly value={sourceCashName ?? ''} placeholder="" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb' }} />
                  <button type="button" onClick={() => setOpenSourceCashPick(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Kaynak Kasa Seç</button>
                  <button type="button" onClick={() => setSourceCashName(null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Temizle</button>
                </div>
              </div>

              {/* Hedef Kasa Adı */}
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Hedef Kasa Adı:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                  <input readOnly value={targetCashName ?? ''} placeholder="" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb' }} />
                  <button type="button" onClick={() => setOpenTargetCashPick(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Hedef Kasa Seç</button>
                  <button type="button" onClick={() => setTargetCashName(null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Temizle</button>
                </div>
              </div>

              {/* Açıklama */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama:</span>
                <input value={cashTransferDesc} onChange={(e) => setCashTransferDesc(e.target.value)} placeholder="-" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Tutar */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar:</span>
                <input value={cashTransferAmount} onChange={(e) => setCashTransferAmount(e.target.value)} placeholder="0,00" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowCashTransfer(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
              <button onClick={() => { /* demo save */ setShowCashTransfer(false); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Kaydet</button>
            </div>
          </div>

          {/* Kaynak Kasa seçimi */}
          {openSourceCashPick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 780, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Kaynak Kasa Seç</strong>
                  <button onClick={() => setOpenSourceCashPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={sourceCashPickQuery} onChange={(e) => setSourceCashPickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>İşlem</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Kasa Adı</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const cashes = [
                          { id: 'k1', name: 'Varsayılan Kasa', note: '-' },
                          { id: 'k2', name: 'Şube Kasa', note: '-' },
                          { id: 'k3', name: 'Merkez Kasa', note: '-' },
                        ];
                        const filtered = cashes.filter((r) => {
                          const hay = `${r.name} ${r.note}`.toLowerCase();
                          return hay.includes(sourceCashPickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <button onClick={() => { setSourceCashName(r.name); setOpenSourceCashPick(false); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                            <td style={{ padding: '8px 10px' }}>{r.name}</td>
                            <td style={{ padding: '8px 10px' }}>{r.note}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setOpenSourceCashPick(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
                </div>
              </div>
            </div>
          )}

          {/* Hedef Kasa seçimi */}
          {openTargetCashPick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 780, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Hedef Kasa Seç</strong>
                  <button onClick={() => setOpenTargetCashPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={targetCashPickQuery} onChange={(e) => setTargetCashPickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>İşlem</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Kasa Adı</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const cashes = [
                          { id: 'k1', name: 'Varsayılan Kasa', note: '-' },
                          { id: 'k2', name: 'Şube Kasa', note: '-' },
                          { id: 'k3', name: 'Merkez Kasa', note: '-' },
                        ];
                        const filtered = cashes.filter((r) => {
                          const hay = `${r.name} ${r.note}`.toLowerCase();
                          return hay.includes(targetCashPickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <button onClick={() => { setTargetCashName(r.name); setOpenTargetCashPick(false); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                            <td style={{ padding: '8px 10px' }}>{r.name}</td>
                            <td style={{ padding: '8px 10px' }}>{r.note}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setOpenTargetCashPick(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Kasadan Bankaya Virman Modal */}
      {showBankTransfer && (
        <div onClick={() => setShowBankTransfer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Kasadan Bankaya Virman İşlemi</strong>
              <button onClick={() => setShowBankTransfer(false)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              {/* Tarih */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih:</span>
                <input type="date" value={bankTransferDate} onChange={(e) => setBankTransferDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Tip */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tip:</span>
                <input value="ÇIKIŞ(-)" readOnly style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f3f4f6' }} />
              </label>

              {/* Açıklama */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama:</span>
                <input value={bankTransferDesc} onChange={(e) => setBankTransferDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Evrak No */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak No:</span>
                <input value={bankTransferDocNo} onChange={(e) => setBankTransferDocNo(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Tutar */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar:</span>
                <input value={bankTransferAmount} onChange={(e) => setBankTransferAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Banka Adı */}
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Banka Adı:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                  <input readOnly value={bankName ?? '-'} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb' }} />
                  <button type="button" onClick={() => setOpenBankPick(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2563eb', background: '#2563eb', color: 'white', cursor: 'pointer' }}>Banka Seç</button>
                  <button type="button" onClick={() => setBankName(null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Temizle</button>
                </div>
              </div>
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowBankTransfer(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
              <button onClick={() => { /* demo save */ setShowBankTransfer(false); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff', cursor: 'pointer' }}>Kaydet</button>
            </div>
          </div>

          {/* Banka seçim modalı */}
          {openBankPick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 780, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Banka Seç</strong>
                  <button onClick={() => setOpenBankPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={bankPickQuery} onChange={(e) => setBankPickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>İşlem</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Banka</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Şube</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>IBAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const banks = [
                          { id: 'b1', name: 'Ziraat Bankası', branch: 'Merkez', iban: 'TR12 0001 0000 1111 2222 3333 44' },
                          { id: 'b2', name: 'İş Bankası', branch: 'Ankara', iban: 'TR34 0006 4000 5555 6666 7777 88' },
                          { id: 'b3', name: 'Garanti BBVA', branch: 'İstanbul', iban: 'TR56 0006 2000 9999 0000 1111 22' },
                        ];
                        const filtered = banks.filter((r) => {
                          const hay = `${r.name} ${r.branch} ${r.iban}`.toLowerCase();
                          return hay.includes(bankPickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <button onClick={() => { setBankName(`${r.name} - ${r.branch}`); setOpenBankPick(false); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                            <td style={{ padding: '8px 10px' }}>{r.name}</td>
                            <td style={{ padding: '8px 10px' }}>{r.branch}</td>
                            <td style={{ padding: '8px 10px' }}>{r.iban}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setOpenBankPick(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Yeni Çıkış Ekle Modal */}
      {showOutcome && (
        <div onClick={() => setShowOutcome(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Yeni Çıkış Ekle</strong>
              <button onClick={() => setShowOutcome(false)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              {/* Tip */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tip:</span>
                <input value="ÇIKIŞ(-)" readOnly style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f3f4f6' }} />
              </label>

              {/* Tarih */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih:</span>
                <input type="date" value={outcomeDate} onChange={(e) => setOutcomeDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Cari Ünvan */}
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Cari Ünvan:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                  <input readOnly value={outcomeAccount ?? 'Henüz seçilmiş bir cari yok'} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb' }} />
                  <button type="button" onClick={() => setOpenOutcomeAccountPick(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #1ea7fd', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}>Carilerden Seç</button>
                  <button type="button" onClick={() => setOutcomeAccount(null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Temizle</button>
                </div>
              </div>

              {/* Açıklama */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama:</span>
                <input value={outcomeDesc} onChange={(e) => setOutcomeDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Evrak No */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak No:</span>
                <input value={outcomeDocNo} onChange={(e) => setOutcomeDocNo(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>

              {/* Tutar */}
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar:</span>
                <input value={outcomeAmount} onChange={(e) => setOutcomeAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </label>
            </div>

            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowOutcome(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
              <button onClick={() => { /* demo ekle */ setShowOutcome(false); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>Ekle</button>
            </div>
          </div>

          {/* Çıkış için Cari seçim modalı */}
          {openOutcomeAccountPick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 780, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Cari Seç</strong>
                  <button onClick={() => setOpenOutcomeAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={outcomeAccountPickQuery} onChange={(e) => setOutcomeAccountPickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>İşlem</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Grup</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Yetkili</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Unvan</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Mail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const all = [
                          { id: '1', group: 'MÜŞTERİLER', officer: 'Ahmet Bey', title: 'Mehmet Bey', mail: 'mail@mail.com' },
                          { id: '2', group: 'MÜŞTERİLER', officer: 'Mustafa Bey', title: 'Mustafa Bey', mail: 'mail@mail.com' },
                          { id: '3', group: 'TEDARİKÇİ', officer: 'Ayşe Hanım', title: 'Ayşe LTD', mail: 'info@ayse.com' },
                        ];
                        const filtered = all.filter((r) => {
                          const hay = `${r.group} ${r.officer} ${r.title} ${r.mail}`.toLowerCase();
                          return hay.includes(outcomeAccountPickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <button onClick={() => { setOutcomeAccount(r.title); setOpenOutcomeAccountPick(false); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                            <td style={{ padding: '8px 10px' }}>{r.group}</td>
                            <td style={{ padding: '8px 10px' }}>{r.officer}</td>
                            <td style={{ padding: '8px 10px' }}>{r.title}</td>
                            <td style={{ padding: '8px 10px' }}>{r.mail}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setOpenOutcomeAccountPick(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raporla Modal */}
      {showReport && (
        <div onClick={() => setShowReport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 620, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>İşlem</strong>
              <button onClick={() => setShowReport(false)} style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
                <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input id="alltime" type="checkbox" checked={reportAllTime} onChange={(e) => setReportAllTime(e.target.checked)} />
                  <label htmlFor="alltime" style={{ userSelect: 'none', cursor: 'pointer' }}>Tüm Zamanlar</label>
                </div>

                <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Başlangıç Tarihi</span>
                    <input value={reportStart} onChange={(e) => setReportStart(e.target.value)} disabled={reportAllTime} placeholder="14.11.2022" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Bitiş Tarihi</span>
                    <input value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} disabled={reportAllTime} placeholder="14.11.2022" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: reportAllTime ? '#f3f4f6' : '#fff' }} />
                  </label>
                </div>

                <div style={{ padding: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { /* rapor getir - demo */ setShowReport(false); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>≡ Kasa Raporu Getir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

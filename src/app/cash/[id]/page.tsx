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
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff' }}>Bankaya Virman</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Kasadan Kasaya Virman</button>
              <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937' }}>Raporla</button>
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
                          <td style={{ padding: '8px' }}>
                            <button style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>İşlemler ▾</button>
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
    </main>
  );
}

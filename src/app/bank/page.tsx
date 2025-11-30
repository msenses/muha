'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

type BankRow = {
  id: number;
  name: string;
  accountNo: string;
  balance: number;
};

export default function BankPage() {
  const [q, setQ] = useState('');
  const router = useRouter();

  // Bankadan bankaya virman modal durumu
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [btDate, setBtDate] = useState('14.11.2022');
  const [btSource, setBtSource] = useState('');
  const [btTarget, setBtTarget] = useState('');
  const [btDesc, setBtDesc] = useState('');
  const [btAmount, setBtAmount] = useState('0');

  // Detaylı rapor filtresi modalı
  const [showDetailReport, setShowDetailReport] = useState(false);
  const [repAllTime, setRepAllTime] = useState(true);
  const [repStart, setRepStart] = useState('14.11.2022');
  const [repEnd, setRepEnd] = useState('14.11.2022');

  const rows: BankRow[] = [
    { id: 1, name: 'Varsayılan - Merkez', accountNo: '', balance: 23423770 },
  ];

  const filtered = rows.filter(r =>
    `${r.name} ${r.accountNo}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 8 }}>
              <button onClick={() => router.push(('/bank/new') as Route)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>Yeni Banka Hesabı</button>
              <button onClick={() => setShowBankTransfer(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Bankadan Bankaya Virman</button>
            </div>

            <div style={{ marginTop: 16, color: 'white', opacity: 0.9, fontWeight: 700 }}>Raporlar</div>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              <button onClick={() => setShowDetailReport(true)} style={{ padding: '10px 12px', width: '100%', borderRadius: 6, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937', cursor: 'pointer' }}>Banka Detaylı Rapor</button>
              <button onClick={() => router.push(('/bank/reports/balance') as Route)} style={{ padding: '10px 12px', width: '100%', borderRadius: 6, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937', cursor: 'pointer' }}>Banka Bakiye Raporu</button>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {/* Başlık */}
            <div style={{ background: '#11b5c7', padding: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏦</span>
              <span>Banka Listesi</span>
            </div>

            {/* Liste */}
            <div style={{ padding: 10 }}>
              <div style={{ overflowX: 'auto', background: '#fff', color: '#111827', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ textAlign: 'left', padding: '8px', width: 42 }}></th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Banka-Hesap</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Hesap No</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Bakiye</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Arama satırı */}
                    <tr>
                      <td style={{ padding: '8px' }}>
                        <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                      </td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px' }}>
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                      </td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px' }}></td>
                    </tr>

                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td style={{ padding: '8px' }}>
                          <button onClick={() => window.location.href = `/bank/${r.id}`} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                        </td>
                        <td style={{ padding: '8px' }}>{r.id}</td>
                        <td style={{ padding: '8px' }}>{r.name}</td>
                        <td style={{ padding: '8px' }}>{r.accountNo || '-'}</td>
                        <td style={{ padding: '8px' }}>{r.balance.toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bankadan Bankaya Virman Modal */}
      {showBankTransfer && (
        <div onClick={() => setShowBankTransfer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: 12, fontWeight: 800, borderBottom: '1px solid #e5e7eb' }}>Bankadan Bankaya Virman</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih :</span>
                <input value={btDate} onChange={(e) => setBtDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Kaynak Banka :</span>
                <select value={btSource} onChange={(e) => setBtSource(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option value="">Banka Seçiniz</option>
                  <option>Varsayılan - Merkez</option>
                  <option>Şube 1</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Hedef Banka :</span>
                <select value={btTarget} onChange={(e) => setBtTarget(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option value="">Banka Seçiniz</option>
                  <option>Varsayılan - Merkez</option>
                  <option>Şube 1</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama :</span>
                <input value={btDesc} onChange={(e) => setBtDesc(e.target.value)} placeholder="Açıklama" style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tutarı :</span>
                <input value={btAmount} onChange={(e) => setBtAmount(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'right' }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowBankTransfer(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detaylı Rapor Filtresi Modal */}
      {showDetailReport && (
        <div onClick={() => setShowDetailReport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>İşlem</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={repAllTime} onChange={(e) => setRepAllTime(e.target.checked)} />
                <span>Tüm Zamanlar</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Başlangıç Tarihi</span>
                  <input value={repStart} onChange={(e) => setRepStart(e.target.value)} disabled={repAllTime} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: repAllTime ? '#f3f4f6' : '#fff' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Bitiş Tarihi</span>
                  <input value={repEnd} onChange={(e) => setRepEnd(e.target.value)} disabled={repAllTime} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: repAllTime ? '#f3f4f6' : '#fff' }} />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowDetailReport(false); router.push(('/bank/reports/detail') as Route); }} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>≡ Banka Raporu Getir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


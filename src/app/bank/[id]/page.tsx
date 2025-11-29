'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';

export default function BankDetailPage({ params }: { params: { id: string } }) {
  const bankName = useMemo(() => {
    return 'Varsayılan - Merkez';
  }, [params.id]);

  const [startDate, setStartDate] = useState('01.01.2000');
  const [endDate, setEndDate] = useState('14.11.2022');
  const [q, setQ] = useState('');

  // Para yatırma modalı (Banka İşlemi)
  const [showDeposit, setShowDeposit] = useState(false);
  const [depType, setDepType] = useState<'GİRİŞ' | 'ÇIKIŞ'>('GİRİŞ');
  const [depMethod, setDepMethod] = useState<'HAVALE' | 'KREDİ KARTI' | 'NAKİT'>('HAVALE');
  const [depDate, setDepDate] = useState('14.11.2022');
  const [depTitle, setDepTitle] = useState('');
  const [depDocNo, setDepDocNo] = useState('');
  const [depDesc, setDepDesc] = useState('');
  const [depAmount, setDepAmount] = useState('0.00');
  const [openAccountPick, setOpenAccountPick] = useState(false);
  const [accountPickQuery, setAccountPickQuery] = useState('');

  // Para çekme modalı (Banka İşlemi - ÇIKIŞ)
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withType, setWithType] = useState<'GİRİŞ' | 'ÇIKIŞ'>('ÇIKIŞ');
  const [withMethod, setWithMethod] = useState<'HAVALE' | 'KREDİ KARTI' | 'NAKİT'>('HAVALE');
  const [withDate, setWithDate] = useState('14.11.2022');
  const [withTitle, setWithTitle] = useState('');
  const [withDocNo, setWithDocNo] = useState('');
  const [withDesc, setWithDesc] = useState('');
  const [withAmount, setWithAmount] = useState('0.00');
  const [openWithdrawAccountPick, setOpenWithdrawAccountPick] = useState(false);
  const [withdrawAccountPickQuery, setWithdrawAccountPickQuery] = useState('');

  // Kasaya Virman modalı
  const [showCashTransfer, setShowCashTransfer] = useState(false);
  const [ctMethod, setCtMethod] = useState<'Havale' | 'Kredi Kartı' | 'Nakit'>('Havale');
  const [ctDate, setCtDate] = useState('14.11.2022');
  const [ctDocNo, setCtDocNo] = useState('');
  const [ctDesc, setCtDesc] = useState('Bankadan, kasaya virman');
  const [ctAmount, setCtAmount] = useState('0');
  const [ctCash, setCtCash] = useState<'Varsayılan Kasa' | 'Kasa2'>('Varsayılan Kasa');

  type Txn = {
    id: string;
    date: string;
    type: 'GİRİŞ' | 'ÇIKIŞ';
    amount: number;
    desc: string;
    payMethod: string;
    account: string;
  };

  const rows: Txn[] = [
    { id: '1', date: '14.11.2022', type: 'GİRİŞ', amount: 4000, desc: 'Varsayılan Kasa Kasasından Varsayılan Bankasına Virman -', payMethod: 'Kasadan Virman', account: '' },
    { id: '2', date: '11.11.2022', type: 'GİRİŞ', amount: 4.77, desc: 'SATIŞ FATURASI', payMethod: 'Kredi Kartı', account: 'Mehmet Bey' },
    { id: '3', date: '04.11.2022', type: 'GİRİŞ', amount: 10000, desc: 'Tahsilat', payMethod: 'Kredi Kartı', account: 'Mehmet Bey' },
  ];

  const filtered = rows.filter(r =>
    `${r.date} ${r.type} ${r.amount} ${r.desc} ${r.payMethod} ${r.account}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const sums = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    for (const r of rows) {
      if (r.type === 'GİRİŞ') inSum += r.amount;
      else outSum += r.amount;
    }
    return { inSum, outSum, balance: inSum - outSum };
  }, [rows]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          {/* Sol menü */}
          <aside>
            <div style={{ display: 'grid', gap: 8 }}>
              <button onClick={() => setShowDeposit(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Para Yatırma</button>
              <button onClick={() => setShowWithdraw(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>Para Çekme</button>
              <button onClick={() => setShowCashTransfer(true)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Kasaya Virman</button>
            </div>
          </aside>

          {/* Sağ içerik */}
          <div style={{ display: 'grid', gap: 12 }}>
            {/* Üst bilgi paneli */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
              <div style={{ borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ padding: 10, fontWeight: 800 }}>Banka Adı : {bankName}</div>
                <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Hesap No:</div>
                    <div>-</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Bakiye :</div>
                    <div>{sums.balance.toLocaleString('tr-TR')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>IBAN :</div>
                    <div>-</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Şube Kodu :</div>
                    <div>-</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Banka Şubesi:</div>
                    <div>Merkez</div>
                  </div>
                </div>
              </div>
              <div>
                <button style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937' }}>✏ Düzenle</button>
              </div>
            </div>

            {/* Hareket listesi */}
            <div style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ padding: 10, fontWeight: 700 }}>🏦 Banka Hareket Listesi</div>

              {/* Filtre bar */}
              <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr) auto', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Başlangıç Tarihi:</span>
                  <input value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', color: '#111827' }} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Bitiş Tarihi:</span>
                  <input value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', color: '#111827' }} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Ara...</span>
                  <input value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', color: '#111827' }} />
                </label>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, opacity: 0.9, color: 'white' }}>
                  <div>Giriş: {sums.inSum.toLocaleString('tr-TR')}</div>
                  <div>Çıkış: {sums.outSum.toLocaleString('tr-TR')}</div>
                  <div>Bakiye: {sums.balance.toLocaleString('tr-TR')}</div>
                </div>
              </div>

              {/* Tablo */}
              <div style={{ padding: 10 }}>
                <div style={{ overflowX: 'auto', background: '#fff', color: '#111827', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>İşlemler</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tarih</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>İşlem</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tutar</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Açıklama</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Ödeme Şekli</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Cari</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.id}>
                          <td style={{ padding: '8px' }}>
                            <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>İşlemler ▾</button>
                          </td>
                          <td style={{ padding: '8px' }}>{r.date}</td>
                          <td style={{ padding: '8px' }}>{r.type}</td>
                          <td style={{ padding: '8px' }}>{r.amount.toLocaleString('tr-TR')}</td>
                          <td style={{ padding: '8px' }}>{r.desc}</td>
                          <td style={{ padding: '8px' }}>{r.payMethod}</td>
                          <td style={{ padding: '8px' }}>{r.account}</td>
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

      {/* Para Yatırma (Banka İşlemi) Modal */}
      {showDeposit && (
        <div onClick={() => setShowDeposit(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 800 }}>BANKA İŞLEMİ</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{bankName}</div>
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tip :</span>
                <select value={depType} onChange={(e) => setDepType(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option>GİRİŞ</option>
                  <option>ÇIKIŞ</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select value={depMethod} onChange={(e) => setDepMethod(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option>HAVALE</option>
                  <option>KREDİ KARTI</option>
                  <option>NAKİT</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih :</span>
                <input value={depDate} onChange={(e) => setDepDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <span>ÜNVAN</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px', gap: 6 }}>
                  <input value={depTitle} onChange={(e) => setDepTitle(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  <button onClick={() => setOpenAccountPick(true)} style={{ borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>🔍</button>
                </div>
              </div>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak No :</span>
                <input value={depDocNo} onChange={(e) => setDepDocNo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama :</span>
                <textarea value={depDesc} onChange={(e) => setDepDesc(e.target.value)} rows={3} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={depAmount} onChange={(e) => setDepAmount(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'right' }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setShowDeposit(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Vazgeç</button>
                <button onClick={() => setShowDeposit(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Kaydet</button>
              </div>
            </div>
          </div>

          {/* Cari Seç Modal */}
          {openAccountPick && (
            <div onClick={() => setOpenAccountPick(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1100 }}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>CARI SEÇ
                  <button onClick={() => setOpenAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={accountPickQuery} onChange={(e) => setAccountPickQuery(e.target.value)} placeholder="" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Cari Ünvan</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Yetkili</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: '1', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
                        { id: '2', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
                        { id: '3', title: 'MYSOFT DİJİTAL DÖNÜŞÜM (E-BELGE)', officer: '' },
                      ]
                        .filter(a => (`${a.title} ${a.officer}`).toLowerCase().includes(accountPickQuery.toLowerCase()))
                        .map((a) => (
                          <tr key={a.id}>
                            <td style={{ padding: '8px' }}>{a.title}</td>
                            <td style={{ padding: '8px' }}>{a.officer}</td>
                            <td style={{ padding: '8px' }}>
                              <button onClick={() => { setDepTitle(a.title); setOpenAccountPick(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kasaya Virman Modal */}
      {showCashTransfer && (
        <div onClick={() => setShowCashTransfer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 800 }}>Kasaya Virman</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tip:</span>
                <input value="ÇIKIŞ" readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: '#f9fafb' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select value={ctMethod} onChange={(e) => setCtMethod(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option>Havale</option>
                  <option>Kredi Kartı</option>
                  <option>Nakit</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih :</span>
                <input value={ctDate} onChange={(e) => setCtDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak No :</span>
                <input value={ctDocNo} onChange={(e) => setCtDocNo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama :</span>
                <input value={ctDesc} onChange={(e) => setCtDesc(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={ctAmount} onChange={(e) => setCtAmount(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'right' }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Kasa :</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="radio" checked={ctCash === 'Varsayılan Kasa'} onChange={() => setCtCash('Varsayılan Kasa')} /> Varsayılan Kasa</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="radio" checked={ctCash === 'Kasa2'} onChange={() => setCtCash('Kasa2')} /> Kasa2</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setShowCashTransfer(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Vazgeç</button>
                <button onClick={() => setShowCashTransfer(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Para Çekme (Banka İşlemi - ÇIKIŞ) Modal */}
      {showWithdraw && (
        <div onClick={() => setShowWithdraw(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 800 }}>BANKA İŞLEMİ</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{bankName}</div>
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tip :</span>
                <select value={withType} onChange={(e) => setWithType(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option>GİRİŞ</option>
                  <option>ÇIKIŞ</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select value={withMethod} onChange={(e) => setWithMethod(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                  <option>HAVALE</option>
                  <option>KREDİ KARTI</option>
                  <option>NAKİT</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tarih :</span>
                <input value={withDate} onChange={(e) => setWithDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <span>ÜNVAN</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px', gap: 6 }}>
                  <input value={withTitle} onChange={(e) => setWithTitle(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                  <button onClick={() => setOpenWithdrawAccountPick(true)} style={{ borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>🔍</button>
                </div>
              </div>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak No :</span>
                <input value={withDocNo} onChange={(e) => setWithDocNo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama :</span>
                <textarea value={withDesc} onChange={(e) => setWithDesc(e.target.value)} rows={3} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={withAmount} onChange={(e) => setWithAmount(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'right' }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setShowWithdraw(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Vazgeç</button>
                <button onClick={() => setShowWithdraw(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Kaydet</button>
              </div>
            </div>
          </div>

          {/* Cari Seç Modal (Para Çekme) */}
          {openWithdrawAccountPick && (
            <div onClick={() => setOpenWithdrawAccountPick(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1100 }}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>CARI SEÇ
                  <button onClick={() => setOpenWithdrawAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={withdrawAccountPickQuery} onChange={(e) => setWithdrawAccountPickQuery(e.target.value)} placeholder="" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Cari Ünvan</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Yetkili</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: '1', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
                        { id: '2', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
                        { id: '3', title: 'MYSOFT DİJİTAL DÖNÜŞÜM (E-BELGE)', officer: '' },
                      ]
                        .filter(a => (`${a.title} ${a.officer}`).toLowerCase().includes(withdrawAccountPickQuery.toLowerCase()))
                        .map((a) => (
                          <tr key={a.id}>
                            <td style={{ padding: '8px' }}>{a.title}</td>
                            <td style={{ padding: '8px' }}>{a.officer}</td>
                            <td style={{ padding: '8px' }}>
                              <button onClick={() => { setWithTitle(a.title); setOpenWithdrawAccountPick(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}


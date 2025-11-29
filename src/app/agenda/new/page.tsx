'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

type Account = { id: string; title: string; officer: string };

export default function AgendaNewPage() {
  const [company, setCompany] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gsm, setGsm] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('0');
  const [minute, setMinute] = useState('0');
  const [user, setUser] = useState('bilsoft');

  // Cari seçim modalı
  const [openAccountPick, setOpenAccountPick] = useState(false);
  const [accountPickQuery, setAccountPickQuery] = useState('');

  const accounts: Account[] = [
    { id: '1', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
    { id: '2', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
    { id: '3', title: 'MYSOFT DİJİTAL DÖNÜŞÜM (E-BELGE)', officer: '' },
  ];

  const filtered = accounts.filter(a =>
    `${a.title} ${a.officer}`.toLowerCase().includes(accountPickQuery.toLowerCase())
  );

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Yeni Bildirim Ekleme</div>

          <div style={{ background: '#ffffff', color: '#111827', borderRadius: 8, border: '1px solid #e5e7eb', padding: 12, maxWidth: 560 }}>
            <div style={{ marginBottom: 8 }}>
              <button onClick={() => setOpenAccountPick(true)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>🔍 Cari Seç</button>
            </div>

            <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
              <span>Firma</span>
              <input value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
              <span>Ad Soyad</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
              <span>Telefon</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
              <span>GSM</span>
              <input value={gsm} onChange={(e) => setGsm(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
              <span>Açıklama</span>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tarih</span>
                <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Tarih seçiniz" style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Saat</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select value={hour} onChange={(e) => setHour(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={String(i)}>{i}</option>)}
                  </select>
                  <select value={minute} onChange={(e) => setMinute(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                    {Array.from({ length: 60 }).map((_, i) => <option key={i} value={String(i)}>{i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <label style={{ display: 'grid', gap: 4, marginBottom: 16 }}>
              <span>Kullanıcı</span>
              <select value={user} onChange={(e) => setUser(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option>bilsoft</option>
              </select>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>💾 Kaydet</button>
            </div>
          </div>
        </div>
      </section>

      {/* Cari Seç Modal */}
      {openAccountPick && (
        <div onClick={() => setOpenAccountPick(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>
              CARI SEÇ
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
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td style={{ padding: '8px' }}>{a.title}</td>
                      <td style={{ padding: '8px' }}>{a.officer}</td>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => { setCompany(a.title); setOpenAccountPick(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ paddingTop: 8, fontSize: 12, color: '#6b7280' }}>İlk 20 kayıt gözükmektedir. Göremediğiniz kayıtlar için arama yapınız.</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => setOpenAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
*** End Patch


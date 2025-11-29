'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function AgendaPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [start, setStart] = useState('27.10.2022');
  const [end, setEnd] = useState('27.11.2022');
  const [user, setUser] = useState<'Hepsi' | 'Ben' | 'Diğerleri'>('Hepsi');
  const [notif, setNotif] = useState<'Tüm Bildirimler' | 'Okunan' | 'Okunmayan'>('Tüm Bildirimler');

  const rows = [
    { id: 1, fullName: 'Mustafa Bey', company: 'Mustafa Bey', phone: '5452542424', gsm: '5452542424', note: 'İşlemler kontrol edilecek.', dateTime: '03.12.2022 10:30:00' },
    { id: 2, fullName: 'Mustafa Bey', company: 'Mustafa Bey', phone: '5452542424', gsm: '5452542424', note: 'Ödemeler kontrol edilecek.', dateTime: '03.12.2022 10:10:00' },
    { id: 3, fullName: 'Ahmet Bey',   company: 'Mehmet Bey',  phone: '5428909590', gsm: '5428909590', note: 'Tahsilatlar kontrol edilecek.', dateTime: '02.12.2022 10:10:00' },
  ];

  const filteredRows = rows.filter(r =>
    `${r.fullName} ${r.company} ${r.phone} ${r.gsm} ${r.note} ${r.dateTime}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
          <button onClick={() => router.push(('/agenda/new') as Route)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>Yeni Bildirim</button>
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
          {/* Başlık ve filtre alanı - turkuaz bant */}
          <div style={{ background: '#11b5c7', padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Bildirim Listesi</div>

            <div style={{ display: 'grid', gap: 10 }}>
              {/* Arama satırı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px', gap: 8 }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }} />
                <button style={{ borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
              </div>

              {/* Tarih ve seçim alanları */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Başlangıç Tarihi:</span>
                  <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="27.10.2022" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Bitiş Tarihi:</span>
                  <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="27.11.2022" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Kullanıcı</span>
                  <select value={user} onChange={(e) => setUser(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }}>
                    <option>Hepsi</option>
                    <option>Ben</option>
                    <option>Diğerleri</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Bildirimler</span>
                  <select value={notif} onChange={(e) => setNotif(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }}>
                    <option>Tüm Bildirimler</option>
                    <option>Okunan</option>
                    <option>Okunmayan</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>≡ Ara</button>
              </div>
            </div>
          </div>

          {/* Tablo */}
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: 10 }}>
            <div style={{ overflowX: 'auto', background: '#fff', color: '#111827', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}></th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Ad Soyad</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Firma Adı</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Telefon</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Cep Telefonu</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Açıklama</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Tarih / Saat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => router.push((`/agenda/${r.id}`) as Route)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>🔍</button>
                      </td>
                      <td style={{ padding: '8px' }}>{r.id}</td>
                      <td style={{ padding: '8px' }}>{r.fullName}</td>
                      <td style={{ padding: '8px' }}>{r.company}</td>
                      <td style={{ padding: '8px' }}>{r.phone}</td>
                      <td style={{ padding: '8px' }}>{r.gsm}</td>
                      <td style={{ padding: '8px' }}>{r.note}</td>
                      <td style={{ padding: '8px' }}>{r.dateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


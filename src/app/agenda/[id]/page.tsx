'use client';
export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';

export default function AgendaDetailPage({ params }: { params: { id: string } }) {
  // Demo amaçlı sabit veri
  const initial = useMemo(() => ({
    company: 'Mehmet Bey',
    fullName: 'Ahmet Bey',
    phone: '5428909590',
    gsm: '5428909590',
    desc: 'Tahsilatlar kontrol edilecek.',
    date: '02.12.2022',
    hour: '10',
    minute: '10',
    user: 'bilsoft',
    status: 'Tamamlanmadı'
  }), [params.id]);

  const [company, setCompany] = useState(initial.company);
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [gsm, setGsm] = useState(initial.gsm);
  const [desc, setDesc] = useState(initial.desc);
  const [date, setDate] = useState(initial.date);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [user, setUser] = useState(initial.user);
  const [status, setStatus] = useState(initial.status);

  // Notlar alanı
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes((n) => [noteInput.trim(), ...n]);
    setNoteInput('');
  };
  const removeNote = (idx: number) => {
    setNotes((n) => n.filter((_, i) => i !== idx));
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ padding: 12, fontWeight: 700 }}>Yeni Bildirim Ekleme</div>

          <div style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Sol form */}
              <div style={{ background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
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
                    <input value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
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

                <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
                  <span>Kullanıcı</span>
                  <select value={user} onChange={(e) => setUser(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                    <option>bilsoft</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
                  <span>İşlem Durumu</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                    <option>Tamamlanmadı</option>
                    <option>Tamamlandı</option>
                  </select>
                </label>
              </div>

              {/* Sağ Notlar paneli */}
              <div style={{ background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Notlar</span>
                  <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} rows={4} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={addNote} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>➕ Not Ekle</button>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Not</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {notes.length === 0 && <div style={{ fontSize: 12, color: '#6b7280' }}>Henüz not eklenmedi.</div>}
                    {notes.map((n, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}>
                        <div>{n}</div>
                        <button onClick={() => removeNote(i)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>Sil</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>💾 Kaydet</button>
              <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>🗑 Sil</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


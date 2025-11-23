'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function InstallmentsNewPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('22.11.2022');
  const [total, setTotal] = useState('0');
  const [downPayment, setDownPayment] = useState('0');
  const [cash, setCash] = useState('Varsayılan Kasa');
  const [firstInstallment, setFirstInstallment] = useState('22.11.2022');
  const [count, setCount] = useState('2');
  const [period, setPeriod] = useState('(30 GÜN) Aylık');
  const [desc, setDesc] = useState('');

  const [openAccountPick, setOpenAccountPick] = useState(false);
  const [accountQuery, setAccountQuery] = useState('');

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <header style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Yeni Taksit Oluştur</header>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 12, maxWidth: 740 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>ÜNVAN :</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              <button onClick={() => setOpenAccountPick(true)} title="Cari Seç" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
            </div>
          </div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Tarih :</span>
            <input value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Toplam Tutar :</span>
            <input value={total} onChange={(e) => setTotal(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Peşinat Tutarı :</span>
            <input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Kasa Seçimi :</span>
            <select value={cash} onChange={(e) => setCash(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
              <option>Varsayılan Kasa</option>
              <option>Kasa2</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>İlk Taksit Tarihi :</span>
            <input value={firstInstallment} onChange={(e) => setFirstInstallment(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Taksit Sayısı :</span>
            <input value={count} onChange={(e) => setCount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Taksit Periyodu :</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
              <option>(30 GÜN) Aylık</option>
              <option>(7 GÜN) Haftalık</option>
              <option>(15 GÜN) İki Haftada Bir</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Açıklama :</span>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => router.push(('/installments') as Route)} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Kaydet</button>
          </div>
        </div>
      </section>

      {/* Cari Seç Modal */}
      {openAccountPick && (
        <div onClick={() => setOpenAccountPick(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Cari Seç</strong>
              <button onClick={() => setOpenAccountPick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>✖</button>
            </div>
            <div style={{ padding: 12 }}>
              <input value={accountQuery} onChange={(e) => setAccountQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
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
                      { id: '1', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
                      { id: '2', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
                    ];
                    const filtered = all.filter((r) => {
                      const hay = `${r.title} ${r.officer}`.toLowerCase();
                      return hay.includes(accountQuery.toLowerCase());
                    });
                    return filtered.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 10px' }}>{r.title}</td>
                        <td style={{ padding: '8px 10px' }}>{r.officer}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <button onClick={() => { setTitle(r.title); setOpenAccountPick(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Seç</button>
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
    </main>
  );
}



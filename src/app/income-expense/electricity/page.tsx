'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function IncomeExpenseElectricityDetailPage() {
  const router = useRouter();
  const [showTxn, setShowTxn] = useState<null | 'income' | 'expense'>(null);
  const [payType, setPayType] = useState<'Nakit' | 'Havale' | 'Kredi Kartı'>('Nakit');
  const [cash, setCash] = useState('Varsayılan Kasa');
  const [payStatus, setPayStatus] = useState<'Ödendi' | 'Ödenmedi'>('Ödendi');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [docNo, setDocNo] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  // İşlemler menüsü akışları
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectBox, setSelectBox] = useState<null | 'cash' | 'bank'>(null);
  const [pendingPaymentType, setPendingPaymentType] = useState<'Nakit' | 'Havale' | 'Kredi Kartı'>('Nakit');
  const [editRow, setEditRow] = useState<null | { tip: 'GİRİŞ' | 'ÇIKIŞ'; tutar: number; aciklama: string; evrak: string; tarih: string; sekil: 'Nakit' | 'Havale' | 'Kredi Kartı'; durum: 'Ödendi' | 'Ödenmedi' }>(null);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
          {/* Sol toplam kutuları */}
          <div>
            <button onClick={() => setShowTxn('income')} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer', marginBottom: 6 }}>Gelir İşle (+)</button>
            <button onClick={() => setShowTxn('expense')} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer', marginBottom: 6 }}>Gider İşle (-)</button>
            <button onClick={() => router.push('/income-expense/reports/detail')} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer', marginBottom: 10 }}>Gelişmiş Rapor</button>

            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                <span>Giriş</span><strong>450,00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                <span>Çıkış</span><strong>52.000,00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                <span>Bakiye</span><strong>-51.550,00</strong>
              </div>
            </div>
          </div>

          {/* Sağ tablo ve filtreler */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>
              Gelir Gider İşlem Detayı <span style={{ opacity: 0.9 }}>Elektrik</span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 220px auto 40px', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <input type="date" defaultValue="2020-01-01" style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                <input type="date" defaultValue="2025-11-09" style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                <input placeholder="Ara..." style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                <button style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>🔍</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                    <th style={{ padding: '10px 8px' }}>İşlem</th>
                    <th style={{ padding: '10px 8px' }}>Tip</th>
                    <th style={{ padding: '10px 8px' }}>Tutar</th>
                    <th style={{ padding: '10px 8px' }}>Açıklama</th>
                    <th style={{ padding: '10px 8px' }}>Evrak No</th>
                    <th style={{ padding: '10px 8px' }}>Tarih</th>
                    <th style={{ padding: '10px 8px' }}>Ödeme Şekli</th>
                    <th style={{ padding: '10px 8px' }}>Ödeme Durumu</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tip: 'GİRİŞ', tutar: 250, aciklama: '', evrak: '', tarih: '14.11.2022 00:00:00', sekil: 'Nakit', durum: 'Ödendi' },
                    { tip: 'GİRİŞ', tutar: 100, aciklama: '', evrak: '', tarih: '14.11.2022 00:00:00', sekil: 'Havale', durum: 'Ödendi' },
                    { tip: 'ÇIKIŞ', tutar: 52000, aciklama: '', evrak: '', tarih: '03.11.2022 00:00:00', sekil: 'Nakit', durum: 'Ödendi' },
                    { tip: 'GİRİŞ', tutar: 100, aciklama: '', evrak: '123456', tarih: '26.10.2022 00:00:00', sekil: 'Kredi Kartı', durum: 'Ödendi' },
                  ].map((r, i) => (
                    <tr key={i} style={{ color: 'white' }}>
                      <td style={{ padding: 8, position: 'relative' }}>
                        <button onClick={(e) => {
                          const btn = (e.currentTarget as HTMLButtonElement);
                          const open = btn.getAttribute('data-open') === '1';
                          // basit toggle: aynı satıra küçük menü
                          btn.setAttribute('data-open', open ? '0' : '1');
                          const menu = btn.nextElementSibling as HTMLDivElement;
                          if (menu) menu.style.display = open ? 'none' : 'block';
                        }} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>İşlemler ▾</button>
                        <div style={{ position: 'absolute', top: '100%', left: 8, minWidth: 160, background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 14px 35px rgba(0,0,0,0.35)', display: 'none', zIndex: 20 }}>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPendingPaymentType(r.sekil as 'Nakit' | 'Havale' | 'Kredi Kartı'); setShowConfirm(true); (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none'; }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>✎ Öde/Tahsil Et</button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditRow(r); (e.currentTarget.parentElement as HTMLDivElement).style.display = 'none'; }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>✎ Düzenle</button>
                          <button style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>🗑 Sil</button>
                        </div>
                      </td>
                      <td style={{ padding: 8 }}>{r.tip}</td>
                      <td style={{ padding: 8 }}>{r.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: 8 }}>{r.aciklama || '-'}</td>
                      <td style={{ padding: 8 }}>{r.evrak || '-'}</td>
                      <td style={{ padding: 8 }}>{r.tarih}</td>
                      <td style={{ padding: 8 }}>{r.sekil}</td>
                      <td style={{ padding: 8 }}>{r.durum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Yeni Gelir/Gider modalı */}
      {showTxn && (
        <div onClick={() => setShowTxn(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 8, background: '#fff', color: '#111827', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Yeni Gelir / Gider Ekle</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tip:</span>
                <input readOnly value={showTxn === 'income' ? 'GİRİŞ' : 'ÇIKIŞ'} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Ödeme Şekli:</span>
                <select value={payType} onChange={(e) => setPayType(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Nakit</option>
                  <option>Havale</option>
                  <option>Kredi Kartı</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Kasa:</span>
                <select value={cash} onChange={(e) => setCash(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Varsayılan Kasa</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Ödeme Durumu:</span>
                <select value={payStatus} onChange={(e) => setPayStatus(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Ödendi</option>
                  <option>Ödenmedi</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tarih:</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Evrak No:</span>
                <input value={docNo} onChange={(e) => setDocNo(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Açıklama:</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tutar:</span>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowTxn(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button onClick={() => setShowTxn(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* Öde/Tahsil Et — Onay Modalı */}
      {showConfirm && (
        <div onClick={() => setShowConfirm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: '95%', borderRadius: 8, background: '#fff', color: '#111827', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Öde/Tahsil Et</div>
            <div style={{ padding: 12 }}>Bu kaydın durumunu ödendi yapmak istediğinizden emin misiniz?</div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button onClick={() => { setShowConfirm(false); setSelectBox(pendingPaymentType === 'Nakit' ? 'cash' : 'bank'); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Evet</button>
            </div>
          </div>
        </div>
      )}

      {/* Kasa / Banka Seçimi Modalı */}
      {selectBox && (
        <div onClick={() => setSelectBox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 8, background: '#fff', color: '#111827', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>{selectBox === 'cash' ? 'Kasa Seçimi' : 'Banka Seçimi'}</div>
            <div style={{ padding: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>İşlem</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Adı</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Açıklama</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Şube Adı</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 8 }}><button onClick={() => setSelectBox(null)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Seç</button></td>
                    <td style={{ padding: 8 }}>{selectBox === 'cash' ? 'Varsayılan Kasa' : 'Varsayılan Banka'}</td>
                    <td style={{ padding: 8 }}>-</td>
                    <td style={{ padding: 8 }}>Merkez</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectBox(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenle Modalı */}
      {editRow && (
        <div onClick={() => setEditRow(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 8, background: '#fff', color: '#111827', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Gelir / Gider İşlem Düzenle</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tip:</span>
                <input readOnly value={editRow.tip} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Ödeme Şekli:</span>
                <select value={editRow.sekil} onChange={(e) => setEditRow({ ...editRow, sekil: e.target.value as any })} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Nakit</option>
                  <option>Havale</option>
                  <option>Kredi Kartı</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Kasa:</span>
                <select style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Varsayılan Kasa</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Ödeme Durumu:</span>
                <select value={editRow.durum} onChange={(e) => setEditRow({ ...editRow, durum: e.target.value as any })} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Ödendi</option>
                  <option>Ödenmedi</option>
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tarih:</span>
                <input type="date" value={editRow.tarih.slice(0,10)} onChange={(e) => setEditRow({ ...editRow, tarih: `${e.target.value} 00:00:00` })} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Evrak No:</span>
                <input value={editRow.evrak} onChange={(e) => setEditRow({ ...editRow, evrak: e.target.value })} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Açıklama:</span>
                <input value={editRow.aciklama} onChange={(e) => setEditRow({ ...editRow, aciklama: e.target.value })} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Tutar:</span>
                <input value={String(editRow.tutar)} onChange={(e) => setEditRow({ ...editRow, tutar: Number(e.target.value || 0) })} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditRow(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button onClick={() => setEditRow(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Değişiklikleri Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useState } from 'react';

export default function CashListPage() {
  const router = useRouter();
  const [items, setItems] = useState<Array<{ name: string; desc: string; balance: number }>>([
    { name: 'Varsayılan Kasa', desc: '-', balance: 965822.41 },
  ]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [openReports, setOpenReports] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportAllTime, setReportAllTime] = useState(false);
  const [reportStart, setReportStart] = useState('14.11.2022');
  const [reportEnd, setReportEnd] = useState('14.11.2022');

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst araç çubuğu */}
      <header style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button onClick={() => router.push('/cash/new')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+ Ekle</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Raporlar ▾</button>
          {openReports && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 220, background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 14px 35px rgba(0,0,0,0.35)', zIndex: 20 }}>
              <button onClick={() => setShowReport(true)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Kasa Raporu</button>
              <button onClick={() => setShowReport(true)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Kasa Hareket Raporu</button>
            </div>
          )}
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>KASA LİSTESİ</div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>İşlem</th>
                  <th style={{ padding: '10px 8px' }}>Kasa Ad</th>
                  <th style={{ padding: '10px 8px' }}>Açıklama</th>
                  <th style={{ padding: '10px 8px' }}>Bakiye</th>
                  <th style={{ padding: '10px 8px' }}>Düzenle/Sil</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} style={{ color: 'white' }}>
                    <td style={{ padding: '8px' }}>
                      <button onClick={() => { router.push(('/cash/varsayilan') as Route); }} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>➕ Detaya Git</button>
                    </td>
                    <td style={{ padding: '8px' }}>{it.name}</td>
                    <td style={{ padding: '8px' }}>{it.desc}</td>
                    <td style={{ padding: '8px' }}>{it.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px' }}>
                      <button
                        title="Düzenle"
                        onClick={() => { setEditIdx(i); setEditName(it.name); setEditDesc(it.desc); }}
                        style={{ padding: 6, marginRight: 6, borderRadius: 6, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}
                      >✏️</button>
                      <button
                        title="Sil"
                        onClick={() => setDeleteIdx(i)}
                        style={{ padding: 6, borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer' }}
                      >✖</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Yeni Kasa Modal (artık kullanılmıyor; yeni sayfa kullanılacak) */}

      {/* Düzenle Modal */}
      {editIdx !== null && (
        <div onClick={() => setEditIdx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: '95%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Düzenle</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Kasa Adı:</span>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Açıklama:</span>
                <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditIdx(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button
                onClick={() => {
                  if (editIdx === null) return;
                  const next = items.slice();
                  next[editIdx] = { ...next[editIdx], name: editName, desc: editDesc };
                  setItems(next);
                  setEditIdx(null);
                }}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sil Onayı */}
      {deleteIdx !== null && (
        <div onClick={() => setDeleteIdx(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: '95%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Sil</div>
            <div style={{ padding: 12 }}>Bu kasayı silmek istediğinize emin misiniz?</div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setDeleteIdx(null)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button
                onClick={() => {
                  if (deleteIdx === null) return;
                  const next = items.slice();
                  next.splice(deleteIdx, 1);
                  setItems(next);
                  setDeleteIdx(null);
                }}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}
              >
                Sil
              </button>
            </div>
          </div>
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
                  <button onClick={() => { setShowReport(false); router.push(('/cash/reports/balance') as Route); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>≡ Kasa Raporu Getir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

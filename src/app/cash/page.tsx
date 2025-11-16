'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
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

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst araç çubuğu */}
      <header style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button onClick={() => setShowNew(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+ Ekle</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenReports((v) => !v)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Raporlar ▾</button>
          {openReports && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 220, background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 14px 35px rgba(0,0,0,0.35)', zIndex: 20 }}>
              <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Kasa Raporu</button>
              <button style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Kasa Hareket Raporu</button>
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
                      <button onClick={() => { /* Detay sayfası hazır olduğunda rota eklenecek */ }} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>➕ Detaya Git</button>
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

      {/* Yeni Kasa Modal */}
      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: '95%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Yeni Kasa Ekle</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Kasa Adı:</span>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Açıklama:</span>
                <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowNew(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button
                onClick={() => {
                  if (!newName.trim()) return;
                  setItems((prev) => [{ name: newName, desc: newDesc || '-', balance: 0 }, ...prev]);
                  setNewName('');
                  setNewDesc('');
                  setShowNew(false);
                }}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

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
    </main>
  );
}

export const dynamic = 'force-dynamic';

import CashClientPage from './ClientPage';

export default function CashPage() {
  return <CashClientPage />;
}

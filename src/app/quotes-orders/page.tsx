'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

type Row = {
  id: number;
  type: 'VERİLEN TEKLİF' | 'ALINAN TEKLİF' | 'VERİLEN SİPARİŞ' | 'ALINAN SİPARİŞ';
  date: string;
  no: string;
  flow: string; // işlem durumu
  stage: string; // tek/sip durumu
  title: string; // ünvan
  total: number;
  note: string;
};

export default function QuotesOrdersPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'Hepsi' | 'Teklif' | 'Sipariş'>('Hepsi');
  const [menu, setMenu] = useState<{
    id: number;
    left: number;
    top: number;
    // Anchor buton konumu
    anchor?: { left: number; right: number; top: number; bottom: number };
    // Ölçülmüş menü boyutu
    w?: number;
    h?: number;
    caretX?: number;
  } | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportSortType, setReportSortType] = useState<'Tarihe Göre' | 'Ada Göre'>('Tarihe Göre');
  const [reportSortOrder, setReportSortOrder] = useState<'AZ' | 'ZA'>('AZ');
  const [reportListType, setReportListType] = useState<'Hepsi' | 'Teklif' | 'Sipariş'>('Hepsi');

  const rows: Row[] = [
    { id: 1, type: 'VERİLEN TEKLİF', date: '27.11.2022', no: '1', flow: 'Verilen Teklif => Verilen Sipariş', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: 'KDV dahildir' },
    { id: 2, type: 'VERİLEN TEKLİF', date: '22.11.2022', no: '1', flow: 'Verilen Teklif => Alış Siparişi', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: 'KDV dahildir' },
    { id: 3, type: 'VERİLEN SİPARİŞ', date: '28.10.2022', no: '1', flow: 'Verilen Sipariş => ALIŞ FATURASI', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: '' },
    { id: 4, type: 'ALINAN SİPARİŞ', date: '28.10.2022', no: '1', flow: 'Alınan Sipariş => IRSALİYE', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: '' },
    { id: 5, type: 'ALINAN TEKLİF', date: '28.10.2022', no: '1', flow: 'Alınan Teklif => Verilen Sipariş', stage: 'Bekliyor', title: 'Mehmet Bey', total: 0, note: '' },
  ];

  const filtered = useMemo(() => {
    const hay = q.toLowerCase();
    let list = rows.filter(r => `${r.type} ${r.date} ${r.no} ${r.flow} ${r.stage} ${r.title} ${r.note}`.toLowerCase().includes(hay));
    if (filter === 'Teklif') list = list.filter(r => r.type.includes('TEKLİF'));
    if (filter === 'Sipariş') list = list.filter(r => r.type.includes('SİPARİŞ'));
    return list;
  }, [q, filter]);

  // Menü açıkken dışarı tıklayınca kapat
  useEffect(() => {
    const onDown = () => setMenu(null);
    const onScroll = () => setMenu(null);
    const onResize = () => setMenu(null);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Menü boyutu ölçümü ve kesin yerleşim
  const menuRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (!menu || !menu.anchor) return;
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuW = rect.width || 320;
    const menuH = rect.height || 280;
    const anchor = menu.anchor;

    // Varsayılan: butonun altına, sola hizalı
    let left = anchor.left + window.scrollX;
    let top = anchor.bottom + 6 + window.scrollY;

    // Sağdan taşarsa, sağdan sola kaydır
    if (left + menuW > window.scrollX + window.innerWidth - 8) {
      left = Math.max(8 + window.scrollX, anchor.right + window.scrollX - menuW);
    }
    // Alttan taşarsa, butonun üstüne aç
    if (top + menuH > window.scrollY + window.innerHeight - 8) {
      top = Math.max(8 + window.scrollY, anchor.top + window.scrollY - (menuH + 6));
    }
    // Ekran içine sıkıştır
    left = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - menuW - 8));
    top = Math.max(8 + window.scrollY, Math.min(top, window.scrollY + window.innerHeight - menuH - 8));

    // Caret (ok) konumu: butonun solundan itibaren ~16px içeride
    let caretX = (anchor.left + 16 + window.scrollX) - left;
    // menü kenarlarından taşmasın
    caretX = Math.max(14, Math.min(menuW - 14, caretX));

    // Eğer konum veya ölçüler değiştiyse state’i güncelle (sonsuz döngüyü engelle)
    if (menu.left !== left || menu.top !== top || menu.w !== menuW || menu.h !== menuH || menu.caretX !== caretX) {
      setMenu({ ...menu, left, top, w: menuW, h: menuH, caretX });
    }
  }, [menu]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          {/* Sol: liste */}
          <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Teklif Liste</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} style={{ width: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option>Hepsi</option>
                  <option>Teklif</option>
                  <option>Sipariş</option>
                </select>
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: '#12b3c5', color: 'white' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>İŞLEM</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TEK/SİP TÜRÜ</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TARİH</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TEK/SİP NO</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>İŞLEM DURUMU</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>TEK/SİP DURUMU</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>ÜNVAN</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>GENEL TOPLAM</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>AÇIKLAMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const btn = e.currentTarget as HTMLElement;
                              const rect = btn.getBoundingClientRect();
                              // İlk aşamada anchor ile komit et, kesin konumu ölçümden sonra hesaplayacağız
                              setMenu((prev) =>
                                prev && prev.id === r.id
                                  ? null
                                  : {
                                      id: r.id,
                                      left: rect.left,
                                      top: rect.bottom + 6,
                                      anchor: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
                                    }
                              );
                            }}
                            style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}
                          >
                            İŞLEM ▾
                          </button>
                          {menu?.id === r.id && (
                            <div
                              ref={menuRef}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                top: menu.top,
                                left: menu.left,
                                minWidth: 260,
                                maxHeight: 'calc(100vh - 16px)',
                                overflow: 'auto',
                                background: 'white',
                                color: '#111827',
                                border: '1px solid #e5e7eb',
                                borderRadius: 6,
                                boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
                                zIndex: 2000,
                              }}
                            >
                              {/* üstte küçük üçgen ok */}
                              <div style={{
                                position: 'absolute',
                                top: -6,
                                left: (menu.caretX ?? 18) - 6,
                                width: 12,
                                height: 12,
                                background: 'white',
                                borderLeft: '1px solid #e5e7eb',
                                borderTop: '1px solid #e5e7eb',
                                transform: 'rotate(45deg)',
                              }} />
                              {r.type === 'VERİLEN TEKLİF' && (
                                <button onClick={() => { window.location.href = '/quotes-orders/convert/given-to-received-order'; }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Verilen Teklifi Alınan Siparişe Dönüştür</button>
                              )}
                              {r.type === 'ALINAN TEKLİF' && (
                                <button onClick={() => { window.location.href = '/quotes-orders/convert/received-to-given-order'; }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Alınan Teklifi Verilen Siparişe Dönüştür</button>
                              )}
                              {r.type === 'ALINAN SİPARİŞ' && (
                                <button onClick={() => { window.location.href = '/quotes-orders/convert/received-order-to-dispatch'; }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Alınan Siparişi İrsaliyeye Dönüştür</button>
                              )}
                              {r.type === 'VERİLEN SİPARİŞ' && (
                                <button onClick={() => { window.location.href = '/quotes-orders/convert/given-order-to-invoice'; }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>Verilen Siparişi Faturaya Dönüştür</button>
                              )}
                              {(r.type !== 'VERİLEN TEKLİF' && r.type !== 'ALINAN TEKLİF' && r.type !== 'ALINAN SİPARİŞ' && r.type !== 'VERİLEN SİPARİŞ') && (
                                <button disabled style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#9ca3af', cursor: 'not-allowed' }}>Dönüştür</button>
                              )}
                              <div style={{ height: 1, background: '#e5e7eb' }} />
                              <button disabled style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#9ca3af', cursor: 'not-allowed' }}>🔒 Formu Bas</button>
                              <div style={{ height: 1, background: '#e5e7eb' }} />
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', cursor: 'pointer' }}>✏ Düzelt</button>
                              <div style={{ height: 1, background: '#e5e7eb' }} />
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑 Sil</button>
                              <div style={{ height: 1, background: '#e5e7eb' }} />
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer' }}>⛔ İptal Et</button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>{r.type}</td>
                        <td style={{ padding: '8px' }}>{r.date}</td>
                        <td style={{ padding: '8px' }}>{r.no}</td>
                        <td style={{ padding: '8px' }}>{r.flow}</td>
                        <td style={{ padding: '8px' }}>{r.stage}</td>
                        <td style={{ padding: '8px' }}>{r.title}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{r.total.toLocaleString('tr-TR')}</td>
                        <td style={{ padding: '8px' }}>{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sağ menü */}
          <aside style={{ display: 'grid', gap: 12 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.08)', fontWeight: 700 }}>Teklif</div>
              <div style={{ padding: 10, display: 'grid', gap: 8 }}>
                <button onClick={() => { window.location.href = '/quotes-orders/new/given'; }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>➕ Yeni Verilen Teklif</button>
                <button onClick={() => { window.location.href = '/quotes-orders/new/received'; }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>➕ Yeni Alınan Teklif</button>
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.08)', fontWeight: 700 }}>Sipariş</div>
              <div style={{ padding: 10, display: 'grid', gap: 8 }}>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>➕ Yeni Verilen Sipariş</button>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>➕ Yeni Alınan Sipariş</button>
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.08)', fontWeight: 700 }}>Raporlar</div>
              <div style={{ padding: 10 }}>
                <button onClick={() => setShowReport(true)} style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid #d1a054', background: '#d1a054', color: '#1f2937', cursor: 'pointer' }}>🗂 Rapor Al</button>
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
              <div style={{ padding: 10 }}>
                <button style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Açıklama Tanımlama</button>
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
              <div style={{ padding: 10 }}>
                <button style={{ padding: '10px 12px', width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Durum Tanımlama</button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Rapor modalı */}
      {showReport && (
        <div onClick={() => setShowReport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, display: 'grid', gap: 10, color: '#111827' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Teklif Raporu</div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Başlangıç Tarihi</span>
              <input value={reportStart} onChange={(e) => setReportStart(e.target.value)} placeholder="27.11.2022" style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Bitiş Tarihi</span>
              <input value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} placeholder="27.11.2022" style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Sıralama Türü</span>
              <select value={reportSortType} onChange={(e) => setReportSortType(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option>Tarihe Göre</option>
                <option>Ada Göre</option>
              </select>
            </label>

            <div style={{ display: 'grid', gap: 6 }}>
              <span>Sıralama Şekli</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="radio" checked={reportSortOrder === 'AZ'} onChange={() => setReportSortOrder('AZ')} />
                  <span>A-Z</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="radio" checked={reportSortOrder === 'ZA'} onChange={() => setReportSortOrder('ZA')} />
                  <span>Z-A</span>
                </label>
              </div>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Listelemek istediğiniz türü seçiniz.</span>
              <select value={reportListType} onChange={(e) => setReportListType(e.target.value as any)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option>Hepsi</option>
                <option>Teklif</option>
                <option>Sipariş</option>
              </select>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReport(false)} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🗂 Raporla</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



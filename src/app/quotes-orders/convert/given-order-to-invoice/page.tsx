'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useMemo, useState } from 'react';

type Row = {
  id: string;
  name: string;
  vat: number;
  sct: number;
  price: number;
  qty: number;
};

function ConvertInner() {
  const account = useMemo(() => ({
    title: 'Müşteri A.Ş.',
    officer: 'Ayşe Hanım',
    address: 'Merkez',
    taxOffice: 'Kadıköy',
    taxNo: '11122233344',
    city: 'İstanbul',
    district: 'Kadıköy'
  }), []);

  const [rows, setRows] = useState<Row[]>([]);
  const [noteTitle, setNoteTitle] = useState('Fatura Notu');
  const [noteText, setNoteText] = useState('Fiyatlara KDV dahildir.');

  const totals = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.price * r.qty, 0);
    const vat = rows.reduce((s, r) => s + (r.price * r.qty * r.vat) / 100, 0);
    const sct = rows.reduce((s, r) => s + (r.price * r.qty * r.sct) / 100, 0);
    const grand = total + vat + sct;
    return { total, vat, sct, discount: 0, subtotal: total, grand };
  }, [rows]);

  const addProduct = () => {
    const sample: Row = {
      id: String(Date.now()),
      name: 'Buğday Ekmek',
      vat: 18,
      sct: 0,
      price: 2.10,
      qty: 1,
    };
    setRows((r) => [...r, sample]);
  };

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>SATIŞ FATURASI</div>

          {/* Üst bilgiler */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
              gap: 12
            }}
          >
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}><span>Ünvan:</span><input value={account.title} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} /></label>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}><span>Yetkili:</span><input value={account.officer} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} /></label>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}><span>Adres:</span><input value={account.address} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} /></label>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>Vergi Dairesi:</span><input value={account.taxOffice} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>Vergi No:</span><input value={account.taxNo} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr', gap: 6, alignItems: 'center' }}><span>İlçe:</span><input value={account.city} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /><span>İl:</span><input value={account.district} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
              <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>Tarih</span><input value=\"27.11.2022\" readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr', gap: 6, alignItems: 'center' }}>
                <span>Saat</span><input value=\"09:45\" readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
                <span>Fatura No</span><input value=\"SF-001\" readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Barkod + ürün ekle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input placeholder=\"Barkod...\" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff' }} />
            <button onClick={addProduct} style={{ borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>Ürün Ekle</button>
          </div>

          {/* Ürün listesi */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
            <div style={{ padding: 10, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Ad</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Kdv</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Ötv</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Birim Fiyat</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Miktar</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Toplam</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>G.TOPLAM</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const lineTotal = r.price * r.qty;
                    const lineGrand = lineTotal + (lineTotal * r.vat) / 100 + (lineTotal * r.sct) / 100;
                    return (
                      <tr key={r.id}>
                        <td style={{ padding: '8px' }}>{r.name}</td>
                        <td style={{ padding: '8px' }}>{r.vat}</td>
                        <td style={{ padding: '8px' }}>{r.sct}</td>
                        <td style={{ padding: '8px' }}>{r.price.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>{r.qty}</td>
                        <td style={{ padding: '8px' }}>{lineTotal.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>{lineGrand.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>
                          <button style={{ marginRight: 6, padding: '4px 8px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff' }}>Düzenle</button>
                          <button onClick={() => setRows((x) => x.filter((y) => y.id !== r.id))} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff' }}>Sil</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alt iki panel */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
              gap: 12
            }}
          >
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
                <div>Toplam</div><div style={{ textAlign: 'right' }}>{totals.total.toFixed(2)}</div>
                <div>Ara Toplam</div><div style={{ textAlign: 'right' }}>{totals.subtotal.toFixed(2)}</div>
                <div>Kdv Tutar</div><div style={{ textAlign: 'right' }}>{totals.vat.toFixed(2)}</div>
                <div>Ötv Tutar</div><div style={{ textAlign: 'right' }}>{totals.sct.toFixed(2)}</div>
                <div>G.Toplam</div><div style={{ textAlign: 'right' }}>{totals.grand.toFixed(2)}</div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama Başlığı :</span>
                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama</span>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
              </label>
            </div>
          </div>

          {/* Alt dönüştür butonu */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #10b981', background: '#10b981', color: '#fff' }}>Faturaya Dönüştür</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ConvertGivenOrderToInvoicePage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100dvh' }} />}>
      <ConvertInner />
    </Suspense>
  );
}


'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Row = {
  id: string;
  name: string;
  vat: number;
  sct: number;
  price: number;
  qty: number;
};

type AccountInfo = {
  title: string;
  officer: string;
  address: string;
  taxOffice: string;
  taxNo: string;
  city: string;
  district: string;
};

function FormInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const accountId = sp.get('account') || '';

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const [rows, setRows] = useState<Row[]>([]);
  const [noteTitle, setNoteTitle] = useState('KDV2');
  const [noteText, setNoteText] = useState('Fiyatlarımıza KDV dahildir.');
  const [withholding, setWithholding] = useState<'YOK' | '1/2' | '3/10'>('YOK');
  const [orderDate, setOrderDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [shipmentDate, setShipmentDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [orderTime, setOrderTime] = useState<string>('13:50');
  const [orderNo, setOrderNo] = useState<string>('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!accountId) {
        setSaveError('Cari seçilmedi. Lütfen önce cari seçin.');
        return;
      }
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          router.replace(('/login') as Route);
          return;
        }
        const cid = await fetchCurrentCompanyId();
        if (!cid) {
          setSaveError('Şirket bilgisi alınamadı');
          return;
        }
        if (active) setCompanyId(cid);
        const { data, error } = await supabase
          .from('accounts')
          .select('name, contact_name, address, tax_office, tax_id, city, district')
          .eq('id', accountId)
          .single();
        if (!active) return;
        if (error) {
          console.error('Cari bilgisi yüklenemedi (Verilen Teklif):', error);
          setSaveError('Cari bilgisi yüklenemedi');
          return;
        }
        setAccount({
          title: data?.name ?? '',
          officer: (data as any)?.contact_name ?? '',
          address: data?.address ?? '',
          taxOffice: (data as any)?.tax_office ?? '',
          taxNo: (data as any)?.tax_id ?? '',
          city: (data as any)?.city ?? '',
          district: (data as any)?.district ?? '',
        });
      } catch (err) {
        if (!active) return;
        console.error('Cari bilgisi yüklenirken beklenmeyen hata (Verilen Teklif):', err);
        setSaveError('Cari bilgisi yüklenirken hata oluştu');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [accountId, router]);

  const totals = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.price * r.qty, 0);
    const vat = rows.reduce((s, r) => s + (r.price * r.qty * r.vat) / 100, 0);
    const sct = rows.reduce((s, r) => s + (r.price * r.qty * r.sct) / 100, 0);
    const grand = total + vat + sct;
    return { total, vat, sct, discount: 0, subtotal: total, grand };
  }, [rows]);

  const addProduct = () => {
    const row: Row = {
      id: String(Date.now()),
      name: '',
      vat: 18,
      sct: 0,
      price: 0,
      qty: 1,
    };
    setRows((r) => [...r, row]);
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!companyId) {
      setSaveError('Şirket bilgisi alınamadı');
      return;
    }
    if (!accountId) {
      setSaveError('Cari seçilmedi');
      return;
    }
    if (rows.length === 0) {
      setSaveError('En az bir satır eklemelisiniz');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('quotes_orders')
        .insert({
          company_id: companyId,
          account_id: accountId,
          type: 'quote_given',
          status: 'pending',
          quote_order_no: orderNo || null,
          quote_order_date: orderDate,
          valid_until: shipmentDate || null,
          total: totals.total,
          vat_total: totals.vat,
          net_total: totals.grand,
          notes: `${noteTitle ? `${noteTitle}: ` : ''}${noteText || ''}`.trim() || null,
        });
      if (error) throw error;
      router.push(('/quotes-orders') as Route);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Teklif kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 800, color: '#0f172a' }}>VERİLEN TEKLİF</div>

        {/* Üst bilgiler */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
            gap: 12
          }}
        >
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}><span>Ünvan:</span><input value={account?.title ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} /></label>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}><span>Yetkili:</span><input value={account?.officer ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} /></label>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}><span>Adres:</span><input value={account?.address ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }} /></label>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>Vergi Dairesi:</span><input value={account?.taxOffice ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>Vergi No:</span><input value={account?.taxNo ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr', gap: 6, alignItems: 'center' }}><span>İlçe:</span><input value={account?.city ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /><span>İl:</span><input value={account?.district ?? ''} readOnly style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>İşlem Tarihi</span><input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
            <label style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, alignItems: 'center' }}><span>Sevk Tarihi</span><input type="date" value={shipmentDate} onChange={(e) => setShipmentDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr', gap: 6, alignItems: 'center' }}>
              <span>Saat</span><input type="time" value={orderTime} onChange={(e) => setOrderTime(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
              <span>İşlem No</span><input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="Otomatik" style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Barkod + ürün ekle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
          <input placeholder="Barkod..." style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff' }} />
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
                  <th style={{ textAlign: 'left', padding: '8px' }}>İsk.%</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>İsk.TL</th>
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
                      <td style={{ padding: '8px' }}>0.00</td>
                      <td style={{ padding: '8px' }}>0.00</td>
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

        {/* Alt iki panel - sol tutarlar, sağ açıklama/depo */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
            gap: 12
          }}
        >
          {/* Sol tutarlar */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
              <div>Toplam</div><div style={{ textAlign: 'right' }}>{totals.total.toFixed(2)}</div>
              <div>İskonto</div><div style={{ textAlign: 'right' }}>0.00</div>
              <div>Ara Toplam</div><div style={{ textAlign: 'right' }}>{totals.subtotal.toFixed(2)}</div>
              <div>Kdv Tutar</div><div style={{ textAlign: 'right' }}>{totals.vat.toFixed(2)}</div>
              <div>Ötv Tutar</div><div style={{ textAlign: 'right' }}>{totals.sct.toFixed(2)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Tevkifat Oranı
                <select value={withholding} onChange={(e) => setWithholding(e.target.value as any)} style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>YOK</option>
                  <option>1/2</option>
                  <option>3/10</option>
                </select>
              </div>
              <div>G.Toplam</div><div style={{ textAlign: 'right' }}>{totals.grand.toFixed(2)}</div>
            </div>
          </div>

          {/* Sağ açıklama/depo paneli */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Açıklama Seçiniz :</span>
              <select style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option>Seçiniz...</option>
                <option>KDV2</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Açıklama Başlığı :</span>
              <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Açıklama</span>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #10b981', background: '#10b981', color: '#fff' }}>Yeni</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #3b82f6', background: '#3b82f6', color: '#fff' }}>Açıklama Kaydet</button>
            </div>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Depo Seçiniz</span>
              <select style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <option>Merkez</option>
                <option>Şube</option>
              </select>
            </label>
          </div>
        </div>
        </div>

        {/* Hata ve kaydet butonu */}
        {saveError && (
          <div style={{ marginTop: 8, color: '#b91c1c', fontSize: 13 }}>
            {saveError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', opacity: saving || loading ? 0.7 : 1, cursor: 'pointer' }}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function GivenQuoteFormPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100dvh' }} />}>
      <FormInner />
    </Suspense>
  );
}



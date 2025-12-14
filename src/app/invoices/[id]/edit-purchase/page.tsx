'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function EditPurchaseInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [stockMode, setStockMode] = useState<'avg' | 'purchase' | null>('purchase');
  
  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*, accounts(name, tax_id, tax_office, address, phone, email, city, district, contact_name)')
        .eq('id', invoiceId)
        .single();

      if (invoiceData) {
        setInvoice(invoiceData);
        setCompanyName(invoiceData.accounts?.name || '');
        setTaxOffice(invoiceData.accounts?.tax_office || '');
        setTaxNo(invoiceData.accounts?.tax_id || '');
        setAddress(invoiceData.accounts?.address || '');
        setCity(invoiceData.accounts?.city || '');
        setDistrict(invoiceData.accounts?.district || '');
        setEmail(invoiceData.accounts?.email || '');
        setInvoiceDate(invoiceData.invoice_date || new Date().toISOString().slice(0, 10));
        setInvoiceNo(invoiceData.invoice_no || '');
      }

      const { data: itemsData } = await supabase
        .from('invoice_items')
        .select('*, products(name, unit)')
        .eq('invoice_id', invoiceId);

      if (itemsData) {
        setItems(itemsData);
      }
    } catch (error) {
      console.error('Fatura yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyName || !taxNo) {
      alert('Ünvan ve Vergi No alanları zorunludur.');
      return;
    }

    setSaving(true);
    try {
      const companyId = await fetchCurrentCompanyId();
      
      // 1. Cari kontrolü ve oluşturma
      let accountId = invoice.account_id;
      
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('tax_id', taxNo)
        .eq('company_id', companyId)
        .single();

      if (existingAccount) {
        accountId = existingAccount.id;
        // Mevcut cariyi güncelle
        await supabase
          .from('accounts')
          .update({
            name: companyName,
            tax_office: taxOffice,
            address: address,
            city: city,
            district: district,
            email: email,
          })
          .eq('id', accountId);
      } else {
        // Yeni cari oluştur
        const { data: newAccount } = await supabase
          .from('accounts')
          .insert({
            company_id: companyId,
            name: companyName,
            tax_id: taxNo,
            tax_office: taxOffice,
            address: address,
            city: city,
            district: district,
            email: email,
            type: 'supplier',
          })
          .select('id')
          .single();

        if (newAccount) {
          accountId = newAccount.id;
        }
      }

      // 2. Stok kontrolü ve oluşturma/güncelleme
      for (const item of items) {
        if (item.products?.name) {
          const { data: existingProduct } = await supabase
            .from('products')
            .select('id, stock_quantity')
            .eq('name', item.products.name)
            .eq('company_id', companyId)
            .single();

          if (existingProduct) {
            // Stok mevcut - bakiye güncelle
            if (stockMode === 'avg') {
              // Maliyet ortalaması hesapla
              const newStockQty = (existingProduct.stock_quantity || 0) + item.qty;
              await supabase
                .from('products')
                .update({
                  stock_quantity: newStockQty,
                  price: item.unit_price, // Ortalama hesaplama geliştirilebilir
                })
                .eq('id', existingProduct.id);
            } else if (stockMode === 'purchase') {
              // Alış fiyatını güncelle
              await supabase
                .from('products')
                .update({
                  stock_quantity: (existingProduct.stock_quantity || 0) + item.qty,
                  price: item.unit_price,
                })
                .eq('id', existingProduct.id);
            }
          } else {
            // Yeni stok oluştur
            await supabase
              .from('products')
              .insert({
                company_id: companyId,
                name: item.products.name,
                unit: item.products.unit || 'Adet',
                price: item.unit_price,
                vat_rate: item.vat_rate || 18,
                stock_quantity: item.qty,
              });
          }
        }
      }

      // 3. Faturayı alış faturası olarak kaydet
      await supabase
        .from('invoices')
        .update({
          type: 'purchase',
          account_id: accountId,
          invoice_date: invoiceDate,
          invoice_no: invoiceNo,
          status: 'completed',
        })
        .eq('id', invoiceId);

      alert('Alış faturası başarıyla kaydedildi!');
      router.push('/invoices' as Route);
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white', display: 'grid', placeItems: 'center' }}>
        Yükleniyor...
      </main>
    );
  }

  const total = items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const vatTotal = items.reduce((sum, item) => {
    const itemSubtotal = item.qty * item.unit_price;
    return sum + (itemSubtotal * (item.vat_rate || 0) / 100);
  }, 0);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white', padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>ALIŞ FATURASI</h1>

      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {/* Cari Bilgileri */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Ünvan</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Vergi Dairesi</label>
            <input
              value={taxOffice}
              onChange={(e) => setTaxOffice(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Vergi No</label>
            <input
              value={taxNo}
              onChange={(e) => setTaxNo(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>İl</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Adres</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
        </div>

        {/* Fatura Bilgileri */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Fatura Tarihi</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Sevk Tarihi</label>
            <input
              type="date"
              value={invoiceDate}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Saat</label>
            <input
              type="time"
              defaultValue="12:48"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Fatura No</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              />
              <button type="button" style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>+</button>
            </div>
          </div>
        </div>

        {/* Senaryo ve Stok İşleme */}
        <div style={{ marginBottom: 16 }}>
          <select style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white', marginBottom: 8 }}>
            <option value="TICARIFATURA">TICARIFATURA</option>
          </select>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={stockMode === 'avg'} onChange={() => setStockMode('avg')} />
              Maliyet Ortalamasını Stoklara İşle
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={stockMode === 'purchase'} onChange={() => setStockMode('purchase')} />
              Alış Fiyatını Stoklara İşle
            </label>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12 }}>Ad</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12 }}>Kdv</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12 }}>Ötv</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12 }}>Birim Fiyat</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12 }}>Miktar</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12 }}>Toplam</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12 }}>İsk.%</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12 }}>İsk.TL</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12 }}>G.TOPLAM</th>
                <th style={{ padding: '10px 8px', fontSize: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '10px 8px', fontSize: 13 }}>{item.products?.name || '-'}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'center' }}>{item.vat_rate || 0}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'center' }}>0</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'right' }}>{(item.unit_price || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'center' }}>{item.qty || 0}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'right' }}>{((item.qty || 0) * (item.unit_price || 0)).toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'center' }}>0</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'right' }}>0</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{(item.line_total || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', display: 'flex', gap: 4 }}>
                    <button style={{ padding: '4px 8px', borderRadius: 4, background: '#22b8cf', border: 'none', color: 'white', fontSize: 11 }}>Düzenle</button>
                    <button style={{ padding: '4px 8px', borderRadius: 4, background: '#ef4444', border: 'none', color: 'white', fontSize: 11 }}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alt Bilgiler */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <span style={{ fontSize: 13 }}>Toplam</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>{(total - vatTotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <span style={{ fontSize: 13 }}>İskonto</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0.00</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <span style={{ fontSize: 13 }}>Ara Toplam</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>{(total - vatTotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <span style={{ fontSize: 13 }}>Kdv Tutar</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>{vatTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <span style={{ fontSize: 13 }}>Tevkifat Oranı</span>
              <select style={{ padding: '4px', borderRadius: 4, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 12 }}>
                <option value="">YOK</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, paddingTop: 8, borderTop: '2px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>G.Toplam</span>
              <span style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ padding: '12px 40px', borderRadius: 6, background: '#6b7280', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            GERİ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '12px 40px', borderRadius: 6, background: saving ? '#9ca3af' : '#ef4444', border: 'none', color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'KAYDEDILIYOR...' : 'KAYDET'}
          </button>
        </div>
      </div>
    </main>
  );
}


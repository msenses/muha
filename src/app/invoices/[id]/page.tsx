'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      // Fatura bilgilerini yükle
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*, accounts(name, tax_id, tax_office, address, phone, email, city, district, contact_name)')
        .eq('id', invoiceId)
        .single();

      if (invoiceData) {
        setInvoice(invoiceData);
      }

      // Fatura kalemlerini yükle
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

  const handleApprove = async () => {
    if (typeof window !== 'undefined' && window.confirm('Bu taslak faturayı onaya göndermek istediğinizden emin misiniz? Fatura resmileştirilecek ve Giden Faturalar listesine taşınacaktır.')) {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (!error) {
        alert('Fatura başarıyla onaya gönderildi! Artık Giden Faturalar menüsünden takip edebilirsiniz.');
        router.push('/e-fatura' as Route);
      }
    }
  };

  const handlePrintInfo = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleView = () => {
    alert('Fatura önizleme özelliği yakında eklenecek.');
  };

  const handleDownloadPDF = () => {
    alert('PDF indirme özelliği yakında eklenecek.');
  };

  const handleDownloadXML = () => {
    alert('XML indirme özelliği yakında eklenecek.');
  };

  const handleLogs = () => {
    alert('Log kayıtları özelliği yakında eklenecek.');
  };

  const handlePrintReceipt = () => {
    alert('Makbuz yazdırma özelliği yakında eklenecek.');
  };

  const handleSendMail = async () => {
    if (typeof window !== 'undefined' && window.confirm(`Bu fatura ${invoice.accounts?.email || 'cari e-posta adresine'} gönderilecek. Onaylıyor musunuz?`)) {
      alert('Mail gönderme özelliği yakında eklenecek.');
    }
  };

  const handleApproveReceived = async () => {
    if (typeof window !== 'undefined' && window.confirm('Bu gelen faturayı onaylamak istediğinizden emin misiniz?')) {
      const { error } = await supabase
        .from('invoices')
        .update({ approval_status: 'approved' })
        .eq('id', invoiceId);

      if (!error) {
        alert('Fatura başarıyla onaylandı!');
        loadInvoice();
      }
    }
  };

  const handleRejectReceived = async () => {
    if (typeof window !== 'undefined' && window.confirm('Bu gelen faturayı reddetmek istediğinizden emin misiniz?')) {
      const { error } = await supabase
        .from('invoices')
        .update({ approval_status: 'rejected' })
        .eq('id', invoiceId);

      if (!error) {
        alert('Fatura reddedildi!');
        loadInvoice();
      }
    }
  };

  const handleSaveAsPurchase = () => {
    router.push(`/invoices/${invoiceId}/edit-purchase` as Route);
  };

  const handleCancel = async () => {
    if (typeof window !== 'undefined' && window.confirm('Bu faturayı iptal etmek istediğinizden emin misiniz?')) {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'cancelled' })
        .eq('id', invoiceId);

      if (!error) {
        alert('Fatura iptal edildi!');
        router.push('/e-fatura' as Route);
      }
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white', display: 'grid', placeItems: 'center' }}>
        Yükleniyor...
      </main>
    );
  }

  if (!invoice) {
    return (
      <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white', display: 'grid', placeItems: 'center' }}>
        Fatura bulunamadı
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white', padding: 16 }}>
      {/* Üst Butonlar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {invoice.type === 'purchase' ? (
          <>
            {/* Gelen Fatura Butonları */}
            <button onClick={handleDownloadPDF} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>PDF İndir</button>
            <button onClick={handleView} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Görüntüle</button>
            {invoice.e_document_scenario === 'TICARIFATURA' && invoice.approval_status === 'pending' && (
              <>
                <button onClick={handleApproveReceived} style={{ padding: '10px 20px', borderRadius: 6, background: '#10b981', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Onayla</button>
                <button onClick={handleRejectReceived} style={{ padding: '10px 20px', borderRadius: 6, background: '#ef4444', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Reddet</button>
              </>
            )}
            <button onClick={handleSaveAsPurchase} style={{ padding: '10px 20px', borderRadius: 6, background: '#8b5cf6', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Kaydet</button>
          </>
        ) : (
          <>
            {/* Giden Fatura Butonları */}
            <button onClick={handlePrintInfo} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bilgi Fişi</button>
            <button onClick={handleView} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Görüntüle</button>
            <button onClick={handleDownloadPDF} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>PDF İndir</button>
            <button onClick={handleDownloadXML} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>XML İndir</button>
            <button onClick={handleLogs} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Log Kayıtları</button>
            {invoice.status === 'draft' && (
              <button onClick={handleApprove} style={{ padding: '10px 20px', borderRadius: 6, background: '#10b981', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Onaya Gönder</button>
            )}
            <button onClick={handlePrintReceipt} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Makbuz Bas</button>
            <button onClick={handleSendMail} style={{ padding: '10px 20px', borderRadius: 6, background: '#22b8cf', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Mail Gönder</button>
          </>
        )}
      </div>

      {/* FATURA Başlığı */}
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>
        {invoice.type === 'purchase' ? 'ALIŞ FATURASI' : 'SATIŞ FATURASI'}
      </h1>

      {/* İçerik Container */}
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
        {/* Fatura Bilgileri Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Sol Kolon */}
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Fatura No :</span>
              <span style={{ fontSize: 13 }}>{invoice.invoice_no || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Fatura Tarihi :</span>
              <span style={{ fontSize: 13 }}>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('tr-TR') : '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Sevk Tarihi :</span>
              <span style={{ fontSize: 13 }}>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('tr-TR') : '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Firma Ünvan :</span>
              <span style={{ fontSize: 13 }}>{invoice.accounts?.name || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Yetkili :</span>
              <span style={{ fontSize: 13 }}>{invoice.accounts?.contact_name || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'start' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Adres :</span>
              <span style={{ fontSize: 13 }}>{invoice.accounts?.address || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>İl / İlçe :</span>
              <span style={{ fontSize: 13 }}>
                {invoice.accounts?.city || '-'}
                {invoice.accounts?.district ? ` / ${invoice.accounts.district}` : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Vergi D./No :</span>
              <span style={{ fontSize: 13 }}>{invoice.accounts?.tax_office || '-'} / {invoice.accounts?.tax_id || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>E-Mail :</span>
              <span style={{ fontSize: 13 }}>{invoice.accounts?.email || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Ettn No :</span>
              <span style={{ fontSize: 13 }}>{invoice.ettn || '-'}</span>
            </div>
          </div>

          {/* Sağ Kolon */}
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Telefon :</span>
              <span style={{ fontSize: 13 }}>{invoice.accounts?.phone || '-'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Fatura Türü :</span>
              <span style={{ fontSize: 13 }}>{invoice.type === 'purchase' ? 'ALIŞ FATURASI' : 'SATIŞ FATURASI'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Ödeme Şekli :</span>
              <span style={{ fontSize: 13 }}>Açık Hesap</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Fatura Durumu :</span>
              <span style={{ fontSize: 13 }}>
                {invoice.status === 'draft' ? 'Taslak' : invoice.status === 'completed' ? 'Tamamlandı' : invoice.status === 'cancelled' ? 'İptal' : '-'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Kargo Ünvan :</span>
              <span style={{ fontSize: 13 }}>-</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Kargo Vergi No :</span>
              <span style={{ fontSize: 13 }}>-</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Kargo Veriliş Tarihi :</span>
              <span style={{ fontSize: 13 }}>-</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Kargo Ödeme Şekli :</span>
              <span style={{ fontSize: 13 }}>-</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Kargo WEB :</span>
              <span style={{ fontSize: 13 }}>-</span>
            </div>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>KODU</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Ürün Adı</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Miktar</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>B.Fiyat</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Top.Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '10px 8px', fontSize: 13 }}>{item.product_id || '-'}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13 }}>{item.products?.name || '-'}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'center' }}>{item.qty} {item.products?.unit || 'Adet'}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'right' }}>{(item.unit_price || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{(item.line_total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alt Toplam Bilgileri */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Sol - Ek Kesintiler */}
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>G.V. Stopajı :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Mera Fonu :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Borsa Tescil Ücreti :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>SGK Prim Kesintisi :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Toplam Kesinti Tutarı :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
          </div>

          {/* Sağ - Toplam Bilgileri */}
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>İskonto :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Ara Toplam :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>{(invoice.subtotal || invoice.net_total || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Kdv :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>{(invoice.vat_total || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Ötv :</span>
              <span style={{ fontSize: 13, textAlign: 'right' }}>0</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 8, borderTop: '2px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Genel Toplam :</span>
              <span style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{(invoice.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {invoice.type === 'purchase' ? (
            <>
              {/* Gelen Fatura Alt Butonları */}
              {invoice.e_document_scenario === 'TICARIFATURA' && invoice.approval_status === 'pending' && (
                <>
                  <button
                    onClick={handleApproveReceived}
                    style={{
                      padding: '12px 40px',
                      borderRadius: 6,
                      background: '#10b981',
                      border: 'none',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    ONAYLA
                  </button>
                  <button
                    onClick={handleRejectReceived}
                    style={{
                      padding: '12px 40px',
                      borderRadius: 6,
                      background: '#ef4444',
                      border: 'none',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    REDDET
                  </button>
                </>
              )}
              <button
                onClick={handleSaveAsPurchase}
                style={{
                  padding: '12px 40px',
                  borderRadius: 6,
                  background: '#8b5cf6',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                KAYDET
              </button>
            </>
          ) : (
            <>
              {/* Giden Fatura Alt Butonları */}
              {invoice.status === 'draft' && (
                <button
                  onClick={handleApprove}
                  style={{
                    padding: '12px 40px',
                    borderRadius: 6,
                    background: '#10b981',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  ONAYLA
                </button>
              )}
              <button
                onClick={() => router.push(`/invoices/${invoiceId}/edit` as Route)}
                style={{
                  padding: '12px 40px',
                  borderRadius: 6,
                  background: '#22b8cf',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                DÜZENLE
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '12px 40px',
                  borderRadius: 6,
                  background: '#ef4444',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                FATURAYIIPTAL
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}


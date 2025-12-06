'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default function EInvoicePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'drafts' | 'sent' | 'received'>('main');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [sentInvoices, setSentInvoices] = useState<any[]>([]);
  const [receivedInvoices, setReceivedInvoices] = useState<any[]>([]);
  const [showSentSubmenu, setShowSentSubmenu] = useState(false);
  const [showReceivedSubmenu, setShowReceivedSubmenu] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  // Arama filtreleri
  const [searchETTN, setSearchETTN] = useState('');
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchTaxNo, setSearchTaxNo] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchScenario, setSearchScenario] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchInvoiceType, setSearchInvoiceType] = useState('');
  // Giden faturalar için arama
  const [showSentAdvancedSearch, setShowSentAdvancedSearch] = useState(false);
  const [sentSearchETTN, setSentSearchETTN] = useState('');
  const [sentSearchInvoiceNo, setSentSearchInvoiceNo] = useState('');
  const [sentSearchCustomer, setSentSearchCustomer] = useState('');
  const [sentSearchTaxNo, setSentSearchTaxNo] = useState('');
  const [sentSearchStartDate, setSentSearchStartDate] = useState('');
  const [sentSearchEndDate, setSentSearchEndDate] = useState('');
  const [sentSearchScenario, setSentSearchScenario] = useState('');
  const [sentSearchStatus, setSentSearchStatus] = useState('');
  const [sentSearchInvoiceType, setSentSearchInvoiceType] = useState('');

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        router.replace('/login' as Route);
        return;
      }
      setReady(true);
      loadDrafts();
    };
    init();
    return () => {
      active = false;
    };
  }, [router]);

  const loadDrafts = async () => {
    // Taslak faturaları yükle (status='draft' olanlar)
    let query = supabase
      .from('invoices')
      .select('*, accounts(name, tax_id)')
      .eq('status', 'draft');

    // Filtreleri uygula
    if (searchInvoiceNo) {
      query = query.ilike('invoice_no', `%${searchInvoiceNo}%`);
    }
    if (searchCustomer) {
      query = query.ilike('accounts.name', `%${searchCustomer}%`);
    }
    if (searchStartDate) {
      query = query.gte('invoice_date', searchStartDate);
    }
    if (searchEndDate) {
      query = query.lte('invoice_date', searchEndDate);
    }
    if (searchScenario) {
      query = query.eq('e_document_scenario', searchScenario);
    }
    if (searchStatus) {
      query = query.eq('status', searchStatus);
    }
    if (searchInvoiceType) {
      query = query.eq('invoice_kind', searchInvoiceType);
    }

    query = query.order('created_at', { ascending: false });
    
    const { data } = await query;
    setDrafts(data || []);
  };

  const loadSentInvoices = async () => {
    // Giden faturaları yükle (status='sent' veya 'completed' olanlar)
    const { data } = await supabase
      .from('invoices')
      .select('*, accounts(name, tax_id)')
      .in('status', ['sent', 'completed'])
      .eq('type', 'sales')
      .order('created_at', { ascending: false });
    
    setSentInvoices(data || []);
  };

  const loadReceivedInvoices = async () => {
    // Gelen faturaları yükle (type='purchase' olanlar)
    const { data } = await supabase
      .from('invoices')
      .select('*, accounts(name, tax_id)')
      .eq('type', 'purchase')
      .order('created_at', { ascending: false });
    
    setReceivedInvoices(data || []);
  };

  if (!ready) {
    return (
      <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'white' }}>
        Yükleniyor…
      </main>
    );
  }

  const navBtnStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 6,
    background: '#4fd1c5',
    border: '1px solid #38b2ac',
    color: '#0f172a',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
    whiteSpace: 'nowrap',
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst menü (görseldeki buton şeridi) */}
      <section style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={navBtnStyle} onClick={() => router.push('/dashboard' as Route)}>Anasayfa</button>
          <button style={navBtnStyle} onClick={() => setActiveTab('drafts')}>Taslaklar</button>
          <div style={{ position: 'relative' }}>
            <button style={navBtnStyle} onClick={() => setShowSentSubmenu(!showSentSubmenu)}>Giden Faturalar ▾</button>
            {showSentSubmenu && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2c5282', borderRadius: 6, boxShadow: '0 4px 6px rgba(0,0,0,0.2)', zIndex: 10, minWidth: 180 }}>
                <button onClick={() => { setActiveTab('sent'); setShowSentSubmenu(false); loadSentInvoices(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>Fatura Listesi</button>
                <button onClick={() => { setShowSentSubmenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>Gelişmiş Arama</button>
                <button onClick={() => { setShowSentSubmenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>Durum Güncelle</button>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button style={navBtnStyle} onClick={() => setShowReceivedSubmenu(!showReceivedSubmenu)}>Gelen Faturalar ▾</button>
            {showReceivedSubmenu && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2c5282', borderRadius: 6, boxShadow: '0 4px 6px rgba(0,0,0,0.2)', zIndex: 10, minWidth: 180 }}>
                <button onClick={() => { setShowReceivedSubmenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>Oluşmamış Faturalar</button>
                <button onClick={() => { setShowReceivedSubmenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>Onay Bekleyenler</button>
                <button onClick={() => { setActiveTab('received'); setShowReceivedSubmenu(false); loadReceivedInvoices(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>Fatura Listesi</button>
              </div>
            )}
          </div>
          <button style={navBtnStyle} onClick={() => void 0}>Mükellef Kontrol</button>
          <button style={navBtnStyle} onClick={() => void 0}>Ayarlar ▾</button>
          <button style={navBtnStyle} onClick={() => router.push('/accounts?selectFor=sales&eInvoice=1' as Route)}>Fatura Oluştur</button>
          <button style={navBtnStyle} onClick={() => void 0}>Kontör Yükle</button>
        </div>

        {/* Başlık şeridi */}
        <div
          style={{
            marginTop: 12,
            width: '100%',
            background: '#25bcd6',
            color: '#0f172a',
            fontWeight: 800,
            padding: '10px 12px',
            borderRadius: 6,
            letterSpacing: 0.5,
          }}
        >
          E-FATURA
        </div>
      </section>

      {/* İçerik alanı */}
      <section style={{ padding: 16 }}>
        {activeTab === 'sent' ? (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Giden Faturalar Başlığı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 6, height: 24, background: '#22b8cf', borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>GİDEN - FATURA LİSTESİ</h2>
            </div>

            {/* Alt Sekmeler */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setShowSentAdvancedSearch(!showSentAdvancedSearch)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#22b8cf',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Gelişmiş Arama
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#6b7280',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Durum Güncelle
              </button>
            </div>

            {/* Gelişmiş Arama Formu */}
            {showSentAdvancedSearch && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {/* ETTN */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>ETTN:</label>
                    <input
                      type="text"
                      value={sentSearchETTN}
                      onChange={(e) => setSentSearchETTN(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Başlangıç Tarihi */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Başlangıç Tarihi:</label>
                    <input
                      type="date"
                      value={sentSearchStartDate}
                      onChange={(e) => setSentSearchStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Bitiş Tarihi */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Bitiş Tarihi:</label>
                    <input
                      type="date"
                      value={sentSearchEndDate}
                      onChange={(e) => setSentSearchEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* GİB/RES/Fatura NO */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>GİB/RES/Fatura NO:</label>
                    <input
                      type="text"
                      value={sentSearchInvoiceNo}
                      onChange={(e) => setSentSearchInvoiceNo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Senaryo Türü */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Senaryo Türü:</label>
                    <select
                      value={sentSearchScenario}
                      onChange={(e) => setSentSearchScenario(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Hepsi</option>
                      <option value="TEMELFATURA">TEMELFATURA</option>
                      <option value="TICARIFATURA">TICARIFATURA</option>
                      <option value="KAMU">KAMU</option>
                      <option value="EARSIVFATURA">EARSIVFATURA</option>
                    </select>
                  </div>

                  {/* Fatura Durumu */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Fatura Durumu:</label>
                    <select
                      value={sentSearchStatus}
                      onChange={(e) => setSentSearchStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Hepsi</option>
                      <option value="sent">Gönderildi</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="cancelled">İptal</option>
                    </select>
                  </div>

                  {/* Alıcı Ünvan */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Alıcı Ünvan:</label>
                    <input
                      type="text"
                      value={sentSearchCustomer}
                      onChange={(e) => setSentSearchCustomer(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Fatura Tipi */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Fatura Tipi:</label>
                    <select
                      value={sentSearchInvoiceType}
                      onChange={(e) => setSentSearchInvoiceType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Hepsi</option>
                      <option value="SATIS">SATIŞ</option>
                      <option value="IADE">İADE</option>
                      <option value="ISTISNA">İSTİSNA</option>
                      <option value="TEVKIFAT">TEVKİFAT</option>
                      <option value="OZELMATRAH">ÖZELMATRAH</option>
                      <option value="IHRACKAYITLI">İHRACKAYITLI</option>
                    </select>
                  </div>

                  {/* Alıcı VKN/TCKN */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Alıcı VKN/TCKN:</label>
                    <input
                      type="text"
                      value={sentSearchTaxNo}
                      onChange={(e) => setSentSearchTaxNo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                {/* Ara Butonu */}
                <button
                  onClick={() => loadSentInvoices()}
                  style={{
                    marginTop: 16,
                    padding: '10px 40px',
                    borderRadius: 8,
                    background: '#4a5568',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Ara
                </button>
              </div>
            )}

            {/* Giden Faturalar Tablosu */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}></th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Fatura No</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Tarih</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Ünvan</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Toplam</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Kdv</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>G.Toplam</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Durum</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Tip</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Senaryo</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Fatura Tipi</th>
                  </tr>
                </thead>
                <tbody>
                  {sentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding: 32, textAlign: 'center', opacity: 0.7 }}>
                        Giden fatura bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    sentInvoices.map((invoice) => (
                      <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}` as Route)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#22b8cf',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            🔍
                          </button>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>{invoice.invoice_no || '-'}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>
                          {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('tr-TR') : '-'}
                          <br />
                          <span style={{ fontSize: 11, opacity: 0.7 }}>
                            {invoice.created_at ? new Date(invoice.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>{invoice.accounts?.name || '-'}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right' }}>{(invoice.subtotal || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right' }}>{((invoice.total || 0) - (invoice.subtotal || 0)).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{(invoice.total || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            background: invoice.status === 'sent' || invoice.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                            color: invoice.status === 'sent' || invoice.status === 'completed' ? '#10b981' : '#ef4444' 
                          }}>
                            {invoice.status === 'sent' || invoice.status === 'completed' ? 'Onaylandı' : 'Hata'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {invoice.e_document_type === 'EARSIVFATURA' ? 'E-Arşiv' : 'E-Fatura'}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {invoice.e_document_scenario || '-'}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {invoice.invoice_kind || 'SATIŞ'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'received' ? (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Gelen Faturalar Başlığı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 6, height: 24, background: '#22b8cf', borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>GELEN - FATURA LİSTESİ</h2>
            </div>

            {/* Gelişmiş Arama Butonu */}
            <button
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: '#22b8cf',
                border: 'none',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              Gelişmiş Arama
            </button>

            {/* Gelen Faturalar Tablosu */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}></th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Fatura No</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Tarih</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Ünvan</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Toplam</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Kdv</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>G.Toplam</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Durum</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: 32, textAlign: 'center', opacity: 0.7 }}>
                        Gelen fatura bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    receivedInvoices.map((invoice) => (
                      <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}` as Route)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#22b8cf',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            🔍
                          </button>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>{invoice.invoice_no || '-'}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>
                          {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('tr-TR') : '-'}
                          <br />
                          <span style={{ fontSize: 11, opacity: 0.7 }}>
                            {invoice.created_at ? new Date(invoice.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>{invoice.accounts?.name || '-'}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right' }}>{(invoice.subtotal || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right' }}>{((invoice.total || 0) - (invoice.subtotal || 0)).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{(invoice.total || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            background: invoice.approval_status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : invoice.approval_status === 'pending' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                            color: invoice.approval_status === 'approved' ? '#10b981' : invoice.approval_status === 'pending' ? '#fbbf24' : '#ef4444'
                          }}>
                            {invoice.approval_status === 'approved' ? 'Onaylandı' : invoice.approval_status === 'pending' ? 'Onay Bekliyor' : 'Reddedildi'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {invoice.e_document_scenario || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'drafts' ? (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Taslaklar Başlığı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 6, height: 24, background: '#22b8cf', borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>TASLAKLAR</h2>
            </div>

            {/* Gelişmiş Arama Butonu */}
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: '#22b8cf',
                border: 'none',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              Gelişmiş Arama
            </button>

            {/* Gelişmiş Arama Alanları */}
            {showAdvancedSearch && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {/* ETTN */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>ETTN:</label>
                    <input
                      type="text"
                      value={searchETTN}
                      onChange={(e) => setSearchETTN(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Başlangıç Tarihi */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Başlangıç Tarihi:</label>
                    <input
                      type="date"
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Bitiş Tarihi */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Bitiş Tarihi:</label>
                    <input
                      type="date"
                      value={searchEndDate}
                      onChange={(e) => setSearchEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* GİB/RES/Fatura NO */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>GİB/RES/Fatura NO:</label>
                    <input
                      type="text"
                      value={searchInvoiceNo}
                      onChange={(e) => setSearchInvoiceNo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Senaryo Türü */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Senaryo Türü:</label>
                    <select
                      value={searchScenario}
                      onChange={(e) => setSearchScenario(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Hepsi</option>
                      <option value="TEMELFATURA">TEMELFATURA</option>
                      <option value="TICARIFATURA">TICARIFATURA</option>
                      <option value="KAMU">KAMU</option>
                      <option value="EARSIVFATURA">EARSIVFATURA</option>
                    </select>
                  </div>

                  {/* Fatura Durumu */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Fatura Durumu:</label>
                    <select
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Hepsi</option>
                      <option value="draft">Taslak</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                  </div>

                  {/* Alıcı Ünvan */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Alıcı Ünvan:</label>
                    <input
                      type="text"
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Fatura Tipi */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Fatura Tipi:</label>
                    <select
                      value={searchInvoiceType}
                      onChange={(e) => setSearchInvoiceType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Hepsi</option>
                      <option value="SATIS">SATIŞ</option>
                      <option value="IADE">İADE</option>
                      <option value="ISTISNA">İSTİSNA</option>
                      <option value="TEVKIFAT">TEVKİFAT</option>
                      <option value="OZELMATRAH">ÖZELMATRAH</option>
                      <option value="IHRACKAYITLI">İHRACKAYITLI</option>
                    </select>
                  </div>

                  {/* Alıcı VKN/TCKN */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, opacity: 0.85 }}>Alıcı VKN/TCKN:</label>
                    <input
                      type="text"
                      value={searchTaxNo}
                      onChange={(e) => setSearchTaxNo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                {/* Ara Butonu */}
                <button
                  onClick={() => loadDrafts()}
                  style={{
                    marginTop: 16,
                    padding: '10px 40px',
                    borderRadius: 8,
                    background: '#4a5568',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Ara
                </button>
              </div>
            )}

            {/* Taslaklar Tablosu */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}></th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Fatura No</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Tarih</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Ünvan</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Toplam</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Kdv</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>G.Toplam</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Durum</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Tip</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Senaryo</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Fatura Tipi</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding: 32, textAlign: 'center', opacity: 0.7 }}>
                        Taslak fatura bulunmamaktadır.
                      </td>
                    </tr>
                  ) : (
                    drafts.map((draft) => (
                      <tr key={draft.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            onClick={() => router.push(`/invoices/${draft.id}` as Route)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#22b8cf',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            🔍
                          </button>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>{draft.invoice_no || '-'}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>
                          {draft.invoice_date ? new Date(draft.invoice_date).toLocaleDateString('tr-TR') : '-'}
                          <br />
                          <span style={{ fontSize: 11, opacity: 0.7 }}>
                            {draft.created_at ? new Date(draft.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 13 }}>{draft.accounts?.name || '-'}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right' }}>{(draft.subtotal || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right' }}>{((draft.total || 0) - (draft.subtotal || 0)).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{(draft.total || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          <span style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                            Taslak
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {draft.e_document_type === 'EARSIVFATURA' ? 'E-Arşiv' : 'E-Fatura'}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {draft.e_document_scenario || '-'}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12, textAlign: 'center' }}>
                          {draft.invoice_kind || 'SATIŞ'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              minHeight: 240,
            }}
          >
            Bu alan e-Fatura işlemleri için kullanılacaktır.
          </div>
        )}
      </section>
    </main>
  );
}



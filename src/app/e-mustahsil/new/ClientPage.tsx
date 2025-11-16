'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Account = { id: string; name: string };

type Line = { name: string; qty: number; unit_price: number; vat_rate: number; discount_rate: number; discount_amount: number };

export default function EMustahsilNewClientPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [accountId, setAccountId] = useState<string>(typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('account') ?? ''));
  const [accountName, setAccountName] = useState('');
  const [accountContact, setAccountContact] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [shipmentDate, setShipmentDate] = useState(today);
  const [invoiceTime, setInvoiceTime] = useState('09:44');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [isEMustahsil, setIsEMustahsil] = useState(true);

  const [gvStopaj, setGvStopaj] = useState<number>(10);
  const [pastureFund, setPastureFund] = useState<number>(0);
  const [exchangeFee, setExchangeFee] = useState<number>(0);
  const [sgkCut, setSgkCut] = useState<number>(0);

  const [paymentType, setPaymentType] = useState<'Nakit' | 'Havale' | 'Kredi Kartı'>('Nakit');
  const [leftTab, setLeftTab] = useState<'totals' | 'extra'>('totals');

  const barcodeRef = useRef<HTMLInputElement | null>(null);
  const [lines, setLines] = useState<Line[]>([{ name: 'Patates', qty: 1, unit_price: 100, vat_rate: 0, discount_rate: 0, discount_amount: 0 }]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: accs } = await supabase.from('accounts').select('id, name').order('name', { ascending: true }).limit(500);
      setAccounts((accs ?? []) as any);
    };
    init();
  }, [router]);

  useEffect(() => {
    const loadAccount = async () => {
      if (!accountId) return;
      const { data } = await supabase.from('accounts').select('name, email, address').eq('id', accountId).single();
      if (data) {
        setAccountName(data.name ?? '');
        setAccountEmail(data.email ?? '');
        setAccountAddress(data.address ?? '');
      }
    };
    loadAccount();
  }, [accountId]);

  const totals = useMemo(() => {
    let net = 0;
    for (const l of lines) {
      const rawNet = l.qty * l.unit_price;
      const disc = l.discount_amount || (rawNet * (l.discount_rate || 0)) / 100;
      net += Math.max(0, rawNet - disc);
    }
    // Müstahsil kesintileri bilgilendirme amaçlı tutulur; toplamı azaltmaz (görselde G.Toplam 90, net 100 iken %10 stopaj düşülmüş).
    const gtotal = Math.max(0, net - (net * (gvStopaj || 0)) / 100 - (pastureFund || 0) - (exchangeFee || 0) - (sgkCut || 0));
    return { net, gtotal };
  }, [lines, gvStopaj, pastureFund, exchangeFee, sgkCut]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>MÜSTAHSİL</strong>
      </header>
      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Üst bloklar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 420px', gap: 12 }}>
            {/* Cari Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, opacity: 0.95 }}>Cari Bilgileri</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Ünvan</div>
                    {accountId ? (
                      <input value={accountName} onChange={(e) => setAccountName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    ) : (
                      <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                        <option value="">Seçiniz…</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    )}
                  </div>
                  <button type="button" onClick={() => { setAccountId(''); setAccountName(''); }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>{accountId ? 'Değiştir' : 'Cari Seç'}</button>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Yetkili</div>
                  <input value={accountContact} onChange={(e) => setAccountContact(e.target.value)} placeholder="-" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Adres</div>
                  <input value={accountAddress} onChange={(e) => setAccountAddress(e.target.value)} placeholder="Adres" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Mail</div>
                  <input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="mail@example.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Vergi Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, opacity: 0.95 }}>Vergi Bilgileri</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Vergi Dairesi</div>
                  <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} placeholder="Üsküdar" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Vergi No</div>
                  <input value={taxNo} onChange={(e) => setTaxNo(e.target.value)} placeholder="12345678" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İl</div>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Düzce" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İlçe</div>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Merkez" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Fatura Bilgileri (sağ üst) */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Fatura Tarihi</div>
                  <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Sevk Tarihi</div>
                  <input type="date" value={shipmentDate} onChange={(e) => setShipmentDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Saat</div>
                  <input type="time" value={invoiceTime} onChange={(e) => setInvoiceTime(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Fatura No</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="Otomatik" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <button type="button" title="Yeni numara üret" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>+</button>
                  </div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><input type="checkbox" checked={isEMustahsil} onChange={(e) => setIsEMustahsil(e.target.checked)} />E‑Müstahsil Olarak İşle</label>
            </div>
          </div>

          {/* Barkod ve ürün ekle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <input ref={barcodeRef} placeholder="Barkod..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
            <button type="button" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: '#e85b4a', color: 'white' }}>Ürün Ekle</button>
          </div>

          {/* Satır tablosu */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>Ad</th>
                  <th style={{ padding: '10px 8px' }}>Kdv</th>
                  <th style={{ padding: '10px 8px' }}>Ötv</th>
                  <th style={{ padding: '10px 8px' }}>Birim Fiyat</th>
                  <th style={{ padding: '10px 8px' }}>Miktar</th>
                  <th style={{ padding: '10px 8px' }}>Toplam</th>
                  <th style={{ padding: '10px 8px' }}>İsk.%</th>
                  <th style={{ padding: '10px 8px' }}>İsk.TL</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>G.TOPLAM</th>
                  <th style={{ padding: '10px 8px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, idx) => {
                  const rawNet = l.qty * l.unit_price;
                  const disc = l.discount_amount || (rawNet * (l.discount_rate || 0)) / 100;
                  const net = Math.max(0, rawNet - disc);
                  return (
                    <tr key={idx} style={{ color: 'white' }}>
                      <td style={{ padding: '8px' }}>{l.name}</td>
                      <td style={{ padding: '8px' }}>0</td>
                      <td style={{ padding: '8px' }}>0</td>
                      <td style={{ padding: '8px' }}>{l.unit_price.toFixed(2)}</td>
                      <td style={{ padding: '8px' }}>{l.qty}</td>
                      <td style={{ padding: '8px' }}>{net.toFixed(2)}</td>
                      <td style={{ padding: '8px' }}>{l.discount_rate.toFixed(2)}</td>
                      <td style={{ padding: '8px' }}>{l.discount_amount.toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{net.toFixed(2)}</td>
                      <td style={{ padding: '8px' }}>
                        <button type="button" style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Düzenle</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alt bloklar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <button type="button" onClick={() => setLeftTab('totals')} style={{ padding: '10px 12px', border: 'none', background: leftTab === 'totals' ? 'rgba(255,255,255,0.12)' : 'transparent', color: 'white' }}>Tutarlar</button>
                <button type="button" onClick={() => setLeftTab('extra')} style={{ padding: '10px 12px', border: 'none', background: leftTab === 'extra' ? 'rgba(255,255,255,0.12)' : 'transparent', color: 'white' }}>Müstahsil Ek Alan</button>
              </div>
              {leftTab === 'totals' ? (
                <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                    <span>Toplam</span><strong>{totals.net.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                    <span>İskonto</span><strong>0.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                    <span>Ara Toplam</span><strong>{totals.net.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                    <span>Kdv Tutar</span><strong>0.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                    <span>Ötv Tutar</span><strong>0.00</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 0' }}>
                    <span>Tevkifat Oranı</span>
                    <select style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                      <option>YOK</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span>G.Toplam</span><strong>{totals.net.toFixed(2)}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>Müstahsil Ek Alan</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>G.V. Stopajı :</div>
                    <input type="number" step="0.01" value={gvStopaj} onChange={(e) => setGvStopaj(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>{((totals.net * (gvStopaj || 0)) / 100).toFixed(2)} ₺</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>Mera Fonu :</div>
                    <input type="number" step="0.01" value={pastureFund} onChange={(e) => setPastureFund(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>{(pastureFund || 0).toFixed(2)} ₺</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>Borsa Tescil Ücreti :</div>
                    <input type="number" step="0.01" value={exchangeFee} onChange={(e) => setExchangeFee(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>{(exchangeFee || 0).toFixed(2)} ₺</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>SGK Prim Kesintisi :</div>
                    <input type="number" step="0.01" value={sgkCut} onChange={(e) => setSgkCut(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>{(sgkCut || 0).toFixed(2)} ₺</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><span>G.Toplam</span><strong>{totals.gtotal.toFixed(2)}</strong></div>
                </div>
              )}
            </div>

            <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Açıklama</div>
                <textarea rows={3} placeholder="" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ödenen</div>
                  <input placeholder="0.00" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Depo Seçiniz</div>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>Merkez</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ödeme Şekli</div>
                  <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>Nakit</option>
                    <option>Havale</option>
                    <option>Kredi Kartı</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => router.push('/e-mustahsil')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
                <button type="button" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



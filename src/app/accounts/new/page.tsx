'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

export default function AccountNewPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Cari Bilgileri
  const [name, setName] = useState('');
  const [group, setGroup] = useState('MÜŞTERİLER');
  const [authorized, setAuthorized] = useState('');
  const [defaultCash, setDefaultCash] = useState('');

  // Risk Limiti
  const [riskLimit, setRiskLimit] = useState<number | ''>('');
  const [dueDays, setDueDays] = useState<number | ''>('');
  const [riskAction, setRiskAction] = useState<'block' | 'allow' | 'confirm'>('allow');

  // İletişim Bilgileri
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxId, setTaxId] = useState('');
  const [tradeRegistryNo, setTradeRegistryNo] = useState('');

  // Adres Bilgileri
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [showShipping, setShowShipping] = useState(false);
  type ShippingRow = {
    country: string;
    city: string;
    district: string;
    contact: string;
    postalCode: string;
    phone: string;
    mobile: string;
    email: string;
    address: string;
  };
  const [shippingRows, setShippingRows] = useState<ShippingRow[]>([
    { country: '', city: '', district: '', contact: '', postalCode: '', phone: '', mobile: '', email: '', address: '' },
  ]);

  // Diğer
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
    };
    init();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      if (!name.trim()) throw new Error('Ad zorunlu');
      const { error } = await supabase.from('accounts').insert({
        company_id: companyId,
        code: code || null,
        name: name.trim(),
        tax_id: taxId || null,
        tax_office: taxOffice || null,
        contact_name: authorized || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        district: district || null,
        country: country || null,
        // Şimdilik risk ve grup bilgilerini sadece UI'de tutuyoruz;
        // ileride account_groups ve risk limit alanlarına bağlanabilir.
      });
      if (error) throw error;
      router.push('/accounts');
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      {/* Başlık */}
      <div style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700 }}>YENİ CARİ EKLEME</div>
          {/* Form gövdesi */}
          <form onSubmit={submit} style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {/* Cari Bilgileri */}
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontWeight: 600, opacity: 0.95 }}>Cari Bilgileri</div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Hesap/Firma Adı</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Grup</label>
                    <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                      <option>MÜŞTERİLER</option>
                      <option>TEDARİKÇİLER</option>
                      <option>DİĞER</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Yetkili</label>
                    <input value={authorized} onChange={(e) => setAuthorized(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Varsayılan Kasa</label>
                  <select value={defaultCash} onChange={(e) => setDefaultCash(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option value="">Seçiniz</option>
                    <option>Kasa</option>
                    <option>Banka</option>
                  </select>
                </div>

                {/* Risk Limiti */}
                <div style={{ marginTop: 8, fontWeight: 600, opacity: 0.95 }}>Risk Limiti Tanımlama</div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Risk Limit Tutarı</label>
                  <input type="number" value={riskLimit} onChange={(e) => setRiskLimit(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Vade Tarihi (gün)</label>
                  <input type="number" value={dueDays} onChange={(e) => setDueDays(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>Risk Limiti Aşıldığında:</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
                    <input type="radio" checked={riskAction === 'block'} onChange={() => setRiskAction('block')} /> İşlem Yaptırma
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
                    <input type="radio" checked={riskAction === 'allow'} onChange={() => setRiskAction('allow')} /> İşlem Yaptır
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
                    <input type="radio" checked={riskAction === 'confirm'} onChange={() => setRiskAction('confirm')} /> İşlem Esnasında Onay Al
                  </label>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontWeight: 600, opacity: 0.95 }}>İletişim Bilgileri</div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Telefon</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Fax</label>
                  <input value={fax} onChange={(e) => setFax(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Cep Telefonu</label>
                  <input value={mobile} onChange={(e) => setMobile(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>E-Mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Web Adresi</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Posta Kodu</label>
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Vergi Dairesi</label>
                  <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Vergi No</label>
                  <input value={taxId} onChange={(e) => setTaxId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Ticaret Sicil No</label>
                  <input value={tradeRegistryNo} onChange={(e) => setTradeRegistryNo(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontWeight: 600, opacity: 0.95 }}>Adres</div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Ülke</label>
                  <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>İl</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>İlçe</label>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Adres</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Sevk Adresi</label>
                  <input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Cari Kod</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <button type="button" onClick={() => setShowShipping(true)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Sevk Adresi Ekle</button>
                  {!!shippingRows.length && (shippingRows.some(r => r.address || r.city || r.district) || shippingAddress) && (
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>{shippingRows.length} sevk adresi tanımlı</div>
                  )}
                </div>
              </div>
            </div>

            {/* Alt aksiyonlar */}
            {err && <div style={{ color: '#ffb4b4', marginTop: 12 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" onClick={() => router.push('/accounts')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
              <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: '#12b3c5', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Sevk Adresleri Modal */}
      {showShipping && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 2000 }} onClick={() => setShowShipping(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(1100px,96%)', background: 'white', color: '#222', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '10px 14px', background: '#12b3c5', color: 'white', fontWeight: 700 }}>Sevk Adresleri</div>
            <div style={{ padding: 12, background: '#f8f9fb' }}>
              {/* Tablo başlıkları */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.9fr 1fr 1fr 1.2fr 1.6fr 40px', gap: 8, fontSize: 12, fontWeight: 700, color: '#0e3aa3', marginBottom: 6 }}>
                <div>Ülke</div>
                <div>İl</div>
                <div>İlçe</div>
                <div>Yetkili</div>
                <div>Posta Kodu</div>
                <div>Telefon</div>
                <div>Cep Telefon</div>
                <div>Mail</div>
                <div>Sevk Adresi</div>
                <div>Sil</div>
              </div>
              {/* Satırlar */}
              <div style={{ display: 'grid', gap: 8, maxHeight: 360, overflow: 'auto', paddingRight: 4 }}>
                {shippingRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.9fr 1fr 1fr 1.2fr 1.6fr 40px', gap: 8 }}>
                    <input value={row.country} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, country: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.city} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, city: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.district} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, district: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.contact} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, contact: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.postalCode} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, postalCode: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.phone} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, phone: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.mobile} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, mobile: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.email} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, email: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <input value={row.address} onChange={(e) => setShippingRows(prev => prev.map((r,i)=> i===idx ? { ...r, address: e.target.value } : r))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d7de' }} />
                    <button type="button" onClick={() => setShippingRows(prev => prev.filter((_r,i)=> i!==idx))} style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#e74c3c', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Alt aksiyonlar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <button type="button" onClick={() => setShippingRows(prev => [...prev, { country:'', city:'', district:'', contact:'', postalCode:'', phone:'', mobile:'', email:'', address:'' }])} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #2ecc71', background: '#2ecc71', color: 'white', cursor: 'pointer' }}>Ekle</button>
                <button type="button" onClick={() => { setShowShipping(false); if (shippingRows[0]) { setShippingAddress(shippingRows[0].address); } }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #12b3c5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>💾 Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



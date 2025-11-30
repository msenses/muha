'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Account = { id: string; name: string };
type Product = { id: string; name: string; vat_rate: number; price: number; unit: string };

type Line = {
  product_id: string | null;
  name: string;
  qty: number;
  unit_price: number;
  vat_rate: number;     // KDV (%)
  otv_rate: number;     // ÖTV (%)
  discount_rate: number;  // İsk.%
  discount_amount: number; // İsk.TL
};

export default function InvoiceNewClientPage() {
  const router = useRouter();
  const search = useSearchParams();
  const defaultType = search.get('purchase') ? 'purchase' : 'sales';
  const eInvoiceMode = search.get('eInvoice') === '1';

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [type, setType] = useState<'sales' | 'purchase'>(defaultType as any);
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [invoiceNo, setInvoiceNo] = useState('');
  const [accountId, setAccountId] = useState<string>(typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('account') ?? ''));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountName, setAccountName] = useState<string>('');
  const [accountContact, setAccountContact] = useState<string>('');
  const [accountAddress, setAccountAddress] = useState<string>('');
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [taxOffice, setTaxOffice] = useState<string>('');
  const [taxNo, setTaxNo] = useState<string>('');
  const [eDocScenario, setEDocScenario] = useState<'TEMELFATURA' | 'TICARIFATURA' | 'KAMU' | 'EARSIVFATURA'>('TEMELFATURA');
  const [taxpayerKind, setTaxpayerKind] = useState<'efatura' | 'earsiv' | null>(null);
  const [taxWarn, setTaxWarn] = useState<string | null>(null);
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([{
    product_id: null,
    name: '',
    qty: 1,
    unit_price: 0,
    vat_rate: 20,
    otv_rate: 0,
    discount_rate: 0,
    discount_amount: 0,
  }]);
  const [tevkifatRate, setTevkifatRate] = useState<'YOK' | '10/1' | '5/10'>('YOK');
  const [invoiceTab, setInvoiceTab] = useState<'info' | 'extra'>('info');
  const [extraField1, setExtraField1] = useState('');
  const [extraField2, setExtraField2] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [settings, setSettings] = useState({
    defaultAccountId: '' as string | null,
    defaultPayment: 'Nakit',
    openNewAfterSave: false,
    printInvoiceAfterSave: false,
    printReceiptAfterSave: false,
    printInfoSlipAfterSave: false,
    printStockOnSameRow: false,
    fetchLastPrice: false,
    eInvoiceActive: false,
  });
  // Sağ üstteki iki seçenekten yalnızca biri seçili olsun (görseldeki gibi)
  const [stockMode, setStockMode] = useState<'avg' | 'purchase'>('purchase');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const barcodeRef = useRef<HTMLInputElement | null>(null);
  const [paymentType, setPaymentType] = useState<'Nakit' | 'Havale' | 'Kredi Kartı'>('Nakit');
  const bankOptions = [{ id: 'default', name: 'Varsayılan', branch: 'Merkez' }];
  const [selectedBankId, setSelectedBankId] = useState<string>('default');

  // Ürün ekleme paneli (görseldeki satır editörü)
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [draftProductId, setDraftProductId] = useState<string | ''>('');
  const [draftName, setDraftName] = useState('');
  const [draftQty, setDraftQty] = useState<number>(1);
  const [draftUnit, setDraftUnit] = useState<string>('');
  const [draftUnitPrice, setDraftUnitPrice] = useState<number>(0);
  const [draftVatRate, setDraftVatRate] = useState<number>(0);
  const [draftVatIncl, setDraftVatIncl] = useState<'excluded' | 'included'>('excluded');
  const [draftDiscRate, setDraftDiscRate] = useState<number>(0);
  const [draftDiscAmount, setDraftDiscAmount] = useState<number>(0);
  const [draftOtvRate, setDraftOtvRate] = useState<number>(0);
  const [draftOtvIncl, setDraftOtvIncl] = useState<'excluded' | 'included'>('excluded');
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearch, setStockSearch] = useState('');

  // Alt bölüm sekmeleri
  const [bottomTab, setBottomTab] = useState<'totals' | 'mustahsil' | 'bulk'>('totals');
  const [withholding, setWithholding] = useState<number>(0); // G.V. Stopaj
  const [pastureFund, setPastureFund] = useState<number>(0); // Mera Fonu
  const [exchangeFee, setExchangeFee] = useState<number>(0); // Borsa Tescil Ücreti
  const [sgkCut, setSgkCut] = useState<number>(0); // SGK Prim Kesintisi
  const [bulkMode, setBulkMode] = useState<'none' | 'percent_subtotal' | 'percent_total' | 'tl_subtotal' | 'tl_total'>('none');
  const [bulkValue, setBulkValue] = useState<number>(0);

  const draftTotals = useMemo(() => {
    const qty = Number(draftQty || 0);
    let netUnit = Number(draftUnitPrice || 0);
    if (draftVatIncl === 'included' && draftVatRate > 0) netUnit = netUnit / (1 + draftVatRate / 100);
    if (draftOtvIncl === 'included' && draftOtvRate > 0) netUnit = netUnit / (1 + draftOtvRate / 100);
    const grossNet = qty * netUnit;
    const disc = draftDiscAmount || (grossNet * (draftDiscRate || 0)) / 100;
    const netAfterDisc = Math.max(0, grossNet - disc);
    const vat = (netAfterDisc * (draftVatRate || 0)) / 100;
    const otv = (netAfterDisc * (draftOtvRate || 0)) / 100;
    return { net: round2(netAfterDisc), total: round2(netAfterDisc + vat + otv) };
  }, [draftQty, draftUnitPrice, draftVatIncl, draftVatRate, draftOtvIncl, draftOtvRate, draftDiscAmount, draftDiscRate]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
      const [{ data: accs }, { data: prods }] = await Promise.all([
        supabase.from('accounts').select('id, name').order('name', { ascending: true }).limit(500),
        supabase.from('products').select('id, name, vat_rate, price, unit').order('name', { ascending: true }).limit(500),
      ]);
      setAccounts((accs ?? []) as any);
      setProducts((prods ?? []) as any);
    };
    init();
  }, [router]);

  // Seçilen cari için alanları doldur
  useEffect(() => {
    const loadAccount = async () => {
      if (!accountId) return;
      const { data } = await supabase.from('accounts').select('name, email, address, tax_id').eq('id', accountId).single();
      if (data) {
        setAccountName(data.name ?? '');
        setAccountEmail(data.email ?? '');
        setAccountAddress(data.address ?? '');
        setTaxNo(data.tax_id ?? '');
      }
    };
    loadAccount();
  }, [accountId]);

  // E-fatura modunda vergi numarası zorunluluğu ve basit senaryo seçimi
  useEffect(() => {
    if (!eInvoiceMode) {
      setTaxWarn(null);
      setTaxpayerKind(null);
      return;
    }
    if (!taxNo?.trim()) {
      setTaxWarn('E-fatura için vergi numarası zorunludur.');
      setTaxpayerKind(null);
    } else {
      setTaxWarn(null);
      // Basit demo kuralı (entegrasyon eklenince güncellenecek):
      // 10 haneli (VKN) => e-Fatura mükellefi; 11 haneli (TCKN) => e-Arşiv
      const digits = (taxNo ?? '').replace(/\D/g, '');
      const isVKN = digits.length === 10;
      const kind: 'efatura' | 'earsiv' = isVKN ? 'efatura' : 'earsiv';
      setTaxpayerKind(kind);
      setEDocScenario(isVKN ? 'TEMELFATURA' : 'EARSIVFATURA');
    }
  }, [eInvoiceMode, taxNo]);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('saleSettings') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings((s) => ({ ...s, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Cari seçiminden geldiyse form açıldığında barkod alanına odaklan
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 50);
    }
  }, [accountId]);

  const totals = useMemo(() => {
    const sum = lines.reduce((acc, l) => {
      const lineNet = l.qty * l.unit_price;
      const disc = l.discount_amount || (lineNet * (l.discount_rate || 0)) / 100;
      const netAfterDisc = Math.max(0, lineNet - disc);
      const vat = (netAfterDisc * (l.vat_rate || 0)) / 100;
      const otv = (netAfterDisc * (l.otv_rate || 0)) / 100;
      acc.net += netAfterDisc;
      acc.vat += vat;
      acc.otv += otv;
      return acc;
    }, { net: 0, vat: 0, otv: 0 });
    const total = sum.net + sum.vat + sum.otv;
    return { net: round2(sum.net), vat: round2(sum.vat), otv: round2(sum.otv), total: round2(total) };
  }, [lines]);

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, {
    product_id: null, name: '', qty: 1, unit_price: 0, vat_rate: 20, otv_rate: 0, discount_rate: 0, discount_amount: 0,
  }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_l, i) => i !== idx));

  const onProductSelect = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (p) {
      setLine(idx, { product_id: p.id, name: p.name, unit_price: p.price ?? 0, vat_rate: p.vat_rate ?? 0 });
    } else {
      setLine(idx, { product_id: null });
    }
  };
  const onDraftProductPick = (productId: string) => {
    setDraftProductId(productId);
    const p = products.find((x) => x.id === productId);
    if (p) {
      setDraftName(p.name);
      setDraftUnitPrice(Number(p.price ?? 0));
      setDraftVatRate(Number(p.vat_rate ?? 0));
      setDraftUnit(p.unit ?? '');
    }
  };
  const commitDraft = () => {
    setLines((prev) => [...prev, {
      product_id: draftProductId || null,
      name: draftName.trim(),
      qty: Number(draftQty || 0),
      unit_price: (() => {
        let netUnit = Number(draftUnitPrice || 0);
        if (draftVatIncl === 'included' && draftVatRate > 0) netUnit = netUnit / (1 + draftVatRate / 100);
        if (draftOtvIncl === 'included' && draftOtvRate > 0) netUnit = netUnit / (1 + draftOtvRate / 100);
        return round2(netUnit);
      })(),
      vat_rate: Number(draftVatRate || 0),
      otv_rate: Number(draftOtvRate || 0),
      discount_rate: Number(draftDiscRate || 0),
      discount_amount: Number(draftDiscAmount || 0),
    }]);
    // reset
    setDraftProductId('');
    setDraftName('');
    setDraftQty(1);
    setDraftUnit('');
    setDraftUnitPrice(0);
    setDraftVatRate(0);
    setDraftVatIncl('excluded');
    setDraftDiscRate(0);
    setDraftDiscAmount(0);
    setDraftOtvRate(0);
    setDraftOtvIncl('excluded');
    setShowAddPanel(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (eInvoiceMode && !(taxNo?.trim())) {
        throw new Error('E-fatura işlemleri için vergi numarası giriniz.');
      }
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      if (!accountId) throw new Error('Cari seçin');
      if (lines.length === 0) throw new Error('En az bir satır ekleyin');
      const { data: invData, error: invErr } = await supabase
        .from('invoices')
        .insert({
          company_id: companyId,
          account_id: accountId,
          type,
          invoice_no: invoiceNo || null,
          invoice_date: invoiceDate,
          net_total: totals.net,
          vat_total: totals.vat,
          total: totals.total,
        })
        .select('id')
        .single();
      if (invErr) throw invErr;
      const invoiceId = (invData as any).id as string;
      const itemRows = lines.map((l) => ({
        invoice_id: invoiceId,
        product_id: l.product_id,
        qty: l.qty,
        unit_price: l.unit_price,
        vat_rate: l.vat_rate,
        line_total: round2((l.qty * l.unit_price) - (l.discount_amount || 0) + (((l.qty * l.unit_price) - (l.discount_amount || 0)) * (l.vat_rate || 0)) / 100 + (((l.qty * l.unit_price) - (l.discount_amount || 0)) * (l.otv_rate || 0)) / 100),
      }));
      const { error: itemsErr } = await supabase.from('invoice_items').insert(itemRows);
      if (itemsErr) throw itemsErr;
      const moveRows = lines.map((l) => ({
        company_id: companyId,
        product_id: l.product_id!,
        invoice_id: invoiceId,
        move_type: type === 'sales' ? 'out' : 'in',
        qty: l.qty,
      }));
      if (moveRows.every((m) => !!m.product_id)) {
        await supabase.from('stock_movements').insert(moveRows as any);
      }
      // Demo: e-belge senaryosuna göre bilgilendirme
      if (eInvoiceMode) {
        if (taxpayerKind === 'efatura') {
          if (eDocScenario === 'TEMELFATURA') {
            if (typeof window !== 'undefined') window.alert('TEMELFATURA: Düzenlenen e‑fatura alıcıya otomatik onaylı şekilde iletilecektir.');
          } else if (eDocScenario === 'TICARIFATURA') {
            if (typeof window !== 'undefined') window.alert('TICARIFATURA: Fatura alıcının onayına sunuldu. 8 gün içinde onaylanmazsa sistem tarafından otomatik onaylanacaktır.');
          } else if (eDocScenario === 'KAMU') {
            if (typeof window !== 'undefined') window.alert('KAMU: Kamu senaryosu seçildi. İlgili entegrasyon kuralları uygulanacaktır.');
          }
        } else if (taxpayerKind === 'earsiv') {
          if (typeof window !== 'undefined') window.alert('E‑Arşiv: Fatura EARSIVFATURA olarak düzenlenecektir.');
        }
      }
      router.push('/invoices');
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>{type === 'sales' ? 'Satış Faturası' : 'Alış Faturası'}</strong>
      </header>
      <section style={{ padding: 16 }}>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          {/* Üst bloklar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 360px', gap: 12 }}>
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

            {/* Fatura Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setInvoiceTab('info')}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: invoiceTab === 'info' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)', color: 'white' }}
                >
                  Fatura Bilgileri
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceTab('extra')}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: invoiceTab === 'extra' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)', color: 'white' }}
                >
                  Fatura Ek Alanlar
                </button>
                <button type="button" onClick={() => setShowSettings(true)} style={{ marginLeft: 'auto', padding: '8px 10px', borderRadius: 8, border: '1px solid #1e40af', background: '#1e40af', color: 'white' }}>Alış Satış Ayarları</button>
              </div>
              {invoiceTab === 'info' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {eInvoiceMode && (
                    <div style={{ gridColumn: '1 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'end', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>E-Fatura Senaryosu</div>
                        {taxpayerKind === 'efatura' ? (
                          <select value={eDocScenario} onChange={(e) => setEDocScenario(e.target.value as any)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white', fontWeight: 700 }}>
                            <option value="TEMELFATURA">TEMELFATURA</option>
                            <option value="TICARIFATURA">TICARIFATURA</option>
                            <option value="KAMU">KAMU</option>
                          </select>
                        ) : (
                          <input readOnly value="EARSIVFATURA" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white', fontWeight: 700 }} />
                        )}
                      </div>
                      <div style={{ color: taxWarn ? '#ffb4b4' : '#cbd5e1' }}>
                        {taxWarn ?? (taxpayerKind === 'efatura' ? 'E-fatura mükellefi (otomatik iletilir)' : taxpayerKind === 'earsiv' ? 'E-Arşiv mükellefi' : 'Vergi numarası bekleniyor')}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Fatura Tarihi</div>
                    <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Sevk Tarihi</div>
                    <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Saat</div>
                    <input type="time" defaultValue="12:52" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Fatura No</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="Otomatik" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                      <button type="button" title="Yeni numara üret" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>+</button>
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / span 1', display: 'grid', gap: 6, marginTop: 4 }}>
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
              ) : (
                <div style={{ padding: 8, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Özel Alan 1</div>
                    <input value={extraField1} onChange={(e) => setExtraField1(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Özel Alan 2</div>
                    <input value={extraField2} onChange={(e) => setExtraField2(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barkod ve ürün ekle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <input ref={barcodeRef} placeholder="Barkod..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
            <button type="button" onClick={() => setShowAddPanel(true)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: '#e85b4a', color: 'white' }}>Ürün Ekle</button>
          </div>

          {showAddPanel && (
            <div style={{ marginTop: 8, padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.9fr 0.9fr 0.7fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr', gap: 8, alignItems: 'end' }}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Ürün/Hizmet</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Miktar</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Birim</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Birim Fiyat</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Kdv</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Kdv Durumu</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>İskonto (%)</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>İskonto (TL)</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Ötv</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Ötv Durumu</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Toplam</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Genel Toplam</div>

                {/* Ürün */}
                <div>
                  <select value={draftProductId} onChange={(e) => onDraftProductPick(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option value="">—</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Açıklama" style={{ marginTop: 6, width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                {/* Miktar */}
                <input type="number" step="0.001" value={draftQty} onChange={(e) => setDraftQty(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* Birim */}
                <input value={draftUnit} onChange={(e) => setDraftUnit(e.target.value)} placeholder="Birim Seçiniz…" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* Birim Fiyat */}
                <input type="number" step="0.01" value={draftUnitPrice} onChange={(e) => setDraftUnitPrice(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* KDV */}
                <input type="number" step="0.01" value={draftVatRate} onChange={(e) => setDraftVatRate(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* KDV Durumu */}
                <select value={draftVatIncl} onChange={(e) => setDraftVatIncl(e.target.value as any)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="excluded">Kdv Hariç</option>
                  <option value="included">Kdv Dahil</option>
                </select>
                {/* İskonto (%) */}
                <input type="number" step="0.01" value={draftDiscRate} onChange={(e) => setDraftDiscRate(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* İskonto (TL) */}
                <input type="number" step="0.01" value={draftDiscAmount} onChange={(e) => setDraftDiscAmount(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* ÖTV */}
                <input type="number" step="0.01" value={draftOtvRate} onChange={(e) => setDraftOtvRate(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                {/* ÖTV Durumu */}
                <select value={draftOtvIncl} onChange={(e) => setDraftOtvIncl(e.target.value as any)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="excluded">Ötv Hariç</option>
                  <option value="included">Ötv Dahil</option>
                </select>
                {/* Toplam */}
                <input readOnly value={draftTotals.net.toFixed(2)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
                {/* Genel Toplam */}
                <input readOnly value={draftTotals.total.toFixed(2)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button type="button" onClick={() => setShowStockModal(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22b8cf', background: '#22b8cf', color: 'white' }}>Stok Bul</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setShowAddPanel(false)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
                  <button type="button" onClick={commitDraft} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22b8cf', background: '#22b8cf', color: 'white' }}>Ekle</button>
                </div>
              </div>
            </div>
          )}

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
                    const lineTotal = round2(net + (net * (l.vat_rate || 0)) / 100 + (net * (l.otv_rate || 0)) / 100);
                    return (
                      <tr key={idx} style={{ color: 'white' }}>
                        <td style={{ padding: '8px' }}>
                          <input value={l.name} onChange={(e) => setLine(idx, { name: e.target.value })} placeholder="Satır açıklaması" style={{ width: 220, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.vat_rate} onChange={(e) => setLine(idx, { vat_rate: parseFloat(e.target.value) || 0 })} style={{ width: 80, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.otv_rate} onChange={(e) => setLine(idx, { otv_rate: parseFloat(e.target.value) || 0 })} style={{ width: 80, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.unit_price} onChange={(e) => setLine(idx, { unit_price: parseFloat(e.target.value) || 0 })} style={{ width: 120, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.001" value={l.qty} onChange={(e) => setLine(idx, { qty: parseFloat(e.target.value) || 0 })} style={{ width: 100, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>{round2(net).toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.discount_rate} onChange={(e) => setLine(idx, { discount_rate: parseFloat(e.target.value) || 0 })} style={{ width: 80, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.discount_amount} onChange={(e) => setLine(idx, { discount_amount: parseFloat(e.target.value) || 0 })} style={{ width: 100, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{lineTotal.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>
                          <button type="button" onClick={() => removeLine(idx)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Sil</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>

          {/* Stok Bul Modal */}
          {showStockModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1100 }} onClick={() => setShowStockModal(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: 760, maxWidth: '95%', background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
                <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>STOK BUL</div>
                <div style={{ padding: 10 }}>
                  <input value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 10 }} />
                  <div style={{ overflow: 'auto', maxHeight: 380, border: '1px solid #e5e7eb', borderRadius: 6 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', color: '#111827', textAlign: 'left' }}>
                          <th style={{ padding: 8, width: 70 }}>İşlem</th>
                          <th style={{ padding: 8 }}>Ürün Adı</th>
                          <th style={{ padding: 8, width: 120 }}>Stok Kodu</th>
                          <th style={{ padding: 8, width: 120 }}>Barkod</th>
                          <th style={{ padding: 8, width: 120 }}>Satış Fiyatı</th>
                          <th style={{ padding: 8, width: 120 }}>Bakiye</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(products.filter((p) => (p.name ?? '').toLowerCase().includes((stockSearch || '').toLowerCase()))).map((p) => (
                          <tr key={p.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 6 }}>
                              <button type="button" onClick={() => { onDraftProductPick(p.id); setShowStockModal(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #22b8cf', background: '#22b8cf', color: 'white', cursor: 'pointer' }}>Seç</button>
                            </td>
                            <td style={{ padding: 6 }}>{p.name}</td>
                            <td style={{ padding: 6 }}>-</td>
                            <td style={{ padding: 6 }}>-</td>
                            <td style={{ padding: 6 }}>{Number(p.price ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: 6 }}>-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" onClick={() => setShowStockModal(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f3f4f6' }}>Kapat</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alt blok: Tutarlar/Müstahsil/Toplu İskonto + Açıklama/Ödeme */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 0, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'grid' }}>
              {/* Tabs - üst şerit */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <button type="button" onClick={() => setBottomTab('totals')} style={{ padding: '10px 12px', border: 'none', background: bottomTab === 'totals' ? 'rgba(255,255,255,0.12)' : 'transparent', color: 'white', cursor: 'pointer' }}>Tutarlar</button>
                <button type="button" onClick={() => setBottomTab('mustahsil')} style={{ padding: '10px 12px', border: 'none', background: bottomTab === 'mustahsil' ? 'rgba(255,255,255,0.12)' : 'transparent', color: 'white', cursor: 'pointer' }}>Müstahsil Ek Alan</button>
                <div style={{ marginLeft: 'auto', display: 'flex' }}>
                  <button type="button" onClick={() => setBottomTab('bulk')} style={{ padding: '10px 12px', border: 'none', background: bottomTab === 'bulk' ? 'rgba(255,255,255,0.12)' : 'transparent', color: 'white', cursor: 'pointer' }}>Toplu İskonto</button>
                </div>
              </div>

              {bottomTab === 'totals' && (
                <div style={{ display: 'grid', gap: 0, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Toplam</span><strong>{totals.net.toFixed(2)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>İskonto</span><strong>0.00</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Ara Toplam</span><strong>{totals.net.toFixed(2)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Kdv Tutar</span><strong>{totals.vat.toFixed(2)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Ötv Tutar</span><strong>{totals.otv.toFixed(2)}</strong></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span>Tevkifat Oranı</span>
                    <select value={tevkifatRate} onChange={(e) => setTevkifatRate(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                      <option value="YOK">YOK</option>
                      <option value="10/1">10/1</option>
                      <option value="5/10">5/10</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span>G.Toplam</span><strong>{totals.total.toFixed(2)}</strong></div>
                </div>
              )}

              {bottomTab === 'mustahsil' && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>G.V. Stopaj :</div>
                    <input type="number" step="0.01" value={withholding} onChange={(e) => setWithholding(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>0.00 %</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>Mera Fonu :</div>
                    <input type="number" step="0.01" value={pastureFund} onChange={(e) => setPastureFund(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>0.00 %</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>Borsa Tescil Ücreti :</div>
                    <input type="number" step="0.01" value={exchangeFee} onChange={(e) => setExchangeFee(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>0.00 %</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', alignItems: 'center', gap: 8 }}>
                    <div>SGK Prim Kesintisi :</div>
                    <input type="number" step="0.01" value={sgkCut} onChange={(e) => setSgkCut(parseFloat(e.target.value) || 0)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <div style={{ textAlign: 'right', opacity: 0.8 }}>0.00 %</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span>G.Toplam</span>
                    <strong>{totals.total.toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {bottomTab === 'bulk' && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 160px', alignItems: 'center', gap: 8 }}>
                    <div>İskonto:</div>
                    <select value={bulkMode} onChange={(e) => setBulkMode(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                      <option value="none">Seçim Yapınız</option>
                      <option value="percent_subtotal">Yüzde İskonto Ara Toplamdan</option>
                      <option value="percent_total">Yüzde İskonto Genel Toplamdan</option>
                      <option value="tl_subtotal">TL İskonto Ara Toplamdan</option>
                      <option value="tl_total">TL İskonto Genel Toplamdan</option>
                    </select>
                    <input type="number" step="0.01" value={bulkValue} onChange={(e) => setBulkValue(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span>G.Toplam</span>
                    <strong>{totals.total.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Açıklama</div>
                <textarea rows={3} placeholder="Açıklama" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
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
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Kasa Seçiniz</div>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>Varsayılan Kasa</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ödeme Şekli</div>
                  <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option value="Nakit">Nakit</option>
                    <option value="Havale">Havale</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => router.push('/invoices')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
                  <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</button>
                </div>
              </div>

              {paymentType === 'Kredi Kartı' && (
                <div style={{ marginTop: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)', fontWeight: 600, opacity: 0.9 }}>
                    <div>Banka Adı</div>
                    <div>Şubesi</div>
                  </div>
                  <div style={{ display: 'grid' }}>
                    {bankOptions.map((b) => (
                      <label key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="radio" name="bank" checked={selectedBankId === b.id} onChange={() => setSelectedBankId(b.id)} />
                          {b.name}
                        </div>
                        <div>{b.branch}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
        </form>
      </section>

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }} onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '95%', background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Alış Satış Ayarları</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Varsayılan cari seçimi</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                  <input readOnly value={settings.defaultAccountId ? (accounts.find((a) => a.id === settings.defaultAccountId)?.name ?? '') : 'Henüz seçilmiş bir varsayılan cari yok'} style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid #cfd4dc', background: '#fff' }} />
                  <button type="button" onClick={() => setShowAccountPicker((s) => !s)} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #1d4ed8', background: '#1d4ed8', color: '#fff' }}>Cari Bul</button>
                  <button type="button" onClick={() => setSettings((s) => ({ ...s, defaultAccountId: '' }))} style={{ padding: '8px 10px', borderRadius: 4, border: 'none', background: 'transparent', color: '#6b7280' }}>Temizle</button>
                </div>
                {showAccountPicker && (
                  <div style={{ marginTop: 6, border: '1px solid #e5e7eb', borderRadius: 6, maxHeight: 220, overflow: 'auto' }}>
                    {accounts.map((a) => (
                      <button key={a.id} type="button" onClick={() => { setSettings((s) => ({ ...s, defaultAccountId: a.id })); setShowAccountPicker(false); }} style={{ width: '100%', textAlign: 'left', padding: 8, border: 'none', background: 'white', cursor: 'pointer' }}>{a.name}</button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Varsayılan ödeme şekli</div>
                <select value={settings.defaultPayment} onChange={(e) => setSettings((s) => ({ ...s, defaultPayment: e.target.value }))} style={{ width: 260, padding: '8px 10px', borderRadius: 4, border: '1px solid #cfd4dc', background: '#fff' }}>
                  <option value="Nakit">Nakit</option>
                  <option value="Havale">Havale</option>
                  <option value="Kredi Kartı">Kredi Kartı</option>
                </select>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.openNewAfterSave} onChange={(e) => setSettings((s) => ({ ...s, openNewAfterSave: e.target.checked }))} />Kaydettikten sonra yeni satış faturası aç.</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.printInvoiceAfterSave} onChange={(e) => setSettings((s) => ({ ...s, printInvoiceAfterSave: e.target.checked }))} />Kaydettikten sonra fatura yazdır.</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.printReceiptAfterSave} onChange={(e) => setSettings((s) => ({ ...s, printReceiptAfterSave: e.target.checked }))} />Kaydettikten sonra makbuz yazdır.</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.printInfoSlipAfterSave} onChange={(e) => setSettings((s) => ({ ...s, printInfoSlipAfterSave: e.target.checked }))} />Kaydettikten sonra bilgi fişi yazdır.</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.printStockOnSameRow} onChange={(e) => setSettings((s) => ({ ...s, printStockOnSameRow: e.target.checked }))} />Aynı satırda ayrıca stok yazdır.</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.fetchLastPrice} onChange={(e) => setSettings((s) => ({ ...s, fetchLastPrice: e.target.checked }))} />Stok son fiyatı getir</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={settings.eInvoiceActive} onChange={(e) => setSettings((s) => ({ ...s, eInvoiceActive: e.target.checked }))} />EFatura Seçeneği Aktif</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowSettings(false)} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6' }}>Kapat</button>
                <button type="button" onClick={() => { try { localStorage.setItem('saleSettings', JSON.stringify(settings)); } catch {}; setShowSettings(false); }} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Ayarları Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }



'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Account = {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  balance: number;
};

export default function AccountsPage() {
  const router = useRouter();
  const [selectionFor, setSelectionFor] = useState<'sales' | 'purchase' | 'dispatch' | 'dispatch_purchase' | 'sales_return' | 'purchase_return' | 'emustahsil' | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Account[]>([]);
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [scope, setScope] = useState<'all' | 'debt' | 'credit'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalRows, setTotalRows] = useState(0);
  const [showReports, setShowReports] = useState(false);
  const reportsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Sadece istemci tarafında arama parametresini oku
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('selectFor');
      if (p === 'sales' || p === 'purchase' || p === 'dispatch' || p === 'dispatch_purchase' || p === 'sales_return' || p === 'purchase_return' || p === 'emustahsil') {
        setSelectionFor(p);
      } else {
        setSelectionFor(null);
      }
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!reportsRef.current) return;
      if (!reportsRef.current.contains(e.target as Node)) {
        setShowReports(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const query = supabase
        .from('accounts')
        .select('id, code, name, phone, email, balance', { count: 'exact' })
        .order('name', { ascending: true });
      if (q.trim()) {
        // Basit arama: name ilike veya code ilike
        // Supabase'de text search icin or kullanimi
        // Not: filter zinciri OR ile string olarak kurulur
        query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
      }
      if (scope === 'debt') {
        query.gt('balance', 0);
      } else if (scope === 'credit') {
        query.lt('balance', 0);
      }
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      const { data, error, count } = await query.range(start, end);
      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Account[]);
      }
      setTotalRows(count ?? 0);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [q, scope, page, router]);

  // Satırları inceltmek için seçim modunda daha düşük padding kullan
  const selectionMode = !!selectionFor;
  const headPadding = selectionMode ? '8px 8px' : '10px 8px';
  const cellPadding = selectionMode ? '6px 8px' : '8px';

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
          <th style={{ padding: headPadding }}>İşlem</th>
          {!selectionMode && <th style={{ padding: headPadding, width: 40 }}>#</th>}
          <th style={{ padding: headPadding }}>{selectionMode ? 'Ünvan' : 'Cari Adı'}</th>
          <th style={{ padding: headPadding }}>Yetkili</th>
          {!selectionMode && <th style={{ padding: headPadding }}>Sabit Telefon</th>}
          {!selectionMode && <th style={{ padding: headPadding }}>Cep Telefon</th>}
          {!selectionMode && <th style={{ padding: headPadding, textAlign: 'right' }}>Bakiye</th>}
          {!selectionMode && <th style={{ padding: headPadding }}>Düzenle</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => {
          const balance = Number(r.balance ?? 0);
          const isCredit = balance < 0;
          const badgeStyle = {
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: 8,
            color: 'white',
            background: isCredit ? '#e74c3c' : '#1abc9c',
            fontSize: 12,
          } as React.CSSProperties;
          return (
            <tr key={r.id} style={{ color: 'white' }}>
              <td style={{ padding: cellPadding }}>
                <button
                  onClick={() => {
                    if (selectionFor === 'sales') {
                      router.push((`/invoices/new?sales=1&account=${r.id}`) as any);
                    } else if (selectionFor === 'purchase') {
                      router.push((`/invoices/new?purchase=1&account=${r.id}`) as any);
                    } else if (selectionFor === 'dispatch') {
                      router.push((`/dispatch/new?sales=1&account=${r.id}`) as any);
                    } else if (selectionFor === 'dispatch_purchase') {
                      router.push((`/dispatch/new?purchase=1&account=${r.id}`) as any);
                    } else if (selectionFor === 'sales_return') {
                      router.push((`/returns/sales/new?account=${r.id}`) as any);
                    } else if (selectionFor === 'purchase_return') {
                      router.push((`/returns/purchase/new?account=${r.id}`) as any);
                    } else if (selectionFor === 'emustahsil') {
                      router.push((`/e-mustahsil/preview?account=${r.id}`) as any);
                    } else {
                      router.push((`/accounts/${r.id}`) as any);
                    }
                  }}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
                >
                  {selectionMode ? 'Seç' : 'Cariye Git'}
                </button>
              </td>
              {!selectionMode && <td style={{ padding: cellPadding }}>{idx + 1}.</td>}
              <td style={{ padding: cellPadding }}>{r.name}</td>
              <td style={{ padding: cellPadding }}>{'-'}</td>
              {!selectionMode && <td style={{ padding: cellPadding }}>{r.phone ?? '-'}</td>}
              {!selectionMode && <td style={{ padding: cellPadding }}>{'-'}</td>}
              {!selectionMode && (
                <td style={{ padding: cellPadding, textAlign: 'right' }}>
                  <span style={badgeStyle}>{formatMoney(Math.abs(balance))} {isCredit ? '(A)' : ''}</span>
                </td>
              )}
              {!selectionMode && (
                <td style={{ padding: cellPadding }}>
                  <button onClick={() => router.push(`/accounts/${r.id}/edit`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Düzenle</button>
                </td>
              )}
            </tr>
          );
        })}
        {!rows.length && (
          <tr>
            <td colSpan={8} style={{ padding: 16, color: 'white', opacity: 0.8 }}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [rows, router, loading, selectionMode]);

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      {/* Üst Araç Çubuğu */}
      <div style={{ padding: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => router.push('/accounts/new')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: '#e74c3c', color: 'white', cursor: 'pointer' }}>+Yeni Cari</button>
        {!selectionMode && (
          <>
            <button onClick={() => router.push('/accounts/groups')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: '#3498db', color: 'white', cursor: 'pointer' }}>Gruplar</button>
            <div ref={reportsRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowReports((s) => !s)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: '#d4a40c', color: 'white', cursor: 'pointer' }}>Raporlar ▾</button>
              {showReports && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 220, background: 'white', color: '#333', borderRadius: 8, boxShadow: '0 10px 28px rgba(0,0,0,0.25)', padding: 6, zIndex: 1500 }}>
                  <button onClick={() => { setShowReports(false); router.push('/reports?type=cari-ekstre'); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}>≡ Cari Ekstre</button>
                  <button onClick={() => { setShowReports(false); router.push('/reports?type=cari-islem'); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}>≡ Cari İşlem Raporu</button>
                  <button onClick={() => { setShowReports(false); router.push('/reports?type=cari-rapor'); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}>≡ Cari Rapor</button>
                  <button onClick={() => { setShowReports(false); router.push('/reports?type=babs'); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}>≡ BA-BS raporu</button>
                  <button onClick={() => { setShowReports(false); router.push('/reports?type=mutabakat'); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}>≡ Cari Mutabakat Raporu</button>
                </div>
              )}
            </div>
            <button onClick={() => router.push('/cash')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: '#16a085', color: 'white', cursor: 'pointer' }}>Mahsup fişi</button>
          </>
        )}
      </div>

      {/* Cari Listesi Paneli */}
      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>
            {selectionFor === 'sales'
              ? 'SATIŞ YAPILACAK CARİ SEÇİMİ'
              : selectionFor === 'purchase'
              ? 'ALIŞ YAPILACAK CARİ SEÇİMİ'
              : selectionFor === 'dispatch'
              ? 'İRSALİYE YAPILACAK CARİ SEÇİMİ'
              : selectionFor === 'dispatch_purchase'
              ? 'ALIŞ İRSALİYESİ YAPILACAK CARİ SEÇİMİ'
              : selectionFor === 'sales_return'
              ? 'SATIŞ İADE YAPILACAK CARİ SEÇİMİ'
              : selectionFor === 'purchase_return'
              ? 'ALIŞ İADE YAPILACAK CARİ SEÇİMİ'
              : selectionFor === 'emustahsil'
              ? 'E-MÜSTAHSİL CARİ SEÇİMİ'
              : 'CARI LISTESI'}
          </div>

          {/* Filtre/Arama Satırı */}
          <div style={{ display: 'flex', gap: 8, padding: 12, alignItems: 'center' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <button onClick={() => setQ((prev) => prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ara</button>
            <select value={scope} onChange={(e) => setScope(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
              <option value="all">Hepsi</option>
              <option value="debt">Borçlu</option>
              <option value="credit">Alacaklı</option>
            </select>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            {loading ? 'Yükleniyor…' : table}
          </div>

          {/* Sayfalama */}
          <div style={{ padding: '0 12px 12px', display: 'flex', justifyContent: 'center', gap: 6 }}>
            {(() => {
              const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
              const goFirst = () => setPage(1);
              const goPrev = () => setPage((p) => Math.max(1, p - 1));
              const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
              const goLast = () => setPage(totalPages);
              return (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={goFirst} disabled={page <= 1} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>{'«'}</button>
                  <button onClick={goPrev} disabled={page <= 1} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>{'‹'}</button>
                  <span style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: '#1ea7fd', color: 'white' }}>{page}</span>
                  <button onClick={goNext} disabled={page >= totalPages} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>{'›'}</button>
                  <button onClick={goLast} disabled={page >= totalPages} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer' }}>{'»'}</button>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Yeni Cari artık sayfaya taşındı (/accounts/new). Modal kullanılmıyor. */}
    </main>
  );
}

function NewAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
    };
    init();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
        phone: phone || null,
        email: email || null,
        address: address || null,
      });
      if (error) throw error;
      onCreated();
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ width: 560, maxWidth: '92%', padding: 16, borderRadius: 16, background: 'rgba(15,27,73,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong>Yeni Cari</strong>
          <button type="button" onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Kapat</button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Kod</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Ad</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Vergi No/TCKN</label>
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Telefon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Adres</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          </div>
          {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
            <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function formatMoney(n: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return n.toFixed(2);
  }
}



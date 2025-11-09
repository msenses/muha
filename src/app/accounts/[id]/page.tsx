'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Route } from 'next';

type Account = { id: string; name: string; code: string | null; phone: string | null; email: string | null; balance: number | null };
type Inv = { id: string; invoice_no: string | null; invoice_date: string; type: 'sales' | 'purchase'; total: number };

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const accountId = params?.id;
  const [account, setAccount] = useState<Account | null>(null);
  const [rows, setRows] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setErr(null);
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          router.replace('/login');
          return;
        }
        const { data: acc } = await supabase.from('accounts').select('id, name, code, phone, email, balance').eq('id', accountId).single();
        if (!active) return;
        setAccount(acc as any);
        const { data: invs } = await supabase
          .from('invoices')
          .select('id, invoice_no, invoice_date, type, total')
          .eq('account_id', accountId)
          .order('invoice_date', { ascending: true })
          .limit(200);
        if (!active) return;
        setRows((invs ?? []) as any);
      } catch (e: any) {
        if (!active) return;
        setErr(e?.message ?? 'Yüklenemedi');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (accountId) load();
    return () => {
      active = false;
    };
  }, [accountId, router]);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, []);

  const ledger = useMemo(() => {
    let bal = 0;
    return rows.map((r) => {
      const debit = r.type === 'sales' ? Number(r.total ?? 0) : 0;
      const credit = r.type === 'purchase' ? Number(r.total ?? 0) : 0;
      bal += debit - credit;
      return {
        id: r.id,
        date: r.invoice_date,
        no: r.invoice_no ?? '-',
        desc: r.type === 'sales' ? 'Satış Faturası' : 'Alış Faturası',
        debit,
        credit,
        balance: bal,
      };
    });
  }, [rows]);

  const balanceBadge = (n: number) => {
    const isCredit = n < 0;
    return (
      <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, color: 'white', background: isCredit ? '#e74c3c' : '#1abc9c', fontSize: 12 }}>
        {formatMoney(Math.abs(n))} {isCredit ? '(Alacaklı)' : ''}
      </span>
    );
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <div style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Üst bar */}
          <div style={{ display: 'flex', gap: 8, padding: 12, alignItems: 'center', background: 'rgba(255,255,255,0.04)' }}>
            <button onClick={() => router.push((`/reports?type=cari-ekstre&id=${accountId}`) as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: '#d4a40c', color: 'white' }}>Raporlar</button>
            <button onClick={() => router.push((`/accounts/${accountId}/edit`) as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: '#3498db', color: 'white' }}>Düzenle</button>
          </div>

          {/* Bilgiler (sol) + İşlemler (sağ) */}
          <div style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12 }}>
              {/* Sol: Bilgiler ve hızlı raporlar */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, background: 'rgba(0,0,0,0.12)', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 8 }}>
                    <div>Firma Adı :</div>
                    <div>{account?.name ?? '-'}</div>
                    <div>Grup :</div>
                    <div>{'MÜŞTERİLER'}</div>
                    <div>Yetkili :</div>
                    <div>{'-'}</div>
                  </div>
                </div>

                {/* Hızlı rapor butonları */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => router.push((`/reports?type=cari-ekstre&id=${accountId}`) as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>≡ Cari Ekstre</button>
                  <button onClick={() => router.push((`/reports?type=cari-islem&id=${accountId}`) as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>≡ Cari İşlemler Raporu</button>
                  <button onClick={() => alert('Kargo fişi (örnek)')} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>🧾 Kargo Fişi</button>
                  <button onClick={() => router.push((`/reports?type=mutabakat&id=${accountId}`) as Route)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>≡ Cari Mutabakat Raporu</button>
                </div>

                {/* Bakiye */}
                <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                  Bakiye : {balanceBadge(Number(account?.balance ?? 0))}
                </div>
              </div>

              {/* Sağ: Cari işlem butonları */}
              <aside style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                <button onClick={() => router.push((`/invoices/new?sales=1&account=${accountId}`) as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2980b9', background: '#2980b9', color: 'white', cursor: 'pointer' }}>Cariye Stoklu Satış</button>
                <button onClick={() => router.push((`/invoices/new?sales=1&account=${accountId}`) as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #3498db', background: '#3498db', color: 'white', cursor: 'pointer' }}>Cariye Stoksuz Satış</button>
                <button onClick={() => router.push((`/cash?credit=${accountId}`) as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #16a085', background: '#16a085', color: 'white', cursor: 'pointer' }}>Cariden Tahsilat Yap</button>
                <button onClick={() => router.push((`/cash?debit=${accountId}`) as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #27ae60', background: '#27ae60', color: 'white', cursor: 'pointer' }}>Cariye Ödeme Yap</button>
                <button onClick={() => router.push((`/cash?credit=${accountId}`) as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2c3e50', background: '#2c3e50', color: 'white', cursor: 'pointer' }}>Cariyi Alacaklandır</button>
                <button onClick={() => router.push((`/cash?debit=${accountId}`) as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #7f8c8d', background: '#7f8c8d', color: 'white', cursor: 'pointer' }}>Cariye Borçlandır</button>
              </aside>
            </div>
          </div>
        </div>

        {/* Cari İşlemler */}
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', marginTop: 16 }}>
          <div style={{ padding: 12, fontWeight: 700 }}>Cari İşlemler</div>
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '8px' }}>İşlemler</th>
                  <th style={{ padding: '8px' }}>Tarih</th>
                  <th style={{ padding: '8px' }}>Evrak No</th>
                  <th style={{ padding: '8px' }}>Açıklama</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Borç</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Alacak</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r) => (
                  <tr key={r.id} style={{ color: 'white' }}>
                    <td style={{ padding: '8px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((curr) => (curr === r.id ? null : r.id));
                        }}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}
                      >
                        İşlemler ▾
                      </button>
                      {openMenuId === r.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: 6,
                            minWidth: 180,
                            background: 'white',
                            color: '#222',
                            borderRadius: 8,
                            boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                            zIndex: 50,
                            overflow: 'hidden',
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push((`/invoices/${r.id}/edit`) as Route);
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            Faturayı Aç
                          </button>
                          <button
                            onClick={async () => {
                              setOpenMenuId(null);
                              if (!confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
                              try {
                                await supabase.from('invoice_items').delete().eq('invoice_id', r.id);
                                await supabase.from('stock_movements').delete().eq('invoice_id', r.id);
                                const { error } = await supabase.from('invoices').delete().eq('id', r.id);
                                if (error) throw error;
                                setRows((prev) => prev.filter((x) => x.id !== r.id));
                              } catch (e) {
                                alert('Silme başarısız.');
                              }
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c' }}
                          >
                            Faturayı Sil
                          </button>
                          <div style={{ height: 1, background: '#eee' }} />
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push((`/cash?credit=${accountId}`) as Route);
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            Tahsilat Oluştur
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push((`/cash?debit=${accountId}`) as Route);
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            Ödeme Oluştur
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              alert('Yazdır (yakında)');
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            Yazdır/PDF
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>{r.date}</td>
                    <td style={{ padding: '8px' }}>{r.no}</td>
                    <td style={{ padding: '8px' }}>{r.desc}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{r.debit ? formatMoney(r.debit) : '-'}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{r.credit ? formatMoney(r.credit) : '-'}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(r.balance)}</td>
                  </tr>
                ))}
                {!ledger.length && (
                  <tr>
                    <td colSpan={6} style={{ padding: 16, color: 'white', opacity: 0.8 }}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {err && <div style={{ marginTop: 8, color: '#ffb4b4' }}>{err}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}

function formatMoney(n: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return n.toFixed(2);
  }
}



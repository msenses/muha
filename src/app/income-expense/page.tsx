'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
};

export default function IncomeExpensePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReports, setOpenReports] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Yeni kategori formu
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (active) setLoading(false);
          router.replace('/login');
          return;
        }
        const cid = await fetchCurrentCompanyId();
        if (!cid) {
          console.warn('Company ID bulunamadı');
          if (active) setLoading(false);
          return;
        }
        if (active) setCompanyId(cid);
        const query = supabase
          .from('income_expense_categories')
          .select('id, name, type, description')
          .eq('company_id', cid)
          .order('name', { ascending: true });
        if (typeFilter !== 'all') {
          query.eq('type', typeFilter);
        }
        const { data, error } = await query;
        if (!active) return;
        if (error) {
          console.error('Gelir/gider kategorileri yüklenemedi', error);
          setRows([]);
        } else {
          setRows((data ?? []) as unknown as Category[]);
        }
      } catch (err) {
        console.error('Gelir/gider kategorileri yüklenirken hata', err);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [router, typeFilter]);

  const filteredRows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.description ?? ''}`.toLowerCase().includes(t),
    );
  }, [rows, q]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const trimmed = newName.trim();
    if (!trimmed) {
      setSaveError('Kategori adı zorunludur');
      return;
    }
    if (!companyId) {
      setSaveError('Şirket bilgisi alınamadı');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('income_expense_categories')
        .insert({
          company_id: companyId,
          name: trimmed,
          type: newType,
          description: newDesc.trim() || null,
        })
        .select('id, name, type, description')
        .single();
      if (error) throw error;
      const created = data as unknown as Category;
      setRows((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'tr-TR')));
      setNewName('');
      setNewDesc('');
      setNewType('income');
      setShowNew(false);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Kategori kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst araç çubuğu */}
      <header style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button
          onClick={() => setShowNew((v) => !v)}
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}
        >
          {showNew ? 'Yeni Kategoriyi Gizle' : '+ Yeni Kategori'}
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenReports((v) => !v)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Raporlar ▾</button>
          {openReports && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240, background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 14px 35px rgba(0,0,0,0.35)', zIndex: 20 }}>
              <button onClick={() => { setOpenReports(false); router.push('/income-expense/reports/balance'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Gelir Gider Bakiye Raporu</button>
              <button onClick={() => { setOpenReports(false); router.push('/income-expense/reports/detail'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Gelir Gider Detaylı Raporu</button>
            </div>
          )}
        </div>
      </header>

      <section style={{ padding: 16 }}>
        {showNew && (
          <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ padding: '10px 14px', background: '#16a34a', color: 'white', fontWeight: 600 }}>Yeni Gelir/Gider Kategorisi</div>
            <form onSubmit={handleCreateCategory} style={{ padding: 12, display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10, alignItems: 'center' }}>
              <div>Ad :</div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Kira Geliri, Elektrik Gideri..."
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />

              <div>Tip :</div>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'income' | 'expense')}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>

              <div>Açıklama :</div>
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="İsteğe bağlı açıklama"
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />

              <div>{saveError && <span style={{ color: '#fed7d7', fontSize: 12 }}>{saveError}</span>}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNew(false);
                    setSaveError(null);
                  }}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                >
                  Vazgeç
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: 'white', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık + filtreler */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>GELİR GİDER KATEGORİLERİ</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara..."
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.15)', color: 'white' }}
              >
                <option value="all">Hepsi</option>
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>
          </div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>Ad</th>
                  <th style={{ padding: '10px 8px' }}>Tip</th>
                  <th style={{ padding: '10px 8px' }}>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((it) => (
                  <tr key={it.id} style={{ color: 'white' }}>
                    <td style={{ padding: '8px' }}>{it.name}</td>
                    <td style={{ padding: '8px' }}>{it.type === 'income' ? 'Gelir' : 'Gider'}</td>
                    <td style={{ padding: '8px' }}>{it.description || '-'}</td>
                  </tr>
                ))}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Kayıt yok</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Yükleniyor…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}



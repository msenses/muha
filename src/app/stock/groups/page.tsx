'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Group = { id: string; name: string };

export default function StockGroupsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) {
            setError('Şirket bilgisi alınamadı');
            setRows([]);
          }
          return;
        }
        const { data: groups, error: groupsErr } = await supabase
          .from('product_groups')
          .select('id, name')
          .eq('company_id', companyId)
          .order('name', { ascending: true });
        if (!active) return;
        if (groupsErr) {
          console.error('Stok grupları yüklenemedi:', groupsErr);
          setError('Stok grupları yüklenirken hata oluştu');
          setRows([]);
        } else {
          setRows(((groups ?? []) as any[]).map((g) => ({ id: g.id, name: g.name })));
        }
      } catch (e: any) {
        if (!active) return;
        console.error('Stok grupları yüklenirken beklenmeyen hata:', e);
        setError(e?.message ?? 'Beklenmeyen bir hata oluştu');
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const t = q.trim().toLocaleLowerCase('tr-TR');
    if (!t) return rows;
    return rows.filter((g) => g.name.toLocaleLowerCase('tr-TR').includes(t));
  }, [rows, q]);

  const handleDelete = async (row: Group) => {
    if (!window.confirm(`"${row.name}" grubunu silmek istediğinize emin misiniz?`)) return;
    try {
      const { error } = await supabase.from('product_groups').delete().eq('id', row.id);
      if (error) throw error;
      setRows((prev) => prev.filter((g) => g.id !== row.id));
    } catch (e: any) {
      window.alert(e?.message ?? 'Kayıt silinemedi');
    }
  };

  const handleEdit = async (row: Group) => {
    const nextName = window.prompt('Yeni grup adı', row.name)?.trim();
    if (!nextName || nextName === row.name) return;
    try {
      const { error } = await supabase.from('product_groups').update({ name: nextName }).eq('id', row.id);
      if (error) throw error;
      setRows((prev) => prev.map((g) => (g.id === row.id ? { ...g, name: nextName } : g)));
    } catch (e: any) {
      window.alert(e?.message ?? 'Güncelleme başarısız oldu');
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Ana Sayfa / Stok Kartları / Gruplar</div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => router.push(('/stock/groups/new') as Route)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}>
            + Yeni Grup Oluştur
          </button>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            <button onClick={() => setQ((prev) => prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ara</button>
          </div>

          <div style={{ padding: 12 }}>
            {loading && <div style={{ padding: 8, fontSize: 13 }}>Yükleniyor…</div>}
            {error && !loading && <div style={{ padding: 8, fontSize: 13, color: '#ffb4b4' }}>{error}</div>}
            {!loading && !error && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>#</th>
                  <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Grup Adı</th>
                  <th style={{ textAlign: 'right', padding: 10, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, idx) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <td style={{ padding: 10 }}>{idx + 1}</td>
                    <td style={{ padding: 10 }}>{g.name}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>
                        <button
                          title="Düzenle"
                          onClick={() => handleEdit(g)}
                          style={{ marginRight: 6, padding: '6px 8px', borderRadius: 6, border: '1px solid #0aa6b5', background: '#12b3c5', color: 'white', cursor: 'pointer' }}
                        >
                          ✎
                        </button>
                        <button
                          title="Sil"
                          onClick={() => handleDelete(g)}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #c0392b', background: '#e74c3c', color: 'white', cursor: 'pointer' }}
                        >
                          🗑
                        </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>Kayıt bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}



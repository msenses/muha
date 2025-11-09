'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type GroupRow = { id: string; name: string };

export default function AccountGroupsPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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
        const cid = await fetchCurrentCompanyId();
        setCompanyId(cid);
        // account_groups tablosu varsa oku; yoksa graceful degrade
        let base = supabase.from('account_groups').select('id, name').order('name', { ascending: true });
        if (cid) base = base.eq('company_id', cid);
        const { data, error } = await base;
        if (!active) return;
        if (error) {
          // tablo yoksa boş göster
          setRows([]);
        } else {
          setRows((data ?? []) as any);
        }
      } catch (_e) {
        if (!active) return;
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const qq = q.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(qq));
  }, [rows, q]);

  const startEdit = (row: GroupRow) => {
    setEditingId(row.id);
    setEditingName(row.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const name = editingName.trim();
      if (!name) return;
      const { error } = await supabase.from('account_groups').update({ name }).eq('id', editingId);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, name } : r)).sort((a, b) => a.name.localeCompare(b.name)));
      cancelEdit();
    } catch (e: any) {
      setErr(e?.message ?? 'Güncelleme başarısız');
    }
  };
  const removeRow = async (row: GroupRow) => {
    if (!confirm(`"${row.name}" grubu silinsin mi?`)) return;
    try {
      const { error } = await supabase.from('account_groups').delete().eq('id', row.id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e: any) {
      setErr(e?.message ?? 'Silme başarısız');
    }
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <div style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', maxWidth: 880 }}>
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700 }}>CARI GRUPLAR</div>
          <div style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => router.push('/accounts/groups/new')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}>+ Yeni Grup Oluştur</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ width: 240, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              <button onClick={() => setQ((prev) => prev)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ara</button>
            </div>
          </div>

          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>İşlem</th>
                  <th style={{ padding: '10px 8px', width: 40 }}>#</th>
                  <th style={{ padding: '10px 8px' }}>Grup Adı</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r.id} style={{ color: 'white' }}>
                    <td style={{ padding: '8px' }}>
                      {editingId === r.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={saveEdit} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #2ecc71', background: '#2ecc71', color: 'white', cursor: 'pointer' }}>Kaydet</button>
                          <button onClick={cancelEdit} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Vazgeç</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(r)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Yeniden Adlandır</button>
                          <button onClick={() => removeRow(r)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e74c3c', background: 'rgba(231,76,60,0.15)', color: '#ffb4b4', cursor: 'pointer' }}>Sil</button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>{idx + 1}.</td>
                    <td style={{ padding: '8px' }}>
                      {editingId === r.id ? (
                        <input value={editingName} onChange={(e) => setEditingName(e.target.value)} style={{ width: 320, maxWidth: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                      ) : (
                        r.name
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: 'white', opacity: 0.8 }}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td>
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



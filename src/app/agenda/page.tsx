'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type AgendaItem = {
  id: string;
  title: string;
  description: string | null;
  reminder_date: string;
  is_completed: boolean | null;
};

export default function AgendaPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [start, setStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notif, setNotif] = useState<'Tüm Bildirimler' | 'Okunan' | 'Okunmayan'>('Tüm Bildirimler');
  const [rows, setRows] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const companyId = await fetchCurrentCompanyId();
      if (!companyId) {
        console.warn('Company ID bulunamadı');
        setLoading(false);
        return;
      }
      const query = supabase
        .from('agenda_items')
        .select('id, title, description, reminder_date, is_completed')
        .eq('company_id', companyId)
        .order('reminder_date', { ascending: true });
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        console.error('Ajanda kayıtları yüklenemedi', error);
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as AgendaItem[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [router]);

  const filteredRows = useMemo(() => {
    const text = q.trim().toLowerCase();
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    return rows.filter((r) => {
      const hay = `${r.title} ${r.description ?? ''}`.toLowerCase();
      if (text && !hay.includes(text)) return false;
      const d = new Date(r.reminder_date);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      if (notif === 'Okunan' && !r.is_completed) return false;
      if (notif === 'Okunmayan' && r.is_completed) return false;
      return true;
    });
  }, [rows, q, start, end, notif]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <section style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
          <button onClick={() => router.push(('/agenda/new') as Route)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>Yeni Bildirim</button>
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
          {/* Başlık ve filtre alanı - turkuaz bant */}
          <div style={{ background: '#11b5c7', padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Bildirim Listesi</div>

            <div style={{ display: 'grid', gap: 10 }}>
              {/* Arama satırı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px', gap: 8 }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara..." style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }} />
                <button style={{ borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
              </div>

              {/* Tarih ve seçim alanları */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Başlangıç Tarihi:</span>
                  <input value={start} onChange={(e) => setStart(e.target.value)} type="date" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Bitiş Tarihi:</span>
                  <input value={end} onChange={(e) => setEnd(e.target.value)} type="date" style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div />
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, opacity: 0.9 }}>Bildirimler</span>
                  <select value={notif} onChange={(e) => setNotif(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111827' }}>
                    <option>Tüm Bildirimler</option>
                    <option>Okunan</option>
                    <option>Okunmayan</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>≡ Ara</button>
              </div>
            </div>
          </div>

          {/* Tablo */}
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: 10 }}>
            <div style={{ overflowX: 'auto', background: '#fff', color: '#111827', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}></th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Başlık</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Açıklama</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Tarih / Saat</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => (
                    <tr key={r.id}>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => router.push((`/agenda/${r.id}`) as Route)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>🔍</button>
                      </td>
                      <td style={{ padding: '8px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px' }}>{r.title}</td>
                      <td style={{ padding: '8px' }}>{r.description ?? '-'}</td>
                      <td style={{ padding: '8px' }}>{new Date(r.reminder_date).toLocaleString('tr-TR')}</td>
                      <td style={{ padding: '8px' }}>{r.is_completed ? 'Tamamlandı' : 'Bekliyor'}</td>
                    </tr>
                  ))}
                  {!loading && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>Kayıt yok</td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>Yükleniyor…</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

export default function ChequeNoteNewPage() {
  const router = useRouter();

  const [txnDate, setTxnDate] = useState('27.11.2022');
  const [dueDate, setDueDate] = useState('27.11.2022');
  const [amount, setAmount] = useState('0');
  const [number, setNumber] = useState('');
  const [kind, setKind] = useState<'KENDİ EVRAĞIMIZ' | 'MÜŞTERİ ÇEKİ/SENEDİ'>('KENDİ EVRAĞIMIZ');
  const [status, setStatus] = useState<'BEKLEMEDE' | 'ÖDENDİ' | 'TAHSİL EDİLDİ'>('BEKLEMEDE');
  const [note, setNote] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<'ASIL EVRAK' | 'SURET'>('ASIL EVRAK');

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <header style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Çek Ekle</header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Sol panel */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>İşlem Tarihi :</span>
              <input value={txnDate} onChange={(e) => setTxnDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Vade Tarihi :</span>
              <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Tutar :</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Çek/Senet No :</span>
              <input value={number} onChange={(e) => setNumber(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Çek/Senet Türü :</span>
              <select value={kind} onChange={(e) => setKind(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>KENDİ EVRAĞIMIZ</option>
                <option>MÜŞTERİ ÇEKİ/SENEDİ</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Çek/Senet Durumu :</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>BEKLEMEDE</option>
                <option>ÖDENDİ</option>
                <option>TAHSİL EDİLDİ</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Açıklama :</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
          </div>

          {/* Sağ panel */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Banka Adı :</span>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Banka Şubesi :</span>
              <input value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>Hesap No :</span>
              <input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span>ÜNVAN :</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                <button title="Cari Seç" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
              </div>
            </div>
            <label style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
              <span>Evrak Türü :</span>
              <select value={docType} onChange={(e) => setDocType(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>ASIL EVRAK</option>
                <option>SURET</option>
              </select>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => router.push(('/cheque-note') as Route)} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>Kaydet</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



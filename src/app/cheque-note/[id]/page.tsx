'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type ChequeRow = {
  id: string;
  issue_date: string | null;
  due_date: string | null;
  amount: number;
  status: string | null;
  direction: string | null;
  document_no: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  drawer_name: string | null;
  notes: string | null;
  account_name: string | null;
};

type AccountPick = { id: string; title: string; officer: string | null };

export default function ChequeNoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [row, setRow] = useState<ChequeRow | null>(null);
  const [accounts, setAccounts] = useState<AccountPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Düzelt modalı için alanlar
  const [showEdit, setShowEdit] = useState(false);
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAmount, setEditAmount] = useState('0,00');
  const [editDocumentNo, setEditDocumentNo] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankBranch, setEditBankBranch] = useState('');
  const [editDrawerName, setEditDrawerName] = useState('');
  const [editStatus, setEditStatus] = useState<string>('pending');
  const [editNotes, setEditNotes] = useState('');

  // Ödeme için kasa ve banka seçenekleri
  const [cashOptions, setCashOptions] = useState<{ id: string; name: string; balance: number | null }[]>([]);
  const [selectedCashId, setSelectedCashId] = useState<string | null>(null);
  const [bankOptions, setBankOptions] = useState<{ id: string; bank_name: string | null; branch_name: string | null; balance: number | null }[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.replace('/login');
          return;
        }
        const companyId = await fetchCurrentCompanyId();
        if (!companyId) {
          if (active) setError('Şirket bilgisi alınamadı');
          return;
        }
        const [
          { data: ch, error: chErr },
          { data: accs, error: accErr },
          { data: cashData, error: cashErr },
          { data: bankData, error: bankErr },
        ] = await Promise.all([
          supabase
            .from('cheques_notes')
            .select('id, issue_date, due_date, amount, status, direction, document_no, bank_name, bank_branch, drawer_name, notes, accounts ( name )')
            .eq('company_id', companyId)
            .eq('id', params.id)
            .single(),
          supabase
            .from('accounts')
            .select('id, name, contact_name')
            .eq('company_id', companyId)
            .order('name', { ascending: true }),
          supabase
            .from('cash_ledgers')
            .select('id, name, balance')
            .eq('company_id', companyId)
            .order('name', { ascending: true }),
          supabase
            .from('bank_accounts')
            .select('id, bank_name, branch_name, balance')
            .eq('company_id', companyId)
            .order('bank_name', { ascending: true }),
        ]);
        if (!active) return;
        if (chErr) {
          console.error('Çek kaydı bulunamadı:', chErr);
          setError('Kayıt bulunamadı');
        } else if (ch) {
          const accName =
            Array.isArray((ch as any).accounts)
              ? ((ch as any).accounts[0]?.name as string | undefined) ?? null
              : ((ch as any).accounts?.name as string | undefined) ?? null;
          setRow({
            id: ch.id as string,
            issue_date: ch.issue_date ?? null,
            due_date: ch.due_date ?? null,
            amount: Number(ch.amount ?? 0),
            status: ch.status ?? null,
            direction: ch.direction ?? null,
            document_no: ch.document_no ?? null,
            bank_name: ch.bank_name ?? null,
            bank_branch: ch.bank_branch ?? null,
            drawer_name: ch.drawer_name ?? null,
            notes: ch.notes ?? null,
            account_name: accName,
          });
        }
        if (accErr) {
          console.error('Cari listesi yüklenemedi:', accErr);
          setAccounts([]);
        } else {
          setAccounts(
            ((accs ?? []) as any[]).map((a) => ({
              id: a.id as string,
              title: a.name as string,
              officer: (a.contact_name as string) ?? null,
            })),
          );
        }

        if (cashErr) {
          console.error('Kasa listesi yüklenemedi:', cashErr);
        } else if (cashData) {
          const typed =
            (cashData as any[]).map((c) => ({
              id: c.id as string,
              name: String(c.name ?? ''),
              balance: typeof c.balance === 'number' ? (c.balance as number) : Number(c.balance ?? 0),
            })) ?? [];
          setCashOptions(typed);
          if (!selectedCashId && typed.length > 0) {
            setSelectedCashId(typed[0].id);
          }
        }

        if (bankErr) {
          console.error('Banka listesi yüklenemedi:', bankErr);
        } else if (bankData) {
          const typed =
            (bankData as any[]).map((b) => ({
              id: b.id as string,
              bank_name: (b.bank_name as string) ?? null,
              branch_name: (b.branch_name as string) ?? null,
              balance: typeof b.balance === 'number' ? (b.balance as number) : Number(b.balance ?? 0),
            })) ?? [];
          setBankOptions(typed);
          if (!selectedBankId && typed.length > 0) {
            setSelectedBankId(typed[0].id);
          }
        }
      } catch (err: any) {
        if (!active) return;
        console.error('Çek detayı yüklenirken beklenmeyen hata:', err);
        setError(err?.message ?? 'Beklenmeyen bir hata oluştu');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [router, params.id]);

  const data = useMemo(() => {
    if (!row) {
      return {
        txnDate: '',
        dueDate: '',
        amount: '',
        firm: '',
        number: '',
        kind: '',
        docType: 'ASIL EVRAK',
        status: '',
        bank: '',
        branch: '',
        account: '',
        principal: '',
        note: '',
      };
    }
    const fmtDate = (d: string | null) => {
      if (!d) return '';
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return '';
      return dt.toLocaleDateString('tr-TR');
    };
    const mapStatus = (s?: string | null): string => {
      switch (s) {
        case 'pending':
          return 'BEKLEMEDE';
        case 'paid':
          return 'ÖDENDİ';
        case 'bounced':
          return 'KARŞILIKSIZ';
        case 'endorsed':
          return 'CİROLU';
        case 'cancelled':
          return 'İPTAL';
        default:
          return s ?? '';
      }
    };
    const kind = (row.direction || '').toLowerCase() === 'incoming' ? 'MÜŞTERİ ÇEKİ/SENEDİ' : 'KENDİ EVRAĞIMIZ';
    return {
      txnDate: fmtDate(row.issue_date),
      dueDate: fmtDate(row.due_date),
      amount: `${row.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
      firm: row.account_name ?? '',
      number: row.document_no ?? '',
      kind,
      docType: 'ASIL EVRAK',
      status: mapStatus(row.status),
      bank: row.bank_name ?? '',
      branch: row.bank_branch ?? '',
      account: row.drawer_name ?? '',
      principal: '',
      note: row.notes ?? '',
    };
  }, [row]);

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ opacity: 0.75 }}>{label} :</div>
      <div>{value}</div>
    </div>
  );

  // Ödeme Yap modalı
  const [showPay, setShowPay] = useState(false);
  const [payDate, setPayDate] = useState('');
  const [payAmount, setPayAmount] = useState('0,00');
  const [payMethod, setPayMethod] = useState<'Kasadan' | 'Bankadan'>('Kasadan');
  // Tahsilat modalı
  const [showCollect, setShowCollect] = useState(false);
  const [collectDate, setCollectDate] = useState('27.11.2022');
  const [collectAmount, setCollectAmount] = useState('20000');
  const [collectMethod, setCollectMethod] = useState<'Kasaya' | 'Bankaya'>('Kasaya');
  const [selectedCollectCash, setSelectedCollectCash] = useState<'Varsayılan Kasa' | 'Kasa2'>('Varsayılan Kasa');
  // Ciro Et modalı
  const [showEndorse, setShowEndorse] = useState(false);
  const [endorseDate, setEndorseDate] = useState('27.11.2022');
  const [endorseCompany, setEndorseCompany] = useState('');
  const [openEndorsePick, setOpenEndorsePick] = useState(false);
  const [endorsePickQuery, setEndorsePickQuery] = useState('');
  // Bankaya Ver modalı
  const [showGiveBank, setShowGiveBank] = useState(false);
  const [giveBankDate, setGiveBankDate] = useState('');
  const [selectedBank, setSelectedBank] = useState<'Varsayılan' | 'Banka2'>('Varsayılan');

  const parseAmount = (raw: string) => {
    const txt = (raw || '0').toString().replace(/\./g, '').replace(',', '.');
    const n = Number(txt);
    return Number.isFinite(n) ? n : 0;
  };

  const openPayModal = () => {
    if (!row) return;
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      setPayDate(todayIso);
    } catch {
      setPayDate('');
    }
    setPayAmount(
      row.amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
    setPayMethod('Kasadan');
    if (cashOptions.length > 0 && !selectedCashId) {
      setSelectedCashId(cashOptions[0].id);
    }
    setShowPay(true);
  };

  const openEditModal = () => {
    if (!row) return;
    setEditIssueDate(row.issue_date ?? '');
    setEditDueDate(row.due_date ?? '');
    setEditAmount(
      row.amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
    setEditDocumentNo(row.document_no ?? '');
    setEditBankName(row.bank_name ?? '');
    setEditBankBranch(row.bank_branch ?? '');
    setEditDrawerName(row.drawer_name ?? '');
    setEditStatus(row.status ?? 'pending');
    setEditNotes(row.notes ?? '');
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    if (!row) return;
    const amount = parseAmount(editAmount);
    if (!editIssueDate || !editDueDate) {
      alert('İşlem tarihi ve vade tarihi zorunludur.');
      return;
    }
    if (!(amount > 0)) {
      alert('Tutar 0’dan büyük olmalıdır.');
      return;
    }
    try {
      const { error } = await supabase
        .from('cheques_notes')
        .update({
          issue_date: editIssueDate,
          due_date: editDueDate,
          amount,
          document_no: editDocumentNo || null,
          bank_name: editBankName || null,
          bank_branch: editBankBranch || null,
          drawer_name: editDrawerName || null,
          status: editStatus || null,
          notes: editNotes || null,
        })
        .eq('id', row.id);
      if (error) throw error;

      setRow((prev) =>
        prev
          ? {
              ...prev,
              issue_date: editIssueDate,
              due_date: editDueDate,
              amount,
              document_no: editDocumentNo || null,
              bank_name: editBankName || null,
              bank_branch: editBankBranch || null,
              drawer_name: editDrawerName || null,
              status: editStatus || null,
              notes: editNotes || null,
            }
          : prev,
      );
      setShowEdit(false);
    } catch (err: any) {
      console.error('Çek kaydı güncellenemedi', err);
      alert(err?.message ?? 'Çek kaydı güncellenemedi.');
    }
  };

  const handlePaySave = async () => {
    if (!row) return;
    const amount = parseAmount(payAmount);
    if (!(amount > 0)) {
      alert('Tutar 0’dan büyük olmalıdır.');
      return;
    }
    if (!payDate) {
      alert('İşlem tarihi zorunludur.');
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const companyId = await fetchCurrentCompanyId();
      if (!companyId) {
        alert('Şirket bilgisi bulunamadı.');
        return;
      }

      if (payMethod === 'Kasadan') {
        const { data: cashLedgers, error: cashErr } = await supabase
          .from('cash_ledgers')
          .select('id, name, balance')
          .eq('company_id', companyId)
          .order('name', { ascending: true });
        if (cashErr) throw cashErr;
        if (!cashLedgers || cashLedgers.length === 0) {
          alert('Kasa bulunamadı. Önce bir kasa tanımlayın.');
          return;
        }
        let target = cashLedgers[0];
        if (selectedCashId) {
          const found = cashLedgers.find((c) => c.id === selectedCashId);
          if (found) target = found;
        }
        const trxDate = payDate;
        const { error: cashTrxErr } = await supabase.from('cash_transactions').insert({
          cash_ledger_id: target.id,
          amount,
          flow: 'out',
          description: `Verilen çek ödemesi - Çek No: ${row.document_no ?? ''}`,
          trx_date: trxDate,
          cheque_note_id: row.id,
        });
        if (cashTrxErr) throw cashTrxErr;
        const currentBal = Number(target.balance ?? 0);
        await supabase
          .from('cash_ledgers')
          .update({ balance: currentBal - amount })
          .eq('id', target.id);
      } else {
        const { data: banks, error: bankErr } = await supabase
          .from('bank_accounts')
          .select('id, bank_name, branch_name, balance')
          .eq('company_id', companyId)
          .order('bank_name', { ascending: true });
        if (bankErr) throw bankErr;
        if (!banks || banks.length === 0) {
          alert('Banka hesabı bulunamadı. Önce bir banka hesabı tanımlayın.');
          return;
        }
        let bankAcc = banks[0];
        if (selectedBankId) {
          const found = banks.find((b) => b.id === selectedBankId);
          if (found) bankAcc = found;
        }
        const trxDate = payDate;
        const { error: bankTrxErr } = await supabase.from('bank_transactions').insert({
          bank_account_id: bankAcc.id,
          amount,
          flow: 'out',
          description: `Verilen çek ödemesi - Çek No: ${row.document_no ?? ''}`,
          trx_date: trxDate,
          cheque_note_id: row.id,
        });
        if (bankTrxErr) throw bankTrxErr;
        const currentBal = Number(bankAcc.balance ?? 0);
        await supabase
          .from('bank_accounts')
          .update({ balance: currentBal - amount })
          .eq('id', bankAcc.id);
      }

      const { error: chErr } = await supabase
        .from('cheques_notes')
        .update({ status: 'paid' })
        .eq('id', row.id);
      if (chErr) throw chErr;

      setRow((prev) => (prev ? { ...prev, status: 'paid' } : prev));
      setShowPay(false);
    } catch (err: any) {
      console.error('Çek ödemesi kaydedilemedi', err);
      alert(err?.message ?? 'Çek ödemesi kaydedilemedi.');
    }
  };

  const handleDelete = async () => {
    if (!row) return;
    const ok = window.confirm('Bu çeki silmek istediğinize emin misiniz? İlişkili ödeme hareketleri de geri alınacaktır.');
    if (!ok) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const companyId = await fetchCurrentCompanyId();
      if (!companyId) {
        alert('Şirket bilgisi bulunamadı.');
        return;
      }

      // İlgili kasa hareketlerini bul ve bakiyeleri geri al
      const { data: cashTrx, error: cashTrxErr } = await supabase
        .from('cash_transactions')
        .select('id, cash_ledger_id, amount, flow')
        .eq('cheque_note_id', row.id);
      if (cashTrxErr) throw cashTrxErr;

      if (cashTrx && cashTrx.length > 0) {
        const ledgerIds = Array.from(new Set((cashTrx as any[]).map((t) => t.cash_ledger_id as string)));
        const { data: ledgers, error: ledgersErr } = await supabase
          .from('cash_ledgers')
          .select('id, balance')
          .in('id', ledgerIds);
        if (ledgersErr) throw ledgersErr;
        const balMap = new Map<string, number>();
        for (const l of ledgers ?? []) {
          balMap.set((l as any).id as string, Number((l as any).balance ?? 0));
        }
        for (const t of cashTrx as any[]) {
          const id = t.cash_ledger_id as string;
          const current = balMap.get(id) ?? 0;
          const amt = Number(t.amount ?? 0);
          const delta = t.flow === 'out' ? amt : -amt;
          balMap.set(id, current + delta);
        }
        for (const [id, newBal] of balMap.entries()) {
          await supabase.from('cash_ledgers').update({ balance: newBal }).eq('id', id);
        }
        await supabase.from('cash_transactions').delete().eq('cheque_note_id', row.id);
      }

      // İlgili banka hareketlerini bul ve bakiyeleri geri al
      const { data: bankTrx, error: bankTrxErr } = await supabase
        .from('bank_transactions')
        .select('id, bank_account_id, amount, flow')
        .eq('cheque_note_id', row.id);
      if (bankTrxErr) throw bankTrxErr;

      if (bankTrx && bankTrx.length > 0) {
        const bankIds = Array.from(new Set((bankTrx as any[]).map((t) => t.bank_account_id as string)));
        const { data: banks, error: banksErr } = await supabase
          .from('bank_accounts')
          .select('id, balance')
          .in('id', bankIds);
        if (banksErr) throw banksErr;
        const balMap = new Map<string, number>();
        for (const b of banks ?? []) {
          balMap.set((b as any).id as string, Number((b as any).balance ?? 0));
        }
        for (const t of bankTrx as any[]) {
          const id = t.bank_account_id as string;
          const current = balMap.get(id) ?? 0;
          const amt = Number(t.amount ?? 0);
          const delta = t.flow === 'out' ? amt : -amt;
          balMap.set(id, current + delta);
        }
        for (const [id, newBal] of balMap.entries()) {
          await supabase.from('bank_accounts').update({ balance: newBal }).eq('id', id);
        }
        await supabase.from('bank_transactions').delete().eq('cheque_note_id', row.id);
      }

      // Çekin kendisini sil
      const { error: delErr } = await supabase.from('cheques_notes').delete().eq('id', row.id);
      if (delErr) throw delErr;

      router.push(('/cheque-note') as Route);
    } catch (err: any) {
      console.error('Çek kaydı silinemedi', err);
      alert(err?.message ?? 'Çek kaydı silinemedi.');
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <header style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Çek Bilgileri</header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          {/* Sol bilgi paneli */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <Row label="İşlem Tarihi" value={data.txnDate} />
            <Row label="Vade Tarihi" value={data.dueDate} />
            <Row label="Tutar" value={data.amount} />
            <Row label="Firma" value={data.firm} />
            <Row label="Çek/Senet No" value={data.number} />
            <Row label="Çek/Senet Türü" value={data.kind} />
            <Row label="Evrak Türü" value={data.docType} />
            <Row label="Evrak Durumu" value={data.status} />
            <Row label="Banka Adı" value={data.bank} />
            <Row label="Banka Şubesi" value={data.branch} />
            <Row label="Hesap No" value={data.account} />
            <Row label="Asıl Borçlu" value={data.principal || ''} />
            <Row label="Açıklama" value={data.note || ''} />
          </div>

          {/* Sağ işlem paneli */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, display: 'grid', gap: 8, alignContent: 'start' }}>
            {(() => {
              const statusUpper = (data.status || '').toUpperCase();
              const isUnpaid = statusUpper === 'BEKLEMEDE';
              const isPaid = statusUpper === 'ÖDENDİ';
              const isCustomerDoc = (data.kind || '').toUpperCase().includes('MÜŞTERİ');
              const getEnabled = (label: string) => {
                // Ödendi öncelikli kural
                if (isPaid) {
                  return label === 'VERİLEN ÇEK/SENET BORDROSU' || label === 'RAPORLA';
                }
                // Alınan çek kuralları
                if (isCustomerDoc) {
                  return (
                    label === 'DÜZELT' ||
                    label === 'İADE YAP' ||
                    label === 'TAHSİLAT YAP' ||
                    label === 'CİRO ET' ||
                    label === 'BANKAYA VER' ||
                    label === 'ALINAN ÇEK/SENET BORDROSU' ||
                    label === 'RAPORLA' ||
                    label === 'SİL'
                  );
                }
                if (isUnpaid) {
                  return (
                    label === 'DÜZELT' ||
                    label === 'ÖDEME YAP' ||
                    label === 'VERİLEN ÇEK/SENET BORDROSU' ||
                    label === 'RAPORLA'
                  );
                }
                return true;
              };
                const actions: Array<{ label: string; onClick?: () => void }> = [
                { label: 'DÜZELT', onClick: openEditModal },
                { label: 'İADE YAP' },
                { label: 'TAHSİLAT YAP', onClick: () => setShowCollect(true) },
                { label: 'ÖDEME YAP', onClick: openPayModal },
                { label: 'CİRO ET', onClick: () => setShowEndorse(true) },
                { label: 'BANKAYA VER', onClick: () => setShowGiveBank(true) },
                { label: 'VERİLEN ÇEK/SENET BORDROSU', onClick: () => router.push((`/cheque-note/${params.id}/reports/outgoing`) as Route) },
                { label: 'ALINAN ÇEK/SENET BORDROSU' },
                { label: 'RAPORLA' },
              ];
              return actions.map(({ label, onClick }) => (
                <button
                  key={label}
                  disabled={!getEnabled(label)}
                  onClick={getEnabled(label) ? onClick : undefined}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    cursor: getEnabled(label) ? 'pointer' : 'not-allowed',
                    opacity: getEnabled(label) ? 1 : 0.5,
                  }}
                >
                  {label}
                </button>
              ));
            })()}
            {(() => {
              const statusUpper = (data.status || '').toUpperCase();
              const isCustomerDoc = (data.kind || '').toUpperCase().includes('MÜŞTERİ');
              const canDelete = statusUpper !== 'ÖDENDİ' || isCustomerDoc;
              return (
                <button
                  disabled={!canDelete}
                  onClick={canDelete ? handleDelete : undefined}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #fca5a5',
                    background: '#fee2e2',
                    color: '#991b1b',
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                    opacity: canDelete ? 1 : 0.5,
                  }}
                >
                  SİL
                </button>
              );
            })()}
            <button onClick={() => router.push(('/cheque-note') as Route)} style={{ marginTop: 6, width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>
              ← Listeye Dön
            </button>
          </div>
        </div>
      </section>

      {/* Düzelt Modal */}
      {showEdit && (
        <div
          onClick={() => setShowEdit(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 620,
              maxWidth: '95%',
              borderRadius: 10,
              background: '#ffffff',
              color: '#111827',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <strong>Çek Bilgilerini Düzelt</strong>
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                ✖
              </button>
            </div>

            <div style={{ padding: 16, display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>İşlem Tarihi</span>
                  <input
                    type="date"
                    value={editIssueDate}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Vade Tarihi</span>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar</span>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', textAlign: 'right' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Çek/Senet No</span>
                <input
                  value={editDocumentNo}
                  onChange={(e) => setEditDocumentNo(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Banka Adı</span>
                  <input
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Banka Şubesi</span>
                  <input
                    value={editBankBranch}
                    onChange={(e) => setEditBankBranch(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Keşideci / Hesap No</span>
                <input
                  value={editDrawerName}
                  onChange={(e) => setEditDrawerName(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Evrak Durumu</span>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option value="pending">Beklemede</option>
                  <option value="paid">Ödendi</option>
                  <option value="bounced">Karşılıksız</option>
                  <option value="endorsed">Cirolu</option>
                  <option value="cancelled">İptal</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Açıklama</span>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </label>
            </div>

            <div
              style={{
                padding: 12,
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Vazgeç
              </button>
              <button
                onClick={handleEditSave}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #0ea5e9',
                  background: '#0ea5e9',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Yap Modal */}
      {showPay && (
        <div onClick={() => setShowPay(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Ödeme Yap</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={payDate} onChange={(e) => setPayDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as 'Kasadan' | 'Bankadan')}
                  style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option>Kasadan</option>
                  <option>Bankadan</option>
                </select>
              </label>
              {payMethod === 'Kasadan' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Kasa Seçimi</div>
                  {cashOptions.length === 0 && <div style={{ fontSize: 12, color: '#6b7280' }}>Tanımlı kasa bulunamadı.</div>}
                  {cashOptions.map((c) => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="radio"
                        checked={selectedCashId === c.id}
                        onChange={() => setSelectedCashId(c.id)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {payMethod === 'Bankadan' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Banka Seçimi</div>
                  {bankOptions.length === 0 && <div style={{ fontSize: 12, color: '#6b7280' }}>Tanımlı banka hesabı bulunamadı.</div>}
                  {bankOptions.map((b) => (
                    <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="radio"
                        checked={selectedBankId === b.id}
                        onChange={() => setSelectedBankId(b.id)}
                      />
                      <span>
                        {b.bank_name ?? 'Banka'}
                        {b.branch_name ? ` - ${b.branch_name}` : ''}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <button onClick={handlePaySave} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Ödeme Yap</button>
              <button onClick={() => setShowPay(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
      {/* Bankaya Ver Modal */}
      {showGiveBank && (
        <div onClick={() => setShowGiveBank(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Bankaya Ver</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={giveBankDate} onChange={(e) => setGiveBankDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Varsayılan</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" checked={selectedBank === 'Varsayılan'} onChange={() => setSelectedBank('Varsayılan')} />
                  <span>Varsayılan</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" checked={selectedBank === 'Banka2'} onChange={() => setSelectedBank('Banka2')} />
                  <span>Banka2</span>
                </label>
              </div>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <button onClick={() => { /* demo */ setShowGiveBank(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Bankaya Ver</button>
              <button onClick={() => setShowGiveBank(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
      {/* Ciro Et Modal */}
      {showEndorse && (
        <div onClick={() => setShowEndorse(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Çek Ciro Et</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={endorseDate} onChange={(e) => setEndorseDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                <span>Ciro Yapılacak Firma :</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <input value={endorseCompany} onChange={(e) => setEndorseCompany(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
                  <button onClick={() => setOpenEndorsePick(true)} title="Cari Seç" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>🔍</button>
                </div>
              </div>
            </div>
            <div style={{ padding: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => setShowEndorse(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
              <button onClick={() => { /* demo */ setShowEndorse(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Cirola</button>
            </div>
          </div>

          {/* Cari seçimi */}
          {openEndorsePick && (
            <div onClick={(e) => { e.stopPropagation(); }} style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1010 }}>
              <div style={{ width: 720, maxWidth: '96%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                  <strong>Cari Seç</strong>
                  <button onClick={() => setOpenEndorsePick(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>✖</button>
                </div>
                <div style={{ padding: 12 }}>
                  <input value={endorsePickQuery} onChange={(e) => setEndorsePickQuery(e.target.value)} placeholder="Ara..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ padding: '0 12px 12px', maxHeight: 360, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', color: '#111827' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Cari Ünvan</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Yetkili</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px' }}>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const all = [
                          { id: '1', title: 'Mehmet Bey', officer: 'Ahmet Bey' },
                          { id: '2', title: 'Mustafa Bey', officer: 'Mustafa Bey' },
                        ];
                        const filtered = all.filter((r) => {
                          const hay = `${r.title} ${r.officer}`.toLowerCase();
                          return hay.includes(endorsePickQuery.toLowerCase());
                        });
                        return filtered.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 10px' }}>{r.title}</td>
                            <td style={{ padding: '8px 10px' }}>{r.officer}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                              <button onClick={() => { setEndorseCompany(r.title); setOpenEndorsePick(false); }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>Seç</button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Tahsilat Yap Modal */}
      {showCollect && (
        <div onClick={() => setShowCollect(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#ffffff', color: '#111827', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Çek Tahsilat</div>
            <div style={{ padding: 12, display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>İşlem Tarihi :</span>
                <input value={collectDate} onChange={(e) => setCollectDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Tutar :</span>
                <input value={collectAmount} onChange={(e) => setCollectAmount(e.target.value)} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Ödeme Şekli :</span>
                <select value={collectMethod} onChange={(e) => setCollectMethod(e.target.value as 'Kasaya' | 'Bankaya')} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                  <option>Kasaya</option>
                  <option>Bankaya</option>
                </select>
              </label>
              {collectMethod === 'Kasaya' && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Varsayılan Kasa</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" checked={selectedCollectCash === 'Varsayılan Kasa'} onChange={() => setSelectedCollectCash('Varsayılan Kasa')} />
                    <span>Varsayılan Kasa</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" checked={selectedCollectCash === 'Kasa2'} onChange={() => setSelectedCollectCash('Kasa2')} />
                    <span>Kasa2</span>
                  </label>
                </div>
              )}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
              <button onClick={() => { /* demo submit */ setShowCollect(false); }} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>Tahsilat Yap</button>
              <button onClick={() => setShowCollect(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



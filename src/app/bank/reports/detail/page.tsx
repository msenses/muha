'use client';
export const dynamic = 'force-dynamic';

type Txn = {
  date: string;
  type: 'GİRİŞ' | 'ÇIKIŞ';
  desc: string;
  method: string;
  docNo: string | number | '-';
  amount: number;
};

type BankSection = {
  bank: string;
  accountNo: string;
  branch: string;
  branchNo: string;
  iban: string;
  txns: Txn[];
};

function Currency({ value }: { value: number }) {
  return <span>{value.toLocaleString('tr-TR')}</span>;
}

export default function BankDetailReportPage() {
  const sections: BankSection[] = [
    {
      bank: 'Varsayılan',
      accountNo: '',
      branch: 'Merkez',
      branchNo: '',
      iban: '',
      txns: [
        { date: '27.10.2022', type: 'GİRİŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 1000 },
        { date: '31.10.2022', type: 'GİRİŞ', desc: '1. nolu taksidin 1. Taksitlendirme ödemesi, Taksit Sahibi: Mehmet Bey', method: 'KrediKartı', docNo: '-', amount: 100 },
        { date: '03.11.2022', type: 'ÇIKIŞ', desc: 'ALIŞ FATURASI', method: 'Kredi Kartı', docNo: '-', amount: 25000 },
        { date: '04.11.2022', type: 'GİRİŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 20000 },
        { date: '05.11.2022', type: 'GİRİŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 15000 },
        { date: '06.11.2022', type: 'GİRİŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 2333 },
        { date: '07.11.2022', type: 'ÇIKIŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 5454 },
        { date: '09.11.2022', type: 'GİRİŞ', desc: 'SATIŞ FATURASI', method: 'Kredi Kartı', docNo: '-', amount: 440 },
        { date: '10.11.2022', type: 'GİRİŞ', desc: 'SATIŞ FATURASI', method: 'Kredi Kartı', docNo: 10, amount: 10000 },
        { date: '12.11.2022', type: 'GİRİŞ', desc: 'Tahsilat', method: 'Kredi Kartı', docNo: '-', amount: 1000 },
        { date: '13.11.2022', type: 'GİRİŞ', desc: 'Varsayılan Kasa Kasasından Varsayılan Bankasına Virman -', method: 'Kasadan Virman', docNo: '-', amount: 4000 },
        { date: '14.11.2022', type: 'GİRİŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 150 },
        { date: '14.11.2022', type: 'GİRİŞ', desc: '', method: 'HAVALE', docNo: '-', amount: 250 },
        { date: '14.11.2022', type: 'ÇIKIŞ', desc: 'Aktarım', method: 'HAVALE', docNo: '-', amount: 100 },
      ],
    },
    {
      bank: 'Banka2',
      accountNo: '987654321',
      branch: 'Banka2',
      branchNo: '12',
      iban: '897564231',
      txns: [
        { date: '14.11.2022', type: 'GİRİŞ', desc: 'Aktarım', method: 'Havale', docNo: '-', amount: 100 },
      ],
    },
  ];

  const totals = sections.map((s) => {
    let inSum = 0;
    let outSum = 0;
    for (const t of s.txns) {
      if (t.type === 'GİRİŞ') inSum += t.amount;
      else outSum += t.amount;
    }
    return { inSum, outSum, balance: inSum - outSum };
  });

  const periodTotal = totals.reduce((s, t) => s + t.balance, 0);

  return (
    <main style={{ minHeight: '100dvh', background: '#ecf0f5', color: '#111827' }}>
      <section style={{ padding: 12 }}>
        <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Üst araç çubuğu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>✉ Email Gönder</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🗂</button>
              <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
            </div>
          </div>

          {/* Başlık */}
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>BANKA RAPORU</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              <div>Firma : TEST BİLSOFT</div>
              <div>Tarih Aralığı : 14.11.2021 - 14.11.2022</div>
            </div>
          </div>

          {/* Banka bölümleri */}
          <div style={{ padding: 12, display: 'grid', gap: 16 }}>
            {sections.map((s, idx) => (
              <div key={idx} style={{ display: 'grid', gap: 8 }}>
                {/* Banka info header */}
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: '#94a3b8', color: '#fff' }}>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Banka Adı</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Hesap No</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Şube</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>Şube No</th>
                      <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #e5e7eb' }}>IBAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.bank}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.accountNo || '-'}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.branch}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.branchNo || '-'}</td>
                      <td style={{ padding: '6px', border: '1px solid #e5e7eb' }}>{s.iban || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Txn table */}
                <div style={{ overflowX: 'auto', background: '#fff', color: '#111827', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tarih</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tip</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Açıklama</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Ödeme Şekli</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Evrak No</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.txns.map((t, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px' }}>{t.date}</td>
                          <td style={{ padding: '8px' }}>{t.type}</td>
                          <td style={{ padding: '8px' }}>{t.desc}</td>
                          <td style={{ padding: '8px' }}>{t.method}</td>
                          <td style={{ padding: '8px' }}>{t.docNo}</td>
                          <td style={{ padding: '8px' }}><Currency value={t.amount} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Banka özeti */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  <div style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc' }}>
                    Giriş : <Currency value={totals[idx].inSum} />
                  </div>
                  <div style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc' }}>
                    Çıkış : <Currency value={totals[idx].outSum} />
                  </div>
                  <div style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc' }}>
                    Kalan : <Currency value={totals[idx].balance} />
                  </div>
                </div>
              </div>
            ))}

            {/* Alt toplamlar */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 220px' }}>
              <div style={{ padding: 8, color: '#6b7280' }}>14.11.2021 - 14.11.2022 ARASI BANKA HESAPLARI TOPLAMI :</div>
              <div style={{ padding: 8, textAlign: 'right' }}><Currency value={periodTotal} /></div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 220px' }}>
              <div style={{ padding: 8, color: '#6b7280' }}>TÜM BANKALAR TOPLAMI :</div>
              <div style={{ padding: 8, textAlign: 'right' }}><Currency value={periodTotal} /></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


# Finova Muhasebe Sistemi - Neon+Prisma Geçiş PRD

**Proje:** Finova - Ön Muhasebe ve E-Fatura Yönetim Sistemi  
**Teknoloji Hedefi:** Supabase → Neon (PostgreSQL) + Prisma ORM  
**Hazırlanma Tarihi:** 7 Aralık 2025  
**Durum:** Analiz Raporu - Uygulama Öncesi

---

## 1. EXECUTIVE SUMMARY

### 1.1. Proje Özeti
Finova, KOBİ'lere yönelik kapsamlı bir ön muhasebe ve e-fatura yönetim sistemidir. Mevcut yapı Supabase (PostgreSQL + Auth + RLS) üzerine kurulu olup Next.js 14.2.5, React 18.3.1 ve TypeScript kullanmaktadır.

### 1.2. Geçiş Hedefi
- **Veritabanı:** Supabase PostgreSQL → **Neon PostgreSQL**
- **ORM:** Doğrudan Supabase Client → **Prisma Client**
- **Kimlik Doğrulama:** Supabase Auth → **Alternatif Çözüm Gerekli** (NextAuth.js / Clerk / Auth.js)
- **RLS (Row Level Security):** Supabase RLS → **Prisma Middleware / Uygulama Katmanı**

### 1.3. Temel Bulgular
✅ **Veritabanı Şeması:** %100 PostgreSQL uyumlu, kolayca migrate edilebilir  
✅ **Neon Uygunluğu:** Tüm tablolar ve ilişkiler Neon'da sorunsuz çalışır  
⚠️ **Kritik Nokta:** Supabase Auth ve RLS yerine alternatif çözüm gerekiyor  
⚠️ **Orta Risk:** ~50+ dosyada `supabase` import'ları değiştirilmeli  
⚠️ **Yüksek Etki:** E-fatura modülündeki karmaşık state yönetimi

---

## 2. MEVCUT SISTEM MİMARİSİ

### 2.1. Teknoloji Stack'i
```
Frontend:
├── Next.js 14.2.5 (App Router)
├── React 18.3.1 (Client Components)
├── TypeScript 5.4.5
└── Inline Styles (Glass Morphism Design)

Backend/Veritabanı:
├── Supabase PostgreSQL
├── @supabase/supabase-js 2.45.4
├── Supabase Auth (Email/Password)
└── Row Level Security (RLS) Policies

Deployment:
└── Vercel (Git-based CI/CD)
```

### 2.2. Dosya Yapısı
```
muhasebe2/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── accounts/             # Cari Hesap Modülü (13 dosya)
│   │   ├── agenda/               # Ajanda Modülü (3 dosya)
│   │   ├── bank/                 # Banka Modülü (5 dosya)
│   │   ├── cash/                 # Kasa Modülü (6 dosya)
│   │   ├── cheque-note/          # Çek/Senet Modülü (5 dosya)
│   │   ├── dashboard/            # Dashboard (1 dosya)
│   │   ├── dispatch/             # İrsaliye Modülü (2 dosya)
│   │   ├── e-fatura/             # E-Fatura Modülü (1 dosya - 1013 satır!)
│   │   ├── e-mustahsil/          # E-Müstahsil Modülü (5 dosya)
│   │   ├── income-expense/       # Gelir-Gider Modülü (6 dosya)
│   │   ├── installments/         # Taksit Takip Modülü (5 dosya)
│   │   ├── invoices/             # Fatura Modülü (7 dosya)
│   │   ├── login/                # Giriş Sayfası (1 dosya)
│   │   ├── quotes-orders/        # Teklif/Sipariş Modülü (9 dosya)
│   │   ├── reports/              # Raporlar (1 dosya)
│   │   ├── returns/              # İade Modülü (4 dosya)
│   │   └── stock/                # Stok Modülü (20 dosya)
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── lib/
│   │   ├── company.ts            # Company ID Helper
│   │   └── supabaseClient.ts     # Supabase Client (DEMO MODE destekli)
│   └── middleware.ts             # Root → /dashboard redirect
└── supabase/
    ├── schema/001_init.sql       # Veritabanı şeması
    └── seed/001_seed.sql         # Seed data
```

**Toplam Dosya Sayısı:** ~100+ React bileşeni  
**Supabase Import Kullanan:** ~60+ dosya  
**E-Fatura Kompleksitesi:** Yüksek (1000+ satır tek dosya, 40+ state değişkeni)

---

## 3. VERİTABANI ŞEMASI ANALİZİ

### 3.1. Mevcut Tablolar ve İlişkiler

#### 3.1.1. Temel Tablolar
```sql
-- Şirket ve Şube Yönetimi
companies (id, name, created_at)
branches (id, company_id → companies, name, created_at)
profiles (user_id → auth.users, company_id → companies, role, created_at)

-- Cari Hesap Yönetimi
accounts (
  id, company_id → companies, branch_id → branches,
  code, name, tax_id, phone, email, address, balance,
  created_at
)

-- Stok Yönetimi
products (
  id, company_id → companies, sku, name, unit, 
  vat_rate, price, created_at
)

stock_movements (
  id, company_id → companies, product_id → products,
  invoice_id → invoices, move_type, qty, created_at
)

-- Fatura Yönetimi
invoices (
  id, company_id → companies, account_id → accounts,
  type, invoice_no, invoice_date, total, vat_total, net_total,
  created_at
)

invoice_items (
  id, invoice_id → invoices, product_id → products,
  qty, unit_price, vat_rate, line_total, created_at
)

-- Kasa ve Banka
cash_ledgers (id, company_id → companies, name, created_at)

bank_accounts (
  id, company_id → companies, bank_name, iban, created_at
)

bank_transactions (
  id, bank_account_id → bank_accounts, amount, flow,
  description, trx_date, created_at
)
```

#### 3.1.2. Enum Tipler
```sql
CREATE TYPE invoice_type AS ENUM ('sales', 'purchase');
CREATE TYPE stock_move_type AS ENUM ('in', 'out');
CREATE TYPE money_flow AS ENUM ('in', 'out');
```

#### 3.1.3. İndeksler
```sql
CREATE INDEX accounts_company_idx ON accounts(company_id);
CREATE INDEX products_company_idx ON products(company_id);
CREATE INDEX invoices_company_idx ON invoices(company_id);
CREATE INDEX invoice_items_invoice_idx ON invoice_items(invoice_id);
CREATE INDEX stock_company_idx ON stock_movements(company_id);
```

#### 3.1.4. Row Level Security (RLS) Policies
```sql
-- Şirket bazlı erişim kontrolü
CREATE VIEW current_user_company AS
  SELECT p.company_id FROM profiles p WHERE p.user_id = auth.uid();

-- Tüm tablolarda company_id kontrolü
CREATE POLICY accounts_rw ON accounts
  FOR ALL USING (company_id = (SELECT company_id FROM current_user_company));

-- İlişkili tablolarda EXISTS kontrolü
CREATE POLICY invoice_items_r ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_id
      AND i.company_id = (SELECT company_id FROM current_user_company)
    )
  );
```

### 3.2. Eksik Alanlar (E-Fatura İçin Gerekli)

Mevcut kod incelemesinde kullanılan ancak `invoices` tablosunda **eksik** olan alanlar:

```sql
-- invoices tablosuna eklenm EKLENMELİ:
status TEXT,                          -- 'draft', 'completed', 'sent', 'cancelled'
approval_status TEXT,                 -- 'pending', 'approved', 'rejected'
invoice_kind TEXT,                    -- 'SATIS', 'IADE', 'ISTISNA', 'TEVKIFAT', vb.
e_document_scenario TEXT,             -- 'TEMELFATURA', 'TICARIFATURA', 'KAMU', vb.
e_document_type TEXT,                 -- 'EFATURA', 'EARSIVFATURA', vb.
subtotal NUMERIC(14,2),               -- KDV öncesi toplam
ettn TEXT,                            -- E-Fatura UUID
gib_status TEXT,                      -- GİB durumu
taxpayer_kind TEXT,                   -- 'efatura', 'earsiv'
currency TEXT,                        -- 'TRY', 'USD', 'EUR'
tax_office TEXT,                      -- Vergi dairesi
district TEXT,                        -- İlçe
city TEXT,                            -- İl

-- invoice_items tablosuna EKLENMELİ:
otv_rate NUMERIC(5,2),                -- ÖTV oranı
discount_rate NUMERIC(5,2),           -- İskonto yüzdesi
discount_amount NUMERIC(14,2),        -- İskonto tutarı (TL)
teslimat_durumu TEXT,                 -- İhracat: Teslimat durumu
teslimat_orani NUMERIC(5,2),          -- İhracat: Teslimat oranı
kdv_durumu TEXT,                      -- İhracat: KDV durumu
gonderim_sekli TEXT,                  -- İhracat: Gönderim şekli
teslim_sarti TEXT,                    -- İhracat: Teslim şartı
kap_cinsi TEXT,                       -- İhracat: Kap cinsi
kap_adedi INTEGER,                    -- İhracat: Kap adedi
gis_no TEXT,                          -- İhracat: GİS No
kap_numarasi TEXT,                    -- İhracat: Kap numarası
kdv_muafiyet_sebebi TEXT,             -- İstisna: Muafiyet sebebi
tevkifat_durumu TEXT,                 -- Tevkifat: Durum kodu
tevkifat_orani NUMERIC(5,2),          -- Tevkifat: Oran

-- accounts tablosuna EKLENMELİ:
type TEXT,                            -- 'customer', 'supplier', 'both'
tax_office TEXT,                      -- Vergi dairesi
district TEXT,                        -- İlçe
city TEXT,                            -- İl
country TEXT DEFAULT 'Türkiye',       -- Ülke

-- products tablosuna EKLENMELİ:
barcode TEXT,                         -- Barkod
cost_price NUMERIC(14,2),             -- Maliyet fiyatı (ortalama)
stock_balance NUMERIC(14,3),          -- Güncel stok bakiyesi (cache)
min_stock NUMERIC(14,3),              -- Minimum stok seviyesi
```

### 3.3. Neon PostgreSQL Uyumluluk Analizi

| Özellik | Mevcut Kullanım | Neon Desteği | Notlar |
|---------|----------------|--------------|--------|
| UUID | ✅ `gen_random_uuid()` | ✅ Tam destek | pgcrypto extension |
| ENUM Tipler | ✅ 3 adet enum | ✅ Tam destek | - |
| Timestamp TZ | ✅ `timestamp with time zone` | ✅ Tam destek | - |
| Numeric(14,2) | ✅ Para birimi | ✅ Tam destek | - |
| İlişkiler | ✅ Foreign Keys | ✅ Tam destek | CASCADE, RESTRICT |
| İndeksler | ✅ 5 adet index | ✅ Tam destek | B-Tree |
| RLS Policies | ✅ 10+ policy | ⚠️ Neon destekler ama... | Prisma ile entegrasyon zor |
| View | ✅ current_user_company | ✅ Tam destek | Prisma ile manuel query |
| auth.users | ✅ Supabase Auth | ❌ Neon'da yok | NextAuth.js ile değiştirilmeli |
| auth.uid() | ✅ RLS'de kullanılıyor | ❌ Neon'da yok | Middleware ile çözülmeli |

**SONUÇ:** Veritabanı şeması %100 Neon uyumlu. Tek sorun: **Kimlik doğrulama katmanı**.

---

## 4. MODÜL ANALİZİ VE VERİ GEREKSİNİMLERİ

### 4.1. Cari Hesap Modülü (Accounts)

**Dosyalar:** 13 dosya  
**Veritabanı Tabloları:** `accounts`, `account_transactions` (planned)

**Özellikler:**
- Cari kartı oluşturma/düzenleme
- Borç-alacak takibi (`balance` alanı)
- Cari ekstreleri (fatura ilişkileri)
- Tahsilat/Ödeme kayıtları
- Cari grupları (`account_groups` - planlanmış)
- Kargo ve banka bilgileri
- Hızlı satış ekranı

**Prisma Şema Önerisi:**
```prisma
model Account {
  id          String   @id @default(uuid())
  companyId   String   @map("company_id")
  branchId    String?  @map("branch_id")
  code        String?
  name        String
  taxId       String?  @map("tax_id")
  taxOffice   String?  @map("tax_office")
  phone       String?
  email       String?
  address     String?
  city        String?
  district    String?
  country     String   @default("Türkiye")
  balance     Decimal  @default(0) @db.Decimal(14, 2)
  type        String?  // 'customer', 'supplier', 'both'
  createdAt   DateTime @default(now()) @map("created_at")

  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  branch      Branch?  @relation(fields: [branchId], references: [id], onDelete: SetNull)
  invoices    Invoice[]
  
  @@index([companyId])
  @@map("accounts")
}
```

### 4.2. Stok Modülü (Stock/Products)

**Dosyalar:** 20 dosya  
**Veritabanı Tabloları:** `products`, `stock_movements`, `warehouses` (planned), `product_lots` (planned), `product_prices` (planned)

**Özellikler:**
- Stok kartı yönetimi
- Birim tanımları
- Fiyat listeleri
- Seri/lot takibi
- Depo yönetimi (şube/depo bazlı)
- Stok giriş/çıkış hareketleri
- Barkod sistemi
- Paket grup yönetimi
- Şube/depo transferleri
- Stok raporları (hareket, bakiye, etiket, fiyat listesi)

**Prisma Şema Önerisi:**
```prisma
model Product {
  id           String   @id @default(uuid())
  companyId    String   @map("company_id")
  sku          String?
  barcode      String?
  name         String
  unit         String   @default("ADET")
  vatRate      Decimal  @default(20) @map("vat_rate") @db.Decimal(5, 2)
  price        Decimal  @default(0) @db.Decimal(14, 2)
  costPrice    Decimal  @default(0) @map("cost_price") @db.Decimal(14, 2)
  stockBalance Decimal  @default(0) @map("stock_balance") @db.Decimal(14, 3)
  minStock     Decimal  @default(0) @map("min_stock") @db.Decimal(14, 3)
  createdAt    DateTime @default(now()) @map("created_at")

  company      Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  invoiceItems InvoiceItem[]
  movements    StockMovement[]
  
  @@index([companyId])
  @@map("products")
}

model StockMovement {
  id         String   @id @default(uuid())
  companyId  String   @map("company_id")
  productId  String   @map("product_id")
  invoiceId  String?  @map("invoice_id")
  moveType   StockMoveType @map("move_type")
  qty        Decimal  @db.Decimal(14, 3)
  createdAt  DateTime @default(now()) @map("created_at")

  company    Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Restrict)
  invoice    Invoice? @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  
  @@index([companyId])
  @@map("stock_movements")
}

enum StockMoveType {
  in
  out
  
  @@map("stock_move_type")
}
```

### 4.3. Fatura Modülü (Invoices)

**Dosyalar:** 7 dosya (en kritik: `ClientPage.tsx` 1281 satır!)  
**Veritabanı Tabloları:** `invoices`, `invoice_items`

**Özellikler:**
- Satış/Alış faturası oluşturma
- KDV, ÖTV, İskonto hesaplamaları
- Çoklu ürün kalemi
- Fatura düzenleme
- Fatura listeleme/filtreleme
- Fatura detay görüntüleme
- PDF çıktısı (planlı)

**Prisma Şema Önerisi:**
```prisma
model Invoice {
  id                String       @id @default(uuid())
  companyId         String       @map("company_id")
  accountId         String       @map("account_id")
  type              InvoiceType
  invoiceNo         String?      @map("invoice_no")
  invoiceDate       DateTime     @default(now()) @map("invoice_date") @db.Date
  total             Decimal      @default(0) @db.Decimal(14, 2)
  vatTotal          Decimal      @default(0) @map("vat_total") @db.Decimal(14, 2)
  netTotal          Decimal      @default(0) @map("net_total") @db.Decimal(14, 2)
  subtotal          Decimal      @default(0) @db.Decimal(14, 2)
  
  // E-Fatura Alanları
  status            String?      // 'draft', 'completed', 'sent', 'cancelled'
  approvalStatus    String?      @map("approval_status") // 'pending', 'approved', 'rejected'
  invoiceKind       String?      @map("invoice_kind") // 'SATIS', 'IADE', 'ISTISNA', vb.
  eDocScenario      String?      @map("e_document_scenario") // 'TEMELFATURA', 'TICARIFATURA', vb.
  eDocType          String?      @map("e_document_type") // 'EFATURA', 'EARSIVFATURA'
  ettn              String?      // E-Fatura UUID
  gibStatus         String?      @map("gib_status")
  taxpayerKind      String?      @map("taxpayer_kind") // 'efatura', 'earsiv'
  currency          String       @default("TRY")
  taxOffice         String?      @map("tax_office")
  district          String?
  city              String?
  
  createdAt         DateTime     @default(now()) @map("created_at")

  company           Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)
  account           Account      @relation(fields: [accountId], references: [id], onDelete: Restrict)
  items             InvoiceItem[]
  movements         StockMovement[]
  
  @@index([companyId])
  @@map("invoices")
}

model InvoiceItem {
  id                   String   @id @default(uuid())
  invoiceId            String   @map("invoice_id")
  productId            String   @map("product_id")
  qty                  Decimal  @db.Decimal(14, 3)
  unitPrice            Decimal  @map("unit_price") @db.Decimal(14, 2)
  vatRate              Decimal  @map("vat_rate") @db.Decimal(5, 2)
  otvRate              Decimal  @default(0) @map("otv_rate") @db.Decimal(5, 2)
  discountRate         Decimal  @default(0) @map("discount_rate") @db.Decimal(5, 2)
  discountAmount       Decimal  @default(0) @map("discount_amount") @db.Decimal(14, 2)
  lineTotal            Decimal  @map("line_total") @db.Decimal(14, 2)
  
  // İhracat Alanları
  teslimatDurumu       String?  @map("teslimat_durumu")
  teslimatOrani        Decimal? @map("teslimat_orani") @db.Decimal(5, 2)
  kdvDurumu            String?  @map("kdv_durumu")
  gonderimSekli        String?  @map("gonderim_sekli")
  teslimSarti          String?  @map("teslim_sarti")
  kapCinsi             String?  @map("kap_cinsi")
  kapAdedi             Int?     @map("kap_adedi")
  gisNo                String?  @map("gis_no")
  kapNumarasi          String?  @map("kap_numarasi")
  
  // İstisna ve Tevkifat
  kdvMuafiyetSebebi    String?  @map("kdv_muafiyet_sebebi")
  tevkifatDurumu       String?  @map("tevkifat_durumu")
  tevkifatOrani        Decimal? @map("tevkifat_orani") @db.Decimal(5, 2)
  
  createdAt            DateTime @default(now()) @map("created_at")

  invoice              Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product              Product  @relation(fields: [productId], references: [id], onDelete: Restrict)
  
  @@index([invoiceId])
  @@map("invoice_items")
}

enum InvoiceType {
  sales
  purchase
  
  @@map("invoice_type")
}
```

### 4.4. E-Fatura Modülü

**Dosyalar:** 1 dosya (1013 satır!)  
**Veritabanı Tabloları:** `invoices` (extend edilmiş)

**Özellikler:**
- Fatura oluşturma (Satış/Alış)
- Fatura Tipleri: SATIS, IADE, ISTISNA, TEVKIFAT, OZELMATRAH, IHRACKAYITLI, vb.
- Fatura Senaryoları:
  - E-Fatura: TEMELFATURA, TICARIFATURA, KAMU
  - E-Arşiv: EARSIVFATURA, EARSIVATURA, IHRACKAYITLI
- Taslaklar (status='draft')
- Giden Faturalar (status='sent', 'completed')
- Gelen Faturalar (type='purchase')
- Gelişmiş arama (ETTN, Fatura No, Cari, Vergi No, Tarih, Senaryo, Durum)
- Onay/Red işlemleri (Ticari Fatura)
- Gelen faturayı alış faturasına çevirme
- Otomatik cari oluşturma/güncelleme
- Otomatik stok oluşturma/güncelleme
- Stok maliyet hesaplama (ortalama / alış fiyatı)
- Ayarlar (Firma Bilgileri, Genel Ayarlar, E-Mail Ayarları)

**Kritik State Yönetimi (40+ değişken):**
```typescript
// Fatura
const [eDocScenario, setEDocScenario] = useState<'TEMELFATURA' | 'TICARIFATURA' | ...>('TEMELFATURA');
const [invoiceKind, setInvoiceKind] = useState<'SATIS' | 'IADE' | ...>('SATIS');
const [taxpayerKind, setTaxpayerKind] = useState<'efatura' | 'earsiv' | null>(null);
const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');

// Ürün Kalemi Taslak (20+ değişken)
const [draftProductId, setDraftProductId] = useState<string>('');
const [draftQty, setDraftQty] = useState<number>(1);
const [draftUnitPrice, setDraftUnitPrice] = useState<number>(0);
const [draftVatRate, setDraftVatRate] = useState<number>(0);
const [draftOtvRate, setDraftOtvRate] = useState<number>(0);
const [draftDiscRate, setDraftDiscRate] = useState<number>(0);
const [draftDiscAmount, setDraftDiscAmount] = useState<number>(0);
const [draftTeslimatDurumu, setDraftTeslimatDurumu] = useState<string>('');
const [draftKdvMuafiyetSebebi, setDraftKdvMuafiyetSebebi] = useState<string>('');
const [draftTevkifatDurumu, setDraftTevkifatDurumu] = useState<string>('');
// ... 10+ ek alan
```

**Neon+Prisma Riski:** ⚠️ **YÜKSEK** - Karmaşık state yönetimi, dikkatli refactor gerekiyor.

### 4.5. Diğer Modüller

#### Kasa (Cash)
- **Tablolar:** `cash_ledgers`, `cash_transactions` (planned)
- **Özellikler:** Kasa listesi, giriş/çıkış, virman, raporlar

#### Banka (Bank)
- **Tablolar:** `bank_accounts`, `bank_transactions`
- **Özellikler:** Banka hesabı listesi, işlemler, virman, raporlar

#### Çek/Senet (Cheque/Note)
- **Tablolar:** `cheques`, `notes` (planned)
- **Özellikler:** Çek/senet listesi, ciro, tahsil/ödeme

#### E-Müstahsil
- **Tablolar:** `e_mustahsil_receipts` (planned)
- **Özellikler:** Müstahsil makbuzu oluşturma, stopaj, mera fonu

#### Teklif/Sipariş (Quotes/Orders)
- **Tablolar:** `quotes`, `orders` (planned)
- **Özellikler:** Teklif, sipariş, dönüşümler (teklif→sipariş→fatura→irsaliye)

#### İrsaliye (Dispatch)
- **Tablolar:** `dispatches` (planned)
- **Özellikler:** İrsaliye oluşturma, liste

#### İade (Returns)
- **Tablolar:** `returns` (planned) veya `invoices.invoice_kind='IADE'`
- **Özellikler:** Satış/alış iadesi

#### Gelir/Gider (Income/Expense)
- **Tablolar:** `income_expense_records` (planned)
- **Özellikler:** Gelir/gider kayıtları, elektrik faturası

#### Taksit Takip (Installments)
- **Tablolar:** `installments` (planned)
- **Özellikler:** Taksitli satış takibi

#### Ajanda (Agenda)
- **Tablolar:** `agenda_items` (planned)
- **Özellikler:** Not/hatırlatma

#### Raporlar (Reports)
- **Özellikler:** Cari ekstre, stok hareket, satış raporu, KDV, bakiye

---

## 5. NEON + PRISMA GEÇİŞ PLANI

### 5.1. Avantajlar

#### Neon PostgreSQL
✅ **Serverless PostgreSQL** - Otomatik ölçeklendirme  
✅ **Branching** - Her feature için ayrı DB branch (test/staging)  
✅ **Ücretsiz Tier** - 0.5GB depo + 100 saat compute  
✅ **Hızlı Provision** - Anında DB oluşturma  
✅ **Connection Pooling** - PgBouncer entegre  
✅ **Point-in-Time Recovery** - 7 gün tutma  
✅ **PostgreSQL 16** - En son özellikler  

#### Prisma ORM
✅ **Type-Safe** - Compile-time type checking  
✅ **Auto-Generated Client** - Schema'dan otomatik client  
✅ **Migration System** - Güvenli schema değişiklikleri  
✅ **Query Builder** - SQL bilgisi gerektirmez  
✅ **Relation Handling** - İlişkiler otomatik yönetilir  
✅ **Prisma Studio** - GUI ile veritabanı yönetimi  
✅ **Next.js Uyumlu** - App Router ile mükemmel entegrasyon  

### 5.2. Dezavantajlar ve Riskler

#### Neon
⚠️ **Cold Start** - İlk istek 1-2 saniye gecikmeli (Ücretsiz tier)  
⚠️ **Compute Sınırı** - Ücretsiz tier 100 saat/ay  
⚠️ **Connection Limit** - Ücretsiz tier 100 connection  

#### Prisma
⚠️ **Supabase RLS Kaybı** - Row Level Security manuel uygulanmalı  
⚠️ **Supabase Auth Kaybı** - Alternatif auth sistemi gerekli  
⚠️ **Client-Side Kullanım** - Prisma sadece server-side (Next.js API routes / Server Components)  
⚠️ **Bundle Size** - Prisma Client ~1MB ekler  

#### Geçiş Riski
🔴 **YÜKSEK:** E-Fatura modülü (1000+ satır, 40+ state)  
🟡 **ORTA:** 50+ dosyada Supabase import değişikliği  
🟡 **ORTA:** Auth sistemi tamamen değişecek  
🟢 **DÜŞÜK:** Veritabanı şeması migration (direkt SQL import)  

### 5.3. Geçiş Adımları (Önerilen)

#### **FAZ 1: Hazırlık ve Planlama** (2-3 gün)

**1.1. Neon Hesabı ve Proje Kurulumu**
```bash
# Neon hesabı oluştur (https://neon.tech)
# Yeni proje oluştur: finova-production
# Connection string'i al:
# postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/finova
```

**1.2. Prisma Kurulumu**
```bash
npm install prisma @prisma/client
npx prisma init
```

**1.3. Prisma Schema Hazırlama**
- Mevcut `supabase/schema/001_init.sql` → Prisma schema'ya dönüştür
- Eksik alanları ekle (e-fatura için)
- Enum'ları tanımla
- İlişkileri kur

**1.4. Auth Sistemi Seçimi**
**Seçenek A: NextAuth.js (Auth.js v5)**
```bash
npm install next-auth@beta @auth/prisma-adapter
```
- ✅ Açık kaynak
- ✅ Email/Password + OAuth
- ✅ Prisma adapter mevcut
- ✅ Next.js App Router desteği
- ⚠️ Beta (v5)

**Seçenek B: Clerk**
```bash
npm install @clerk/nextjs
```
- ✅ Hazır UI bileşenleri
- ✅ Çok tenant desteği
- ✅ Ücretli ama güçlü
- ❌ Vendor lock-in riski

**Öneri:** NextAuth.js (maliyet ve esneklik açısından)

#### **FAZ 2: Veritabanı Migration** (1 gün)

**2.1. Prisma Schema Finalize**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Company {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  
  branches  Branch[]
  profiles  Profile[]
  accounts  Account[]
  products  Product[]
  invoices  Invoice[]
  // ... diğer ilişkiler
  
  @@map("companies")
}

// ... diğer modeller (yukarıda detaylandırıldı)
```

**2.2. Schema Migration**
```bash
# Mevcut Supabase veritabanından şema al
npx prisma db pull

# Düzenle ve uygula
npx prisma migrate dev --name init

# Prisma Client oluştur
npx prisma generate
```

**2.3. Veri Transferi (Opsiyonel)**
Eğer mevcut Supabase'de prod verisi varsa:
```bash
# pg_dump ile export
pg_dump $SUPABASE_DATABASE_URL > backup.sql

# Neon'a import
psql $NEON_DATABASE_URL < backup.sql
```

#### **FAZ 3: Auth Sistemi Değişimi** (2-3 gün)

**3.1. NextAuth.js Kurulum**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
```

**3.2. Middleware Güncelleme**
```typescript
// middleware.ts
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**3.3. Session Management**
```typescript
// lib/auth.ts
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  return await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { company: true },
  });
}

export async function getCurrentCompanyId() {
  const user = await getCurrentUser();
  return user?.companyId ?? null;
}
```

#### **FAZ 4: Supabase Client Değişimi** (3-5 gün)

**4.1. Prisma Client Kurulumu**
```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**4.2. Supabase → Prisma Dönüşüm Örnekleri**

**ÖNCESİ (Supabase):**
```typescript
const { data, error } = await supabase
  .from('accounts')
  .select('id, name, balance')
  .eq('company_id', companyId)
  .order('name', { ascending: true });

if (error) throw error;
return data;
```

**SONRASI (Prisma):**
```typescript
const accounts = await prisma.account.findMany({
  where: { companyId },
  select: { id: true, name: true, balance: true },
  orderBy: { name: 'asc' },
});

return accounts;
```

**4.3. RLS Replacement (Middleware)**
```typescript
// lib/middleware/company-filter.ts
import { getCurrentCompanyId } from "@/lib/auth";

export async function withCompanyFilter<T>(
  query: (companyId: string) => Promise<T>
): Promise<T> {
  const companyId = await getCurrentCompanyId();
  if (!companyId) throw new Error("No company found for user");
  
  return await query(companyId);
}

// Kullanım:
const accounts = await withCompanyFilter(async (companyId) =>
  prisma.account.findMany({ where: { companyId } })
);
```

**4.4. Server Actions (Next.js App Router)**
```typescript
// app/accounts/actions.ts
'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const companyId = await getCurrentCompanyId();
  if (!companyId) throw new Error("Unauthorized");
  
  return await prisma.account.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
  });
}

export async function createAccount(data: {
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  const companyId = await getCurrentCompanyId();
  if (!companyId) throw new Error("Unauthorized");
  
  const account = await prisma.account.create({
    data: { ...data, companyId },
  });
  
  revalidatePath('/accounts');
  return account;
}
```

**4.5. Dosya Bazlı Değişim Listesi**

50+ dosyada değişiklik gerekiyor. Her dosya için:

1. `import { supabase } from '@/lib/supabaseClient';` → Kaldır
2. `import { prisma } from '@/lib/prisma';` → Ekle
3. `import { getCurrentCompanyId } from '@/lib/auth';` → Ekle (gerekiyorsa)
4. `await supabase.auth.getSession()` → `await auth()` (NextAuth)
5. `await supabase.from('table').select()` → `await prisma.table.findMany()`
6. `await supabase.from('table').insert()` → `await prisma.table.create()`
7. `await supabase.from('table').update()` → `await prisma.table.update()`
8. `await supabase.from('table').delete()` → `await prisma.table.delete()`

**Öncelikli Dosyalar:**
1. `src/app/accounts/page.tsx` (Cari listesi)
2. `src/app/accounts/new/page.tsx` (Cari oluşturma)
3. `src/app/stock/page.tsx` (Stok listesi)
4. `src/app/invoices/page.tsx` (Fatura listesi)
5. `src/app/invoices/new/ClientPage.tsx` (Fatura oluşturma - EN KRİTİK!)
6. `src/app/e-fatura/page.tsx` (E-Fatura - EN KRİTİK!)
7. `src/app/dashboard/page.tsx` (Dashboard)
8. `src/components/Sidebar.tsx` (Auth kontrolü)

#### **FAZ 5: Testing ve Debugging** (2-3 gün)

**5.1. Unit Testing**
```bash
npm install -D vitest @testing-library/react
```

**5.2. Integration Testing**
- Her modülü tek tek test et
- CRUD işlemlerini doğrula
- İlişkili kayıtları kontrol et (cascade delete vb.)

**5.3. E2E Testing (Opsiyonel)**
```bash
npm install -D playwright
```

**5.4. Performance Testing**
- Prisma query optimizasyonu (`include`, `select`)
- N+1 problem kontrolü
- Index kullanımı

#### **FAZ 6: Deployment** (1 gün)

**6.1. Environment Variables**
```env
# .env.production
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/finova"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/finova?sslmode=require"
NEXTAUTH_URL="https://finova.app"
NEXTAUTH_SECRET="your-secret-key"
```

**6.2. Vercel Deployment**
```bash
# package.json scripts ekle
"postinstall": "prisma generate"

# Vercel'de environment variables'ı ekle
# Deploy
vercel --prod
```

**6.3. Prisma Migrate Deploy**
```bash
# Production migration
npx prisma migrate deploy
```

---

## 6. PRİSMA SCHEMA (TAM ŞEMA)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// 1. KULLANICI VE FİRMA YÖNETİMİ
// ============================================================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  password      String
  name          String?
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts      AuthAccount[]
  sessions      Session[]
  profile       Profile?
  
  @@map("users")
}

model AuthAccount {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("auth_accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Company {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  branches       Branch[]
  profiles       Profile[]
  accounts       Account[]
  products       Product[]
  invoices       Invoice[]
  stockMovements StockMovement[]
  cashLedgers    CashLedger[]
  bankAccounts   BankAccount[]

  @@map("companies")
}

model Branch {
  id        String   @id @default(uuid())
  companyId String   @map("company_id")
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  company  Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  accounts Account[]

  @@map("branches")
}

model Profile {
  userId    String   @id @map("user_id")
  companyId String   @map("company_id")
  role      String   @default("operator")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// ============================================================
// 2. CARİ HESAP YÖNETİMİ
// ============================================================

model Account {
  id        String   @id @default(uuid())
  companyId String   @map("company_id")
  branchId  String?  @map("branch_id")
  code      String?
  name      String
  taxId     String?  @map("tax_id")
  taxOffice String?  @map("tax_office")
  phone     String?
  email     String?
  address   String?
  city      String?
  district  String?
  country   String   @default("Türkiye")
  balance   Decimal  @default(0) @db.Decimal(14, 2)
  type      String?  // 'customer', 'supplier', 'both'
  createdAt DateTime @default(now()) @map("created_at")

  company  Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  branch   Branch?   @relation(fields: [branchId], references: [id], onDelete: SetNull)
  invoices Invoice[]

  @@index([companyId])
  @@map("accounts")
}

// ============================================================
// 3. STOK YÖNETİMİ
// ============================================================

model Product {
  id           String   @id @default(uuid())
  companyId    String   @map("company_id")
  sku          String?
  barcode      String?
  name         String
  unit         String   @default("ADET")
  vatRate      Decimal  @default(20) @map("vat_rate") @db.Decimal(5, 2)
  price        Decimal  @default(0) @db.Decimal(14, 2)
  costPrice    Decimal  @default(0) @map("cost_price") @db.Decimal(14, 2)
  stockBalance Decimal  @default(0) @map("stock_balance") @db.Decimal(14, 3)
  minStock     Decimal  @default(0) @map("min_stock") @db.Decimal(14, 3)
  createdAt    DateTime @default(now()) @map("created_at")

  company      Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  invoiceItems InvoiceItem[]
  movements    StockMovement[]

  @@index([companyId])
  @@map("products")
}

model StockMovement {
  id        String        @id @default(uuid())
  companyId String        @map("company_id")
  productId String        @map("product_id")
  invoiceId String?       @map("invoice_id")
  moveType  StockMoveType @map("move_type")
  qty       Decimal       @db.Decimal(14, 3)
  createdAt DateTime      @default(now()) @map("created_at")

  company Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  product Product  @relation(fields: [productId], references: [id], onDelete: Restrict)
  invoice Invoice? @relation(fields: [invoiceId], references: [id], onDelete: SetNull)

  @@index([companyId])
  @@map("stock_movements")
}

enum StockMoveType {
  in
  out

  @@map("stock_move_type")
}

// ============================================================
// 4. FATURA VE E-FATURA YÖNETİMİ
// ============================================================

model Invoice {
  id             String      @id @default(uuid())
  companyId      String      @map("company_id")
  accountId      String      @map("account_id")
  type           InvoiceType
  invoiceNo      String?     @map("invoice_no")
  invoiceDate    DateTime    @default(now()) @map("invoice_date") @db.Date
  total          Decimal     @default(0) @db.Decimal(14, 2)
  vatTotal       Decimal     @default(0) @map("vat_total") @db.Decimal(14, 2)
  netTotal       Decimal     @default(0) @map("net_total") @db.Decimal(14, 2)
  subtotal       Decimal     @default(0) @db.Decimal(14, 2)
  
  // E-Fatura Alanları
  status         String?     // 'draft', 'completed', 'sent', 'cancelled'
  approvalStatus String?     @map("approval_status") // 'pending', 'approved', 'rejected'
  invoiceKind    String?     @map("invoice_kind") // 'SATIS', 'IADE', 'ISTISNA', 'TEVKIFAT', vb.
  eDocScenario   String?     @map("e_document_scenario") // 'TEMELFATURA', 'TICARIFATURA', 'KAMU'
  eDocType       String?     @map("e_document_type") // 'EFATURA', 'EARSIVFATURA'
  ettn           String?     // E-Fatura UUID
  gibStatus      String?     @map("gib_status")
  taxpayerKind   String?     @map("taxpayer_kind") // 'efatura', 'earsiv'
  currency       String      @default("TRY")
  taxOffice      String?     @map("tax_office")
  district       String?
  city           String?
  
  createdAt      DateTime    @default(now()) @map("created_at")

  company   Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  account   Account         @relation(fields: [accountId], references: [id], onDelete: Restrict)
  items     InvoiceItem[]
  movements StockMovement[]

  @@index([companyId])
  @@index([status])
  @@index([invoiceDate])
  @@map("invoices")
}

model InvoiceItem {
  id                String   @id @default(uuid())
  invoiceId         String   @map("invoice_id")
  productId         String   @map("product_id")
  qty               Decimal  @db.Decimal(14, 3)
  unitPrice         Decimal  @map("unit_price") @db.Decimal(14, 2)
  vatRate           Decimal  @map("vat_rate") @db.Decimal(5, 2)
  otvRate           Decimal  @default(0) @map("otv_rate") @db.Decimal(5, 2)
  discountRate      Decimal  @default(0) @map("discount_rate") @db.Decimal(5, 2)
  discountAmount    Decimal  @default(0) @map("discount_amount") @db.Decimal(14, 2)
  lineTotal         Decimal  @map("line_total") @db.Decimal(14, 2)
  
  // İhracat Alanları
  teslimatDurumu    String?  @map("teslimat_durumu")
  teslimatOrani     Decimal? @map("teslimat_orani") @db.Decimal(5, 2)
  kdvDurumu         String?  @map("kdv_durumu")
  gonderimSekli     String?  @map("gonderim_sekli")
  teslimSarti       String?  @map("teslim_sarti")
  kapCinsi          String?  @map("kap_cinsi")
  kapAdedi          Int?     @map("kap_adedi")
  gisNo             String?  @map("gis_no")
  kapNumarasi       String?  @map("kap_numarasi")
  
  // İstisna ve Tevkifat
  kdvMuafiyetSebebi String?  @map("kdv_muafiyet_sebebi")
  tevkifatDurumu    String?  @map("tevkifat_durumu")
  tevkifatOrani     Decimal? @map("tevkifat_orani") @db.Decimal(5, 2)
  
  createdAt         DateTime @default(now()) @map("created_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([invoiceId])
  @@map("invoice_items")
}

enum InvoiceType {
  sales
  purchase

  @@map("invoice_type")
}

// ============================================================
// 5. KASA VE BANKA YÖNETİMİ
// ============================================================

model CashLedger {
  id        String   @id @default(uuid())
  companyId String   @map("company_id")
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("cash_ledgers")
}

model BankAccount {
  id        String   @id @default(uuid())
  companyId String   @map("company_id")
  bankName  String?  @map("bank_name")
  iban      String?
  createdAt DateTime @default(now()) @map("created_at")

  company      Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  transactions BankTransaction[]

  @@map("bank_accounts")
}

model BankTransaction {
  id            String    @id @default(uuid())
  bankAccountId String    @map("bank_account_id")
  amount        Decimal   @db.Decimal(14, 2)
  flow          MoneyFlow
  description   String?
  trxDate       DateTime  @default(now()) @map("trx_date") @db.Date
  createdAt     DateTime  @default(now()) @map("created_at")

  bankAccount BankAccount @relation(fields: [bankAccountId], references: [id], onDelete: Cascade)

  @@map("bank_transactions")
}

enum MoneyFlow {
  in
  out

  @@map("money_flow")
}
```

---

## 7. GEÇİŞ MALİYET VE ZAMAN TAHMİNİ

### 7.1. Geliştirici Zamanı

| Faz | İş Yükü | Süre (Tek Geliştirici) | Öncelik |
|-----|---------|------------------------|---------|
| FAZ 1: Hazırlık | 20 saat | 2-3 gün | 🔴 Kritik |
| FAZ 2: DB Migration | 8 saat | 1 gün | 🔴 Kritik |
| FAZ 3: Auth Değişimi | 20 saat | 2-3 gün | 🔴 Kritik |
| FAZ 4: Supabase→Prisma | 40 saat | 5-6 gün | 🔴 Kritik |
| FAZ 5: Testing | 20 saat | 2-3 gün | 🟡 Önemli |
| FAZ 6: Deployment | 8 saat | 1 gün | 🟡 Önemli |
| **TOPLAM** | **116 saat** | **14-18 iş günü** | - |

### 7.2. Maliyet Analizi

#### Neon Ücretsiz Tier Limitleri
- ✅ 0.5GB depolama
- ✅ 100 saat compute/ay
- ✅ 10 branch
- ⚠️ Cold start (1-2 saniye)

**Tavsiye:** Production için **Scale Tier** ($19/ay)
- 200GB depolama
- Süresiz compute
- 0.5GB RAM
- Cold start yok

#### NextAuth.js
- ✅ Tamamen ücretsiz (self-hosted)

#### Toplam Maliyet (Aylık)
- **Geliştirme:** Ücretsiz (Neon Free Tier)
- **Production:** $19/ay (Neon Scale) + Vercel (mevcut)

**Karşılaştırma:**
- Supabase Free: $0/ay (500MB DB, 2 projections)
- Supabase Pro: $25/ay (8GB DB, 100K MAU)
- **Neon Scale: $19/ay** ✅ Daha ucuz

---

## 8. RİSK ANALİZİ VE AZALTİM STRATEJİLERİ

### 8.1. Yüksek Riskler

#### Risk 1: E-Fatura Modülü Karmaşıklığı
**Etki:** 🔴 Yüksek  
**Olasılık:** 🔴 Yüksek

**Açıklama:** 1000+ satır kod, 40+ state değişkeni, karmaşık iş mantığı.

**Azaltım:**
1. E-Fatura modülünü **en son** refactor et
2. Önce basit modüllerle (accounts, products) deneyim kazan
3. Unit test yazarak her adımı doğrula
4. State management için Zustand/Jotai kullanmayı düşün

#### Risk 2: RLS Kaybı
**Etki:** 🔴 Yüksek (güvenlik)  
**Olasılık:** 🟡 Orta

**Açıklama:** Supabase RLS otomatikti, Prisma'da manuel uygulanmalı.

**Azaltım:**
1. Middleware pattern kullan (her query'de companyId kontrolü)
2. Server Actions ile tüm veritabanı işlemlerini merkezi hale getir
3. Prisma middleware ile global filter uygula:
```typescript
prisma.$use(async (params, next) => {
  if (params.model && ['Account', 'Invoice', 'Product'].includes(params.model)) {
    if (!params.args.where) params.args.where = {};
    params.args.where.companyId = await getCurrentCompanyId();
  }
  return next(params);
});
```

#### Risk 3: Auth Değişimi
**Etki:** 🔴 Yüksek  
**Olasılık:** 🟡 Orta

**Açıklama:** Supabase Auth → NextAuth.js tamamen farklı API.

**Azaltım:**
1. NextAuth.js dokümantasyonunu detaylı incele
2. Önce staging ortamında test et
3. Mevcut kullanıcı session'larını koru (password reset gerekebilir)

### 8.2. Orta Riskler

#### Risk 4: 50+ Dosyada Değişiklik
**Etki:** 🟡 Orta  
**Olasılık:** 🔴 Yüksek

**Azaltım:**
1. Her dosyayı tek tek refactor et (toplu değişiklik yapma)
2. Git branch'lerini küçük tut (her modül için ayrı branch)
3. Code review yap

#### Risk 5: Cold Start (Neon Free Tier)
**Etki:** 🟡 Orta (UX)  
**Olasılık:** 🔴 Yüksek (ücretsiz tier)

**Azaltım:**
1. Production'da Scale Tier ($19/ay) kullan
2. Cron job ile her 5 dakikada ping at (free tier için)

### 8.3. Düşük Riskler

#### Risk 6: Prisma Bundle Size
**Etki:** 🟢 Düşük  
**Olasılık:** 🟢 Düşük

**Açıklama:** Prisma Client ~1MB ekler.

**Azaltım:**
- Prisma sadece server-side kullanılıyor, client bundle'a etki yok

---

## 9. ALTERNATİF ÇÖZÜMLER

### 9.1. Seçenek A: Tam Geçiş (Önerilen)
- Neon + Prisma + NextAuth.js
- ✅ Tam kontrol
- ✅ Daha ucuz
- ✅ Vendor lock-in yok
- ⚠️ Orta/yüksek iş yükü (14-18 gün)

### 9.2. Seçenek B: Hibrit Çözüm
- Neon (DB) + Supabase Auth
- ✅ Auth değişimi yok
- ⚠️ İki farklı servis
- ⚠️ Supabase Auth ücreti (100K MAU = $0, 1M MAU = $250/ay)

### 9.3. Seçenek C: Supabase'de Kalma
- Mevcut yapı
- ✅ Sıfır geçiş maliyeti
- ❌ Supabase Free Tier limitleri (500MB DB, 50K MAU)
- ❌ Supabase Pro pahalı ($25/ay)

**Tavsiye:** **Seçenek A** (Tam Geçiş) - Uzun vadede daha iyi.

---

## 10. SONUÇ VE TAVSİYELER

### 10.1. Genel Değerlendirme

✅ **Neon+Prisma Uyumlu:** Veritabanı şeması %100 uyumlu  
✅ **Maliyet Avantajı:** Neon Scale ($19/ay) < Supabase Pro ($25/ay)  
✅ **Performans:** Prisma type-safe ve hızlı  
⚠️ **Orta İş Yükü:** 14-18 gün geliştirme süresi  
⚠️ **Yüksek Dikkat Gerektiren:** E-Fatura modülü, Auth değişimi, RLS replacement

### 10.2. Tavsiyeler

1. **GEÇİŞİ YAPIN** - Uzun vadede daha sağlıklı
2. **FAZ FAZ İLERLEYİN** - Önce basit modüller, sonra karmaşık
3. **TESTLERE ODAKLANIN** - Her modülü detaylı test edin
4. **PRODUCTION'DA SCALE TIER KULLANIN** - Cold start sorunu yaşamayın
5. **BACKUP ALIN** - Geçiş öncesi mutlaka yedek alın

### 10.3. Zaman Çizelgesi Önerisi

| Hafta | İşler |
|-------|-------|
| Hafta 1 | FAZ 1: Hazırlık, FAZ 2: DB Migration, FAZ 3: Auth (ilk kurulum) |
| Hafta 2 | FAZ 3: Auth (tamamlama), FAZ 4: Basit modüller (accounts, products, dashboard) |
| Hafta 3 | FAZ 4: Orta modüller (invoices, stock, bank, cash) |
| Hafta 4 | FAZ 4: Karmaşık modüller (e-fatura, e-mustahsil), FAZ 5: Testing |
| Hafta 5 | FAZ 5: Testing (devam), FAZ 6: Deployment, Buffer (hata düzeltme) |

**Toplam:** 4-5 hafta (tek geliştirici)

### 10.4. Son Karar

**NEON + PRISMA GEÇİŞİ ÖNERİLİR.**

**Gerekçeler:**
1. Veritabanı şeması tam uyumlu
2. Maliyet avantajı var
3. Daha modern stack (Prisma type-safety)
4. Vendor lock-in riski azalıyor
5. Uzun vadede bakım kolaylığı

**Tek Şart:** E-Fatura modülünü dikkatli refactor edin ve kapsamlı test edin.

---

## 11. İLETİŞİM VE DESTEK

**Hazırlayan:** AI Assistant (Claude 3.5 Sonnet)  
**Tarih:** 7 Aralık 2025  
**Versiyon:** 1.0

**Kaynaklar:**
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth.js Docs: https://next-auth.js.org
- Next.js App Router: https://nextjs.org/docs/app

---

**NOT:** Bu PRD, uygulama yapmadan önce **detaylı analiz raporu** niteliğindedir. Gerçek geçişe başlamadan önce lütfen:
1. Mevcut Supabase veritabanından backup alın
2. Geliştirme ortamında deneme yapın
3. Her fazı ayrı branch'lerde test edin
4. Production'a geçmeden önce staging'de kapsamlı test yapın

**İYİ ŞANSLAR! 🚀**


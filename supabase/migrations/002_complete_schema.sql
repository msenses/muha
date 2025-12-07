-- ============================================================
-- FINOVA MUHASEBE SİSTEMİ - TAM VERİTABANI ŞEMASI
-- Versiyon: 2.0
-- Tarih: 7 Aralık 2025
-- ============================================================

-- ============================================================
-- 1. MEVCUT TABLOLARA EKSİK ALANLARI EKLE
-- ============================================================

-- COMPANIES tablosuna eksik alanlar (E-Fatura için gerekli)
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trade_name TEXT; -- Ticari ünvan
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tax_id TEXT; -- Vergi numarası / TCKN
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tax_office TEXT; -- Vergi dairesi
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Türkiye';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS mersis_no TEXT; -- Mersis numarası
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS kep_address TEXT; -- KEP adresi
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS e_invoice_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS e_archive_enabled BOOLEAN DEFAULT false;

-- ACCOUNTS tablosuna eksik alanlar
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS type TEXT; -- 'customer', 'supplier', 'both'
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS tax_office TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Türkiye';
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(14,2) DEFAULT 0;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS risk_limit NUMERIC(14,2) DEFAULT 0;

-- PRODUCTS tablosuna eksik alanlar
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(14,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_balance NUMERIC(14,3) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock NUMERIC(14,3) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS max_stock NUMERIC(14,3);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS critical_stock NUMERIC(14,3);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

-- INVOICES tablosuna E-Fatura alanları
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed'; -- 'draft', 'completed', 'sent', 'cancelled'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS approval_status TEXT; -- 'pending', 'approved', 'rejected'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_kind TEXT; -- 'SATIS', 'IADE', 'ISTISNA', 'TEVKIFAT', 'OZELMATRAH', 'IHRACKAYITLI', 'DIGER'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS e_document_scenario TEXT; -- 'TEMELFATURA', 'TICARIFATURA', 'KAMU', 'EARSIVFATURA', 'EARSIVATURA', 'IHRACKAYITLI'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS e_document_type TEXT; -- 'EFATURA', 'EARSIVFATURA'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS ettn TEXT; -- E-Fatura UUID
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS gib_status TEXT; -- GİB durumu
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS taxpayer_kind TEXT; -- 'efatura', 'earsiv'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,4) DEFAULT 1;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_office TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14,2) DEFAULT 0; -- KDV öncesi toplam
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_total NUMERIC(14,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shipment_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shipment_time TIME;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_type TEXT; -- 'Nakit', 'Havale', 'Kredi Kartı'
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS kamu_bank TEXT; -- KAMU senaryosu için banka
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS kamu_account_no TEXT; -- KAMU senaryosu için hesap no

-- INVOICE_ITEMS tablosuna detaylı alanlar
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS otv_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS discount_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(14,2) DEFAULT 0;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'ADET';
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS description TEXT;

-- İhracat alanları
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS teslimat_durumu TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS teslimat_orani NUMERIC(5,2);
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS kdv_durumu TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS gonderim_sekli TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS teslim_sarti TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS kap_cinsi TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS kap_adedi INTEGER;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS gis_no TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS kap_numarasi TEXT;

-- İstisna ve Tevkifat alanları
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS kdv_muafiyet_sebebi TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS tevkifat_durumu TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS tevkifat_orani NUMERIC(5,2);

-- ============================================================
-- 2. USER PROFILES TABLOSU (profiles'tan user_profiles'a geçiş)
-- ============================================================

-- Yeni user_profiles tablosu oluştur
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'manager', 'user'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_company_id_idx ON public.user_profiles(company_id);

-- Eski profiles tablosundan veri migrate et (eğer varsa)
INSERT INTO public.user_profiles (user_id, company_id, role, status, created_at)
SELECT 
    user_id, 
    company_id, 
    COALESCE(role, 'user'),
    'active',
    COALESCE(created_at, NOW())
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Updated_at trigger'ı
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. YENİ TABLOLAR - CARİ HESAP
-- ============================================================

-- Cari Grupları
CREATE TABLE IF NOT EXISTS public.account_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS account_groups_company_idx ON public.account_groups(company_id);

-- Accounts tablosuna grup ilişkisi
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.account_groups(id) ON DELETE SET NULL;

-- Cari Hareketleri (Tahsilat/Ödeme)
CREATE TABLE IF NOT EXISTS public.account_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type TEXT NOT NULL, -- 'collection', 'payment', 'debt', 'credit'
    amount NUMERIC(14,2) NOT NULL,
    payment_method TEXT, -- 'Nakit', 'Havale', 'Kredi Kartı', 'Çek', 'Senet'
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    cash_ledger_id UUID REFERENCES public.cash_ledgers(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT NOW(),
    description TEXT,
    receipt_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS account_transactions_company_idx ON public.account_transactions(company_id);
CREATE INDEX IF NOT EXISTS account_transactions_account_idx ON public.account_transactions(account_id);
CREATE INDEX IF NOT EXISTS account_transactions_date_idx ON public.account_transactions(transaction_date);

-- ============================================================
-- 4. YENİ TABLOLAR - STOK YÖNETİMİ
-- ============================================================

-- Stok Grupları
CREATE TABLE IF NOT EXISTS public.product_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_groups_company_idx ON public.product_groups(company_id);

-- Products tablosuna grup ilişkisi
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.product_groups(id) ON DELETE SET NULL;

-- Birim Tanımları
CREATE TABLE IF NOT EXISTS public.product_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_units_company_idx ON public.product_units(company_id);

-- Depolar
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS warehouses_company_idx ON public.warehouses(company_id);

-- Depo bazlı stok hareketleri için stock_movements tablosunu güncelle
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(14,2); -- Birim maliyet
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS description TEXT;

-- Seri/Lot Takibi
CREATE TABLE IF NOT EXISTS public.product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    lot_no TEXT NOT NULL,
    serial_no TEXT,
    production_date DATE,
    expiry_date DATE,
    quantity NUMERIC(14,3) DEFAULT 0,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_lots_company_idx ON public.product_lots(company_id);
CREATE INDEX IF NOT EXISTS product_lots_product_idx ON public.product_lots(product_id);

-- Fiyat Listeleri
CREATE TABLE IF NOT EXISTS public.price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    currency TEXT DEFAULT 'TRY',
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS price_lists_company_idx ON public.price_lists(company_id);

-- Fiyat Listesi Detayları
CREATE TABLE IF NOT EXISTS public.price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id UUID NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    price NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS price_list_items_list_idx ON public.price_list_items(price_list_id);
CREATE INDEX IF NOT EXISTS price_list_items_product_idx ON public.price_list_items(product_id);

-- Paket Grupları
CREATE TABLE IF NOT EXISTS public.package_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    total_price NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS package_groups_company_idx ON public.package_groups(company_id);

-- Paket Grup Ürünleri
CREATE TABLE IF NOT EXISTS public.package_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_group_id UUID NOT NULL REFERENCES public.package_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity NUMERIC(14,3) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS package_group_items_package_idx ON public.package_group_items(package_group_id);

-- ============================================================
-- 4. YENİ TABLOLAR - TEKLİF VE SİPARİŞ
-- ============================================================

-- Teklif/Sipariş Tipi
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_order_type') THEN
        CREATE TYPE public.quote_order_type AS ENUM ('quote_given', 'quote_received', 'order_given', 'order_received');
    END IF;
END $$;

-- Durum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_order_status') THEN
        CREATE TYPE public.quote_order_status AS ENUM ('pending', 'approved', 'rejected', 'converted', 'cancelled');
    END IF;
END $$;

-- Teklif ve Siparişler
CREATE TABLE IF NOT EXISTS public.quotes_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type public.quote_order_type NOT NULL,
    status public.quote_order_status DEFAULT 'pending',
    quote_order_no TEXT,
    quote_order_date DATE NOT NULL DEFAULT NOW(),
    valid_until DATE,
    total NUMERIC(14,2) DEFAULT 0,
    vat_total NUMERIC(14,2) DEFAULT 0,
    net_total NUMERIC(14,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS quotes_orders_company_idx ON public.quotes_orders(company_id);
CREATE INDEX IF NOT EXISTS quotes_orders_account_idx ON public.quotes_orders(account_id);
CREATE INDEX IF NOT EXISTS quotes_orders_date_idx ON public.quotes_orders(quote_order_date);

-- Teklif/Sipariş Kalemleri
CREATE TABLE IF NOT EXISTS public.quote_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_order_id UUID NOT NULL REFERENCES public.quotes_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    qty NUMERIC(14,3) NOT NULL,
    unit_price NUMERIC(14,2) NOT NULL,
    vat_rate NUMERIC(5,2) NOT NULL,
    discount_rate NUMERIC(5,2) DEFAULT 0,
    line_total NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS quote_order_items_quote_order_idx ON public.quote_order_items(quote_order_id);

-- ============================================================
-- 5. YENİ TABLOLAR - İRSALİYE
-- ============================================================

-- İrsaliye Tipi
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispatch_type') THEN
        CREATE TYPE public.dispatch_type AS ENUM ('sales', 'purchase');
    END IF;
END $$;

-- İrsaliyeler
CREATE TABLE IF NOT EXISTS public.dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type public.dispatch_type NOT NULL,
    dispatch_no TEXT,
    dispatch_date DATE NOT NULL DEFAULT NOW(),
    carrier_name TEXT,
    carrier_phone TEXT,
    vehicle_plate TEXT,
    notes TEXT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL, -- Faturaya dönüşürse
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS dispatches_company_idx ON public.dispatches(company_id);
CREATE INDEX IF NOT EXISTS dispatches_account_idx ON public.dispatches(account_id);

-- İrsaliye Kalemleri
CREATE TABLE IF NOT EXISTS public.dispatch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id UUID NOT NULL REFERENCES public.dispatches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    qty NUMERIC(14,3) NOT NULL,
    unit_price NUMERIC(14,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS dispatch_items_dispatch_idx ON public.dispatch_items(dispatch_id);

-- ============================================================
-- 6. YENİ TABLOLAR - ÇEK VE SENET
-- ============================================================

-- Çek/Senet Tipi
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cheque_note_type') THEN
        CREATE TYPE public.cheque_note_type AS ENUM ('cheque', 'note');
    END IF;
END $$;

-- Çek/Senet Durumu
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cheque_note_status') THEN
        CREATE TYPE public.cheque_note_status AS ENUM ('pending', 'paid', 'bounced', 'endorsed', 'cancelled');
    END IF;
END $$;

-- Çek ve Senetler
CREATE TABLE IF NOT EXISTS public.cheques_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type public.cheque_note_type NOT NULL,
    status public.cheque_note_status DEFAULT 'pending',
    direction TEXT NOT NULL, -- 'incoming', 'outgoing'
    document_no TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    bank_name TEXT,
    bank_branch TEXT,
    drawer_name TEXT, -- Keşideci
    endorsement_history TEXT[], -- Ciro geçmişi
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cheques_notes_company_idx ON public.cheques_notes(company_id);
CREATE INDEX IF NOT EXISTS cheques_notes_account_idx ON public.cheques_notes(account_id);
CREATE INDEX IF NOT EXISTS cheques_notes_due_date_idx ON public.cheques_notes(due_date);

-- ============================================================
-- 8. YENİ TABLOLAR - TAKSİT TAKİP
-- ============================================================

-- Taksit Planları
CREATE TABLE IF NOT EXISTS public.installment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    total_amount NUMERIC(14,2) NOT NULL,
    installment_count INTEGER NOT NULL,
    start_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS installment_plans_company_idx ON public.installment_plans(company_id);
CREATE INDEX IF NOT EXISTS installment_plans_account_idx ON public.installment_plans(account_id);

-- Taksitler
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installment_plan_id UUID NOT NULL REFERENCES public.installment_plans(id) ON DELETE CASCADE,
    installment_no INTEGER NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    paid_amount NUMERIC(14,2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS installments_plan_idx ON public.installments(installment_plan_id);
CREATE INDEX IF NOT EXISTS installments_due_date_idx ON public.installments(due_date);

-- ============================================================
-- 9. YENİ TABLOLAR - E-MÜSTAHSIL
-- ============================================================

-- E-Müstahsil Makbuzları
CREATE TABLE IF NOT EXISTS public.e_mustahsil_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    receipt_no TEXT,
    receipt_date DATE NOT NULL DEFAULT NOW(),
    total NUMERIC(14,2) DEFAULT 0,
    gv_stopaj NUMERIC(5,2) DEFAULT 10, -- G.V. Stopaj %
    gv_stopaj_amount NUMERIC(14,2) DEFAULT 0,
    pasture_fund NUMERIC(14,2) DEFAULT 0, -- Mera Fonu
    exchange_fee NUMERIC(14,2) DEFAULT 0, -- Borsa Tescil Ücreti
    sgk_cut NUMERIC(14,2) DEFAULT 0, -- SGK Prim Kesintisi
    net_total NUMERIC(14,2) DEFAULT 0, -- Genel Toplam
    payment_type TEXT,
    notes TEXT,
    etmm TEXT, -- E-Müstahsil UUID
    gib_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS e_mustahsil_receipts_company_idx ON public.e_mustahsil_receipts(company_id);
CREATE INDEX IF NOT EXISTS e_mustahsil_receipts_account_idx ON public.e_mustahsil_receipts(account_id);

-- E-Müstahsil Kalemleri
CREATE TABLE IF NOT EXISTS public.e_mustahsil_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES public.e_mustahsil_receipts(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    qty NUMERIC(14,3) NOT NULL,
    unit_price NUMERIC(14,2) NOT NULL,
    vat_rate NUMERIC(5,2) DEFAULT 0,
    discount_rate NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(14,2) DEFAULT 0,
    line_total NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS e_mustahsil_items_receipt_idx ON public.e_mustahsil_items(receipt_id);

-- ============================================================
-- 10. YENİ TABLOLAR - GELİR/GİDER
-- ============================================================

-- Gelir/Gider Tipi
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'income_expense_type') THEN
        CREATE TYPE public.income_expense_type AS ENUM ('income', 'expense');
    END IF;
END $$;

-- Gelir/Gider Kategorileri
CREATE TABLE IF NOT EXISTS public.income_expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type public.income_expense_type NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS income_expense_categories_company_idx ON public.income_expense_categories(company_id);

-- Gelir/Gider Kayıtları
CREATE TABLE IF NOT EXISTS public.income_expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.income_expense_categories(id) ON DELETE SET NULL,
    type public.income_expense_type NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT NOW(),
    payment_method TEXT,
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    cash_ledger_id UUID REFERENCES public.cash_ledgers(id) ON DELETE SET NULL,
    description TEXT,
    receipt_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS income_expense_records_company_idx ON public.income_expense_records(company_id);
CREATE INDEX IF NOT EXISTS income_expense_records_date_idx ON public.income_expense_records(transaction_date);

-- ============================================================
-- 10. YENİ TABLOLAR - AJANDA
-- ============================================================

-- Ajanda Kayıtları
CREATE TABLE IF NOT EXISTS public.agenda_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    priority TEXT, -- 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agenda_items_company_idx ON public.agenda_items(company_id);
CREATE INDEX IF NOT EXISTS agenda_items_user_idx ON public.agenda_items(user_id);
CREATE INDEX IF NOT EXISTS agenda_items_reminder_idx ON public.agenda_items(reminder_date);

-- ============================================================
-- 11. KASA VE BANKA İYİLEŞTİRMELERİ
-- ============================================================

-- Cash Ledgers tablosuna ek alanlar
ALTER TABLE public.cash_ledgers ADD COLUMN IF NOT EXISTS balance NUMERIC(14,2) DEFAULT 0;
ALTER TABLE public.cash_ledgers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.cash_ledgers ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Cash Transactions
CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_ledger_id UUID NOT NULL REFERENCES public.cash_ledgers(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL,
    flow public.money_flow NOT NULL,
    description TEXT,
    trx_date DATE NOT NULL DEFAULT NOW(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cash_transactions_ledger_idx ON public.cash_transactions(cash_ledger_id);
CREATE INDEX IF NOT EXISTS cash_transactions_date_idx ON public.cash_transactions(trx_date);

-- Bank Accounts tablosuna ek alanlar
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS account_no TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS balance NUMERIC(14,2) DEFAULT 0;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Bank Transactions'a ek alanlar
ALTER TABLE public.bank_transactions ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.bank_transactions ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;
ALTER TABLE public.bank_transactions ADD COLUMN IF NOT EXISTS reference_no TEXT;

-- ============================================================
-- 12. SISTEM AYARLARI
-- ============================================================

-- Sistem Ayarları
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, key)
);
CREATE INDEX IF NOT EXISTS settings_company_idx ON public.settings(company_id);

-- Numaralandırma Şemaları
CREATE TABLE IF NOT EXISTS public.numbering_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'invoice', 'dispatch', 'quote', 'order', vb.
    prefix TEXT,
    suffix TEXT,
    next_number INTEGER DEFAULT 1,
    padding INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, document_type)
);
CREATE INDEX IF NOT EXISTS numbering_schemes_company_idx ON public.numbering_schemes(company_id);

-- ============================================================
-- 13. İNDEKSLER VE PERFORMANS OPTİMİZASYONU
-- ============================================================

-- Bileşik indeksler
CREATE INDEX IF NOT EXISTS invoices_company_date_idx ON public.invoices(company_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS invoices_company_status_idx ON public.invoices(company_id, status);
CREATE INDEX IF NOT EXISTS invoices_ettn_idx ON public.invoices(ettn) WHERE ettn IS NOT NULL;
CREATE INDEX IF NOT EXISTS accounts_company_name_idx ON public.accounts(company_id, name);
CREATE INDEX IF NOT EXISTS products_company_name_idx ON public.products(company_id, name);
CREATE INDEX IF NOT EXISTS products_barcode_idx ON public.products(barcode) WHERE barcode IS NOT NULL;

-- Text search indeksleri (opsiyonel - performans için)
-- CREATE INDEX IF NOT EXISTS accounts_name_trgm_idx ON public.accounts USING gin(name gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON public.products USING gin(name gin_trgm_ops);

-- ============================================================
-- 14. RLS POLİCY GÜNCELLEMELERİ
-- ============================================================

-- Yeni tablolar için RLS etkinleştir
ALTER TABLE public.account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheques_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_mustahsil_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_mustahsil_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numbering_schemes ENABLE ROW LEVEL SECURITY;

-- Company-scoped policies (tüm yeni tablolar için)
-- Account Groups
DROP POLICY IF EXISTS account_groups_rw ON public.account_groups;
CREATE POLICY account_groups_rw ON public.account_groups
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Account Transactions
DROP POLICY IF EXISTS account_transactions_rw ON public.account_transactions;
CREATE POLICY account_transactions_rw ON public.account_transactions
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Product Groups
DROP POLICY IF EXISTS product_groups_rw ON public.product_groups;
CREATE POLICY product_groups_rw ON public.product_groups
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Product Units
DROP POLICY IF EXISTS product_units_rw ON public.product_units;
CREATE POLICY product_units_rw ON public.product_units
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Warehouses
DROP POLICY IF EXISTS warehouses_rw ON public.warehouses;
CREATE POLICY warehouses_rw ON public.warehouses
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Product Lots
DROP POLICY IF EXISTS product_lots_rw ON public.product_lots;
CREATE POLICY product_lots_rw ON public.product_lots
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Price Lists
DROP POLICY IF EXISTS price_lists_rw ON public.price_lists;
CREATE POLICY price_lists_rw ON public.price_lists
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Price List Items (ilişkili tablo kontrolü)
DROP POLICY IF EXISTS price_list_items_r ON public.price_list_items;
CREATE POLICY price_list_items_r ON public.price_list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.price_lists pl
            WHERE pl.id = price_list_id
            AND pl.company_id = (SELECT company_id FROM public.current_user_company)
        )
    );

DROP POLICY IF EXISTS price_list_items_w ON public.price_list_items;
CREATE POLICY price_list_items_w ON public.price_list_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.price_lists pl
            WHERE pl.id = price_list_id
            AND pl.company_id = (SELECT company_id FROM public.current_user_company)
        )
    );

-- Package Groups
DROP POLICY IF EXISTS package_groups_rw ON public.package_groups;
CREATE POLICY package_groups_rw ON public.package_groups
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Package Group Items
DROP POLICY IF EXISTS package_group_items_r ON public.package_group_items;
CREATE POLICY package_group_items_r ON public.package_group_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.package_groups pg
            WHERE pg.id = package_group_id
            AND pg.company_id = (SELECT company_id FROM public.current_user_company)
        )
    );

-- Quotes/Orders
DROP POLICY IF EXISTS quotes_orders_rw ON public.quotes_orders;
CREATE POLICY quotes_orders_rw ON public.quotes_orders
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Quote/Order Items
DROP POLICY IF EXISTS quote_order_items_r ON public.quote_order_items;
CREATE POLICY quote_order_items_r ON public.quote_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quotes_orders qo
            WHERE qo.id = quote_order_id
            AND qo.company_id = (SELECT company_id FROM public.current_user_company)
        )
    );

-- Dispatches
DROP POLICY IF EXISTS dispatches_rw ON public.dispatches;
CREATE POLICY dispatches_rw ON public.dispatches
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Cheques/Notes
DROP POLICY IF EXISTS cheques_notes_rw ON public.cheques_notes;
CREATE POLICY cheques_notes_rw ON public.cheques_notes
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Installment Plans
DROP POLICY IF EXISTS installment_plans_rw ON public.installment_plans;
CREATE POLICY installment_plans_rw ON public.installment_plans
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- E-Müstahsil Receipts
DROP POLICY IF EXISTS e_mustahsil_receipts_rw ON public.e_mustahsil_receipts;
CREATE POLICY e_mustahsil_receipts_rw ON public.e_mustahsil_receipts
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Income/Expense Categories
DROP POLICY IF EXISTS income_expense_categories_rw ON public.income_expense_categories;
CREATE POLICY income_expense_categories_rw ON public.income_expense_categories
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Income/Expense Records
DROP POLICY IF EXISTS income_expense_records_rw ON public.income_expense_records;
CREATE POLICY income_expense_records_rw ON public.income_expense_records
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Agenda Items (kullanıcı bazlı da kontrol edilebilir)
DROP POLICY IF EXISTS agenda_items_rw ON public.agenda_items;
CREATE POLICY agenda_items_rw ON public.agenda_items
    FOR ALL USING (
        company_id = (SELECT company_id FROM public.current_user_company)
        AND (user_id IS NULL OR user_id = auth.uid())
    )
    WITH CHECK (
        company_id = (SELECT company_id FROM public.current_user_company)
        AND (user_id IS NULL OR user_id = auth.uid())
    );

-- Cash Transactions
DROP POLICY IF EXISTS cash_transactions_r ON public.cash_transactions;
CREATE POLICY cash_transactions_r ON public.cash_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cash_ledgers cl
            WHERE cl.id = cash_ledger_id
            AND cl.company_id = (SELECT company_id FROM public.current_user_company)
        )
    );

-- Settings
DROP POLICY IF EXISTS settings_rw ON public.settings;
CREATE POLICY settings_rw ON public.settings
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- Numbering Schemes
DROP POLICY IF EXISTS numbering_schemes_rw ON public.numbering_schemes;
CREATE POLICY numbering_schemes_rw ON public.numbering_schemes
    FOR ALL USING (company_id = (SELECT company_id FROM public.current_user_company))
    WITH CHECK (company_id = (SELECT company_id FROM public.current_user_company));

-- ============================================================
-- 15. YARDIMCI FONKSİYONLAR
-- ============================================================

-- Fatura numarası oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION public.generate_invoice_no(p_company_id UUID, p_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_scheme RECORD;
    v_next_no INTEGER;
    v_result TEXT;
BEGIN
    -- Numaralandırma şemasını al
    SELECT * INTO v_scheme
    FROM public.numbering_schemes
    WHERE company_id = p_company_id AND document_type = 'invoice'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        -- Varsayılan şema oluştur
        INSERT INTO public.numbering_schemes (company_id, document_type, prefix, next_number, padding)
        VALUES (p_company_id, 'invoice', 'INV-', 1, 6)
        RETURNING * INTO v_scheme;
    END IF;
    
    -- Sonraki numarayı al ve güncelle
    v_next_no := v_scheme.next_number;
    UPDATE public.numbering_schemes
    SET next_number = next_number + 1
    WHERE id = v_scheme.id;
    
    -- Numara oluştur
    v_result := COALESCE(v_scheme.prefix, '') || 
                LPAD(v_next_no::TEXT, v_scheme.padding, '0') || 
                COALESCE(v_scheme.suffix, '');
    
    RETURN v_result;
END;
$$;

-- Cari bakiye güncelleme trigger
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Sadece completed invoicelar için bakiye güncelleme
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'completed' THEN
            IF NEW.type = 'sales' THEN
                UPDATE public.accounts
                SET balance = balance + NEW.net_total
                WHERE id = NEW.account_id;
            ELSIF NEW.type = 'purchase' THEN
                UPDATE public.accounts
                SET balance = balance - NEW.net_total
                WHERE id = NEW.account_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Eski durum completed ise geri al
        IF OLD.status = 'completed' THEN
            IF OLD.type = 'sales' THEN
                UPDATE public.accounts
                SET balance = balance - OLD.net_total
                WHERE id = OLD.account_id;
            ELSIF OLD.type = 'purchase' THEN
                UPDATE public.accounts
                SET balance = balance + OLD.net_total
                WHERE id = OLD.account_id;
            END IF;
        END IF;
        
        -- Yeni durum completed ise uygula
        IF NEW.status = 'completed' THEN
            IF NEW.type = 'sales' THEN
                UPDATE public.accounts
                SET balance = balance + NEW.net_total
                WHERE id = NEW.account_id;
            ELSIF NEW.type = 'purchase' THEN
                UPDATE public.accounts
                SET balance = balance - NEW.net_total
                WHERE id = NEW.account_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'completed' THEN
            IF OLD.type = 'sales' THEN
                UPDATE public.accounts
                SET balance = balance - OLD.net_total
                WHERE id = OLD.account_id;
            ELSIF OLD.type = 'purchase' THEN
                UPDATE public.accounts
                SET balance = balance + OLD.net_total
                WHERE id = OLD.account_id;
            END IF;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_update_account_balance ON public.invoices;
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLİCİES
-- ============================================================

-- Companies tablosu için RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies
    FOR SELECT
    USING (
        id IN (
            SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS companies_all ON public.companies;
CREATE POLICY companies_all ON public.companies
    FOR ALL
    USING (
        id IN (
            SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- User Profiles tablosu için RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_self ON public.user_profiles;
CREATE POLICY user_profiles_self ON public.user_profiles
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Accounts tablosu için RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accounts_company ON public.accounts;
CREATE POLICY accounts_company ON public.accounts
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
        )
    );

-- Products tablosu için RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_company ON public.products;
CREATE POLICY products_company ON public.products
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
        )
    );

-- Invoices tablosu için RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoices_company ON public.invoices;
CREATE POLICY invoices_company ON public.invoices
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
        )
    );

-- Invoice Items tablosu için RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_items_company ON public.invoice_items;
CREATE POLICY invoice_items_company ON public.invoice_items
    FOR ALL
    USING (
        invoice_id IN (
            SELECT id FROM public.invoices WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Diğer tablolar için RLS (company_id bazlı)
DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'company_id'
        AND table_name NOT IN ('companies', 'accounts', 'products', 'invoices', 'user_profiles')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS %I_company ON public.%I', tbl, tbl);
        
        EXECUTE format('
            CREATE POLICY %I_company ON public.%I
            FOR ALL
            USING (
                company_id IN (
                    SELECT company_id FROM public.user_profiles WHERE user_id = auth.uid()
                )
            )', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================
-- COMPLETED: Tam veritabanı şeması hazır!
-- ============================================================


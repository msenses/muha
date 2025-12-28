-- ============================================================
-- TAKSİT PLANLARINA TAHSİLAT ŞEKLİ ve BANKA/KASA BAĞLANTISI
-- ============================================================
-- installment_plans tablosuna:
--  - collection_method: 'cash' | 'bank' (metinsel)
--  - cash_ledger_id:    hangi kasadan tahsilat yapılacağı
--  - bank_account_id:   hangi banka hesabından tahsilat yapılacağı
-- Bu alanlar, taksit planı oluşturulurken seçilen değerlere göre doldurulacak.
-- ============================================================

ALTER TABLE public.installment_plans
  ADD COLUMN IF NOT EXISTS collection_method TEXT,
  ADD COLUMN IF NOT EXISTS cash_ledger_id UUID REFERENCES public.cash_ledgers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL;


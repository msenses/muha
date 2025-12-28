-- ============================================================
-- INSTALLMENTS TABLOSU İÇİN RLS POLICY
-- ============================================================
-- 002_complete_schema.sql içinde:
--   - installments tablosu oluşturuluyor
--   - RLS ENABLE ediliyor
-- fakat herhangi bir POLICY tanımlanmamış durumda.
-- Bu yüzden client üzerinden insert/select yaparken
-- "new row violates row-level security policy for table \"installments\""
-- hatası alınıyor.
--
-- Bu migration, installments için invoice_items benzeri bir company
-- kontrolü ekler:
--   - installment_plan_id üzerinden installment_plans tablosuna bakılır
--   - ilgili planın company_id'si current_user_company ile eşleşiyorsa
--     satıra erişim verilir.
-- ============================================================

ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS installments_rw ON public.installments;

CREATE POLICY installments_rw ON public.installments
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.installment_plans p
    WHERE p.id = installment_plan_id
      AND p.company_id = (SELECT company_id FROM public.current_user_company)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.installment_plans p
    WHERE p.id = installment_plan_id
      AND p.company_id = (SELECT company_id FROM public.current_user_company)
  )
);


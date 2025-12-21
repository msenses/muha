-- cash_transactions SELECT RLS policyini yeni user_profiles yapısına göre düzelt

DO $$
BEGIN
  -- Eski SELECT policy'sini (current_user_company kullanan) kaldır
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cash_transactions'
      AND policyname = 'cash_transactions_r'
  ) THEN
    EXECUTE 'DROP POLICY cash_transactions_r ON public.cash_transactions';
  END IF;
END $$;

-- Yeni SELECT policy:
-- Kullanıcının erişebildiği şirketlere ait kasaların hareketlerini görebilsin
CREATE POLICY cash_transactions_r ON public.cash_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.cash_ledgers cl
      JOIN public.user_profiles up
        ON up.company_id = cl.company_id
      WHERE cl.id = cash_ledger_id
        AND up.user_id = auth.uid()
    )
  );



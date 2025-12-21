-- bank_transactions RLS policylerini yeni user_profiles yapısına göre düzelt

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bank_transactions'
      AND policyname = 'bank_trx_r'
  ) THEN
    EXECUTE 'DROP POLICY bank_trx_r ON public.bank_transactions';
  END IF;
END $$;

CREATE POLICY bank_trx_r ON public.bank_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.bank_accounts b
      JOIN public.user_profiles up
        ON up.company_id = b.company_id
      WHERE b.id = bank_account_id
        AND up.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bank_transactions'
      AND policyname = 'bank_trx_w'
  ) THEN
    EXECUTE 'DROP POLICY bank_trx_w ON public.bank_transactions';
  END IF;
END $$;

CREATE POLICY bank_trx_w ON public.bank_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.bank_accounts b
      JOIN public.user_profiles up
        ON up.company_id = b.company_id
      WHERE b.id = bank_account_id
        AND up.user_id = auth.uid()
    )
  );



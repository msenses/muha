-- Enable insert (write) for cash_transactions with proper RLS checks
-- Kullanıcı sadece erişimine açık şirketlerin kasalarına hareket ekleyebilsin

DO $$
BEGIN
  -- Eski policy varsa temizle
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cash_transactions'
      AND policyname = 'cash_transactions_w'
  ) THEN
    EXECUTE 'DROP POLICY cash_transactions_w ON public.cash_transactions';
  END IF;
END $$;

CREATE POLICY cash_transactions_w ON public.cash_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cash_ledgers cl
      JOIN public.user_profiles up
        ON up.company_id = cl.company_id
      WHERE cl.id = cash_ledger_id
        AND up.user_id = auth.uid()
    )
  );



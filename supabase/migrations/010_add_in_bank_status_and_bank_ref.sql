-- cheque_note_status tipine 'in_bank' degerini ekle ve cheques_notes tablosuna bank_account_id kolonu ekle

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'cheque_note_status'
      AND e.enumlabel = 'in_bank'
  ) THEN
    ALTER TYPE public.cheque_note_status ADD VALUE 'in_bank';
  END IF;
END $$;

ALTER TABLE public.cheques_notes
  ADD COLUMN IF NOT EXISTS bank_account_id uuid REFERENCES public.bank_accounts(id) ON DELETE SET NULL;



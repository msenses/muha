-- cash_transactions ve bank_transactions tablolarına çek/senet referansı ekle

ALTER TABLE public.cash_transactions
  ADD COLUMN IF NOT EXISTS cheque_note_id uuid REFERENCES public.cheques_notes(id) ON DELETE SET NULL;

ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS cheque_note_id uuid REFERENCES public.cheques_notes(id) ON DELETE SET NULL;



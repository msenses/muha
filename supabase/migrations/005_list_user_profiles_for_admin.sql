-- ============================================================
-- USER_PROFILES LISTESİ (RLS'TEN BAĞIMSIZ)
-- Bu fonksiyon RLS'e dokunmadan, SECURITY DEFINER ile:
--  - Tüm user_profiles satırlarını döner.
-- Uygulamadaki /users sayfası bu fonksiyonu kullanarak listeleme yapar.
-- Admin kontrolü uygulama tarafında (isAdmin) zaten yapılıyor.
-- ============================================================

create or replace function public.list_user_profiles_for_admin()
returns table (
  id uuid,
  user_id uuid,
  role text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  select up.id, up.user_id, up.role, up.status, up.created_at
  from public.user_profiles up
  order by up.created_at asc;
$$;


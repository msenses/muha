-- ============================================================
-- ADMIN KULLANICILAR İÇİN GÜVENLİ USER_PROFILES OLUŞTURMA FONKSİYONU
-- Bu fonksiyon, zaten auth.users tablosunda oluşturulmuş bir kullanıcı için
-- (ör. client tarafında supabase.auth.signUp ile)
-- aynı firmaya bağlı user_profiles kaydı ekler.
--
-- RLS'e dokunmaz; SECURITY DEFINER sayesinde kendi içinde RLS'i bypass eder.
-- Yetki kontrolü fonksiyon içinde yapılır:
--   - Sadece role = 'admin' olan çağıran kullanıcı, kendi company_id'si için
--     yeni user_profiles satırı oluşturabilir.
-- ============================================================

create or replace function public.create_user_with_profile(
  p_user_id uuid,
  p_role    text default 'user'
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_admin_profile public.user_profiles;
begin
  -- 1) Çağıran kullanıcının admin olduğunu ve bir firmaya bağlı olduğunu doğrula
  select *
  into v_admin_profile
  from public.user_profiles
  where user_id = auth.uid()
    and role = 'admin'
  limit 1;

  if v_admin_profile.user_id is null then
    raise exception 'Bu islemi sadece admin kullanicilar yapabilir.'
      using errcode = '42501';
  end if;

  if v_admin_profile.company_id is null then
    raise exception 'Admin kullanicinin bagli oldugu bir company_id bulunamadi.';
  end if;

  -- 2) Yeni kullanici icin user_profiles kaydi olustur
  insert into public.user_profiles (user_id, company_id, role, status)
  values (p_user_id, v_admin_profile.company_id, p_role, 'active');

end;
$$;


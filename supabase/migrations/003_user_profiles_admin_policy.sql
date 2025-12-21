-- ============================================================
-- USER_PROFILES RLS GÜNCELLEME
-- Amaç:
--  - Mevcut kullanıcıların kendi user_profiles kaydını görüp güncelleyebilmesi
--  - Aynı firmadaki admin kullanıcıların diğer kullanıcılar için user_profiles
--    kaydı oluşturup güncelleyebilmesi
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Eski sadece "kendisi" erişebilsin politikasını kaldır
DROP POLICY IF EXISTS user_profiles_self ON public.user_profiles;

-- Yeni politika:
-- 1) Kullanıcı kendi kaydı (user_id = auth.uid()) için tam erişime sahip
-- 2) Aynı firmadaki admin kullanıcılar (role = 'admin') o firmaya ait
--    tüm user_profiles kayıtlarını yönetebilir
CREATE POLICY user_profiles_rw ON public.user_profiles
FOR ALL
USING (
  -- Kendi kaydı
  user_id = auth.uid()
  OR
  -- Aynı firmadaki admin
  EXISTS (
    SELECT 1
    FROM public.user_profiles up_admin
    WHERE up_admin.user_id = auth.uid()
      AND up_admin.company_id = public.user_profiles.company_id
      AND up_admin.role = 'admin'
  )
)
WITH CHECK (
  -- Kendi kaydını oluşturma/güncelleme
  user_id = auth.uid()
  OR
  -- Aynı firmadaki admin'in başka kullanıcılar için kayıt oluşturup/güncellemesi
  EXISTS (
    SELECT 1
    FROM public.user_profiles up_admin
    WHERE up_admin.user_id = auth.uid()
      AND up_admin.company_id = public.user_profiles.company_id
      AND up_admin.role = 'admin'
  )
);


-- =============================================
-- KULLANICI VE FİRMA BAĞLANTISI SETUP
-- =============================================
-- Bu dosya yeni bir kullanıcı oluşturulduğunda veya
-- mevcut kullanıcıları bir firmaya bağlamak için kullanılır.

-- 1. ADIM: Mevcut kullanıcıları listele
-- =============================================
SELECT 
  id as user_id,
  email,
  created_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Bu sorgu sonucunda kullanıcı ID'lerini göreceksiniz.
-- Bir sonraki adımda bu ID'leri kullanacağız.


-- 2. ADIM: Mevcut firmaları listele
-- =============================================
SELECT 
  id as company_id,
  name,
  trade_name,
  tax_id
FROM public.companies
ORDER BY created_at DESC;

-- Eğer firma yoksa, önce seed/002_production_seed.sql dosyasını çalıştırın!


-- 3. ADIM: User Profile oluştur (veya güncelle)
-- =============================================
-- KULLANIM: Aşağıdaki USER_ID ve COMPANY_ID değerlerini
-- yukarıdaki sorgulardan aldığınız değerlerle değiştirin.

-- Örnek: Yeni kullanıcı için profile oluşturma
INSERT INTO public.user_profiles (user_id, company_id, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- ← USER_ID'yi buraya yazın
  '00000000-0000-0000-0000-000000000000',  -- ← COMPANY_ID'yi buraya yazın
  'admin',                                  -- Role: 'admin', 'manager', 'user'
  'active'                                  -- Status: 'active', 'suspended', 'pending'
)
ON CONFLICT (user_id) 
DO UPDATE SET
  company_id = EXCLUDED.company_id,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();


-- 4. ADIM: Toplu kullanıcı ekleme (birden fazla kullanıcı için)
-- =============================================
-- Örnek: 3 kullanıcıyı aynı firmaya bağlama

/*
INSERT INTO public.user_profiles (user_id, company_id, role, status)
VALUES 
  ('user-id-1', 'company-id-1', 'admin', 'active'),
  ('user-id-2', 'company-id-1', 'manager', 'active'),
  ('user-id-3', 'company-id-1', 'user', 'active')
ON CONFLICT (user_id) 
DO UPDATE SET
  company_id = EXCLUDED.company_id,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();
*/


-- 5. ADIM: Mevcut kullanıcı-firma bağlantılarını kontrol et
-- =============================================
SELECT 
  up.id,
  u.email,
  c.name as company_name,
  c.trade_name,
  up.role,
  up.status,
  up.created_at
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.user_id
LEFT JOIN public.companies c ON c.id = up.company_id
ORDER BY up.created_at DESC;


-- 6. ADIM: Bir kullanıcının yetkilerini güncelleme
-- =============================================
-- Örnek: Kullanıcıyı manager yapma

/*
UPDATE public.user_profiles
SET 
  role = 'manager',
  updated_at = NOW()
WHERE user_id = 'USER_ID_BURAYA';
*/


-- 7. ADIM: Bir kullanıcının firmasını değiştirme
-- =============================================
-- Örnek: Kullanıcıyı başka bir firmaya taşıma

/*
UPDATE public.user_profiles
SET 
  company_id = 'YENİ_COMPANY_ID_BURAYA',
  updated_at = NOW()
WHERE user_id = 'USER_ID_BURAYA';
*/


-- 8. ADIM: Test kullanıcısı için hızlı setup
-- =============================================
-- Bu sorgu otomatik olarak:
-- 1. İlk firmayı bulur
-- 2. İlk kullanıcıyı bulur
-- 3. Aralarında bağlantı kurar

DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- İlk kullanıcıyı al
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE confirmed_at IS NOT NULL
  ORDER BY created_at
  LIMIT 1;
  
  -- İlk firmayı al
  SELECT id INTO v_company_id
  FROM public.companies
  ORDER BY created_at
  LIMIT 1;
  
  -- Eğer ikisi de varsa bağlantı kur
  IF v_user_id IS NOT NULL AND v_company_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (user_id, company_id, role, status)
    VALUES (v_user_id, v_company_id, 'admin', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET
      company_id = EXCLUDED.company_id,
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      updated_at = NOW();
    
    RAISE NOTICE 'Kullanıcı % firma %''ye bağlandı', v_user_id, v_company_id;
  ELSE
    RAISE NOTICE 'Kullanıcı veya firma bulunamadı!';
  END IF;
END $$;


-- =============================================
-- NOTLAR VE İPUÇLARI
-- =============================================

-- • Her kullanıcının mutlaka bir company_id'si olmalıdır
-- • Role seçenekleri: 'admin', 'manager', 'user'
-- • Status seçenekleri: 'active', 'suspended', 'pending'
-- • Admin: Tüm yetkilere sahip
-- • Manager: Veri ekleme/düzenleme, silme yetkisi yok
-- • User: Sadece görüntüleme yetkisi

-- • Test için hızlı setup: ADIM 8'i kullanın
-- • Manuel setup: ADIM 1-3'ü sırayla çalıştırın
-- • Toplu kullanıcı ekleme: ADIM 4'ü kullanın


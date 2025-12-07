# 🚀 Finova Kurulum Rehberi

Bu rehber, Finova uygulamasını Supabase backend ile sıfırdan kurmak için gereken tüm adımları içerir.

---

## 📋 İÇİNDEKİLER

1. [Gereksinimler](#gereksinimler)
2. [Supabase Projesi Oluşturma](#supabase-projesi-oluşturma)
3. [Veritabanı Schema Kurulumu](#veritabanı-schema-kurulumu)
4. [Seed Data Yükleme](#seed-data-yükleme)
5. [Kullanıcı ve Firma Bağlantısı](#kullanıcı-ve-firma-bağlantısı)
6. [Vercel Deployment](#vercel-deployment)
7. [İlk Giriş ve Test](#ilk-giriş-ve-test)
8. [Sorun Giderme](#sorun-giderme)

---

## 1️⃣ GEREKSINIMLER

- **Supabase Hesabı**: [supabase.com](https://supabase.com)
- **Vercel Hesabı** (opsiyonel): [vercel.com](https://vercel.com)
- **Node.js** 18+
- **Git**

---

## 2️⃣ SUPABASE PROJESİ OLUŞTURMA

### Adım 1: Yeni Proje Oluşturun
1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. **"New Project"** butonuna tıklayın
3. Proje ayarlarını doldurun:
   - **Name**: `finova-prod` (veya istediğiniz bir isim)
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Size en yakın bölge (örn: `Europe West (Ireland)`)
   - **Pricing Plan**: Free veya Pro
4. **"Create new project"** butonuna tıklayın
5. Proje oluşturulmasını bekleyin (~2 dakika)

### Adım 2: API Bilgilerini Alın
1. Sol menüden **"Settings"** > **"API"** sekmesine gidin
2. Şu bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxxxxx.supabase.co`)
   - **anon/public** key (uzun bir JWT token)
3. Bu bilgileri bir yere not edin, sonra kullanacağız!

---

## 3️⃣ VERİTABANI SCHEMA KURULUMU

### Adım 1: SQL Editor'ü Açın
1. Supabase Dashboard'da sol menüden **"SQL Editor"** sekmesine tıklayın
2. **"New query"** butonuna tıklayın

### Adım 2: İlk Migration'ı Çalıştırın
1. `supabase/migrations/001_init.sql` dosyasını açın
2. **Tüm içeriği** kopyalayın
3. SQL Editor'e yapıştırın
4. Sağ alttaki **"Run"** butonuna tıklayın
5. ✅ "Success. No rows returned" mesajını görmelisiniz

### Adım 3: Ana Schema'yı Çalıştırın
1. **Yeni bir query** oluşturun ("New query")
2. `supabase/migrations/002_complete_schema.sql` dosyasını açın
3. **Tüm içeriği** kopyalayın
4. SQL Editor'e yapıştırın
5. **"Run"** butonuna tıklayın
6. ✅ "Success. No rows returned" mesajını görmelisiniz

> **ÖNEMLİ**: Herhangi bir hata alırsanız, hata mesajını okuyun ve [Sorun Giderme](#sorun-giderme) bölümüne bakın.

### Adım 4: Tabloları Kontrol Edin
1. Sol menüden **"Table Editor"** sekmesine gidin
2. Şu tabloları görmelisiniz:
   - `companies`
   - `user_profiles`
   - `accounts`
   - `products`
   - `invoices`
   - `invoice_items`
   - ve 40+ diğer tablo

---

## 4️⃣ SEED DATA YÜKLEME

Seed data, uygulamanın çalışması için gerekli başlangıç verilerini içerir (demo firma, varsayılan ayarlar, vb.).

### Adım 1: Seed Dosyasını Çalıştırın
1. SQL Editor'de **yeni bir query** oluşturun
2. `supabase/seed/002_production_seed.sql` dosyasını açın
3. **Tüm içeriği** kopyalayın
4. SQL Editor'e yapıştırın
5. **"Run"** butonuna tıklayın

### Adım 2: Seed Data'yı Kontrol Edin
Şu sorguyu çalıştırın:

```sql
SELECT id, name, trade_name, tax_id FROM public.companies;
```

✅ "DEMO FİRMA A.Ş." görmelisiniz!

---

## 5️⃣ KULLANICI VE FİRMA BAĞLANTISI

### Seçenek A: Otomatik Setup (Hızlı Test İçin)

1. SQL Editor'de yeni bir query oluşturun
2. `supabase/setup/001_user_setup.sql` dosyasını açın
3. **ADIM 8: Test kullanıcısı için hızlı setup** bölümünü bulun
4. O kısmı kopyalayıp çalıştırın

Bu, ilk kullanıcıyı otomatik olarak ilk firmaya bağlar.

### Seçenek B: Manuel Setup (Önerilen)

#### 1. Yeni Kullanıcı Oluşturun
1. Sol menüden **"Authentication"** > **"Users"** sekmesine gidin
2. **"Add user"** > **"Create new user"** seçin
3. Email ve şifre girin (örn: `admin@finova.app` / `Admin123!`)
4. **"Create user"** butonuna tıklayın

#### 2. Kullanıcı ID'sini Bulun
SQL Editor'de şu sorguyu çalıştırın:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC;
```

Oluşturduğunuz kullanıcının ID'sini kopyalayın.

#### 3. Firma ID'sini Bulun
```sql
SELECT id, name FROM public.companies ORDER BY created_at DESC LIMIT 1;
```

Demo firmanın ID'sini kopyalayın.

#### 4. User Profile Oluşturun
```sql
INSERT INTO public.user_profiles (user_id, company_id, role, status)
VALUES (
  'KULLANICI_ID_BURAYA',  -- Adım 2'den aldığınız ID
  'FIRMA_ID_BURAYA',      -- Adım 3'ten aldığınız ID
  'admin',
  'active'
);
```

#### 5. Bağlantıyı Kontrol Edin
```sql
SELECT 
  u.email,
  c.name as company_name,
  up.role,
  up.status
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.user_id
LEFT JOIN public.companies c ON c.id = up.company_id;
```

✅ Kullanıcının firma bağlantısını görmelisiniz!

---

## 6️⃣ VERCEL DEPLOYMENT

### Adım 1: Environment Variables
1. Vercel Dashboard'da projenizi açın
2. **"Settings"** > **"Environment Variables"** sekmesine gidin
3. Şu değişkenleri ekleyin:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **ÖNEMLİ**: Bu değerleri Adım 2'de Supabase'den kopyalamıştınız!

### Adım 2: Redeploy
1. **"Deployments"** sekmesine gidin
2. En son deployment'ı bulun
3. **"..."** menüsüne tıklayın > **"Redeploy"**
4. Deploy'un tamamlanmasını bekleyin

---

## 7️⃣ İLK GİRİŞ VE TEST

### Adım 1: Uygulamayı Açın
Tarayıcıda uygulamanızı açın:
- **Localhost**: `http://localhost:3000`
- **Vercel**: `https://yourapp.vercel.app`

### Adım 2: Login Sayfası
✅ Otomatik olarak `/login` sayfasına yönlendirilmelisiniz.

### Adım 3: Giriş Yapın
Adım 5'te oluşturduğunuz email/şifre ile giriş yapın:
- Email: `admin@finova.app`
- Şifre: `Admin123!`

### Adım 4: Dashboard Kontrolü
✅ Giriş başarılıysa:
- Dashboard açılmalı
- **Topbar ortasında firma adı** görünmeli ("DEMO FİRMA A.Ş.")
- Sol menüden sayfalar açılabilmeli

### Adım 5: Bağlantı Testi (Opsiyonel)
Daha detaylı test için:
```
http://localhost:3000/test-connection
```

Bu sayfa 8 farklı test yapacak ve tüm bağlantıların çalıştığını doğrulayacak.

---

## 8️⃣ SORUN GİDERME

### ❌ "Session yok" / Login sayfasına geri atıyor

**Sorun**: Kullanıcı giriş yapamıyor veya sürekli login'e yönlendiriliyor.

**Çözüm**:
1. Tarayıcı konsolunu açın (F12)
2. `localStorage` ve `cookies`'i temizleyin
3. Hard refresh yapın (Ctrl+Shift+R)
4. Tekrar giriş deneyin

---

### ❌ "Company ID bulunamadı" uyarısı

**Sorun**: Kullanıcı profili firmaya bağlı değil.

**Çözüm**: [Adım 5: Seçenek B](#seçenek-b-manuel-setup-önerilen)'yi tekrar kontrol edin ve user profile oluşturun.

---

### ❌ "ERROR: permission denied for table accounts"

**Sorun**: RLS (Row Level Security) policy'leri çok kısıtlayıcı.

**Geçici Çözüm** (SADECE TEST İÇİN):
```sql
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
```

**Kalıcı Çözüm**: `002_complete_schema.sql` dosyasındaki RLS policy'leri kontrol edin ve düzeltin.

---

### ❌ "Failed to run sql query: ERROR: column X does not exist"

**Sorun**: Migration eksik veya yanlış sırayla çalıştırıldı.

**Çözüm**:
1. Tüm tabloları silin (dikkatli olun!)
2. Migration'ları sırayla yeniden çalıştırın (001, sonra 002)

---

### ❌ Vercel build hatası

**Sorun**: Environment variables eksik.

**Çözüm**:
1. Vercel'de environment variables'ları kontrol edin
2. Hem `NEXT_PUBLIC_SUPABASE_URL` hem de `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlı mı?
3. Redeploy yapın

---

## 🎉 TEBRIKLER!

Artık Finova uygulamanız çalışır durumda! 

### Sonraki Adımlar:
- ✅ Yeni kullanıcılar ekleyin
- ✅ Firma bilgilerini güncelleyin
- ✅ İlk faturanızı oluşturun
- ✅ Cari ve stok kartları ekleyin

### Yardım ve Destek:
- 📧 Teknik sorunlar için: [GitHub Issues](https://github.com/msenses/muha/issues)
- 📖 Daha fazla dokümantasyon: `DEPLOYMENT.md` ve `supabase/README.md`

---

**Son Güncelleme**: 7 Aralık 2025  
**Versiyon**: 1.0.0


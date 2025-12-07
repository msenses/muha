# Finova - Vercel Deployment Rehberi

## 🚀 Deployment Adımları

### 1. Vercel Environment Variables Ekleme

Build hatası düzeltildi! Ancak uygulamanın çalışması için Vercel'de environment variables eklemeniz gerekiyor.

#### Adım 1: Vercel Dashboard'a Giriş
1. [Vercel Dashboard](https://vercel.com/dashboard) adresine gidin
2. Projenizi seçin (`muhasebe2`)

#### Adım 2: Environment Variables Ekleme
1. **Settings** sekmesine tıklayın
2. Sol menüden **Environment Variables** seçin
3. Aşağıdaki değişkenleri ekleyin:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ithjtcgfsyqfljwyaynw.supabase.co
Environment: Production, Preview, Development (hepsini seçin)
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aGp0Y2dmc3lxZmxqd3lheW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTgzMDAsImV4cCI6MjA4MDY3NDMwMH0.s9WplBqXnCaDo_iacbfEikuDrmitp3bQJ00nmRmsKVU
Environment: Production, Preview, Development (hepsini seçin)
```

#### Adım 3: Redeploy
Environment variables ekledikten sonra:
1. **Deployments** sekmesine gidin
2. En son deployment'ı bulun
3. Sağdaki **...** menüsüne tıklayın
4. **Redeploy** seçin
5. ✅ **Use existing Build Cache** seçeneğini KALDIĞIN
6. **Redeploy** butonuna tıklayın

**VEYA:**

Yeni bir push yapın (otomatik deploy tetiklenir):
```bash
git commit --allow-empty -m "trigger deploy"
git push
```

---

## 🗄️ Supabase Database Kurulumu

### 1. Supabase Dashboard'a Giriş
1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin (URL: `ithjtcgfsyqfljwyaynw.supabase.co`)

### 2. Migration Uygulama

#### Adım 1: İlk Schema (Temel Tablolar)
1. **SQL Editor** sekmesine gidin
2. **New query** butonuna tıklayın
3. `supabase/schema/001_init.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'a yapıştırın
5. **Run** butonuna tıklayın

#### Adım 2: Tam Schema (Tüm Modüller)
1. **New query** butonuna tıklayın
2. `supabase/migrations/002_complete_schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın

#### Adım 3: Seed Data (Demo Veriler - Opsiyonel)
1. **New query** butonuna tıklayın
2. `supabase/seed/002_production_seed.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın

### 3. İlk Kullanıcı Kaydı

#### Adım 1: Kullanıcı Oluşturma
1. Uygulamaya giriş yapın (deploy edildikten sonra)
2. `/login` sayfasında kayıt olun
3. Email ve şifrenizi girin

#### Adım 2: Profil Bağlama
1. Supabase Dashboard > **Authentication** > **Users** sekmesine gidin
2. Oluşturduğunuz kullanıcının **ID**'sini kopyalayın (UUID formatında)
3. **SQL Editor**'a gidin
4. Aşağıdaki SQL'i çalıştırın (USER_ID_BURAYA yerine kendi ID'nizi yazın):

```sql
INSERT INTO public.profiles (user_id, company_id, role)
SELECT 
  'USER_ID_BURAYA',  -- Kendi user ID'nizi buraya yazın
  (SELECT id FROM public.companies WHERE name = 'Finova Demo Şirketi'),
  'admin';
```

**Örnek:**
```sql
INSERT INTO public.profiles (user_id, company_id, role)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',  -- Örnek UUID
  (SELECT id FROM public.companies WHERE name = 'Finova Demo Şirketi'),
  'admin';
```

---

## ✅ Kontrol Listesi

Build başarılı olması için:

- [ ] Vercel'de `NEXT_PUBLIC_SUPABASE_URL` eklendi
- [ ] Vercel'de `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklendi
- [ ] Redeploy tetiklendi
- [ ] Supabase'de `001_init.sql` çalıştırıldı
- [ ] Supabase'de `002_complete_schema.sql` çalıştırıldı
- [ ] Supabase'de `002_production_seed.sql` çalıştırıldı (opsiyonel)
- [ ] İlk kullanıcı kaydı yapıldı
- [ ] Kullanıcı profili bağlandı

---

## 📊 Supabase Database İçeriği

Migration'lar başarıyla uygulandığında:

**Tablolar (45+):**
- ✅ companies, branches, profiles
- ✅ accounts, account_groups, account_transactions
- ✅ products, product_groups, product_units, warehouses
- ✅ stock_movements, product_lots
- ✅ price_lists, price_list_items
- ✅ package_groups, package_group_items
- ✅ invoices, invoice_items (E-Fatura alanları ile)
- ✅ quotes_orders, quote_order_items
- ✅ dispatches, dispatch_items
- ✅ cheques_notes
- ✅ installment_plans, installments
- ✅ e_mustahsil_receipts, e_mustahsil_items
- ✅ income_expense_categories, income_expense_records
- ✅ cash_ledgers, cash_transactions
- ✅ bank_accounts, bank_transactions
- ✅ agenda_items, settings, numbering_schemes

**Demo Data (Seed uygulandıysa):**
- 1 Demo şirket
- 2 Depo (Merkez + Şube)
- 1 Kasa
- 1 Banka hesabı
- 15 Birim tanımı
- 4 Cari grup
- 3 Cari (2 müşteri + 1 tedarikçi)
- 4 Stok grubu
- 4 Ürün
- 19 Gelir/Gider kategorisi
- 7 Numaralandırma şeması

---

## 🔧 Sorun Giderme

### Build Hatası Devam Ediyorsa

1. **Environment variables doğru mu?**
   - Vercel Dashboard > Settings > Environment Variables
   - Her iki değişken de ekli mi kontrol edin
   - Production, Preview, Development hepsinde aktif mi?

2. **Cache temizleme:**
   - Vercel Deployment > ... menü > Redeploy
   - ❌ "Use existing Build Cache" seçeneğini KALDIRIN

3. **Local test:**
   ```bash
   npm run build
   ```
   Local'de build başarılıysa, Vercel'de env sorunu vardır.

### Supabase Bağlantı Hatası

1. **RLS kontrol:**
   - Supabase Dashboard > Authentication > Policies
   - Tüm tablolarda RLS aktif mi?

2. **User profili bağlı mı:**
   ```sql
   SELECT * FROM public.profiles WHERE user_id = auth.uid();
   ```
   Sonuç boş ise, profil bağlama adımını tekrarlayın.

---

## 📞 Destek

Sorun yaşarsanız:
1. Vercel build loglarını kontrol edin
2. Browser console'da hata olup olmadığına bakın
3. Supabase > Logs bölümünü inceleyin

---

**Son Güncelleme:** 7 Aralık 2025  
**Commit:** 997c6de


## FINOVA – Çok Firmalı Veritabanı Mimari PRD

### 1. Amaç

- **Amaç**: Finova muhasebe uygulamasını, her firma için **ayrı Supabase projesi (veritabanı)** kullanılan, ama **ortak bir merkez veritabanı üzerinden kullanıcı ve firma yönetimi** yapılan çok-firmalı (multi-tenant) mimariye geçirmek.
- **Hedefler**:
  - Her firmanın verileri **fiziksel olarak ayrı** veritabanlarında tutulsun.
  - Tek bir merkez proje üzerinden:
    - Kullanıcılar yönetilsin.
    - Kullanıcı hangi firmalara bağlıysa oraya yönlendirilsin.
  - Mevcut modüller (cari, stok, fatura, çek-senet, ajanda, vs.) **minimum değişiklikle** çalışmaya devam etsin.

### 2. Kapsam

- **Bu PRD kapsamı**:
  - Supabase tarafında:
    - 1 adet **merkez (directory)** projesi.
    - Her firma için 1 adet **uygulama (tenant)** projesi.
  - Veritabanı şeması:
    - Merkez proje için **yeni şema**.
    - Firma projeleri için `001_init.sql` + `002_complete_schema.sql` tabanlı **uygulama şeması**.
  - Login ve firma seçimi akışının mimarisi (yüksek seviye).
- **Bu PRD kapsamı dışı**:
  - Detaylı UI tasarımı.
  - Her ekran için ayrı ayrı UX dökümantasyonu.
  - E-fatura entegrasyon teknik detayları.

### 3. Genel Mimari

### 3.1. Merkez Proje (Directory DB)

- **Rolü**:
  - Tüm firmaları (tenant’lar) ve kullanıcı-firma ilişkilerini tutar.
  - Login işlemleri bu proje üzerinden yapılır.
  - Hangi kullanıcının hangi firmalara erişimi olduğu burada belirlenir.
  - Her firma için hangi Supabase projesine (uygulama DB’sine) bağlanılacağı bilgisi burada saklanır.

- **İçerik**:
  - Firma (tenant) kayıtları.
  - Kullanıcı profilleri (auth.users ile ilişkili).
  - Kullanıcı–firma yetkileri (rol, default firma).
  - Her firmanın Supabase bağlantı bilgileri.

### 3.2. Firma Projeleri (Tenant Uygulama DB’leri)

- **Rolü**:
  - İlgili firmaya ait **tüm muhasebe verilerini** tutar:
    - Cari hesap, stok, fatura, teklif/sipariş, irsaliye, çek-senet, taksit, e-müstahsil, gelir/gider, kasa, banka, ajanda, ayarlar vb.
- **İçerik**:
  - Mevcut `supabase/schema/001_init.sql` + `supabase/migrations/002_complete_schema.sql` dosyalarındaki tüm tablo ve fonksiyonlar.
- **Not**:
  - Şema zaten **company_id** sütunları ile çok-firmalı çalışabilecek şekilde tasarlanmış olsa da, her Supabase projesinde **fiilen tek firma** tutulacak.
  - İleride istenirse, tek projede çok firma moduna da (SINGLE_COMPANY_MODE = false + user_profiles) dönülebilir.

---

## 4. Kullanıcı Senaryoları (User Stories)

### 4.1. Login ve Firma Seçimi

- **US-01**: Kullanıcı e-posta/şifresi ile giriş yapar.
  - Giriş işlemi **merkez Supabase projesinde** gerçekleşir.
- **US-02**: Giriş yapan kullanıcı, erişimi olduğu firmalar (tenant’lar) listesini görür.
  - Eğer tek firmaya bağlıysa, otomatik o firmaya yönlendirilir.
  - Birden fazla firmaya bağlıysa, kullanıcı arayüzde firma seçer.
- **US-03**: Kullanıcı firma seçtikten sonra, uygulama **ilgili firmanın Supabase projesine** bağlanır ve muhasebe ekranları o veritabanını kullanır.

### 4.2. Yeni Firma Ekleme

- **US-04**: Admin, yeni bir firma (tenant) oluşturur.
  - Merkez projede yeni `tenant` kaydı oluşur.
  - Ayrı bir Supabase projesi açılır, firma şeması (001 + 002 SQL) çalıştırılır.
  - Bu projenin URL ve key bilgileri merkezde `tenant_databases` tablosuna kaydedilir.

### 4.3. Kullanıcıyı Firmaya Bağlama

- **US-05**: Admin, mevcut bir kullanıcıyı yeni firmaya bağlar.
  - Merkez projede `directory_user_tenants` tablosuna kayıt eklenir.
  - Kullanıcı bir sonraki girişte bu firmayı da seçenek olarak görür.

---

## 5. Fonksiyonel Gereksinimler

### 5.1. Auth & Login

- **FR-01**: Merkez projede Supabase Auth kullanılır (email/password).
- **FR-02**: Login sayfası, merkez projedeki `auth.signInWithPassword` fonksiyonunu kullanarak giriş yapar.
- **FR-03**: Giriş başarılı olursa:
  - `directory_user_tenants` tablosundan `user_id = auth.uid()` için tenant listesi çekilir.
- **FR-04**: Kullanıcının erişimi olan tenant sayısı:
  - 1 ise → doğrudan o tenant’ın uygulamasına yönlendirilir.
  - >1 ise → kullanıcıdan seçim yapması istenir.

### 5.2. Tenant Yönetimi (Merkez DB)

- **FR-05**: Merkez DB’de aşağıdaki tablolar bulunur:
  - `tenants`: firmalar.
  - `tenant_databases`: her firmanın Supabase URL / anahtar bilgileri.
  - `directory_users`: auth.users ile ilişkili kullanıcı profilleri.
  - `directory_user_tenants`: kullanıcı–firma ilişkileri, rol bilgisi, default firma.
- **FR-06**: RLS ile kullanıcı sadece bağlı olduğu tenant’ları görebilir.
- **FR-07**: Rollere göre (admin, manager, user) yetki seviyesi tanımlanabilir (ileride genişletilebilir).

### 5.3. Firma Uygulama DB Bağlantısı

- **FR-08**: Uygulama tarafında iki farklı Supabase client kavramı tanımlanır:
  - `supabaseDirectoryClient`: merkez proje için.
  - `supabaseAppClient`: seçilen firma (tenant) projesi için.
- **FR-09**: Tüm muhasebe ile ilgili veritabanı işlemleri **yalnızca `supabaseAppClient`** ile yapılır.
- **FR-10**: Firma seçimi yapıldıktan sonra, seçilen tenant’ın bilgileri (örneğin local storage veya secure cookie + server component context) içinde saklanır ve tüm istekler bunu kullanır.

### 5.4. Muhasebe Modülleri (Firma DB)

Bu modüllerin veritabanı tarafı **tamamen firma DB’sinde** bulunur. Aşağıdaki tabloların tamamı mevcut `001_init.sql` + `002_complete_schema.sql` kombinasyonundan gelir:

- **Cari**:
  - `accounts`, `account_groups`, `account_transactions`.
- **Stok**:
  - `products`, `product_groups`, `product_units`, `warehouses`, `stock_movements`, `product_lots`, `price_lists`, `price_list_items`, `package_groups`, `package_group_items`.
- **Fatura**:
  - `invoices`, `invoice_items` (+ E-fatura alanları), `generate_invoice_no` fonksiyonu, `update_account_balance` trigger’ı.
- **Teklif / Sipariş**:
  - `quotes_orders`, `quote_order_items`, enum: `quote_order_type`, `quote_order_status`.
- **İrsaliye**:
  - `dispatches`, `dispatch_items`, enum: `dispatch_type`.
- **Çek / Senet**:
  - `cheques_notes`, enum: `cheque_note_type`, `cheque_note_status`.
- **Taksit Takip**:
  - `installment_plans`, `installments`.
- **E-Müstahsil**:
  - `e_mustahsil_receipts`, `e_mustahsil_items`.
- **Gelir / Gider**:
  - `income_expense_categories`, `income_expense_records`, enum: `income_expense_type`.
- **Kasa / Banka**:
  - `cash_ledgers`, `cash_transactions`, `bank_accounts`, `bank_transactions`, enum: `money_flow`.
- **Ajanda**:
  - `agenda_items`.
- **Sistem Ayarları**:
  - `settings`, `numbering_schemes`.
- **Genel**:
  - `companies`, `branches`, `user_profiles` (mevcut projede), `current_user_company` view, RLS politikaları, indeksler.

---

## 6. Veri Modeli Özeti

### 6.1. Merkez Proje Şeması (Directory)

- **`tenants`**
  - `id` (uuid, PK)
  - `name` (text, not null)
  - `created_at` (timestamptz)

- **`tenant_databases`**
  - `id` (uuid, PK)
  - `tenant_id` (uuid, FK → tenants.id, unique)
  - `supabase_url` (text, not null)
  - `supabase_anon_key` (text, not null) – Opsiyonel, istersen sadece backend’de env değişkeni olarak da tutulabilir.
  - `supabase_service_role_key` (text, opsiyonel, sadece backend tarafında)
  - `created_at` (timestamptz)

- **`directory_users`**
  - `id` (uuid, PK)
  - `user_id` (uuid, unique, FK → auth.users.id)
  - `full_name` (text)
  - `created_at` (timestamptz)

- **`directory_user_tenants`**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users.id)
  - `tenant_id` (uuid, FK → tenants.id)
  - `role` (text, default `user`) – `admin`, `manager`, `user` vb.
  - `is_default` (boolean, default false)
  - `created_at` (timestamptz)
  - `unique(user_id, tenant_id)`

RLS:
- Kullanıcı sadece `user_id = auth.uid()` olan satırları görebilir.
- Tenant’lar sadece `directory_user_tenants` üzerinden ilişkili oldukları ölçüde görünebilir.

### 6.2. Firma Projesi Şeması (Uygulama DB)

- Burada tablo detayları **mevcut dosyalar** ile tanımlıdır:
  - `supabase/schema/001_init.sql`
  - `supabase/migrations/002_complete_schema.sql`
- Bu dosyalardaki tasarım:
  - `companies` + E-fatura alanları.
  - `accounts`, `products`, `invoices`, `invoice_items`, `stock_movements`, vs. ve ek tablolar.
  - RLS: `current_user_company` view + `user_profiles` üzerinden `company_id` tabanlı güvenlik.

Not:
- Eğer her firma için ayrı proje kullanıyorsak, bu şema her projede aynı şekilde uygulanır.
- İleride istersen, `company_id` alanlarını sadeleştirerek gerçekten tek-firmalı bir şemaya indirgemek ikinci bir refactor adımı olabilir.

---

## 7. Supabase Yapılandırması

### 7.1. Merkez Proje – Kurulum

- Supabase’te yeni bir proje aç: **örnek ad: `finova-directory`**.
- Bu projede:
  - `SQL Editor` → Bu PRD’deki merkez şema SQL’ini (tenants, tenant_databases, directory_users, directory_user_tenants + RLS) çalıştır.
  - Auth ayarlarında **Email/Password** girişine izin ver.
- Next.js tarafında:
  - `.env` içine:
    - `NEXT_PUBLIC_DIRECTORY_SUPABASE_URL`
    - `NEXT_PUBLIC_DIRECTORY_SUPABASE_ANON_KEY`
  - Yeni bir dosya: `src/lib/directorySupabaseClient.ts`
    - `createClient(DIRECTORY_SUPABASE_URL, DIRECTORY_SUPABASE_ANON_KEY)` ile `supabaseDirectoryClient` oluştur.

### 7.2. Firma Projesi – Kurulum

- Geliştirme için şu an kullandığın Supabase projesi **1. firma** gibi davranır.
- Bu projede:
  - `supabase/schema/001_init.sql`
  - `supabase/migrations/002_complete_schema.sql`
  dosyalarını sırasıyla çalıştırmış olmak yeterlidir.
- Yeni firma geldiğinde:
  - Supabase’te yeni bir proje açılır.
  - Aynı iki SQL dosyası çalıştırılır.
  - Merkez projede `tenants` + `tenant_databases` tablolarına bu firmanın kaydı eklenir.

---

## 8. Güvenlik & RLS

- **Merkez proje**:
  - kullanıcı–firma ilişkileri `directory_user_tenants` ile yönetilir.
  - `tenants` ve `directory_user_tenants` tablolarında RLS:
    - `user_id = auth.uid()` koşulu ve `tenant_id` üzerinden filtre.
- **Firma projeleri**:
  - Mevcut RLS tasarımı (`current_user_company` view + `user_profiles` + company_id bazlı politikalar) korunur.
  - Eğer istenirse, firma başına ayrı projede:
    - `company_id` bazlı RLS sadeleştirilip “bu projeye giren herkes bu firma” varsayımı da ileride uygulanabilir.

---

## 9. Aşamalı Geçiş Planı

### Faz 1 – Mevcut Tek Projede Stabil Çalışma

- Login devre dışı (şu anki gibi) veya basit login ile:
  - `SINGLE_COMPANY_MODE = true` kalır.
  - Tüm modüller tek firma üzerinde test edilir.

### Faz 2 – Tek Projede Çoklu Firma (Opsiyonel Ara Adım)

- `SINGLE_COMPANY_MODE = false` yapılır.
- `user_profiles` tablosu ile kullanıcı–firma ilişkisi kullanılır.
- Tek Supabase projesinde birden fazla firma kaydı yönetecek şekilde sistem test edilir.

### Faz 3 – Merkez + Ayrı Firma Projeleri

- Merkez proje (`finova-directory`) kurulur.
- Login artık merkez proje üzerinden yapılır.
- Tenant seçimi eklenir.
- Seçilen tenant’a göre `supabaseAppClient` oluşturulur ve tüm CRUD işlemleri buna geçer.

---

Bu PRD, Finova muhasebe uygulamasının çok-firmalı (multi-tenant) veritabanı mimarisini, modüllerle ilişkisini ve Supabase yapılandırmasını üst seviyede tanımlar. Ayrıntılı kod implementasyonu (login sayfası, client oluşturma, tenant seçimi UI vb.) bu PRD’yi baz alarak ayrı teknik task’lere bölünecektir.

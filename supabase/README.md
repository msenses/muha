# Finova Supabase Veritabanı Dokümantasyonu

## Kurulum

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com) üzerinden yeni proje oluşturun
2. Project URL ve Anon Key'i kopyalayın
3. `.env.local` dosyası oluşturun ve credentials'ları ekleyin:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Migration Uygulama

Supabase Dashboard > SQL Editor'dan sırasıyla çalıştırın:

```bash
# 1. İlk schema (temel tablolar)
supabase/schema/001_init.sql

# 2. Tam schema (tüm modüller)
supabase/migrations/002_complete_schema.sql
```

### 3. Seed Data Yükleme

```bash
# Demo data yükleme (opsiyonel)
supabase/seed/002_production_seed.sql
```

## Veritabanı Yapısı

### Ana Tablolar

#### 1. Şirket ve Kullanıcı Yönetimi
- `companies` - Şirketler
- `branches` - Şubeler
- `profiles` - Kullanıcı profilleri (auth.users ile ilişkili)

#### 2. Cari Hesap Modülü
- `accounts` - Cari hesaplar (müşteri/tedarikçi)
- `account_groups` - Cari grupları
- `account_transactions` - Cari hareketleri (tahsilat/ödeme)

#### 3. Stok Modülü
- `products` - Ürün kartları
- `product_groups` - Ürün grupları
- `product_units` - Birim tanımları
- `warehouses` - Depolar
- `stock_movements` - Stok hareketleri
- `product_lots` - Seri/lot takibi
- `price_lists` - Fiyat listeleri
- `price_list_items` - Fiyat listesi detayları
- `package_groups` - Paket grupları
- `package_group_items` - Paket grup ürünleri

#### 4. Fatura ve E-Fatura Modülü
- `invoices` - Faturalar (satış/alış)
- `invoice_items` - Fatura kalemleri
- E-Fatura alanları: `status`, `invoice_kind`, `e_document_scenario`, `ettn`, vb.

#### 5. Teklif ve Sipariş Modülü
- `quotes_orders` - Teklif ve siparişler
- `quote_order_items` - Teklif/sipariş kalemleri

#### 6. İrsaliye Modülü
- `dispatches` - İrsaliyeler
- `dispatch_items` - İrsaliye kalemleri

#### 7. Çek ve Senet Modülü
- `cheques_notes` - Çek ve senetler

#### 8. Taksit Takip Modülü
- `installment_plans` - Taksit planları
- `installments` - Taksitler

#### 9. E-Müstahsil Modülü
- `e_mustahsil_receipts` - E-Müstahsil makbuzları
- `e_mustahsil_items` - E-Müstahsil kalemleri

#### 10. Gelir/Gider Modülü
- `income_expense_categories` - Gelir/gider kategorileri
- `income_expense_records` - Gelir/gider kayıtları

#### 11. Kasa ve Banka Modülü
- `cash_ledgers` - Kasalar
- `cash_transactions` - Kasa hareketleri
- `bank_accounts` - Banka hesapları
- `bank_transactions` - Banka hareketleri

#### 12. Diğer
- `agenda_items` - Ajanda kayıtları
- `settings` - Sistem ayarları
- `numbering_schemes` - Numaralandırma şemaları

## Önemli Özellikler

### Row Level Security (RLS)

Tüm tablolar **company_id** bazlı RLS ile korunmaktadır. Kullanıcılar sadece kendi şirketlerinin verilerine erişebilir.

### Trigger'lar

- `trigger_update_account_balance` - Fatura oluşturulduğunda cari bakiyeyi otomatik günceller

### Fonksiyonlar

- `generate_invoice_no()` - Otomatik fatura numarası oluşturur
- `update_account_balance()` - Cari bakiye güncellemesi yapar

## E-Fatura Alanları

### invoices tablosu
- `status` - Fatura durumu ('draft', 'completed', 'sent', 'cancelled')
- `approval_status` - Onay durumu ('pending', 'approved', 'rejected')
- `invoice_kind` - Fatura tipi ('SATIS', 'IADE', 'ISTISNA', 'TEVKIFAT', vb.)
- `e_document_scenario` - E-Fatura senaryosu ('TEMELFATURA', 'TICARIFATURA', 'KAMU', vb.)
- `e_document_type` - E-Belge tipi ('EFATURA', 'EARSIVFATURA')
- `ettn` - E-Fatura UUID
- `gib_status` - GİB durumu
- `taxpayer_kind` - Mükellef tipi ('efatura', 'earsiv')
- `currency` - Para birimi
- `kamu_bank` - KAMU senaryosu için banka
- `kamu_account_no` - KAMU senaryosu için hesap no

### invoice_items tablosu
- `otv_rate` - ÖTV oranı
- `discount_rate` - İskonto yüzdesi
- `discount_amount` - İskonto tutarı

**İhracat Alanları:**
- `teslimat_durumu`, `teslimat_orani`, `kdv_durumu`, `gonderim_sekli`, `teslim_sarti`
- `kap_cinsi`, `kap_adedi`, `gis_no`, `kap_numarasi`

**İstisna ve Tevkifat:**
- `kdv_muafiyet_sebebi` - KDV muafiyet sebebi
- `tevkifat_durumu` - Tevkifat durumu
- `tevkifat_orani` - Tevkifat oranı

## Veri Yedekleme

### Manuel Yedekleme

Supabase Dashboard > Database > Backups

### Otomatik Yedekleme

Supabase Pro plan ile otomatik yedekleme aktiftir (7 gün saklama).

## Performans İpuçları

1. **İndeksler:** Tüm sık sorgulanan alanlarda indeks tanımlıdır
2. **RLS Optimizasyonu:** `current_user_company` view kullanarak company_id otomatik filtrelenir
3. **Bileşik İndeksler:** Tarih ve company_id için bileşik indeksler mevcuttur

## Güvenlik

- ✅ Tüm tablolarda RLS aktif
- ✅ Şirket bazlı veri izolasyonu
- ✅ Auth.users ile entegre profil sistemi
- ✅ Cascade delete ile veri bütünlüğü
- ✅ Foreign key kısıtlamaları

## Destek

Sorun yaşarsanız:
1. Supabase Dashboard > Logs kontrol edin
2. RLS policy'leri kontrol edin
3. Migration'ların sırasıyla uygulandığından emin olun

---

**Son Güncelleme:** 7 Aralık 2025  
**Versiyon:** 2.0


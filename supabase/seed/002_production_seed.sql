-- ============================================================
-- FINOVA MUHASEBE SİSTEMİ - SEED DATA
-- Versiyon: 2.0
-- Tarih: 7 Aralık 2025
-- ============================================================

-- ============================================================
-- 1. DEMO ŞİRKET OLUŞTUR
-- ============================================================

INSERT INTO public.companies (name) 
VALUES ('Finova Demo Şirketi')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. KULLANICI PROFİLİ OLUŞTUR
-- NOT: İlk kullanıcı giriş yaptıktan sonra bu profil otomatik bağlanacak
-- Şimdilik manuel olarak eklenebilir
-- ============================================================

-- İlk kullanıcı için profil (email'i güncelleyin)
-- INSERT INTO public.profiles (user_id, company_id, role)
-- SELECT u.id, c.id, 'admin'
-- FROM auth.users u
-- CROSS JOIN LATERAL (
--   SELECT id FROM public.companies WHERE name = 'Finova Demo Şirketi' LIMIT 1
-- ) c
-- WHERE u.email = 'admin@finova.com'
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. VARSAYILAN DEPOLAR
-- ============================================================

INSERT INTO public.warehouses (company_id, name, is_default)
SELECT id, 'Merkez Depo', TRUE
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

INSERT INTO public.warehouses (company_id, name)
SELECT id, 'Şube Depo'
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. VARSAYILAN KASA VE BANKA
-- ============================================================

INSERT INTO public.cash_ledgers (company_id, name, balance, is_default)
SELECT id, 'Varsayılan Kasa', 0, TRUE
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

INSERT INTO public.bank_accounts (company_id, bank_name, account_no, iban, balance, is_default)
SELECT id, 'Ziraat Bankası', '12345678', 'TR330006100519786457841326', 0, TRUE
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. BİRİM TANIMLARI
-- ============================================================

INSERT INTO public.product_units (company_id, name, short_name)
SELECT c.id, unit_name, unit_short
FROM public.companies c
CROSS JOIN (
    VALUES
        ('ADET', 'AD'),
        ('KİLOGRAM', 'KG'),
        ('GRAM', 'GR'),
        ('TON', 'TON'),
        ('LİTRE', 'LT'),
        ('MİLİLİTRE', 'ML'),
        ('METRE', 'M'),
        ('SANTİMETRE', 'CM'),
        ('METRE KARE', 'M2'),
        ('METRE KÜP', 'M3'),
        ('PAKET', 'PKT'),
        ('KOLI', 'KOLI'),
        ('KUTU', 'KUTU'),
        ('ŞİŞE', 'ŞŞ'),
        ('TENEKE', 'TN')
) AS units(unit_name, unit_short)
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. CARİ GRUPLAR
-- ============================================================

INSERT INTO public.account_groups (company_id, name, description)
SELECT id, group_name, group_desc
FROM public.companies
CROSS JOIN (
    VALUES
        ('Perakende Müşteriler', 'Bireysel müşteriler'),
        ('Kurumsal Müşteriler', 'Şirket müşterileri'),
        ('Tedarikçiler', 'Ürün ve hizmet tedarikçileri'),
        ('Personel', 'Çalışanlar')
) AS groups(group_name, group_desc)
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. DEMO CARİLER
-- ============================================================

-- Müşteri 1
INSERT INTO public.accounts (
    company_id, code, name, type, tax_id, tax_office,
    phone, email, address, city, district, country, balance
)
SELECT 
    c.id,
    'CARI-001',
    'ABC Teknoloji Ltd. Şti.',
    'customer',
    '1234567890',
    'Kadıköy',
    '+90 216 555 00 01',
    'info@abcteknoloji.com',
    'Caferağa Mah. Moda Cad. No:123',
    'İstanbul',
    'Kadıköy',
    'Türkiye',
    0
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- Müşteri 2
INSERT INTO public.accounts (
    company_id, code, name, type, tax_id, tax_office,
    phone, email, address, city, district, country, balance
)
SELECT 
    c.id,
    'CARI-002',
    'XYZ Pazarlama A.Ş.',
    'customer',
    '0987654321',
    'Beşiktaş',
    '+90 212 555 00 02',
    'iletisim@xyzpazarlama.com',
    'Levent Mah. Büyükdere Cad. No:456',
    'İstanbul',
    'Beşiktaş',
    'Türkiye',
    0
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- Tedarikçi 1
INSERT INTO public.accounts (
    company_id, code, name, type, tax_id, tax_office,
    phone, email, address, city, district, country, balance
)
SELECT 
    c.id,
    'CARI-003',
    'Mega Tedarik San. Tic. Ltd.',
    'supplier',
    '5555555555',
    'Çankaya',
    '+90 312 555 00 03',
    'satis@megatedarik.com',
    'Kızılay Mah. Atatürk Bulvarı No:789',
    'Ankara',
    'Çankaya',
    'Türkiye',
    0
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. STOK GRUPLAR
-- ============================================================

INSERT INTO public.product_groups (company_id, name, description)
SELECT id, group_name, group_desc
FROM public.companies
CROSS JOIN (
    VALUES
        ('Elektronik', 'Elektronik ürünler'),
        ('Gıda', 'Gıda ürünleri'),
        ('Tekstil', 'Tekstil ürünleri'),
        ('Hizmet', 'Hizmet kalemleri')
) AS groups(group_name, group_desc)
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. DEMO ÜRÜNLER
-- ============================================================

-- Ürün 1
INSERT INTO public.products (
    company_id, sku, barcode, name, unit, vat_rate, 
    price, cost_price, stock_balance, min_stock, description, category
)
SELECT 
    c.id,
    'PRD-001',
    '8690000000001',
    'Laptop ASUS ZenBook 14',
    'ADET',
    20,
    25000,
    20000,
    10,
    5,
    'Intel Core i7, 16GB RAM, 512GB SSD',
    'Elektronik'
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- Ürün 2
INSERT INTO public.products (
    company_id, sku, barcode, name, unit, vat_rate, 
    price, cost_price, stock_balance, min_stock, description, category
)
SELECT 
    c.id,
    'PRD-002',
    '8690000000002',
    'Kablosuz Mouse Logitech MX Master 3',
    'ADET',
    20,
    1500,
    1200,
    25,
    10,
    'Ergonomik, kablosuz, şarj edilebilir',
    'Elektronik'
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- Ürün 3
INSERT INTO public.products (
    company_id, sku, barcode, name, unit, vat_rate, 
    price, cost_price, stock_balance, min_stock, description, category
)
SELECT 
    c.id,
    'PRD-003',
    '8690000000003',
    'Mekanik Klavye Keychron K8',
    'ADET',
    20,
    2500,
    2000,
    15,
    5,
    'RGB, hot-swap, Gateron switch',
    'Elektronik'
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- Ürün 4 (Hizmet)
INSERT INTO public.products (
    company_id, sku, name, unit, vat_rate, 
    price, cost_price, stock_balance, min_stock, description, category
)
SELECT 
    c.id,
    'SRV-001',
    'Web Yazılım Geliştirme Hizmeti',
    'SAAT',
    20,
    500,
    0,
    0,
    0,
    'Profesyonel web yazılım geliştirme',
    'Hizmet'
FROM public.companies c
WHERE c.name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. GELİR/GİDER KATEGORİLERİ
-- ============================================================

-- Gelir Kategorileri
INSERT INTO public.income_expense_categories (company_id, name, type, description)
SELECT id, cat_name, 'income'::public.income_expense_type, cat_desc
FROM public.companies
CROSS JOIN (
    VALUES
        ('Satış Gelirleri', 'Ürün ve hizmet satış gelirleri'),
        ('Kira Gelirleri', 'Kira gelirleri'),
        ('Faiz Gelirleri', 'Banka ve mevduat faiz gelirleri'),
        ('Diğer Gelirler', 'Diğer çeşitli gelirler')
) AS cats(cat_name, cat_desc)
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- Gider Kategorileri
INSERT INTO public.income_expense_categories (company_id, name, type, description)
SELECT id, cat_name, 'expense'::public.income_expense_type, cat_desc
FROM public.companies
CROSS JOIN (
    VALUES
        ('Kira Giderleri', 'Ofis ve işyeri kira giderleri'),
        ('Elektrik', 'Elektrik faturaları'),
        ('Su', 'Su faturaları'),
        ('Doğalgaz', 'Doğalgaz faturaları'),
        ('İnternet', 'İnternet abonelik giderleri'),
        ('Telefon', 'Telefon ve hat giderleri'),
        ('Personel Maaşları', 'Çalışan maaş ödemeleri'),
        ('Vergi ve Harçlar', 'Resmi vergi ve harç ödemeleri'),
        ('Kırtasiye', 'Ofis malzemeleri'),
        ('Ulaşım', 'Ulaşım ve yakıt giderleri'),
        ('Reklam ve Pazarlama', 'Reklam kampanya giderleri'),
        ('Danışmanlık', 'Hukuk, muhasebe vb. danışmanlık'),
        ('Bakım ve Onarım', 'Bakım onarım giderleri'),
        ('Sigorta', 'Sigorta primleri'),
        ('Diğer Giderler', 'Diğer çeşitli giderler')
) AS cats(cat_name, cat_desc)
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. NUMARALANDIRMA ŞEMALARI
-- ============================================================

INSERT INTO public.numbering_schemes (company_id, document_type, prefix, next_number, padding)
SELECT id, doc_type, doc_prefix, 1, 6
FROM public.companies
CROSS JOIN (
    VALUES
        ('invoice', 'FTR-'),
        ('dispatch', 'IRS-'),
        ('quote', 'TKL-'),
        ('order', 'SIP-'),
        ('receipt', 'MKB-'),
        ('cheque', 'CEK-'),
        ('note', 'SNT-')
) AS schemes(doc_type, doc_prefix)
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT (company_id, document_type) DO NOTHING;

-- ============================================================
-- 12. SİSTEM AYARLARI (Varsayılan)
-- ============================================================

INSERT INTO public.settings (company_id, key, value)
SELECT id, 'general', jsonb_build_object(
    'company_name', 'Finova Demo Şirketi',
    'company_title', 'Finova Yazılım Ltd. Şti.',
    'tax_office', 'Kadıköy',
    'tax_id', '1234567890',
    'address', 'Caddebostan Mah. Bağdat Cad. No:100 Kadıköy/İstanbul',
    'phone', '+90 216 555 00 00',
    'email', 'info@finova.com',
    'website', 'www.finova.com',
    'logo_url', '/finova_logo.png'
)
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.settings (company_id, key, value)
SELECT id, 'invoice', jsonb_build_object(
    'default_currency', 'TRY',
    'default_vat_rate', 20,
    'default_payment_type', 'Nakit',
    'auto_number', true,
    'show_totals_on_print', true,
    'show_vat_breakdown', true,
    'default_note', 'Bizi tercih ettiğiniz için teşekkür ederiz.'
)
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.settings (company_id, key, value)
SELECT id, 'e_invoice', jsonb_build_object(
    'enabled', false,
    'provider', 'izibiz',
    'test_mode', true,
    'default_scenario', 'TEMELFATURA',
    'auto_send', false,
    'auto_approve', true
)
FROM public.companies
WHERE name = 'Finova Demo Şirketi'
ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- 13. DEMO FATURA (Opsiyonel - Test için)
-- ============================================================

-- İlk test faturası
-- NOT: Bu fatura sadece sistem testleri için eklenmiştir
-- INSERT INTO public.invoices (
--     company_id, account_id, type, invoice_no, invoice_date,
--     subtotal, vat_total, net_total, total, status, currency
-- )
-- SELECT 
--     c.id,
--     a.id,
--     'sales',
--     'FTR-000001',
--     CURRENT_DATE,
--     10000,
--     2000,
--     12000,
--     12000,
--     'completed',
--     'TRY'
-- FROM public.companies c
-- JOIN public.accounts a ON a.company_id = c.id AND a.code = 'CARI-001'
-- WHERE c.name = 'Finova Demo Şirketi';

-- ============================================================
-- COMPLETED: Seed data hazır!
-- ============================================================


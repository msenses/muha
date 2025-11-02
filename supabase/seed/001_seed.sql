-- Finova seed: ornek sirket, ornek cari ve urun
-- Dikkat: profiles.user_id icin Supabase Auth > Users altindan kullanici UUID'sini girin

insert into public.companies (name)
values ('Finova Demo Ltd.');

-- 2) Profil bagla (BURAYA_EMAIL_YAZIN kismini e-postanizla degistirin)
insert into public.profiles (user_id, company_id, role)
select u.id as user_id,
       c.id as company_id,
       'admin' as role
from auth.users u
cross join lateral (
  select id from public.companies order by created_at desc limit 1
) c
where u.email = 'BURAYA_EMAIL_YAZIN';

-- 3) Ornek cari ve urunler
insert into public.accounts (company_id, code, name, tax_id, phone)
select (
  select id from public.companies order by created_at desc limit 1
), 'CARI-0001', 'Örnek Müşteri', '11111111111', '+90 555 000 00 00';

insert into public.products (company_id, sku, name, unit, vat_rate, price)
select (
  select id from public.companies order by created_at desc limit 1
), 'PRD-0001', 'Örnek Ürün', 'ADET', 20, 100.00;



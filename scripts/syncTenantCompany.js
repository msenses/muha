// Senaryo: Merkezi Supabase projesindeki tenants + tenant_databases
// tablolarından firma ve bağlantı bilgilerini okuyup,
// ilgili uygulama (tenant) Supabase projesindeki companies tablosuna
// insert/update yapan bir senkronizasyon script'i.

const { createClient } = require('@supabase/supabase-js');

const DIRECTORY_URL = process.env.DIRECTORY_SUPABASE_URL;
const DIRECTORY_SERVICE_ROLE_KEY = process.env.DIRECTORY_SERVICE_ROLE_KEY;

if (!DIRECTORY_URL || !DIRECTORY_SERVICE_ROLE_KEY) {
  console.error('DIRECTORY_SUPABASE_URL veya DIRECTORY_SERVICE_ROLE_KEY ortam değişkenleri eksik.');
  process.exit(1);
}

async function resolveTenantId(directory, argTenantId) {
  if (argTenantId) return argTenantId;

  console.log('Tenant ID argüman verilmedi; ilk tenant kaydı kullanılacak.');
  const { data, error } = await directory
    .from('tenants')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('tenants tablosundan ilk kayıt alınamadı:', error);
    process.exit(1);
  }
  if (!data) {
    console.error('tenants tablosunda hiç kayıt yok. Önce merkez projeye firma ekleyin.');
    process.exit(1);
  }

  return data.id;
}

async function main() {
  const argTenantId = process.argv[2];

  // 1) Merkezi projeye bağlan
  const directory = createClient(DIRECTORY_URL, DIRECTORY_SERVICE_ROLE_KEY);

  const tenantId = await resolveTenantId(directory, argTenantId);
  console.log('Senkronize edilecek tenant_id:', tenantId);

  // 2) Tenant + bağlantı bilgilerini al
  const { data: tenant, error } = await directory
    .from('tenants')
    .select(`
      id,
      name,
      tax_id,
      phone,
      email,
      address,
      city,
      district,
      country,
      tenant_databases (
        supabase_url,
        supabase_service_role_key
      )
    `)
    .eq('id', tenantId)
    .maybeSingle();

  if (error) {
    console.error('Tenant bilgisi alınamadı:', error);
    process.exit(1);
  }
  if (!tenant) {
    console.error('Belirtilen tenant_id için kayıt bulunamadı:', tenantId);
    process.exit(1);
  }

  const db = tenant.tenant_databases;
  if (!db || !db.supabase_url || !db.supabase_service_role_key) {
    console.error('tenant_databases içinde supabase_url veya supabase_service_role_key eksik.');
    process.exit(1);
  }

  console.log('Uygulama veritabanı URL:', db.supabase_url);

  // 3) İlgili firma veritabanına bağlan
  const tenantClient = createClient(db.supabase_url, db.supabase_service_role_key);

  // 4) companies tablosunu insert/update et
  const { data: existing, error: existingError } = await tenantClient
    .from('companies')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error('Firma veritabanında companies tablosu okunamadı:', existingError);
    process.exit(1);
  }

  const payload = {
    name: tenant.name,
    trade_name: tenant.name,
    tax_id: tenant.tax_id,
    address: tenant.address,
    city: tenant.city,
    district: tenant.district,
    country: tenant.country || 'Türkiye',
    phone: tenant.phone,
    email: tenant.email,
  };

  if (!existing) {
    console.log('companies tablosunda kayıt yok, yeni kayıt eklenecek...');
    const { error: insertError } = await tenantClient.from('companies').insert(payload);
    if (insertError) {
      console.error('companies insert hata:', insertError);
      process.exit(1);
    }
    console.log('companies tablosuna yeni firma kaydı eklendi.');
  } else {
    console.log('companies tablosunda mevcut kayıt bulundu, güncellenecek...');
    const { error: updateError } = await tenantClient
      .from('companies')
      .update(payload)
      .eq('id', existing.id);
    if (updateError) {
      console.error('companies update hata:', updateError);
      process.exit(1);
    }
    console.log('companies tablosundaki firma kaydı güncellendi.');
  }

  console.log('Senkronizasyon tamamlandı.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Beklenmeyen hata:', err);
  process.exit(1);
});

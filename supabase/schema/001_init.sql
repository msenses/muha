-- Extensions
create extension if not exists pgcrypto;

-- Companies and branches
create table if not exists public.companies (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	created_at timestamp with time zone default now()
);

create table if not exists public.branches (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	name text not null,
	created_at timestamp with time zone default now()
);

-- Profiles mapped to auth.users
create table if not exists public.profiles (
	user_id uuid primary key references auth.users(id) on delete cascade,
	company_id uuid not null references public.companies(id) on delete cascade,
	role text not null default 'operator',
	created_at timestamp with time zone default now()
);

-- Accounts (customers/suppliers)
create table if not exists public.accounts (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	branch_id uuid references public.branches(id) on delete set null,
	code text,
	name text not null,
	tax_id text,
	phone text,
	email text,
	address text,
	balance numeric(14,2) not null default 0,
	created_at timestamp with time zone default now()
);
create index if not exists accounts_company_idx on public.accounts(company_id);

-- Products
create table if not exists public.products (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	sku text,
	name text not null,
	unit text not null default 'ADET',
	vat_rate numeric(5,2) not null default 20,
	price numeric(14,2) not null default 0,
	created_at timestamp with time zone default now()
);
create index if not exists products_company_idx on public.products(company_id);

do $$ begin
    if not exists (select 1 from pg_type where typname = 'invoice_type') then
        create type public.invoice_type as enum ('sales','purchase');
    end if;
end $$;

create table if not exists public.invoices (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	account_id uuid not null references public.accounts(id) on delete restrict,
	type public.invoice_type not null,
	invoice_no text,
	invoice_date date not null default now(),
	total numeric(14,2) not null default 0,
	vat_total numeric(14,2) not null default 0,
	net_total numeric(14,2) not null default 0,
	created_at timestamp with time zone default now()
);
create index if not exists invoices_company_idx on public.invoices(company_id);

create table if not exists public.invoice_items (
	id uuid primary key default gen_random_uuid(),
	invoice_id uuid not null references public.invoices(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete restrict,
	qty numeric(14,3) not null,
	unit_price numeric(14,2) not null,
	vat_rate numeric(5,2) not null,
	line_total numeric(14,2) not null,
	created_at timestamp with time zone default now()
);
create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);

do $$ begin
    if not exists (select 1 from pg_type where typname = 'stock_move_type') then
        create type public.stock_move_type as enum ('in','out');
    end if;
end $$;

create table if not exists public.stock_movements (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete restrict,
	invoice_id uuid references public.invoices(id) on delete set null,
	move_type public.stock_move_type not null,
	qty numeric(14,3) not null,
	created_at timestamp with time zone default now()
);
create index if not exists stock_company_idx on public.stock_movements(company_id);

-- Cash and bank
create table if not exists public.cash_ledgers (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	name text not null,
	created_at timestamp with time zone default now()
);

create table if not exists public.bank_accounts (
	id uuid primary key default gen_random_uuid(),
	company_id uuid not null references public.companies(id) on delete cascade,
	bank_name text,
	iban text,
	created_at timestamp with time zone default now()
);

do $$ begin
    if not exists (select 1 from pg_type where typname = 'money_flow') then
        create type public.money_flow as enum ('in','out');
    end if;
end $$;

create table if not exists public.bank_transactions (
	id uuid primary key default gen_random_uuid(),
	bank_account_id uuid not null references public.bank_accounts(id) on delete cascade,
	amount numeric(14,2) not null,
	flow public.money_flow not null,
	description text,
	trx_date date not null default now(),
	created_at timestamp with time zone default now()
);

-- RLS helpers: current_company_id via profiles
create or replace view public.current_user_company as
select p.company_id
from public.profiles p
where p.user_id = auth.uid();

-- Enable RLS
alter table public.companies enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.cash_ledgers enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.bank_transactions enable row level security;

-- Policies (company scoped)
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
    for select using ( id = (select company_id from public.current_user_company) );

drop policy if exists companies_ins on public.companies;
create policy companies_ins on public.companies
    for insert with check ( true ); -- company creation allowed; restrict via RPC if needed

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
    for update using ( id = (select company_id from public.current_user_company) );

drop policy if exists branches_rw on public.branches;
create policy branches_rw on public.branches
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
    for all using ( user_id = auth.uid() )
    with check ( user_id = auth.uid() );

drop policy if exists accounts_rw on public.accounts;
create policy accounts_rw on public.accounts
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists products_rw on public.products;
create policy products_rw on public.products
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists invoices_rw on public.invoices;
create policy invoices_rw on public.invoices
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists invoice_items_r on public.invoice_items;
create policy invoice_items_r on public.invoice_items
    for select using (
        exists (
            select 1 from public.invoices i
            where i.id = invoice_id
            and i.company_id = (select company_id from public.current_user_company)
        )
    );

drop policy if exists invoice_items_w on public.invoice_items;
create policy invoice_items_w on public.invoice_items
    for insert with check (
        exists (
            select 1 from public.invoices i
            where i.id = invoice_id
            and i.company_id = (select company_id from public.current_user_company)
        )
    );

drop policy if exists stock_rw on public.stock_movements;
create policy stock_rw on public.stock_movements
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists cash_rw on public.cash_ledgers;
create policy cash_rw on public.cash_ledgers
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists bank_acc_rw on public.bank_accounts;
create policy bank_acc_rw on public.bank_accounts
    for all using ( company_id = (select company_id from public.current_user_company) )
    with check ( company_id = (select company_id from public.current_user_company) );

drop policy if exists bank_trx_r on public.bank_transactions;
create policy bank_trx_r on public.bank_transactions
    for select using (
        exists (
            select 1 from public.bank_accounts b
            where b.id = bank_account_id
            and b.company_id = (select company_id from public.current_user_company)
        )
    );

drop policy if exists bank_trx_w on public.bank_transactions;
create policy bank_trx_w on public.bank_transactions
    for insert with check (
        exists (
            select 1 from public.bank_accounts b
            where b.id = bank_account_id
            and b.company_id = (select company_id from public.current_user_company)
        )
    );

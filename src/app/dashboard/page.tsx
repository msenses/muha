'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type InvoiceRow = { id: string; invoice_date: string; type: 'sales' | 'purchase'; total: number; accounts: { name: string } | null };

type AgendaSummary = { id: string; title: string; reminder_date: string };

function formatCurrency(x: number) {
	return x.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}

function KpiCard(props: { title: string; value: string; sub?: string; accent?: string }) {
	return (
		<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
			<div style={{ fontSize: 13, opacity: 0.85 }}>{props.title}</div>
			<div style={{ fontWeight: 800, fontSize: 24, marginTop: 6, color: props.accent ?? 'white' }}>{props.value}</div>
			{props.sub ? <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>{props.sub}</div> : null}
		</div>
	);
}

function Sparkline({ points, color = '#22c55e' }: { points: number[]; color?: string }) {
	if (!points.length) {
		return <div style={{ fontSize: 12, opacity: 0.8 }}>Veri yok</div>;
	}
	const max = Math.max(1, ...points);
	const min = Math.min(0, ...points);
	const range = Math.max(1, max - min);
	const width = 220;
	const height = 48;
	const step = points.length > 1 ? width / (points.length - 1) : width;
	const d = points
		.map((p, i) => {
			const x = Math.round(i * step);
			const y = Math.round(height - ((p - min) / range) * height);
			return `${i === 0 ? 'M' : 'L'}${x},${y}`;
		})
		.join(' ');
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
			<path d={d} fill="none" stroke={color} strokeWidth="2" />
		</svg>
	);
}

export default function DashboardPage() {
	const router = useRouter();

	const [accountCount, setAccountCount] = useState<number>(0);
	const [productCount, setProductCount] = useState<number>(0);
	const [sales30d, setSales30d] = useState<number>(0);
	const [purchases30d, setPurchases30d] = useState<number>(0);
	const [lastInvoices, setLastInvoices] = useState<InvoiceRow[]>([]);
	const [sales12m, setSales12m] = useState<number[]>([]);
	const [lowStock, setLowStock] = useState<Array<{ id: string; name: string; balance: number }>>([]);
	const [agendaItems, setAgendaItems] = useState<AgendaSummary[]>([]);

	useEffect(() => {
		let active = true;
		const load = async () => {
			try {
				const { data: sessionData } = await supabase.auth.getSession();
				if (!sessionData.session) {
					if (active) router.replace('/login');
					return;
				}

				const companyId = await fetchCurrentCompanyId();
				if (!companyId) {
					console.warn('Company ID bulunamadı');
					return;
				}

				// 1) Cari ve ürün sayıları
				const [{ count: accCount }, { count: prodCount }] = await Promise.all([
					supabase.from('accounts').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
					supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
				]);

				// 2) Son 30 gün satış/alış tutarları
				const since = new Date();
				since.setDate(since.getDate() - 30);
				const sinceStr = since.toISOString().slice(0, 10);
				const { data: last30Invoices } = await supabase
					.from('invoices')
					.select('type, net_total, invoice_date')
					.eq('company_id', companyId)
					.gte('invoice_date', sinceStr);

				let salesSum = 0;
				let purchaseSum = 0;
				(last30Invoices ?? []).forEach((inv: any) => {
					const amt = Number(inv.net_total ?? 0);
					if (inv.type === 'sales') salesSum += amt;
					if (inv.type === 'purchase') purchaseSum += amt;
				});

				// 3) Son faturalar
				const { data: lastInv } = await supabase
					.from('invoices')
					.select('id, invoice_date, type, total, accounts(name)')
					.eq('company_id', companyId)
					.order('invoice_date', { ascending: false })
					.limit(5);

				// 4) Azalan stoklar
				const { data: lowStockRows } = await supabase
					.from('products')
					.select('id, name, stock_balance, min_stock')
					.eq('company_id', companyId)
					.order('stock_balance', { ascending: true })
					.limit(10);

				// 5) Aylık satışlar (son 12 ay)
				const since12 = new Date();
				since12.setMonth(since12.getMonth() - 11);
				const since12Str = since12.toISOString().slice(0, 10);
				const { data: last12Sales } = await supabase
					.from('invoices')
					.select('invoice_date, net_total, type')
					.eq('company_id', companyId)
					.eq('type', 'sales')
					.gte('invoice_date', since12Str);

				const monthly: Record<string, number> = {};
				(last12Sales ?? []).forEach((inv: any) => {
					const d = inv.invoice_date?.slice(0, 7); // yyyy-MM
					if (!d) return;
					monthly[d] = (monthly[d] ?? 0) + Number(inv.net_total ?? 0);
				});
				const months: string[] = [];
				const now = new Date();
				for (let i = 11; i >= 0; i--) {
					const d = new Date(now);
					d.setMonth(d.getMonth() - i);
					months.push(d.toISOString().slice(0, 7));
				}
				const sales12 = months.map((m) => monthly[m] ?? 0);

				// 6) Ajanda'dan yaklaşan 3 kayıt
				const { data: agendaRows } = await supabase
					.from('agenda_items')
					.select('id, title, reminder_date')
					.eq('company_id', companyId)
					.order('reminder_date', { ascending: true })
					.limit(3);

				if (!active) return;

				setAccountCount(accCount ?? 0);
				setProductCount(prodCount ?? 0);
				setSales30d(salesSum);
				setPurchases30d(purchaseSum);
				setLastInvoices((lastInv ?? []) as unknown as InvoiceRow[]);
				setSales12m(sales12);
				setLowStock(
					(lowStockRows ?? [])
						.map((p: any) => ({
							id: p.id,
							name: p.name,
							balance: Number(p.stock_balance ?? 0),
							min: Number(p.min_stock ?? 0),
						}))
						// En az stok olanları öne al, stok seviyesi 0 veya min stok altında olanları göster
						.filter((p) => p.balance <= p.min || p.balance <= 0)
				);
				setAgendaItems(
					(agendaRows ?? []).map((a: any) => ({
						id: a.id,
						title: a.title,
						reminder_date: a.reminder_date,
					}))
				);
			} catch (err) {
				console.error('Dashboard verileri yüklenemedi:', err);
			}
		};
		load();
		return () => {
			active = false;
		};
	}, [router]);

	const kpis = useMemo(() => {
		return [
			{ title: 'Toplam Cari', value: accountCount.toString(), sub: 'Müşteri + Tedarikçi' },
			{ title: 'Toplam Ürün', value: productCount.toString(), sub: 'Aktif stok kartları' },
			{ title: 'Son 30 Gün Satış', value: formatCurrency(sales30d), accent: '#22c55e' },
			{ title: 'Son 30 Gün Alım', value: formatCurrency(purchases30d), accent: '#0ea5e9' },
		];
	}, [accountCount, productCount, sales30d, purchases30d]);

	return (
		<section style={{ padding: 16, color: 'white' }}>
			{/* İlk satır: 3 kare kutu */}
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
				{/* 1) Ajanda */}
				<div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: 12, aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column' }}>
					<div style={{ fontWeight: 700, marginBottom: 8 }}>Ajanda</div>
					<div style={{ display: 'grid', gap: 8, overflow: 'auto' }}>
						{agendaItems.map((a) => (
							<div key={a.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10, alignItems: 'center' }}>
								<div style={{ fontSize: 12, opacity: 0.85 }}>{new Date(a.reminder_date).toLocaleString('tr-TR')}</div>
								<div style={{ opacity: 0.95 }}>{a.title}</div>
							</div>
						))}
						{!agendaItems.length && (
							<div style={{ fontSize: 13, opacity: 0.8 }}>Yaklaşan ajanda kaydı bulunamadı.</div>
						)}
						<button onClick={() => router.push('/agenda')} style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ajandaya Git</button>
					</div>
				</div>

				{/* 2) En az stok */}
				<div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: 12, aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column' }}>
					<div style={{ fontWeight: 700, marginBottom: 8 }}>Azalan Stoklar</div>
					<div style={{ display: 'grid', gap: 8, overflow: 'auto' }}>
						{lowStock.map((r) => (
							<div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
								<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
								<div style={{ fontWeight: 700, color: r.balance <= 0 ? '#ef4444' : '#f59e0b' }}>{r.balance}</div>
							</div>
						))}
						{!lowStock.length && <div style={{ opacity: 0.8, fontSize: 13 }}>Gösterilecek ürün yok.</div>}
						<button onClick={() => router.push('/stock')} style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Stok Modülüne Git</button>
					</div>
				</div>
			</div>

			{/* 4. ve sonrası: en çok ihtiyaçtan en aza */}
			{/* 4) KPI'lar */}
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
				<div style={{ fontWeight: 800, fontSize: 20 }}>Genel Bakış</div>
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={() => router.push('/invoices/new')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #22c55e', background: '#22c55e', color: 'white', cursor: 'pointer' }}>+ Satış Faturası</button>
					<button onClick={() => router.push('/accounts/new')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>+ Cari</button>
					<button onClick={() => router.push('/stock')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Stoklar</button>
				</div>
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
				{kpis.map((k) => <KpiCard key={k.title} title={k.title} value={k.value} sub={k.sub} accent={k.accent} />)}
			</div>

			{/* 5) Son Faturalar + 6) Aylık Satışlar */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
				<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
					<div style={{ fontWeight: 700, marginBottom: 8 }}>Son Faturalar</div>
					<div style={{ display: 'grid', gap: 8 }}>
						{lastInvoices.map((r) => (
							<div key={r.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center' }}>
								<div style={{ fontSize: 12, opacity: 0.85 }}>{new Date(r.invoice_date).toLocaleDateString('tr-TR')}</div>
								<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.95 }}>{r.accounts?.name ?? '-'}</div>
								<div style={{ fontWeight: 700, color: r.type === 'sales' ? '#22c55e' : '#0ea5e9' }}>{formatCurrency(Number(r.total ?? 0))}</div>
							</div>
						))}
						{!lastInvoices.length && <div style={{ opacity: 0.8, fontSize: 13 }}>Gösterilecek fatura bulunamadı.</div>}
						<div>
							<button onClick={() => router.push('/invoices')} style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Tüm Faturalar</button>
						</div>
					</div>
				</div>

				<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<div style={{ fontWeight: 700 }}>Aylık Satışlar</div>
						<div style={{ fontSize: 12, opacity: 0.8 }}>Son 12 Ay</div>
					</div>
					<div style={{ marginTop: 8 }}>
						<Sparkline points={sales12m} color="#22c55e" />
					</div>
				</div>
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12, marginTop: 16 }}>
				<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
					<div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Cariler</div>
					<button onClick={() => router.push('/accounts')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Cari Listesine Git</button>
				</div>
				<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
					<div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Faturalar</div>
					<button onClick={() => router.push('/invoices')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Fatura Modülüne Git</button>
				</div>
				<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
					<div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Stok</div>
					<button onClick={() => router.push('/stock')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Stok Modülüne Git</button>
				</div>
				<div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
					<div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Kasa/Banka</div>
					<button onClick={() => router.push('/cash')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer' }}>Kasa/Banka Modülüne Git</button>
				</div>
			</div>
		</section>
	);
}

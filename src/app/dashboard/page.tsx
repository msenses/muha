 'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type InvoiceRow = { id: string; invoice_date: string; type: 'sales' | 'purchase'; total: number; accounts: { name: string } | null };

function formatCurrency(x: number) {
	return x.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
}

function addDaysLabel(days: number) {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toLocaleDateString('tr-TR');
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
	const [accountCount] = useState<number>(12);
	const [productCount] = useState<number>(58);
	const [sales30d] = useState<number>(126000);
	const [purchases30d] = useState<number>(84000);
	const [lastInvoices] = useState<InvoiceRow[]>([
		{ id: 'd1', invoice_date: new Date().toISOString().slice(0, 10), type: 'sales', total: 5800, accounts: { name: 'Demo Müşteri' } },
		{ id: 'd2', invoice_date: new Date().toISOString().slice(0, 10), type: 'purchase', total: 2400, accounts: { name: 'Demo Tedarikçi' } },
	]);
	const [sales12m] = useState<number[]>([12000, 8000, 15000, 18000, 22000, 17000, 26000, 30000, 28000, 31000, 29000, 35000]);
	const [lowStock] = useState<Array<{ id: string; name: string; balance: number }>>([
		{ id: 'p1', name: 'Demo Ürün A', balance: 2 },
		{ id: 'p2', name: 'Demo Ürün B', balance: 3 },
		{ id: 'p3', name: 'Demo Ürün C', balance: 5 },
	]);

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
						{[
							{ t: '03.12 10:30', text: 'İşlemler kontrol edilecek. — Mustafa Bey' },
							{ t: '03.12 10:10', text: 'Ödemeler kontrol edilecek. — Mustafa Bey' },
							{ t: '02.12 10:10', text: 'Tahsilatlar kontrol edilecek. — Ahmet Bey' },
						].map((e, i) => (
							<div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10, alignItems: 'center' }}>
								<div style={{ fontSize: 12, opacity: 0.85 }}>{e.t}</div>
								<div style={{ opacity: 0.95 }}>{e.text}</div>
							</div>
						))}
						<button onClick={() => router.push('/agenda')} style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ajandaya Git</button>
					</div>
				</div>

				{/* 2) Son 1 haftadaki yaklaşan ödemeler */}
				<div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: 12, aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column' }}>
					<div style={{ fontWeight: 700, marginBottom: 8 }}>Yaklaşan Ödemeler (7 gün)</div>
					<div style={{ display: 'grid', gap: 8, overflow: 'auto' }}>
						{[
							{ d: addDaysLabel(1), name: 'Demo Tedarikçi', amount: 4800 },
							{ d: addDaysLabel(3), name: 'XYZ Ltd.', amount: 9200 },
							{ d: addDaysLabel(5), name: 'ABC A.Ş.', amount: 3500 },
						].map((p, i) => (
							<div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center' }}>
								<div style={{ fontSize: 12, opacity: 0.85 }}>{p.d}</div>
								<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
								<div style={{ fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(p.amount)}</div>
							</div>
						))}
						<button onClick={() => router.push('/cash')} style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Ödeme/Tahsilatlara Git</button>
					</div>
				</div>

				{/* 3) En az stok */}
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

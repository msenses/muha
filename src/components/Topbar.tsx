'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Props = {
	show?: boolean;
	leftOffset?: number;
};

export default function Topbar({ show = true, leftOffset = 0 }: Props) {
	const [userLabel, setUserLabel] = useState<string>('');
	const [branch, setBranch] = useState<string>('');
	const [period, setPeriod] = useState<string>('');

	useEffect(() => {
		if (!show) return;
		let mounted = true;
		const load = async () => {
			const { data } = await supabase.auth.getSession();
			if (!mounted) return;
			const u = data.session?.user;
			const display =
				(u as any)?.user_metadata?.full_name ||
				(u as any)?.user_metadata?.name ||
				u?.email ||
				'Kullanıcı';
			setUserLabel(display);
		};
		load();
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			const u = session?.user;
			const display =
				(u as any)?.user_metadata?.full_name ||
				(u as any)?.user_metadata?.name ||
				u?.email ||
				'Kullanıcı';
			setUserLabel(display);
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, [show]);

	// Şube ve dönem basitçe localStorage üzerinden tutulur (varsayılanlar).
	useEffect(() => {
		if (!show) return;
		const savedBranch = typeof window !== 'undefined' ? window.localStorage.getItem('app.branch') : null;
		const savedPeriod = typeof window !== 'undefined' ? window.localStorage.getItem('app.period') : null;
		setBranch(savedBranch || 'Merkez');
		const currentYear = new Date().getFullYear().toString();
		setPeriod(savedPeriod || currentYear);
	}, [show]);

	const containerStyle = useMemo(() => {
		return {
			position: 'fixed' as const,
			top: 0,
			left: leftOffset,
			right: 0,
			height: 52,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-end',
			gap: 16,
			padding: '0 16px',
			background: 'rgba(0,0,0,0.15)',
			backdropFilter: 'blur(6px)',
			borderBottom: '1px solid rgba(255,255,255,0.12)',
			color: 'white',
			zIndex: 1100,
		};
	}, [leftOffset]);

	if (!show) return null;

	return (
		<header style={containerStyle}>
			<div style={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 12, opacity: 0.8 }}>Şube</span>
				<strong>{branch}</strong>
			</div>
			<div style={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 12, opacity: 0.8 }}>Dönem</span>
				<strong>{period}</strong>
			</div>
			<div style={{ opacity: 0.95, display: 'flex', alignItems: 'center', gap: 8 }}>
				<span style={{ fontSize: 12, opacity: 0.8 }}>Kullanıcı</span>
				<strong>{userLabel}</strong>
			</div>
		</header>
	);
}



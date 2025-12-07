'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-side'da pathname kontrolü yap
  const isLoginOrTest = mounted && (pathname === '/login' || pathname === '/test-connection' || pathname === '/');
  const showSidebar = mounted && !isLoginOrTest;
  const showTopbar = mounted && !isLoginOrTest;

  // Server-side render'da veya henüz mount olmadıysa sadece children'ı render et
  if (!mounted) {
    return (
      <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {showSidebar && <Sidebar />}
      {showTopbar && <Topbar />}
      <div style={{ paddingLeft: showSidebar ? 240 : 0, paddingTop: showTopbar ? 60 : 0 }}>
        {children}
      </div>
    </div>
  );
}



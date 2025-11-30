'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/login';
  const showTopbar = pathname !== '/login';

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {showSidebar && <Sidebar />}
      <Topbar show={showTopbar} />
      <div style={{ paddingLeft: showSidebar ? 240 : 0, paddingTop: showTopbar ? 60 : 0 }}>
        {children}
      </div>
    </div>
  );
}



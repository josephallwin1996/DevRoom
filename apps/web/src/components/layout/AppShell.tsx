'use client';

import { useState } from 'react';

import { useAuth } from '@/providers/AuthProvider';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header
        username={user?.username}
        avatarUrl={user?.avatarUrl}
        onMenuClick={() => setSidebarOpen(true)}
        onLogout={logout}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
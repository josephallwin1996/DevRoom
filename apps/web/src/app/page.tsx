'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/providers/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted)]">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Welcome to DevRoom
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Your collaborative developer workspace.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
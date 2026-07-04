"use client";

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, loadFromStorage } = useStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 pb-20 md:px-6 md:py-8 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}

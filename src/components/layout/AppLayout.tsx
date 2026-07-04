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
        <div className="mx-auto max-w-[1400px] px-4 py-4 pb-20 md:px-10 md:py-10 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}

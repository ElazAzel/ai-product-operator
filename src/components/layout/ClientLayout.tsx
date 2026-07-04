"use client";

import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/lib/store';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = useStore(s => s.user);

  useEffect(() => {
    const html = document.documentElement;
    if (user.theme === 'light') {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
  }, [user.theme]);

  return <AppLayout>{children}</AppLayout>;
}

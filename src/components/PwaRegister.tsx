'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function PwaRegister() {
  const [conn, setConn] = useState({ online: true, type: 'unknown' });

  useEffect(() => {
    const updateConn = () => {
      const n = navigator as any;
      const c = n.connection;
      const type = c ? c.type : 'unknown';
      setConn({ online: navigator.onLine, type });
    };

    updateConn();
    window.addEventListener('online', updateConn);
    window.addEventListener('offline', updateConn);

    const c = (navigator as any).connection;
    if (c) c.addEventListener('change', updateConn);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }

    return () => {
      window.removeEventListener('online', updateConn);
      window.removeEventListener('offline', updateConn);
      if (c) c.removeEventListener('change', updateConn);
    };
  }, []);

  if (conn.online) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium",
      "bg-amber-500/10 text-amber-400 border-b border-amber-500/20 backdrop-blur-sm"
    )}>
      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      Офлайн-режим — данные сохраняются локально
    </div>
  );
}

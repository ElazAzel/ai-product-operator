'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function PwaRegister() {
  const [status, setStatus] = useState('online');

  useEffect(() => {
    const update = () => {
      const n = navigator as any;
      const c = n.connection;
      setStatus(navigator.onLine ? 'online' : 'offline');
      if (navigator.onLine && c && c.type !== 'wifi' && c.type !== 'ethernet') {
        setStatus('cellular');
      }
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const c = (navigator as any).connection;
    if (c) c.addEventListener('change', update);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          if (reg.active) reg.active.postMessage({ type: 'DOWNLOAD_ALL' });
          reg.addEventListener('updatefound', () => {
            const sw = reg.installing;
            if (sw) sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') sw.postMessage({ type: 'DOWNLOAD_ALL' });
            });
          });
        });
      });
    }

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if (c) c.removeEventListener('change', update);
    };
  }, []);

  if (status === 'online') return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium backdrop-blur-sm",
      status === 'offline'
        ? "bg-amber-500/10 text-amber-400 border-b border-amber-500/20"
        : "bg-blue-500/10 text-blue-400 border-b border-blue-500/20"
    )}>
      <div className={cn(
        "h-1.5 w-1.5 rounded-full animate-pulse",
        status === 'offline' ? "bg-amber-400" : "bg-blue-400"
      )} />
      {status === 'offline' ? 'Офлайн-режим — все данные доступны' : 'Экономия трафика — загрузка по WiFi'}
    </div>
  );
}

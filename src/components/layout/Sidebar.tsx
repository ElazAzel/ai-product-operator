"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Database, BarChart3,
  Calendar, Package, DollarSign, ClipboardList, FileText,
  Settings, ChevronLeft, ChevronRight, Sparkles, Award,
  MoreHorizontal, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/evidence-vault', label: 'Evidence', icon: Database },
  { href: '/skill-scorecard', label: 'Skills', icon: BarChart3 },
  { href: '/weekly-plan', label: 'Plan', icon: Calendar },
  { href: '/artifacts', label: 'Artifacts', icon: Package },
  { href: '/money-map', label: 'Money', icon: DollarSign },
  { href: '/reviews', label: 'Reviews', icon: ClipboardList },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/certifications', label: 'Certs', icon: Award },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const mobileMainNav = navItems.slice(0, 4);
const mobileMoreNav = navItems.slice(4);

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, currentLessonId } = useStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  if (!mounted) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const navContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-sm font-bold tracking-tight">AI Product Operator</span>
        </div>
        <button onClick={toggleSidebar} className="hidden md:flex rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-accent-subtle text-accent"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
              !sidebarOpen && "justify-center"
            )}
            title={!sidebarOpen ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      {sidebarOpen && currentLessonId && (
        <div className="border-t p-3">
          <Link href={`/lesson/${currentLessonId}`}
            className="flex items-center gap-3 rounded-xl bg-accent-subtle px-3 py-2.5 text-sm font-medium text-accent">
            <BookOpen className="h-5 w-5" />
            <span>Текущий урок</span>
          </Link>
        </div>
      )}
      {sidebarOpen && (
        <div className="border-t p-4">
          <div className="text-xs text-zinc-500">v0.1.0 MVP</div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t bg-zinc-950/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)]">
        {mobileMainNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1"
            >
              <div className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-colors",
                active ? "text-accent" : "text-zinc-500"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-tight transition-colors",
                active ? "text-accent" : "text-zinc-500"
              )}>
                {item.label}
              </span>
              {active && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-accent" />}
            </Link>
          );
        })}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1"
        >
          <div className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-500">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-zinc-500">Ещё</span>
        </button>
      </nav>

      {/* Mobile more menu drawer */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom,0px)] animate-slide-up">
            <div className="rounded-t-2xl bg-zinc-900 border border-zinc-800 p-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Все разделы</span>
                <button onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-800">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {mobileMoreNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl p-3 transition-colors",
                        active ? "bg-accent-subtle" : "hover:bg-zinc-800"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", active ? "text-accent" : "text-zinc-400")} />
                      <span className={cn("text-[10px] leading-tight text-center", active ? "text-accent" : "text-zinc-500")}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r bg-zinc-950 transition-all duration-300 md:block",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">{navContent}</div>
      </aside>
    </>
  );
}

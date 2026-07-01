"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, BookOpen, Database, BarChart3,
  Calendar, Package, DollarSign, ClipboardList, FileText,
  Settings, ChevronLeft, ChevronRight, Sparkles, Menu, X,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Course Roadmap', icon: Map },
  { href: '/evidence-vault', label: 'Evidence Vault', icon: Database },
  { href: '/skill-scorecard', label: 'Skill Scorecard', icon: BarChart3 },
  { href: '/weekly-plan', label: 'Weekly Plan', icon: Calendar },
  { href: '/artifacts', label: 'Artifacts', icon: Package },
  { href: '/money-map', label: 'Money Map', icon: DollarSign },
  { href: '/reviews', label: 'Reviews', icon: ClipboardList },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/certifications', label: 'Certifications', icon: Award },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, currentLessonId } = useStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!mounted) return null;

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        {(sidebarOpen || mobileOpen) && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold tracking-tight">AI Product Operator</span>
          </div>
        )}
        {/* Desktop toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="flex md:hidden rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-subtle text-accent dark:bg-accent-subtle dark:text-accent"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                !(sidebarOpen || mobileOpen) && "justify-center"
              )}
              title={!(sidebarOpen || mobileOpen) ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {(sidebarOpen || mobileOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Current Lesson */}
      {(sidebarOpen || mobileOpen) && currentLessonId && (
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <Link
            href={`/lesson/${currentLessonId}`}
            className="flex items-center gap-3 rounded-xl bg-accent-subtle px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-subtle"
          >
            <BookOpen className="h-5 w-5" />
            <span>Текущий урок</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      {(sidebarOpen || mobileOpen) && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            v0.1.0 MVP
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex md:hidden items-center justify-center h-10 w-10 rounded-xl bg-zinc-900 text-zinc-100 shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-zinc-200 bg-white transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full w-64 flex-col">
          {navContent}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 md:block",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {navContent}
        </div>
      </aside>
    </>
  );
}

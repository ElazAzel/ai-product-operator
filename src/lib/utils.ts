import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Direction, Module, Lesson, EvidenceCard, Artifact, Skill, WeeklyPlan } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getDirectionLabel(direction: Direction): string {
  const labels: Record<Direction, string> = {
    'ai-services': 'AI-услуги',
    'linkmax': 'LinkMAX',
    'academy': 'Academy',
    'skill': 'Навык',
  };
  return labels[direction];
}

export function getDirectionColor(direction: Direction): string {
  const colors: Record<Direction, string> = {
    'ai-services': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'linkmax': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    'academy': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'skill': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };
  return colors[direction];
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'not_started': 'Не начат',
    'in_progress': 'В процессе',
    'completed': 'Завершён',
    'draft': 'Черновик',
    'validated': 'Проверено',
    'case-ready': 'Готово к кейсу',
    'tested': 'Протестировано',
    'packaged': 'Упаковано',
    'published': 'Опубликовано',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'not_started': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    'in_progress': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'draft': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    'validated': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'case-ready': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'tested': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'packaged': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    'published': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  return colors[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}

export function calculateModuleProgress(lessons: Lesson[], moduleId: string): number {
  const moduleLessons = lessons.filter(l => l.module_id === moduleId);
  if (moduleLessons.length === 0) return 0;
  const completed = moduleLessons.filter(l => l.status === 'completed').length;
  return Math.round((completed / moduleLessons.length) * 100);
}

export function calculateCourseProgress(modules: Module[]): number {
  if (modules.length === 0) return 0;
  const total = modules.reduce((sum, m) => sum + m.progress, 0);
  return Math.round(total / modules.length);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportToJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
}

export function exportToMarkdown(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.md`;
  link.click();
}

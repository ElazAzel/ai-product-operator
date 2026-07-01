"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { formatCurrency, getDirectionLabel, getDirectionColor } from '@/lib/utils';
import { Direction } from '@/lib/types';
import {
  DollarSign, TrendingUp, Target, Briefcase, Users, FileText,
  ArrowRight, Zap, Plus, Trash2
} from 'lucide-react';

export default function MoneyMapPage() {
  const { user, modules, lessons, evidenceCards, artifacts, incomeEntries, addIncomeEntry, deleteIncomeEntry, getTotalIncome, getIncomeByDirection } = useStore();
  const [showDialog, setShowDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({ amount: 0, source: '', description: '', direction: 'ai-services' as Direction, date: new Date().toISOString().split('T')[0], hours_spent: 0 });

  const revenueStreams = [
    {
      title: 'AI-аудит',
      description: 'Диагностика бизнеса для внедрения AI',
      price: '50–100k ₸',
      status: 'available',
      module: 4,
      lessons: ['les-4-2', 'les-4-3'],
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'AI-внедрение за 14 дней',
      description: 'Маленький проект: контент-система, FAQ, скрипты',
      price: '150–300k ₸',
      status: 'available',
      module: 5,
      lessons: ['les-5-3'],
      icon: Zap,
      color: 'text-accent',
    },
    {
      title: 'AI-база знаний',
      description: 'RAG-система для бизнеса',
      price: '200–500k ₸',
      status: 'future',
      module: 9,
      lessons: ['les-9-3', 'les-9-4'],
      icon: Target,
      color: 'text-emerald-500',
    },
    {
      title: 'AI-продукты',
      description: 'Свои AI-функции, Page Builder, micro-SaaS',
      price: 'Product revenue',
      status: 'available',
      module: 6,
      lessons: ['les-6-1', 'les-6-2'],
      icon: Briefcase,
      color: 'text-amber-500',
    },
    {
      title: 'AI-обучение',
      description: 'Курсы, воркшопы, контент, менторство',
      price: '200k–1M+ ₸',
      status: 'available',
      module: 11,
      lessons: ['les-11-1', 'les-11-2'],
      icon: Users,
      color: 'text-pink-500',
    },
  ];

  const relatedLessons = lessons.filter(l =>
    evidenceCards.some(e => e.lesson_id === l.id) ||
    artifacts.some(a => a.lesson_id === l.id)
  );

  const totalIncome = getTotalIncome();
  const incomeProgress = user.income_goal > 0 ? Math.min(100, Math.round((totalIncome / user.income_goal) * 100)) : 0;

  const handleAddIncome = () => {
    if (newEntry.amount <= 0) return;
    addIncomeEntry({ ...newEntry, user_id: 'user-1' });
    setShowDialog(false);
    setNewEntry({ amount: 0, source: '', description: '', direction: 'ai-services', date: new Date().toISOString().split('T')[0], hours_spent: 0 });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <DollarSign className="h-7 w-7 text-accent" />
          Money Map
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          Связь обучения с доходом. Каждый урок → деньги.
        </p>
      </div>

      {/* Goal */}
      <Card className="border-t-2 border-accent bg-surface">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-accent font-medium mb-1">Главная цель</div>
              <div className="text-2xl font-bold md:text-3xl">{formatCurrency(user.income_goal)}/мес</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm text-zinc-400 mb-1">Текущий доход от AI</div>
              <div className="text-xl font-bold text-emerald-400 md:text-2xl">{formatCurrency(totalIncome)}</div>
              <Progress value={incomeProgress} className="w-full sm:w-48 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income by Direction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['ai-services', 'ai-products', 'ai-teaching'] as const).map(dir => {
          const dirIncome = getIncomeByDirection(dir);
          return (
            <Card key={dir}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDirectionColor(dir)}>{getDirectionLabel(dir)}</Badge>
                  <span className="text-lg font-bold text-emerald-400">{formatCurrency(dirIncome)}</span>
                </div>
                <Progress value={user.income_goal > 0 ? Math.min(100, (dirIncome / user.income_goal) * 100) : 0} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Income Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Доходы
            </CardTitle>
            <Button size="sm" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> Добавить доход
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {incomeEntries.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              Ещё нет записей о доходе. Добавь первый заработанный тенге.
            </p>
          ) : (
            <div className="space-y-2">
              {[...incomeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Badge className={getDirectionColor(entry.direction)}>
                      {getDirectionLabel(entry.direction)}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{entry.source}</p>
                      <p className="text-xs text-zinc-500">{entry.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-emerald-400">{formatCurrency(entry.amount)}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteIncomeEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Streams */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Потоки дохода</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {revenueStreams.map((stream) => (
            <Card key={stream.title} className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-zinc-800 ${stream.color}`}>
                    <stream.icon className="h-5 w-5" />
                  </div>
                  <Badge variant={stream.status === 'available' ? 'default' : 'secondary'}>
                    {stream.status === 'available' ? 'Доступно' : `Модуль ${stream.module}`}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{stream.title}</h3>
                <p className="text-sm text-zinc-400 mb-3">{stream.description}</p>
                <div className="text-lg font-bold text-emerald-400">{stream.price}</div>
                <Link href={`/lesson/${stream.lessons[0] || 'les-1-1'}`}>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 mt-3 hover:text-zinc-300 cursor-pointer">
                    Связанные уроки <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-zinc-500 mt-1">Лиды</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-zinc-500 mt-1">Офферы</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-zinc-500 mt-1">Оплаченные</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-zinc-500 mt-1">Кейсы</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons → Money Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Уроки, связанные с доходом</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedLessons.length === 0 ? (
            <p className="text-zinc-500 text-sm">
              Пройди уроки и создай артефакты — они появятся здесь.
              Каждый урок = артефакт = применение = деньги.
            </p>
          ) : (
            <div className="space-y-2">
              {relatedLessons.slice(0, 10).map(lesson => {
                const mod = modules.find(m => m.id === lesson.module_id);
                return (
                  <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {mod ? `М${mod.order_index}` : '—'}
                      </Badge>
                      <span className="text-sm">{lesson.title}</span>
                      <ArrowRight className="h-3 w-3 ml-auto text-zinc-600" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Income Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить доход</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Сумма (₸)</Label>
              <Input type="number" value={newEntry.amount || ''} onChange={e => setNewEntry(f => ({ ...f, amount: +e.target.value }))} placeholder="100000" />
            </div>
            <div>
              <Label>Источник</Label>
              <Input value={newEntry.source} onChange={e => setNewEntry(f => ({ ...f, source: e.target.value }))} placeholder="AI-аудит для компании X" />
            </div>
            <div>
              <Label>Описание</Label>
              <Input value={newEntry.description} onChange={e => setNewEntry(f => ({ ...f, description: e.target.value }))} placeholder="Подробности" />
            </div>
            <div>
              <Label>Затрачено часов</Label>
              <Input type="number" value={newEntry.hours_spent || ''} onChange={e => setNewEntry(f => ({ ...f, hours_spent: +e.target.value }))} placeholder="10" />
            </div>
            <div>
              <Label>Направление</Label>
              <div className="flex gap-2 mt-1">
                {(['ai-services', 'ai-products', 'ai-teaching'] as const).map(d => (
                  <Button key={d} variant={newEntry.direction === d ? 'default' : 'outline'} size="sm"
                    onClick={() => setNewEntry(f => ({ ...f, direction: d }))}>
                    {getDirectionLabel(d)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Дата</Label>
              <Input type="date" value={newEntry.date} onChange={e => setNewEntry(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Отмена</Button>
            <Button onClick={handleAddIncome}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 italic">
          &ldquo;Если это не связано с деньгами, продуктом или кейсом — проверь, зачем ты это делаешь.&rdquo;
        </p>
      </div>
    </div>
  );
}

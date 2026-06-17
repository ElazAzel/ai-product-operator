"use client";

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, TrendingUp, Target, Briefcase, Users, FileText,
  ArrowRight, Zap
} from 'lucide-react';

export default function MoneyMapPage() {
  const { user, modules, lessons, evidenceCards, artifacts } = useStore();

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
      color: 'text-violet-500',
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
      title: 'LinkMAX AI-функции',
      description: 'AI Page Builder, Copy Assistant, Mini-RAG',
      price: 'Product revenue',
      status: 'available',
      module: 6,
      lessons: ['les-6-1', 'les-6-2'],
      icon: Briefcase,
      color: 'text-amber-500',
    },
    {
      title: 'AI Strategic Academy',
      description: 'Модули, воркшопы, корпоративное обучение',
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <DollarSign className="h-7 w-7 text-violet-500" />
          Money Map
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          Связь обучения с доходом. Каждый урок → деньги.
        </p>
      </div>

      {/* Goal */}
      <Card className="border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-violet-400 font-medium mb-1">Главная цель</div>
              <div className="text-2xl font-bold md:text-3xl">{formatCurrency(user.income_goal)}/мес</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm text-zinc-400 mb-1">Текущий доход от AI</div>
              <div className="text-xl font-bold text-emerald-400 md:text-2xl">0 ₸</div>
              <Progress value={0} className="w-full sm:w-48 mt-2" />
            </div>
          </div>
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

      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 italic">
          &ldquo;Если это не связано с деньгами, продуктом или кейсом — проверь, зачем ты это делаешь.&rdquo;
        </p>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDirectionLabel, getDirectionColor, formatCurrency } from '@/lib/utils';
import {
  ArrowRight, BookOpen, Database, Package, Target, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Zap, DollarSign, Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const {
    modules, lessons, evidenceCards, artifacts, skills,
    user, getCourseProgress, getDirectionProgress,
    getWeeklyHoursPlanned, getWeeklyHoursActual,
    getTotalIncome
  } = useStore();

  const courseProgress = getCourseProgress();
  const aiServicesProgress = getDirectionProgress('ai-services');
  const aiProductsProgress = getDirectionProgress('ai-products');
  const aiTeachingProgress = getDirectionProgress('ai-teaching');

  const currentModule = modules.find(m => m.status === 'in_progress') || modules.find(m => m.status === 'not_started');
  const currentLesson = lessons.find(l => l.status === 'in_progress') || (currentModule ? lessons.find(l => l.module_id === currentModule.id && l.status !== 'completed') : null);

  const weeklyPlanned = getWeeklyHoursPlanned();
  const weeklyActual = getWeeklyHoursActual();
  const totalIncome = getTotalIncome();

  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const totalLessons = lessons.length;

  const nextActions = [];
  if (currentLesson) {
    nextActions.push({
      label: `Продолжить: ${currentLesson.title}`,
      href: `/lesson/${currentLesson.id}`,
      icon: BookOpen,
    });
  }
  if (evidenceCards.length === 0) {
    nextActions.push({
      label: 'Создать первую Evidence Card',
      href: '/evidence-vault',
      icon: Database,
    });
  }
  if (skills.some(s => s.score === 0)) {
    nextActions.push({
      label: 'Заполнить Skill Scorecard',
      href: '/skill-scorecard',
      icon: Target,
    });
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Управляй своим развитием как продуктом
        </p>
      </div>

      {/* Money Connection Banner */}
      <Card className="border-t-2 border-accent bg-surface">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                <DollarSign className="h-4 w-4" />
                Связь с целью
              </div>
              <h3 className="text-xl font-bold md:text-2xl">{formatCurrency(user.income_goal)}/мес</h3>
              <p className="text-zinc-400 mt-1">
                Каждый урок → артефакт → применение → доказательство → деньги
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400">Текущий доход</div>
              <div className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</div>
              <Progress value={user.income_goal > 0 ? Math.min(100, (totalIncome / user.income_goal) * 100) : 0} className="w-full sm:w-48 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Прогресс курса</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseProgress}%</div>
            <Progress value={courseProgress} className="mt-2" />
            <p className="text-xs text-zinc-500 mt-2">{completedLessons} из {totalLessons} уроков</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Evidence Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{evidenceCards.length}</div>
            <p className="text-xs text-zinc-500 mt-2">
              {evidenceCards.length === 0 ? 'Создай первую Evidence Card' : 'доказательств собрано'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Артефакты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{artifacts.length}</div>
            <p className="text-xs text-zinc-500 mt-2">
              {artifacts.length === 0 ? 'Добавь первый артефакт' : 'артефактов создано'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Часы на неделе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weeklyActual}<span className="text-lg text-zinc-500">/{user.weekly_hours_goal}ч</span></div>
            <Progress value={(weeklyActual / user.weekly_hours_goal) * 100} className="mt-2" />
            <p className="text-xs text-zinc-500 mt-2">Запланировано: {weeklyPlanned}ч</p>
          </CardContent>
        </Card>
      </div>

      {/* Direction Progress */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Прогресс по направлениям</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['ai-services', 'ai-products', 'ai-teaching'] as const).map((dir) => {
            const progress = getDirectionProgress(dir);
            return (
              <Card key={dir}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDirectionColor(dir)}>
                      {getDirectionLabel(dir)}
                    </Badge>
                    <span className="text-sm font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cross-Cutting Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-accent" />
            Сквозные практики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
              <div className="text-sm font-semibold text-accent mb-1">AI-Radar</div>
              <p className="text-xs text-zinc-400">15–20 мин/нед: 1–2 источника + вывод «что реально меняет мою работу»</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
              <div className="text-sm font-semibold text-cyan-400 mb-1">Evals-мышление</div>
              <p className="text-xs text-zinc-400">3–5 эталонных кейсов и критерий «сработало / нет» до масштабирования</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
              <div className="text-sm font-semibold text-amber-400 mb-1">Ментальные модели</div>
              <p className="text-xs text-zinc-400">Токены, контекст, галлюцинации, reasoning — что не меняется от версии к версии</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
              <div className="text-sm font-semibold text-emerald-400 mb-1">Этика и раскрытие</div>
              <p className="text-xs text-zinc-400">Честность о AI в работе, аккуратность с данными, проверка правил</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Module & Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Module */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Текущий модуль
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentModule ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Модуль {currentModule.order_index}</Badge>
                  <Badge className={currentModule.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' : ''}>
                    {currentModule.status === 'in_progress' ? 'В процессе' : 'Не начат'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{currentModule.title}</h3>
                <p className="text-sm text-zinc-400 mb-3">{currentModule.description}</p>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>Прогресс: {currentModule.progress}%</span>
                  <span>Артефакты: {currentModule.artifact_count}</span>
                  <span>Evidence: {currentModule.evidence_count}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Начни с Course Roadmap</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Action */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-accent" />
              Следующее действие
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextActions.length > 0 ? (
              <div className="space-y-3">
                {nextActions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <action.icon className="h-5 w-5 text-muted" />
                    <span className="text-sm font-medium">{action.label}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-zinc-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                <p className="text-emerald-400">Всё сделано! Проверь Evidence Vault.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Быстрая статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">{completedLessons}</div>
              <div className="text-xs text-zinc-500 mt-1">Уроков пройдено</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">{evidenceCards.length}</div>
              <div className="text-xs text-zinc-500 mt-1">Evidence Cards</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">{artifacts.length}</div>
              <div className="text-xs text-zinc-500 mt-1">Артефактов</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
              <div className="text-2xl font-bold">{skills.filter(s => s.score > 0).length}</div>
              <div className="text-xs text-zinc-500 mt-1">Навыков оценено</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micro-copy footer */}
      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 italic">
          &ldquo;Артефакт важнее ощущения прогресса.&rdquo;
        </p>
      </div>
    </div>
  );
}

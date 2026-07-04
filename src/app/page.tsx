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
  ArrowRight, BookOpen, Database, Target,
  Clock, CheckCircle2, Zap, DollarSign, Sparkles,
  Layers, Map
} from 'lucide-react';

export default function DashboardPage() {
  const {
    modules, lessons, evidenceCards, artifacts, skills,
    user, getCourseProgress, getDirectionProgress,
    getWeeklyHoursPlanned, getWeeklyHoursActual,
    getTotalIncome
  } = useStore();

  const courseProgress = getCourseProgress();
  const weeklyPlanned = getWeeklyHoursPlanned();
  const weeklyActual = getWeeklyHoursActual();
  const totalIncome = getTotalIncome();
  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const totalLessons = lessons.length;

  const currentModule = modules.find(m => m.status === 'in_progress') || modules.find(m => m.status === 'not_started');
  const currentLesson = lessons.find(l => l.status === 'in_progress') || (currentModule ? lessons.find(l => l.module_id === currentModule.id && l.status !== 'completed') : null);

  const moduleLessons = currentModule ? lessons.filter(l => l.module_id === currentModule.id) : [];
  const moduleCompleted = moduleLessons.filter(l => l.status === 'completed').length;
  const moduleTotal = moduleLessons.length;

  const isFreshStart = evidenceCards.length === 0 && completedLessons === 0;
  const needsScorecard = skills.some(s => s.score === 0);
  const needsEvidence = evidenceCards.length === 0;

  const nextActions = [];
  if (currentLesson) {
    nextActions.push({ label: `Продолжить урок: ${currentLesson.title}`, href: `/lesson/${currentLesson.id}`, icon: BookOpen, priority: 1 });
  } else if (currentModule) {
    const firstIncomplete = lessons.find(l => l.module_id === currentModule.id && l.status !== 'completed');
    if (firstIncomplete) nextActions.push({ label: `Начать: ${firstIncomplete.title}`, href: `/lesson/${firstIncomplete.id}`, icon: BookOpen, priority: 1 });
  }
  if (needsScorecard) nextActions.push({ label: 'Заполнить Skill Scorecard', href: '/skill-scorecard', icon: Target, priority: 2 });
  if (needsEvidence && completedLessons > 0) nextActions.push({ label: 'Создать Evidence Card для пройденного урока', href: '/evidence-vault', icon: Database, priority: 2 });

  nextActions.sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero — Текущий урок */}
      <Card className="border-t-2 border-accent bg-surface overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs text-accent font-medium uppercase tracking-wider mb-3">
                <Zap className="h-3.5 w-3.5" />
                {currentLesson ? 'Продолжи обучение' : isFreshStart ? 'Начни здесь' : 'Твой прогресс'}
              </div>
              {currentLesson ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{currentModule ? `Модуль ${currentModule.order_index}` : ''}</Badge>
                    <Badge className="bg-amber-500/10 text-amber-500 text-xs">В процессе</Badge>
                  </div>
                  <h2 className="text-xl font-bold md:text-2xl mb-1">{currentLesson.title}</h2>
                  <p className="text-sm text-zinc-400 mb-4">{currentLesson.goal || 'Продолжи прохождение урока'}</p>
                  <Link href={`/lesson/${currentLesson.id}`}>
                    <Button size="lg" className="gap-2">
                      <BookOpen className="h-4 w-4" /> Продолжить урок <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : isFreshStart ? (
                <>
                  <h2 className="text-xl font-bold md:text-2xl mb-1">Добро пожаловать в AI Product Operator</h2>
                  <p className="text-sm text-zinc-400 mb-4">12 модулей по 4 урока. Каждый урок → артефакт → доказательство → деньги.</p>
                  <div className="flex gap-2">
                    <Link href="/roadmap"><Button size="lg" className="gap-2"><Map className="h-4 w-4" /> Обзор курса <ArrowRight className="h-4 w-4" /></Button></Link>
                    <Link href="/skill-scorecard"><Button variant="outline" size="lg" className="gap-2"><Target className="h-4 w-4" /> Стартовая диагностика</Button></Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold md:text-2xl mb-1">Курс завершён!</h2>
                  <p className="text-sm text-zinc-400 mb-4">Ты прошёл все {totalLessons} уроков. Переходи к масштабированию.</p>
                  <Link href="/roadmap"><Button variant="outline" size="lg"><Map className="h-4 w-4 mr-2" /> Карта курса</Button></Link>
                </>
              )}
            </div>
            <div className="md:w-48 bg-zinc-800/30 p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-zinc-800">
              <div className="text-center">
                <div className="text-sm text-zinc-500 mb-1">Курс</div>
                <div className="text-3xl font-bold">{courseProgress}%</div>
                <Progress value={courseProgress} className="mt-2 mb-1" />
                <div className="text-xs text-zinc-500">{completedLessons}/{totalLessons} уроков</div>
              </div>
              {currentModule && moduleTotal > 0 && (
                <div className="text-center mt-4 pt-4 border-t border-zinc-800">
                  <div className="text-sm text-zinc-500 mb-1">Модуль {currentModule.order_index}</div>
                  <div className="text-lg font-semibold">{moduleCompleted}/{moduleTotal}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Быстрые действия */}
      {nextActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nextActions.map((action, idx) => (
            <Link key={idx} href={action.href}>
              <Button variant={idx === 0 ? 'default' : 'outline'} size="sm" className="gap-2">
                <action.icon className="h-4 w-4" /> {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{completedLessons}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Уроков пройдено</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{evidenceCards.length}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Evidence Cards</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{artifacts.length}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Артефактов</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{weeklyActual}<span className="text-sm text-zinc-600">/{user.weekly_hours_goal}ч</span></div>
          <div className="text-xs text-zinc-500 mt-0.5">Часов на неделе</div>
        </CardContent></Card>
      </div>

      {/* Доход */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-subtle"><DollarSign className="h-5 w-5 text-accent" /></div>
              <div>
                <div className="text-xs text-zinc-500">Цель / Текущий доход</div>
                <div className="text-lg font-bold">{formatCurrency(user.income_goal)}/мес <span className="text-emerald-400">→ {formatCurrency(totalIncome)}</span></div>
              </div>
            </div>
            <div className="w-32"><Progress value={user.income_goal > 0 ? Math.min(100, (totalIncome / user.income_goal) * 100) : 0} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Прогресс по направлениям */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Направления</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['ai-services', 'ai-products', 'ai-teaching'] as const).map((dir) => {
            const progress = getDirectionProgress(dir);
            return (
              <Card key={dir}><CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDirectionColor(dir)}>{getDirectionLabel(dir)}</Badge>
                  <span className="text-sm font-bold">{progress}%</span>
                </div>
                <Progress value={progress} />
              </CardContent></Card>
            );
          })}
        </div>
      </div>

      {/* Текущий модуль — мини-карта */}
      {currentModule && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-accent" />
              Модуль {currentModule.order_index}: {currentModule.title}
              <Badge className="ml-auto text-xs">{currentModule.status === 'in_progress' ? 'В процессе' : 'Не начат'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {moduleLessons.map((lesson) => (
                <Link key={lesson.id} href={`/lesson/${lesson.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-sm">
                  {lesson.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : lesson.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-zinc-600 shrink-0" />
                  )}
                  <span className={lesson.status === 'completed' ? 'text-zinc-500' : lesson.status === 'in_progress' ? 'text-zinc-200 font-medium' : 'text-zinc-400'}>{lesson.title}</span>
                  {lesson.id === currentLesson?.id && (
                    <Badge variant="outline" className="ml-auto text-xs">Текущий</Badge>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сквозные практики */}
      <Card>
        <CardContent className="p-4">
          <details className="group">
            <summary className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer list-none">
              <Sparkles className="h-4 w-4 text-accent" />
              Сквозные практики
              <ArrowRight className="h-3 w-3 ml-auto transition-transform group-open:rotate-90" />
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {[
                { title: 'AI-Radar', desc: '15–20 мин/нед: 1–2 источника + вывод', color: 'text-accent' },
                { title: 'Evals-мышление', desc: '3–5 эталонных кейсов до масштабирования', color: 'text-cyan-400' },
                { title: 'Ментальные модели', desc: 'Токены, контекст, reasoning', color: 'text-amber-400' },
                { title: 'Этика и раскрытие', desc: 'Честность о AI, аккуратность с данными', color: 'text-emerald-400' },
              ].map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                  <div className={`text-sm font-semibold ${p.color} mb-1`}>{p.title}</div>
                  <p className="text-xs text-zinc-500">{p.desc}</p>
                </div>
              ))}
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}

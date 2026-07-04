"use client";

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusLabel, getStatusColor } from '@/lib/utils';
import { Lock, CheckCircle2, Circle, Clock, ArrowRight, Map } from 'lucide-react';

export default function RoadmapPage() {
  const { modules, lessons, getFirstIncompleteLesson } = useStore();

  const getModuleLessons = (moduleId: string) => {
    return lessons.filter(l => l.module_id === moduleId);
  };

  const isModuleLocked = (orderIndex: number) => {
    if (orderIndex <= 2) return false;
    const prevModule = modules.find(m => m.order_index === orderIndex - 1);
    return prevModule && prevModule.status !== 'completed';
  };

  const getModuleContinueLesson = (moduleId: string) => {
    return getFirstIncompleteLesson(moduleId);
  };

  const completedAny = lessons.some(l => l.status === 'completed');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <Map className="h-7 w-7 text-accent" />
          Course Roadmap
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          12 модулей от базы до масштабирования. Каждый модуль = артефакты + доказательства.
        </p>
      </div>

      {!completedAny && (
        <Card className="border-accent/30 bg-accent-subtle/20">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-accent-subtle shrink-0"><Map className="h-5 w-5 text-accent" /></div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Как проходить курс</h3>
              <div className="text-sm text-zinc-400 space-y-1">
                <p>1. Выбери модуль с пометкой <Badge className="bg-accent text-accent-on text-xs mx-1">Сейчас</Badge></p>
                <p>2. Нажми «Начать модуль» и проходи уроки по порядку</p>
                <p>3. Каждый урок → теория → практика → артефакт → Evidence Card</p>
                <p>4. Заполни чек-лист и закрой урок. Модули открываются последовательно.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const moduleLessons = getModuleLessons(module.id);
          const locked = isModuleLocked(module.order_index);
          const completedCount = moduleLessons.filter(l => l.status === 'completed').length;
          const continueLesson = getModuleContinueLesson(module.id);

          const isActive = module.status === 'in_progress' || (module.status === 'not_started' && !modules.find(m => m.order_index < module.order_index && m.status !== 'completed'));
          return (
            <Card
              key={module.id}
              className={`relative transition-all hover:shadow-lg hover:shadow-accent/5 ${locked ? 'opacity-50' : ''} ${isActive ? 'ring-1 ring-accent/40' : ''}`}
            >
              {locked && (
                <div className="absolute top-4 right-4">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
              )}
              {isActive && (
                <div className="absolute -top-2.5 left-4">
                  <Badge className="bg-accent text-accent-on text-xs">Сейчас</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    Модуль {module.order_index}
                  </Badge>
                  <Badge className={getStatusColor(module.status)}>
                    {getStatusLabel(module.status)}
                  </Badge>
                </div>
                <CardTitle className="text-base leading-tight">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400 line-clamp-2">{module.description}</p>

                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span>Прогресс</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{completedCount}/{moduleLessons.length} уроков</span>
                  <span>{module.artifact_count} артефактов</span>
                  <span>{module.evidence_count} evidence</span>
                </div>

                {/* Lessons list */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {moduleLessons.map((lesson) => (
                    <Link key={lesson.id} href={locked ? '#' : `/lesson/${lesson.id}`}>
                      <div className={`flex items-center gap-2 text-xs py-0.5 ${locked ? '' : 'hover:bg-zinc-800/50 rounded px-1 cursor-pointer'}`}>
                        {lesson.status === 'completed' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : lesson.status === 'in_progress' ? (
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                        )}
                        <span className={lesson.status === 'completed' ? 'text-zinc-500 line-through' : lesson.status === 'in_progress' ? 'text-zinc-200 font-medium' : ''}>
                          {lesson.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {!locked && (
                  <Link href={continueLesson ? `/lesson/${continueLesson.id}` : '#'}>
                    <Button variant="ghost" className="w-full mt-2" size="sm">
                      {module.status === 'not_started' ? 'Начать модуль' : module.status === 'completed' ? 'Повторить' : 'Продолжить'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 italic">
          &ldquo;Урок нельзя закрыть без доказательства. Мозг возмущён, система довольна.&rdquo;
        </p>
      </div>
    </div>
  );
}

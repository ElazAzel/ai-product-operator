"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { getDirectionLabel, getDirectionColor, formatDate, exportToMarkdown } from '@/lib/utils';
import { Direction } from '@/lib/types';
import { Calendar, Plus, Clock, CheckCircle2, FileText } from 'lucide-react';

export default function WeeklyPlanPage() {
  const { weeklyPlans, addWeeklyPlan, skills, addEvidenceCard } = useStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({
    week_start: new Date().toISOString().split('T')[0],
    focus: '',
    skill: '',
    artifact_goal: '',
    tasks: ['', '', ''],
    material: '',
    experiment: '',
    metric: '',
    application_area: [] as Direction[],
    planned_hours: 15,
    actual_hours: 0,
    weekly_reflection: '',
  });

  const sortedPlans = [...weeklyPlans].sort((a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime());

  const handleCreate = () => {
    addWeeklyPlan({
      ...form,
      user_id: 'user-1',
    });
    setShowCreateDialog(false);
    setForm({
      week_start: new Date().toISOString().split('T')[0],
      focus: '', skill: '', artifact_goal: '', tasks: ['', '', ''],
      material: '', experiment: '', metric: '', application_area: [],
      planned_hours: 15, actual_hours: 0, weekly_reflection: '',
    });
  };

  const toggleDirection = (dir: Direction) => {
    setForm(f => ({
      ...f,
      application_area: f.application_area.includes(dir)
        ? f.application_area.filter(d => d !== dir)
        : [...f.application_area, dir],
    }));
  };

  const handleExport = (plan: typeof weeklyPlans[0]) => {
    const md = `# Weekly Plan: ${plan.week_start}

## Фокус недели
**Навык:** ${plan.skill}
**Артефакт:** ${plan.artifact_goal}

## Задачи
${plan.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Материал
${plan.material}

## Эксперимент
${plan.experiment}

## Метрика
${plan.metric}

## Применение
${plan.application_area.map(d => `- ${getDirectionLabel(d)}`).join('\n')}

## Часы: ${plan.actual_hours} / ${plan.planned_hours}

## Вывод
${plan.weekly_reflection}`;
    exportToMarkdown(md, `weekly-plan-${plan.week_start}`);
  };

  const createEvidenceFromWeek = (plan: typeof weeklyPlans[0]) => {
    addEvidenceCard({
      user_id: 'user-1',
      lesson_id: null,
      module_id: null,
      date: new Date().toISOString().split('T')[0],
      direction: plan.application_area?.[0] || 'ai-services',
      what_done: `Недельный план: ${plan.focus}. Артефакт: ${plan.artifact_goal}`,
      artifact: plan.artifact_goal,
      artifact_url: '',
      where_applied: plan.application_area.map(d => getDirectionLabel(d)).join(', '),
      metric: plan.metric,
      what_proven: plan.weekly_reflection,
      what_not_proven: '',
      next_improvement: '',
      case_potential: 'later',
      status: 'draft',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
            <Calendar className="h-7 w-7 text-accent" />
            Weekly Plan
          </h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Формула: навык → артефакт → применение → доказательство → деньги
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Создать план
        </Button>
      </div>

      {sortedPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет недельных планов</h3>
            <p className="text-zinc-500 mb-4">Создай план на ближайшую неделю</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Создать план
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPlans.map((plan) => {
            const hoursPercent = plan.planned_hours > 0 ? (plan.actual_hours / plan.planned_hours) * 100 : 0;
            return (
              <Card key={plan.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline">{plan.week_start}</Badge>
                        <span className="text-sm text-zinc-400">Фокус: {plan.focus}</span>
                      </div>
                      <h3 className="font-semibold text-lg">{plan.artifact_goal}</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => handleExport(plan)}>
                        <FileText className="h-4 w-4 mr-1" /> Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => createEvidenceFromWeek(plan)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Evidence Card
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-zinc-500">Навык</Label>
                      <p className="text-sm">{plan.skill}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-500">Метрика</Label>
                      <p className="text-sm">{plan.metric}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-500">Материал</Label>
                      <p className="text-sm">{plan.material}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-500">Эксперимент</Label>
                      <p className="text-sm">{plan.experiment}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-xs text-zinc-500">Задачи</Label>
                    <div className="mt-1 space-y-1">
                      {plan.tasks.filter(t => t).map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-zinc-600" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                        <span><Clock className="h-3 w-3 inline mr-1" />{plan.actual_hours}ч / {plan.planned_hours}ч</span>
                        <span>{Math.round(hoursPercent)}%</span>
                      </div>
                      <Progress value={hoursPercent} />
                    </div>
                    <div className="flex gap-1">
                      {plan.application_area.map(d => (
                        <Badge key={d} className={`${getDirectionColor(d)} text-xs`}>
                          {getDirectionLabel(d)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {plan.weekly_reflection && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <Label className="text-xs text-zinc-500">Вывод недели</Label>
                      <p className="text-sm mt-1 text-zinc-300">{plan.weekly_reflection}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый недельный план</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Дата начала недели</Label>
                <Input type="date" value={form.week_start} onChange={e => setForm(f => ({ ...f, week_start: e.target.value }))} />
              </div>
              <div>
                <Label>Часы (план / факт)</Label>
                <div className="flex gap-2">
                  <Input type="number" value={form.planned_hours} onChange={e => setForm(f => ({ ...f, planned_hours: +e.target.value }))} className="w-20" />
                  <Input type="number" value={form.actual_hours} onChange={e => setForm(f => ({ ...f, actual_hours: +e.target.value }))} className="w-20" />
                </div>
              </div>
            </div>
            <div>
              <Label>Главный фокус</Label>
              <Input value={form.focus} onChange={e => setForm(f => ({ ...f, focus: e.target.value }))} placeholder="Одно предложение" />
            </div>
            <div>
              <Label>Целевой навык</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {skills.map(s => (
                  <Button
                    key={s.id}
                    variant={form.skill === s.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm(f => ({ ...f, skill: s.name }))}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Главный артефакт</Label>
              <Input value={form.artifact_goal} onChange={e => setForm(f => ({ ...f, artifact_goal: e.target.value }))} placeholder="Что создать за неделю" />
            </div>
            <div>
              <Label>3 подзадачи</Label>
              {form.tasks.map((task, i) => (
                <Input key={i} value={task} onChange={e => {
                  const newTasks = [...form.tasks];
                  newTasks[i] = e.target.value;
                  setForm(f => ({ ...f, tasks: newTasks }));
                }} placeholder={`Задача ${i + 1}`} className="mt-2" />
              ))}
            </div>
            <div>
              <Label>Материал для изучения</Label>
              <Textarea value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
            </div>
            <div>
              <Label>Эксперимент</Label>
              <Input value={form.experiment} onChange={e => setForm(f => ({ ...f, experiment: e.target.value }))} />
            </div>
            <div>
              <Label>Метрика</Label>
              <Input value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} placeholder="Как измерить результат" />
            </div>
            <div>
              <Label>Применение</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {(['ai-services', 'ai-products', 'ai-teaching'] as const).map(d => (
                  <Button
                    key={d}
                    variant={form.application_area.includes(d) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDirection(d)}
                  >
                    {getDirectionLabel(d)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Вывод недели</Label>
              <Textarea value={form.weekly_reflection} onChange={e => setForm(f => ({ ...f, weekly_reflection: e.target.value }))} placeholder="Что получилось, что нет" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Отмена</Button>
            <Button onClick={handleCreate}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

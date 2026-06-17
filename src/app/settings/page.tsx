"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getDirectionLabel, getDirectionColor, exportToCSV, exportToJSON } from '@/lib/utils';
import { Direction } from '@/lib/types';
import {
  Settings as SettingsIcon, User, Target, Clock, Palette,
  Download, Trash2, AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser, evidenceCards, artifacts, weeklyPlans, reviews, resetData } = useStore();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [incomeGoal, setIncomeGoal] = useState(user.income_goal);
  const [weeklyHours, setWeeklyHours] = useState(user.weekly_hours_goal);
  const [directions, setDirections] = useState<Direction[]>(user.active_directions);

  const handleSave = () => {
    updateUser({
      name,
      email,
      income_goal: incomeGoal,
      weekly_hours_goal: weeklyHours,
      active_directions: directions,
    });
  };

  const toggleDirection = (dir: Direction) => {
    setDirections(d =>
      d.includes(dir) ? d.filter(x => x !== dir) : [...d, dir]
    );
  };

  const handleExportAll = () => {
    exportToCSV(evidenceCards.map(c => ({
      дата: c.date,
      направление: c.direction,
      что_сделано: c.what_done,
      артефакт: c.artifact,
      метрика: c.metric,
    })), 'evidence-cards-export');

    exportToCSV(artifacts.map(a => ({
      название: a.title,
      тип: a.type,
      направление: a.direction,
      статус: a.status,
    })), 'artifacts-export');
  };

  const handleExportJSON = () => {
    exportToJSON({
      user,
      evidenceCards,
      artifacts,
      weeklyPlans,
      reviews,
    }, 'ai-product-operator-full-export');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <SettingsIcon className="h-7 w-7 text-violet-500" />
          Settings
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          Настройки профиля и параметры обучения.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-violet-500" />
            Профиль
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Имя</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-500" />
            Цели
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Цель дохода (₸/мес)</Label>
            <Input type="number" value={incomeGoal} onChange={e => setIncomeGoal(+e.target.value)} />
          </div>
          <div>
            <Label>Недельная нагрузка (часов)</Label>
            <Input type="number" value={weeklyHours} onChange={e => setWeeklyHours(+e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Directions */}
      <Card>
        <CardHeader>
          <CardTitle>Активные направления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            {(['ai-services', 'linkmax', 'academy'] as const).map(dir => (
              <Button
                key={dir}
                variant={directions.includes(dir) ? 'default' : 'outline'}
                onClick={() => toggleDirection(dir)}
              >
                <Badge className={`${getDirectionColor(dir)} mr-2`}>{getDirectionLabel(dir)}</Badge>
                {directions.includes(dir) ? 'Включено' : 'Выключено'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-violet-500" />
            Экспорт данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-400">Экспортируй свои данные для анализа или резервного копирования.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-2" /> Экспорт CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" /> Экспорт JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Сохранить настройки
      </Button>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Опасная зона
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-4">
            Сбросить все данные и начать заново. Это действие необратимо.
          </p>
          <Button variant="destructive" onClick={() => { if (confirm('Ты уверен? Все данные будут удалены.')) resetData(); }}>
            <Trash2 className="h-4 w-4 mr-2" /> Сбросить данные
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { getDirectionLabel, getDirectionColor } from '@/lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, Target, TrendingUp, AlertTriangle, ArrowRight, Save } from 'lucide-react';

export default function SkillScorecardPage() {
  const { skills, updateSkill } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ score: 0, confidence: 0, last_artifact: '', main_gap: '', next_step: '' });

  const chartData = skills.map(s => ({
    name: s.name,
    baseline: 1,
    current: s.score,
  }));

  const avgScore = skills.length > 0 ? Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length * 10) / 10 : 0;
  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 3);
  const gaps = skills.filter(s => s.score <= 2);

  const handleEdit = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      setEditingId(skillId);
      setEditForm({
        score: skill.score,
        confidence: skill.confidence,
        last_artifact: skill.last_artifact,
        main_gap: skill.main_gap,
        next_step: skill.next_step,
      });
    }
  };

  const handleSave = () => {
    if (editingId) {
      updateSkill(editingId, editForm);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <BarChart3 className="h-7 w-7 text-violet-500" />
          Skill Scorecard
        </h1>
        <p className="text-zinc-400 mt-1">
          Диагностика навыков. Оцени честно — потом артефакты покажут правду.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Target className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgScore}</div>
                <div className="text-xs text-zinc-500">Средний балл</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{topSkills.length}</div>
                <div className="text-xs text-zinc-500">Сильных навыка</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{gaps.length}</div>
                <div className="text-xs text-zinc-500">Главных пробела</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Карта навыков</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#71717a', fontSize: 10 }} />
                <Radar name="Текущий уровень" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="Baseline" dataKey="baseline" stroke="#3f3f46" fill="#3f3f46" fillOpacity={0.1} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <div className="space-y-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <Badge className={`${getDirectionColor(skill.direction)} text-xs mt-1`}>
                      {getDirectionLabel(skill.direction)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{skill.score}</div>
                    <div className="text-xs text-zinc-500">из 5</div>
                  </div>
                  {editingId !== skill.id && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(skill.id)}>
                      Оценить
                    </Button>
                  )}
                </div>
              </div>

              <Progress value={(skill.score / 5) * 100} className="mb-3" />

              {editingId === skill.id ? (
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Оценка (1-5)</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <Button
                            key={v}
                            variant={editForm.score === v ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditForm(f => ({ ...f, score: v }))}
                          >
                            {v}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Уверенность (1-5)</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <Button
                            key={v}
                            variant={editForm.confidence === v ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditForm(f => ({ ...f, confidence: v }))}
                          >
                            {v}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Последний артефакт</Label>
                    <Input value={editForm.last_artifact} onChange={e => setEditForm(f => ({ ...f, last_artifact: e.target.value }))} placeholder="Что создал в этом навыке" />
                  </div>
                  <div>
                    <Label>Главный пробел</Label>
                    <Input value={editForm.main_gap} onChange={e => setEditForm(f => ({ ...f, main_gap: e.target.value }))} placeholder="Чего не хватает" />
                  </div>
                  <div>
                    <Label>Следующий шаг</Label>
                    <Input value={editForm.next_step} onChange={e => setEditForm(f => ({ ...f, next_step: e.target.value }))} placeholder="Что сделать дальше" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" /> Сохранить
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>Отмена</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800 text-sm md:grid-cols-4">
                  <div>
                    <span className="text-zinc-500 text-xs">Уверенность</span>
                    <p className="mt-1 font-medium">{skill.confidence}/5</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Последний артефакт</span>
                    <p className="mt-1">{skill.last_artifact || '—'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Главный пробел</span>
                    <p className="mt-1">{skill.main_gap}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Следующий шаг</span>
                    <p className="mt-1">{skill.next_step}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 italic">
          &ldquo;Если навык не подтверждён артефактом — это не навык, а мнение.&rdquo;
        </p>
      </div>
    </div>
  );
}

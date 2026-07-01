"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  getDirectionLabel, getDirectionColor, getStatusLabel, getStatusColor,
  formatDate, exportToCSV, exportToJSON
} from '@/lib/utils';
import { ArtifactType, Direction, ArtifactStatus } from '@/lib/types';
import { Package, Plus, Search, Download, ExternalLink, Trash2 } from 'lucide-react';

export default function ArtifactsPage() {
  const { artifacts, addArtifact, deleteArtifact } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ArtifactType | 'all'>('all');
  const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'prompt' as ArtifactType,
    direction: 'ai-services' as Direction,
    description: '',
    url: '',
    metric: '',
    lesson_id: null as string | null,
  });

  const filtered = artifacts.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterDirection !== 'all' && a.direction !== filterDirection) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = () => {
    addArtifact({ ...form, user_id: 'user-1', status: 'draft' });
    setShowCreateDialog(false);
    setForm({ title: '', type: 'prompt', direction: 'ai-services', description: '', url: '', metric: '', lesson_id: null });
  };

  const handleExportCSV = () => {
    exportToCSV(filtered.map(a => ({
      название: a.title,
      тип: a.type,
      направление: getDirectionLabel(a.direction),
      описание: a.description,
      метрика: a.metric,
      статус: getStatusLabel(a.status),
      дата: formatDate(a.created_at),
    })), 'artifacts');
  };

  const artifactTypes: ArtifactType[] = ['prompt', 'workflow', 'offer', 'case', 'demo', 'report', 'automation', 'lesson', 'checklist', 'api-spec', 'rag-demo', 'agent-blueprint'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
            <Package className="h-7 w-7 text-accent" />
            Artifacts
          </h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Все созданные артефакты. Каждый — доказательство навыка.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Добавить
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'ai-services', 'ai-products', 'ai-teaching'] as const).map(d => (
            <Button key={d} variant={filterDirection === d ? 'default' : 'outline'} size="sm"
              onClick={() => setFilterDirection(d)}>
              {d === 'all' ? 'Все' : getDirectionLabel(d)}
            </Button>
          ))}
        </div>
      </div>

      {/* Artifacts Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет артефактов</h3>
            <p className="text-zinc-500 mb-4">Добавь первый артефакт после прохождения урока</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Добавить артефакт
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((artifact) => (
            <Card key={artifact.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getDirectionColor(artifact.direction)}>
                    {getDirectionLabel(artifact.direction)}
                  </Badge>
                  <Badge className={getStatusColor(artifact.status)}>
                    {getStatusLabel(artifact.status)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{artifact.title}</h3>
                <Badge variant="outline" className="text-xs mb-2">{artifact.type}</Badge>
                {artifact.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{artifact.description}</p>
                )}
                {artifact.metric && (
                  <p className="text-xs text-zinc-500 mb-2">Метрика: {artifact.metric}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">{formatDate(artifact.created_at)}</span>
                  <div className="flex gap-1">
                    {artifact.url && (
                      <a href={artifact.url} target="_blank" rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-800">
                        <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
                      </a>
                    )}
                    <button onClick={() => deleteArtifact(artifact.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-800">
                      <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый артефакт</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Тип</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {artifactTypes.map(t => (
                  <Button key={t} variant={form.type === t ? 'default' : 'outline'} size="sm"
                    onClick={() => setForm(f => ({ ...f, type: t }))}>
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Направление</Label>
              <div className="flex gap-2 mt-1">
                {(['ai-services', 'ai-products', 'ai-teaching'] as const).map(d => (
                  <Button key={d} variant={form.direction === d ? 'default' : 'outline'} size="sm"
                    onClick={() => setForm(f => ({ ...f, direction: d }))}>
                    {getDirectionLabel(d)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Ссылка</Label>
                <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <Label>Метрика</Label>
                <Input value={form.metric} onChange={e => setForm(f => ({ ...f, metric: e.target.value }))} />
              </div>
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

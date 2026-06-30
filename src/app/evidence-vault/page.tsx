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
import { Direction, EvidenceStatus, CasePotential } from '@/lib/types';
import {
  Database, Plus, Search, Download, Trash2, ExternalLink, Pencil, CheckCircle2
} from 'lucide-react';

export default function EvidenceVaultPage() {
  const { evidenceCards, modules, lessons, addEvidenceCard, updateEvidenceCard, deleteEvidenceCard } = useStore();
  const [search, setSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState<Direction | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EvidenceStatus | 'all'>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const emptyForm = {
    lesson_id: '', module_id: '', direction: 'ai-services' as Direction,
    what_done: '', artifact: '', artifact_url: '', where_applied: '',
    metric: '', what_proven: '', what_not_proven: '', next_improvement: '',
    case_potential: 'later' as CasePotential,
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const filtered = evidenceCards.filter(card => {
    if (filterDirection !== 'all' && card.direction !== filterDirection) return false;
    if (filterStatus !== 'all' && card.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return card.what_done.toLowerCase().includes(q) || card.artifact.toLowerCase().includes(q) || card.metric.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: evidenceCards.length,
    aiServices: evidenceCards.filter(c => c.direction === 'ai-services').length,
    linkmax: evidenceCards.filter(c => c.direction === 'linkmax').length,
    academy: evidenceCards.filter(c => c.direction === 'academy').length,
    caseReady: evidenceCards.filter(c => c.status === 'case-ready').length,
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowDialog(true);
  };

  const openEdit = (cardId: string) => {
    const card = evidenceCards.find(c => c.id === cardId);
    if (!card) return;
    setEditingId(cardId);
    setForm({
      lesson_id: card.lesson_id || '',
      module_id: card.module_id || '',
      direction: card.direction,
      what_done: card.what_done,
      artifact: card.artifact,
      artifact_url: card.artifact_url,
      where_applied: card.where_applied,
      metric: card.metric,
      what_proven: card.what_proven,
      what_not_proven: card.what_not_proven,
      next_improvement: card.next_improvement,
      case_potential: card.case_potential,
    });
    setFormErrors({});
    setShowDialog(true);
  };

  const handleSave = () => {
    const errors: Record<string, boolean> = {};
    if (!form.what_done.trim()) errors.what_done = true;
    if (!form.metric.trim()) errors.metric = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (editingId) {
      updateEvidenceCard(editingId, {
        direction: form.direction,
        what_done: form.what_done,
        artifact: form.artifact,
        artifact_url: form.artifact_url,
        where_applied: form.where_applied,
        metric: form.metric,
        what_proven: form.what_proven,
        what_not_proven: form.what_not_proven,
        next_improvement: form.next_improvement,
        case_potential: form.case_potential,
      });
    } else {
      addEvidenceCard({
        user_id: 'user-1',
        lesson_id: form.lesson_id || null,
        module_id: form.module_id || null,
        date: new Date().toISOString().split('T')[0],
        direction: form.direction,
        what_done: form.what_done,
        artifact: form.artifact,
        artifact_url: form.artifact_url,
        where_applied: form.where_applied,
        metric: form.metric,
        what_proven: form.what_proven,
        what_not_proven: form.what_not_proven,
        next_improvement: form.next_improvement,
        case_potential: form.case_potential,
        status: 'draft',
      });
    }
    setShowDialog(false);
  };

  const handleExportCSV = () => {
    exportToCSV(filtered.map(c => ({
      дата: c.date,
      направление: getDirectionLabel(c.direction),
      что_сделано: c.what_done,
      артефакт: c.artifact,
      метрика: c.metric,
      статус: getStatusLabel(c.status),
    })), 'evidence-vault');
  };

  const handleExportJSON = () => {
    exportToJSON(filtered, 'evidence-vault');
  };

  const detailCard = evidenceCards.find(c => c.id === selectedCard);
  const detailLesson = detailCard?.lesson_id ? lessons.find(l => l.id === detailCard.lesson_id) : null;
  const detailModule = detailCard?.module_id ? modules.find(m => m.id === detailCard.module_id) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
            <Database className="h-7 w-7 text-accent" />
            Evidence Vault
          </h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Место, где продуктивность перестаёт притворяться.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Создать
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-zinc-500">Всего</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.aiServices}</div>
          <div className="text-xs text-zinc-500">AI-услуги</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.linkmax}</div>
          <div className="text-xs text-zinc-500">LinkMAX</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.academy}</div>
          <div className="text-xs text-zinc-500">Academy</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.caseReady}</div>
          <div className="text-xs text-zinc-500">Готово к кейсу</div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'ai-services', 'linkmax', 'academy'] as const).map(d => (
            <Button key={d} variant={filterDirection === d ? 'default' : 'outline'} size="sm"
              onClick={() => setFilterDirection(d)}>
              {d === 'all' ? 'Все' : getDirectionLabel(d)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'draft', 'validated', 'case-ready'] as const).map(s => (
            <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm"
              onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'Все статусы' : getStatusLabel(s)}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {evidenceCards.length === 0 ? 'Vault пуст' : 'Нет результатов'}
            </h3>
            <p className="text-zinc-500 mb-4">
              {evidenceCards.length === 0
                ? 'Создай первую Evidence Card после прохождения урока. Каждая карточка — доказательство навыка.'
                : 'Попробуй изменить фильтры'}
            </p>
            {evidenceCards.length === 0 && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Создать Evidence Card
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((card) => (
            <Card key={card.id} className="cursor-pointer hover:shadow-lg hover:shadow-accent/5 transition-all group"
              onClick={() => setSelectedCard(card.id)}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getDirectionColor(card.direction)}>
                    {getDirectionLabel(card.direction)}
                  </Badge>
                  <Badge className={getStatusColor(card.status)}>
                    {getStatusLabel(card.status)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{card.what_done || 'Без описания'}</h3>
                <p className="text-xs text-zinc-500 mb-3">{formatDate(card.date)}</p>
                {card.artifact && (
                  <p className="text-xs text-zinc-400 mb-1">
                    <span className="text-zinc-500">Артефакт:</span> {card.artifact}
                  </p>
                )}
                {card.metric && (
                  <p className="text-xs text-zinc-400 mb-2">
                    <span className="text-zinc-500">Метрика:</span> {card.metric}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {card.case_potential === 'yes' && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Кейс
                    </Badge>
                  )}
                  <div className="ml-auto flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(card.id); }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-800">
                      <Pencil className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
                    </button>
                    {card.artifact_url && (
                      <a href={card.artifact_url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-800">
                        <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Редактировать Evidence Card' : 'Новая Evidence Card'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Направление</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(['ai-services', 'linkmax', 'academy', 'skill'] as const).map(d => (
                    <Button key={d} variant={form.direction === d ? 'default' : 'outline'} size="sm"
                      onClick={() => setForm(f => ({ ...f, direction: d }))}>
                      {getDirectionLabel(d)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Связанный модуль</Label>
                <select value={form.module_id} onChange={e => setForm(f => ({ ...f, module_id: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
                  <option value="">Не выбран</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>Модуль {m.order_index}: {m.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Что сделано <span className="text-red-400">*</span></Label>
              <Textarea value={form.what_done}
                onChange={e => { setForm(f => ({ ...f, what_done: e.target.value })); setFormErrors(e2 => ({ ...e2, what_done: false })); }}
                placeholder="Опиши результат..."
                className={formErrors.what_done ? 'border-red-500' : ''} />
              {formErrors.what_done && <p className="text-xs text-red-400 mt-1">Обязательное поле</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Артефакт</Label>
                <Input value={form.artifact} onChange={e => setForm(f => ({ ...f, artifact: e.target.value }))} placeholder="Название" />
              </div>
              <div>
                <Label>Ссылка</Label>
                <Input value={form.artifact_url} onChange={e => setForm(f => ({ ...f, artifact_url: e.target.value }))} placeholder="URL" />
              </div>
            </div>
            <div>
              <Label>Где применено</Label>
              <Input value={form.where_applied} onChange={e => setForm(f => ({ ...f, where_applied: e.target.value }))} placeholder="Описание применения" />
            </div>
            <div>
              <Label>Метрика <span className="text-red-400">*</span></Label>
              <Input value={form.metric}
                onChange={e => { setForm(f => ({ ...f, metric: e.target.value })); setFormErrors(e2 => ({ ...e2, metric: false })); }}
                placeholder="Измеримый результат"
                className={formErrors.metric ? 'border-red-500' : ''} />
              {formErrors.metric && <p className="text-xs text-red-400 mt-1">Обязательное поле</p>}
            </div>
            <div>
              <Label>Что доказано</Label>
              <Textarea value={form.what_proven} onChange={e => setForm(f => ({ ...f, what_proven: e.target.value }))} />
            </div>
            <div>
              <Label>Что НЕ доказано</Label>
              <Textarea value={form.what_not_proven} onChange={e => setForm(f => ({ ...f, what_not_proven: e.target.value }))} />
            </div>
            <div>
              <Label>Следующее улучшение</Label>
              <Input value={form.next_improvement} onChange={e => setForm(f => ({ ...f, next_improvement: e.target.value }))} />
            </div>
            <div>
              <Label>Использовать как кейс?</Label>
              <div className="flex gap-2 mt-1">
                {([['yes', 'Да'], ['no', 'Нет'], ['later', 'Позже']] as const).map(([v, label]) => (
                  <Button key={v} variant={form.case_potential === v ? 'default' : 'outline'} size="sm"
                    onClick={() => setForm(f => ({ ...f, case_potential: v }))}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Отмена</Button>
            <Button onClick={handleSave}>{editingId ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailCard && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={getDirectionColor(detailCard.direction)}>
                    {getDirectionLabel(detailCard.direction)}
                  </Badge>
                  <Badge className={getStatusColor(detailCard.status)}>
                    {getStatusLabel(detailCard.status)}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-zinc-500">Дата</Label>
                    <p className="text-sm">{formatDate(detailCard.date)}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500">Связанный урок</Label>
                    <p className="text-sm">{detailLesson?.title || '—'}</p>
                  </div>
                </div>
                {detailModule && (
                  <div>
                    <Label className="text-zinc-500">Модуль</Label>
                    <p className="text-sm">Модуль {detailModule.order_index}: {detailModule.title}</p>
                  </div>
                )}
                <div>
                  <Label className="text-zinc-500">Что сделано</Label>
                  <p className="text-sm">{detailCard.what_done}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-zinc-500">Артефакт</Label>
                    <p className="text-sm">{detailCard.artifact || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500">Метрика</Label>
                    <p className="text-sm">{detailCard.metric || '—'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-500">Где применено</Label>
                  <p className="text-sm">{detailCard.where_applied || '—'}</p>
                </div>
                <div>
                  <Label className="text-zinc-500">Что доказано</Label>
                  <p className="text-sm">{detailCard.what_proven || '—'}</p>
                </div>
                <div>
                  <Label className="text-zinc-500">Что НЕ доказано</Label>
                  <p className="text-sm">{detailCard.what_not_proven || '—'}</p>
                </div>
                <div>
                  <Label className="text-zinc-500">Следующее улучшение</Label>
                  <p className="text-sm">{detailCard.next_improvement || '—'}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => { openEdit(detailCard.id); setSelectedCard(null); }}>
                  <Pencil className="h-4 w-4 mr-1" /> Редактировать
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { deleteEvidenceCard(detailCard.id); setSelectedCard(null); }}>
                  <Trash2 className="h-4 w-4 mr-1" /> Удалить
                </Button>
                <Button variant="outline" onClick={() => setSelectedCard(null)}>Закрыть</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { ClipboardList, Plus, Calendar } from 'lucide-react';

export default function ReviewsPage() {
  const { reviews, addReview } = useStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({
    period_start: '',
    period_end: '',
    artifacts_created: '',
    metrics_achieved: '',
    money_result: '',
    what_worked: '',
    what_failed: '',
    what_to_remove: '',
    what_to_improve: '',
    next_focus: '',
  });

  const sortedReviews = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleCreate = () => {
    addReview({ ...form, user_id: 'user-1' });
    setShowCreateDialog(false);
    setForm({
      period_start: '', period_end: '', artifacts_created: '', metrics_achieved: '',
      money_result: '', what_worked: '', what_failed: '', what_to_remove: '',
      what_to_improve: '', next_focus: '',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
            <ClipboardList className="h-7 w-7 text-accent" />
            Reviews
          </h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">
            Каждые 4 недели — честный разбор. Что работает, что нет, что убрать.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Новый Review
        </Button>
      </div>

      {sortedReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет ревью</h3>
            <p className="text-zinc-500 mb-4">Создай первое ревью через 4 недели обучения</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Создать ревью
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted" />
                  <div>
                    <div className="font-semibold">{review.period_start} — {review.period_end}</div>
                    <div className="text-xs text-zinc-500">{formatDate(review.created_at)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-zinc-500">Артефакты созданы</Label>
                    <p className="text-sm mt-1">{review.artifacts_created}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Метрики достигнуты</Label>
                    <p className="text-sm mt-1">{review.metrics_achieved}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Результат по деньгам</Label>
                    <p className="text-sm mt-1 text-emerald-400">{review.money_result || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Что сработало</Label>
                    <p className="text-sm mt-1">{review.what_worked}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Что не сработало</Label>
                    <p className="text-sm mt-1">{review.what_failed}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Что убрать</Label>
                    <p className="text-sm mt-1">{review.what_to_remove}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Что усилить</Label>
                    <p className="text-sm mt-1">{review.what_to_improve}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500">Следующий фокус</Label>
                    <p className="text-sm mt-1 font-medium">{review.next_focus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Период с</Label>
                <Input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
              </div>
              <div>
                <Label>Период по</Label>
                <Input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Какие артефакты созданы</Label>
              <Textarea value={form.artifacts_created} onChange={e => setForm(f => ({ ...f, artifacts_created: e.target.value }))} />
            </div>
            <div>
              <Label>Какие метрики достигнуты</Label>
              <Textarea value={form.metrics_achieved} onChange={e => setForm(f => ({ ...f, metrics_achieved: e.target.value }))} />
            </div>
            <div>
              <Label>Что принесло деньги</Label>
              <Textarea value={form.money_result} onChange={e => setForm(f => ({ ...f, money_result: e.target.value }))} />
            </div>
            <div>
              <Label>Что сработало</Label>
              <Textarea value={form.what_worked} onChange={e => setForm(f => ({ ...f, what_worked: e.target.value }))} />
            </div>
            <div>
              <Label>Что не сработало</Label>
              <Textarea value={form.what_failed} onChange={e => setForm(f => ({ ...f, what_failed: e.target.value }))} />
            </div>
            <div>
              <Label>Что убрать</Label>
              <Textarea value={form.what_to_remove} onChange={e => setForm(f => ({ ...f, what_to_remove: e.target.value }))} />
            </div>
            <div>
              <Label>Что усилить</Label>
              <Textarea value={form.what_to_improve} onChange={e => setForm(f => ({ ...f, what_to_improve: e.target.value }))} />
            </div>
            <div>
              <Label>Следующий месячный фокус</Label>
              <Input value={form.next_focus} onChange={e => setForm(f => ({ ...f, next_focus: e.target.value }))} />
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

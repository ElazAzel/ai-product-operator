"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { getDirectionLabel, getDirectionColor, getStatusLabel, getStatusColor } from '@/lib/utils';
import { ArtifactType, CompletionChecklist } from '@/lib/types';
import {
  BookOpen, Target, Lightbulb, Wrench, Package, ClipboardCheck,
  BarChart3, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, Lock, Plus, FileText, Star, X, Circle, Sparkles, Clock,
  ExternalLink, FileCode, DollarSign
} from 'lucide-react';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    lessons, modules, evidenceCards, user,
    completeLesson, startLesson, addEvidenceCard, addArtifact,
    setCurrentLesson, canCompleteLesson,
    getLessonChecklist, setLessonChecklist,
    getEvidenceForLesson, approveEvidence, requestEvidenceRevision,
  } = useStore();

  const lesson = lessons.find(l => l.id === id);
  const module = lesson ? modules.find(m => m.id === lesson.module_id) : null;

  const [showEvalPrompt, setShowEvalPrompt] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showArtifactDialog, setShowArtifactDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [evidenceForm, setEvidenceForm] = useState({
    what_done: '', artifact: '', artifact_url: '', where_applied: '',
    metric: '', what_proven: '', what_not_proven: '', next_improvement: '',
    reflection: '', money_impact: '', money_amount: 0,
    case_potential: 'later' as 'yes' | 'no' | 'later',
  });

  const [artifactForm, setArtifactForm] = useState({
    title: '', type: 'prompt' as ArtifactType, description: '', url: '', metric: '',
  });

  const [evidenceErrors, setEvidenceErrors] = useState<Record<string, boolean>>({});
  const [artifactErrors, setArtifactErrors] = useState<Record<string, boolean>>({});

  const checklist = lesson ? getLessonChecklist(lesson.id) : {
    criteria_1: false, criteria_2: false, criteria_3: false,
    artifact_added: false, evidence_card_filled: false,
  };

  useEffect(() => {
    if (lesson) {
      setCurrentLesson(lesson.id);
      startLesson(lesson.id);
    }
    return () => setCurrentLesson(null);
  }, [lesson?.id]);

  if (!lesson || !module) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Урок не найден</h2>
        <p className="text-zinc-400 mb-4">Проверь ссылку или вернись к Roadmap</p>
        <Link href="/roadmap"><Button>Вернуться к Roadmap</Button></Link>
      </div>
    );
  }

  const isLocked = module.order_index > 2 && modules.find(m => m.order_index === module.order_index - 1)?.status !== 'completed';

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Модуль заблокирован</h2>
        <p className="text-zinc-400 mb-4">Заверши предыдущий модуль, чтобы разблокировать</p>
        <Link href="/roadmap"><Button>Вернуться к Roadmap</Button></Link>
      </div>
    );
  }

  const allLessonsInModule = lessons.filter(l => l.module_id === lesson.module_id);
  const currentLessonIdx = allLessonsInModule.findIndex(l => l.id === lesson.id);
  const prevLesson = currentLessonIdx > 0 ? allLessonsInModule[currentLessonIdx - 1] : null;
  const nextLesson = currentLessonIdx < allLessonsInModule.length - 1 ? allLessonsInModule[currentLessonIdx + 1] : null;

  const handleChecklistChange = (key: keyof CompletionChecklist, value: boolean) => {
    if (!lesson) return;
    setLessonChecklist(lesson.id, { ...checklist, [key]: value });
  };

  const handleAddEvidence = () => {
    const errors: Record<string, boolean> = {};
    if (!evidenceForm.what_done.trim()) errors.what_done = true;
    if (!evidenceForm.metric.trim()) errors.metric = true;
    if (Object.keys(errors).length > 0) {
      setEvidenceErrors(errors);
      return;
    }
    setEvidenceErrors({});
    addEvidenceCard({
      user_id: 'user-1',
      lesson_id: lesson.id,
      module_id: lesson.module_id,
      date: new Date().toISOString().split('T')[0],
      direction: lesson.application_area?.[0] || 'ai-services',
      what_done: evidenceForm.what_done,
      artifact: evidenceForm.artifact,
      artifact_url: evidenceForm.artifact_url,
      where_applied: evidenceForm.where_applied,
      metric: evidenceForm.metric,
      what_proven: evidenceForm.what_proven,
      what_not_proven: evidenceForm.what_not_proven,
      next_improvement: evidenceForm.next_improvement,
      reflection: evidenceForm.reflection,
      money_impact: evidenceForm.money_impact,
      money_amount: evidenceForm.money_amount,
      case_potential: evidenceForm.case_potential,
      status: 'submitted',
      reviewer_id: null,
      review_comment: null,
      submitted_at: null,
      approved_at: null,
    });
    setLessonChecklist(lesson.id, { ...checklist, evidence_card_filled: true });
    setShowEvidenceDialog(false);
    setEvidenceForm({
      what_done: '', artifact: '', artifact_url: '', where_applied: '',
      metric: '', what_proven: '', what_not_proven: '', next_improvement: '',
      reflection: '', money_impact: '', money_amount: 0,
      case_potential: 'later',
    });
  };

  const handleAddArtifact = () => {
    const errors: Record<string, boolean> = {};
    if (!artifactForm.title.trim()) errors.title = true;
    if (Object.keys(errors).length > 0) {
      setArtifactErrors(errors);
      return;
    }
    setArtifactErrors({});
    addArtifact({
      user_id: 'user-1',
      lesson_id: lesson.id,
      title: artifactForm.title,
      type: artifactForm.type,
      direction: lesson.application_area?.[0] || 'ai-services',
      description: artifactForm.description,
      url: artifactForm.url,
      status: 'draft',
      metric: artifactForm.metric,
    });
    setLessonChecklist(lesson.id, { ...checklist, artifact_added: true });
    setShowArtifactDialog(false);
    setArtifactForm({ title: '', type: 'prompt', description: '', url: '', metric: '' });
  };

  const handleTryComplete = () => {
    const result = canCompleteLesson(lesson.id);
    if (result.canComplete) {
      setShowCompleteDialog(true);
    } else {
      setMissingItems(result.missing);
      setShowMissingDialog(true);
    }
  };

  const handleConfirmComplete = () => {
    completeLesson(lesson.id);
    setShowCompleteDialog(false);
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}`);
    } else {
      router.push('/roadmap');
    }
  };

  const lessonEvidence = evidenceCards.filter(e => e.lesson_id === lesson.id);
  const hasApprovedEvidence = lessonEvidence.some(e => e.status === 'approved');
  const hasSubmittedEvidence = lessonEvidence.some(e => e.status === 'submitted');
  const checklistItems = [
    { key: 'evidence_card_filled' as keyof CompletionChecklist, label: 'Evidence Card отправлена на проверку', auto: hasSubmittedEvidence },
    { key: 'artifact_added' as keyof CompletionChecklist, label: 'Артефакт добавлен' },
  ];

  const completionPercentage = Math.min(100, ((Object.values(checklist).filter(Boolean).length + (hasApprovedEvidence ? 1 : 0)) / 3) * 100);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/roadmap" className="hover:text-zinc-300 transition-colors">Roadmap</Link>
        <span>/</span>
        <span>Модуль {module.order_index}</span>
        <span>/</span>
        <span className="text-zinc-300">{lesson.title}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Badge variant="outline">Модуль {module.order_index}</Badge>
          {lesson.estimated_minutes && (
            <Badge variant="outline" className="text-zinc-400">
              <Clock className="h-3 w-3 mr-1" />
              {lesson.estimated_minutes} мин
            </Badge>
          )}
          <Badge className={getStatusColor(lesson.status)}>
            {getStatusLabel(lesson.status)}
          </Badge>
          {lesson.status === 'completed' && (
            <Badge className="bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Завершён
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{lesson.title}</h1>
        <p className="text-accent mt-2 font-medium">{lesson.goal}</p>
      </div>

      {/* Completion Progress */}
      <Card className="border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Прогресс выполнения</span>
            <span className="text-sm text-zinc-400">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} />
          {completionPercentage < 100 && lesson.status !== 'completed' && (
            <p className="text-xs text-zinc-500 mt-2">
              Урок нельзя закрыть без доказательства. Отметь все пункты ниже.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Мини-теория
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                {lesson.mini_theory}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-5 w-5 text-blue-500" />
                Практика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">{lesson.practice}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-muted" />
                Артефакт на выходе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300">{lesson.artifact_requirement}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                Домашнее задание
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300">{lesson.homework}</p>
            </CardContent>
          </Card>

          {/* Eval Prompt Section */}
          {lesson.eval_prompt && (
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowEvalPrompt(!showEvalPrompt)}>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileCode className="h-5 w-5 text-violet-500" />
                  Eval Prompt (самопроверка)
                  <Badge variant="outline" className="ml-auto text-xs">
                    {showEvalPrompt ? 'Скрыть' : 'Показать'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              {showEvalPrompt && (
                <CardContent>
                  <div className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 font-mono text-xs">
                    {lesson.eval_prompt}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
                Метрика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300">{lesson.metric}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-pink-500" />
                Где применить
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lesson.application_area.map((area) => (
                  <Badge key={area} className={getDirectionColor(area)}>
                    {getDirectionLabel(area)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-5 w-5 text-yellow-500" />
                Критерий готовности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300">{lesson.done_criteria}</p>
            </CardContent>
          </Card>

          {/* Money Connection */}
          {lesson.money_connection && (
            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  Связь с деньгами
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300">{lesson.money_connection}</p>
              </CardContent>
            </Card>
          )}

          {/* Template URL */}
          {lesson.template_url && (
            <Link href={`/templates?template=${lesson.template_url}`}>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Открыть шаблон
              </Button>
            </Link>
          )}

          {/* External Links */}
          {lesson.external_links && lesson.external_links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="h-5 w-5 text-blue-500" />
                  Дополнительные материалы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lesson.external_links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Status */}
          {mounted && lessonEvidence.length > 0 && (() => {
            const ev = lessonEvidence[lessonEvidence.length - 1];
            const statusColors: Record<string, string> = { approved: 'border-emerald-500/20', needs_revision: 'border-amber-500/20' };
            const statusText: Record<string, string> = { draft: 'Черновик', submitted: 'На проверке', needs_revision: 'На доработке', approved: 'Принято', waived: 'Зачтено' };
            const badgeColors: Record<string, string> = { approved: 'text-emerald-500', needs_revision: 'text-amber-500', submitted: 'text-blue-500' };
            return (
              <Card className={`border ${statusColors[ev.status] || 'border-zinc-800'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Evidence Card</span>
                    <Badge variant="outline" className={`text-xs ${badgeColors[ev.status] || 'text-zinc-500'}`}>
                      {statusText[ev.status] || ev.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{ev.what_done}</p>
                  {ev.review_comment && (
                    <p className="text-xs text-zinc-500 mt-1 italic">Комментарий: {ev.review_comment}</p>
                  )}
                  {user.role === 'owner' && ev.status === 'submitted' && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-emerald-500 text-xs" onClick={() => approveEvidence(ev.id, 'owner')}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Принять
                      </Button>
                      <Button size="sm" variant="outline" className="text-amber-500 text-xs" onClick={() => {
                        const comment = prompt('Что нужно доработать?');
                        if (comment) requestEvidenceRevision(ev.id, 'owner', comment);
                      }}>
                        <AlertCircle className="h-3 w-3 mr-1" /> На доработку
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          <Separator />

          {/* Action Buttons */}
          {lesson.status !== 'completed' ? (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => setShowArtifactDialog(true)}>
                <Plus className="h-4 w-4 mr-2" /> Добавить артефакт
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowEvidenceDialog(true)}>
                <FileText className="h-4 w-4 mr-2" /> Заполнить Evidence Card
              </Button>

              {/* Checklist */}
              <div className="space-y-2.5 pt-2">
                <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Чек-лист завершения</Label>
                {checklistItems.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 text-sm cursor-pointer group"
                    onClick={() => handleChecklistChange(item.key, !checklist[item.key])}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checklist[item.key]
                         ? 'bg-accent border-accent'
                        : 'border-zinc-600 group-hover:border-zinc-400'
                    }`}>
                      {checklist[item.key] && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <span className={checklist[item.key] ? 'text-zinc-500 line-through' : ''}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                className="w-full mt-2"
                variant="primary"
                disabled={!hasApprovedEvidence}
                onClick={handleTryComplete}
              >
                {!mounted ? 'Загрузка...' : hasApprovedEvidence
                  ? 'Завершить урок'
                  : hasSubmittedEvidence
                    ? 'Ожидает проверки Evidence Card'
                    : 'Сначала заполни Evidence Card'
                }
              </Button>
            </div>
          ) : (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-400">Урок завершён</p>
                <p className="text-xs text-zinc-500 mt-1">Evidence Card и артефакты сохранены</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        {prevLesson ? (
          <Link href={`/lesson/${prevLesson.id}`}>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="truncate max-w-[200px]">{prevLesson.title}</span>
            </Button>
          </Link>
        ) : <div />}
        {nextLesson ? (
          <Link href={`/lesson/${nextLesson.id}`}>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <span className="truncate max-w-[200px]">{nextLesson.title}</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        ) : (
          <Link href="/roadmap">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              К Roadmap
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>

      {/* Evidence Card Dialog */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evidence Card</DialogTitle>
            <DialogDescription>Зафиксируй доказательство прохождения урока</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Что сделано <span className="text-red-400">*</span></Label>
              <Textarea
                value={evidenceForm.what_done}
                onChange={e => { setEvidenceForm(f => ({ ...f, what_done: e.target.value })); setEvidenceErrors(e2 => ({ ...e2, what_done: false })); }}
                placeholder="Опиши результат..."
                className={evidenceErrors.what_done ? 'border-red-500' : ''}
              />
              {evidenceErrors.what_done && <p className="text-xs text-red-400 mt-1">Обязательное поле</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Артефакт</Label>
                <Input value={evidenceForm.artifact} onChange={e => setEvidenceForm(f => ({ ...f, artifact: e.target.value }))} placeholder="Название артефакта" />
              </div>
              <div>
                <Label>Ссылка на артефакт</Label>
                <Input value={evidenceForm.artifact_url} onChange={e => setEvidenceForm(f => ({ ...f, artifact_url: e.target.value }))} placeholder="URL" />
              </div>
            </div>
            <div>
              <Label>Где применено</Label>
              <Input value={evidenceForm.where_applied} onChange={e => setEvidenceForm(f => ({ ...f, where_applied: e.target.value }))} placeholder="AI-услуги / Проект / Обучение" />
            </div>
            <div>
              <Label>Метрика <span className="text-red-400">*</span></Label>
              <Input
                value={evidenceForm.metric}
                onChange={e => { setEvidenceForm(f => ({ ...f, metric: e.target.value })); setEvidenceErrors(e2 => ({ ...e2, metric: false })); }}
                placeholder="Измеримый результат"
                className={evidenceErrors.metric ? 'border-red-500' : ''}
              />
              {evidenceErrors.metric && <p className="text-xs text-red-400 mt-1">Обязательное поле</p>}
            </div>
            <div>
              <Label>Рефлексия</Label>
              <Textarea value={evidenceForm.reflection} onChange={e => setEvidenceForm(f => ({ ...f, reflection: e.target.value }))}
                placeholder="Что сработало, что улучшить в следующий раз" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Денежный эффект</Label>
                <Input value={evidenceForm.money_impact} onChange={e => setEvidenceForm(f => ({ ...f, money_impact: e.target.value }))}
                  placeholder="Например: получил заказ на 50 000 тг" />
              </div>
              <div>
                <Label>Сумма (если есть)</Label>
                <Input type="number" value={evidenceForm.money_amount || ''} onChange={e => setEvidenceForm(f => ({ ...f, money_amount: +e.target.value }))}
                  placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Что доказано</Label>
              <Textarea value={evidenceForm.what_proven} onChange={e => setEvidenceForm(f => ({ ...f, what_proven: e.target.value }))} placeholder="Что подтвердилось..." />
            </div>
            <div>
              <Label>Что НЕ доказано</Label>
              <Textarea value={evidenceForm.what_not_proven} onChange={e => setEvidenceForm(f => ({ ...f, what_not_proven: e.target.value }))} placeholder="Что осталось под вопросом..." />
            </div>
            <div>
              <Label>Следующее улучшение</Label>
              <Input value={evidenceForm.next_improvement} onChange={e => setEvidenceForm(f => ({ ...f, next_improvement: e.target.value }))} placeholder="Что сделать дальше" />
            </div>
            <div>
              <Label>Можно ли использовать как кейс?</Label>
              <div className="flex gap-2 mt-1">
                {([['yes', 'Да'], ['no', 'Нет'], ['later', 'Позже']] as const).map(([v, label]) => (
                  <Button
                    key={v}
                    variant={evidenceForm.case_potential === v ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEvidenceForm(f => ({ ...f, case_potential: v }))}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvidenceDialog(false)}>Отмена</Button>
            <Button onClick={handleAddEvidence}>Сохранить Evidence Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Artifact Dialog */}
      <Dialog open={showArtifactDialog} onOpenChange={setShowArtifactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить артефакт</DialogTitle>
            <DialogDescription>Зафиксируй созданный артефакт</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название <span className="text-red-400">*</span></Label>
              <Input
                value={artifactForm.title}
                onChange={e => { setArtifactForm(f => ({ ...f, title: e.target.value })); setArtifactErrors(e2 => ({ ...e2, title: false })); }}
                placeholder="Название артефакта"
                className={artifactErrors.title ? 'border-red-500' : ''}
              />
              {artifactErrors.title && <p className="text-xs text-red-400 mt-1">Обязательное поле</p>}
            </div>
            <div>
              <Label>Тип</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(['prompt', 'workflow', 'offer', 'case', 'demo', 'report', 'automation', 'lesson', 'checklist', 'api-spec', 'rag-demo', 'agent-blueprint'] as ArtifactType[]).map(t => (
                  <Button key={t} variant={artifactForm.type === t ? 'default' : 'outline'} size="sm"
                    onClick={() => setArtifactForm(f => ({ ...f, type: t }))} className="text-xs">
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={artifactForm.description} onChange={e => setArtifactForm(f => ({ ...f, description: e.target.value }))} placeholder="Опиши артефакт..." />
            </div>
            <div>
              <Label>Ссылка</Label>
              <Input value={artifactForm.url} onChange={e => setArtifactForm(f => ({ ...f, url: e.target.value }))} placeholder="URL" />
            </div>
            <div>
              <Label>Метрика</Label>
              <Input value={artifactForm.metric} onChange={e => setArtifactForm(f => ({ ...f, metric: e.target.value }))} placeholder="Как измерить" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArtifactDialog(false)}>Отмена</Button>
            <Button onClick={handleAddArtifact}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Missing Items Dialog */}
      <Dialog open={showMissingDialog} onOpenChange={setShowMissingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Не все пункты выполнены
            </DialogTitle>
            <DialogDescription>
              Урок нельзя закрыть без доказательства. Заполни недостающие пункты:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {missingItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMissingDialog(false)}>Понятно, исправлю</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Урок завершён!</DialogTitle>
            <DialogDescription>
              Все доказательства собраны. Артефакт создан. Система довольна.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <p className="text-zinc-400 text-sm italic">
              &ldquo;Артефакт важнее ощущения прогресса.&rdquo;
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Остаться на странице</Button>
            <Button onClick={handleConfirmComplete}>
              {nextLesson ? 'Следующий урок' : 'К Roadmap'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

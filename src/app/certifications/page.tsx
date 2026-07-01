"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Award, ExternalLink, CheckCircle2, Circle,
  Trash2, GraduationCap, BookOpen, Share2
} from 'lucide-react';

export default function CertificationsPage() {
  const { certifications, modules, certificationCards, addCertificationCard, deleteCertificationCard } = useStore();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

  const [form, setForm] = useState({
    certification_id: '', certification_title: '', provider: '',
    date_completed: new Date().toISOString().split('T')[0],
    url: '', reflection: '', linked: false,
  });

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareText, setShareText] = useState('');

  const completedIds = new Set(certificationCards.map(c => c.certification_id));
  const sorted = [...certifications].sort((a, b) => a.order_index - b.order_index);

  const freeCerts = sorted.filter(c => c.level === 'free');
  const paidCerts = sorted.filter(c => c.level === 'paid');
  const premiumCerts = sorted.filter(c => c.level === 'premium');

  const handleAdd = () => {
    if (!form.certification_id || !form.date_completed) return;
    addCertificationCard({
      user_id: 'user-1',
      certification_id: form.certification_id,
      certification_title: form.certification_title,
      provider: form.provider,
      date_completed: form.date_completed,
      url: form.url,
      reflection: form.reflection,
      linked: form.linked,
    });
    setShowDialog(false);
    setForm({ certification_id: '', certification_title: '', provider: '', date_completed: new Date().toISOString().split('T')[0], url: '', reflection: '', linked: false });
    setSelectedCertId(null);
  };

  const handleComplete = (cert: typeof certifications[0]) => {
    setSelectedCertId(cert.id);
    setForm({
      certification_id: cert.id,
      certification_title: cert.title,
      provider: cert.provider,
      date_completed: new Date().toISOString().split('T')[0],
      url: cert.url,
      reflection: '',
      linked: false,
    });
    setShowDialog(true);
  };

  const generateShareText = (card: typeof certificationCards[0]) => {
    const mod = modules.find(m => certifications.find(c => c.id === card.certification_id)?.module_id === m.id);
    const text = [
      `Получил сертификат: ${card.certification_title}`,
      ``,
      `Провайдер: ${card.provider}`,
      mod ? `Связано с модулем: ${mod.title}` : '',
      ``,
      card.reflection,
      ``,
      `#AI #Сертификация #AIProductOperator #${card.provider.replace(/\s+/g, '')}`,
    ].filter(Boolean).join('\n');
    setShareText(text);
    setShowShareDialog(true);
  };

  const copyShareText = () => {
    navigator.clipboard.writeText(shareText);
  };

  const CertificationCard = ({ cert, completed }: { cert: typeof certifications[0], completed: boolean }) => {
    const mod = cert.module_id ? modules.find(m => m.id === cert.module_id) : null;
    const card = certificationCards.find(c => c.certification_id === cert.id);
    return (
      <Card className={`transition-all ${completed ? 'border-emerald-500/30' : 'opacity-90 hover:opacity-100'}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-600 shrink-0" />
              )}
              <div>
                <h3 className="font-semibold text-sm leading-tight">{cert.title}</h3>
                <p className="text-xs text-zinc-500">{cert.provider}</p>
              </div>
            </div>
            <Badge variant={cert.level === 'free' ? 'secondary' : cert.level === 'paid' ? 'default' : 'outline'}
              className={cert.level === 'free' ? 'bg-emerald-500/10 text-emerald-500' : cert.level === 'paid' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'}>
              {cert.level === 'free' ? 'Бесплатно' : cert.level === 'paid' ? 'Платный' : 'Премиум'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mb-3">{cert.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mod && (
                <Badge variant="outline" className="text-xs">
                  Модуль {mod.order_index}
                </Badge>
              )}
              <a href={cert.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> {cert.cost}
              </a>
            </div>
            {completed ? (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs"
                  onClick={() => generateShareText(card!)}>
                  <Share2 className="h-3 w-3 mr-1" /> Поделиться
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-400"
                  onClick={() => deleteCertificationCard(card!.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => handleComplete(cert)}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Отметить
              </Button>
            )}
          </div>
          {completed && card?.reflection && (
            <p className="text-xs text-zinc-500 mt-2 italic border-t border-zinc-800 pt-2">
              {card.reflection}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const total = certifications.length;
  const completed = certificationCards.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <Award className="h-7 w-7 text-accent" />
          Certification Map
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          Карта сертификаций 2025–2026. Каждый модуль курса готовит к конкретному внешнему credential.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-subtle">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completed}/{total}</div>
                <div className="text-xs text-zinc-500">Сертификатов получено</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{freeCerts.length}</div>
                <div className="text-xs text-zinc-500">Бесплатных</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <BookOpen className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{paidCerts.length}</div>
                <div className="text-xs text-zinc-500">Платных</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{premiumCerts.length}</div>
                <div className="text-xs text-zinc-500">Премиум</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certification Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Общий прогресс</span>
            <span className="text-sm text-zinc-400">{progress}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Free Certifications */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-emerald-500" />
          Бесплатные — делать немедленно
          <Badge variant="outline" className="text-xs ml-2">{freeCerts.filter(c => completedIds.has(c.id)).length}/{freeCerts.length}</Badge>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeCerts.map(cert => (
            <CertificationCard key={cert.id} cert={cert} completed={completedIds.has(cert.id)} />
          ))}
        </div>
      </div>

      {paidCerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Платные — для профессионального веса
            <Badge variant="outline" className="text-xs ml-2">{paidCerts.filter(c => completedIds.has(c.id)).length}/{paidCerts.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidCerts.map(cert => (
              <CertificationCard key={cert.id} cert={cert} completed={completedIds.has(cert.id)} />
            ))}
          </div>
        </div>
      )}

      {premiumCerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Премиум — для экспертного уровня
            <Badge variant="outline" className="text-xs ml-2">{premiumCerts.filter(c => completedIds.has(c.id)).length}/{premiumCerts.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premiumCerts.map(cert => (
              <CertificationCard key={cert.id} cert={cert} completed={completedIds.has(cert.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Add Certification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить сертификат</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input value={form.certification_title} readOnly />
            </div>
            <div>
              <Label>Провайдер</Label>
              <Input value={form.provider} readOnly />
            </div>
            <div>
              <Label>Дата получения</Label>
              <Input type="date" value={form.date_completed} onChange={e => setForm(f => ({ ...f, date_completed: e.target.value }))} />
            </div>
            <div>
              <Label>Ссылка на сертификат</Label>
              <Input value={form.url} readOnly />
            </div>
            <div>
              <Label>Рефлексия: что я узнал, чего не было в модуле курса?</Label>
              <Textarea value={form.reflection} onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))} placeholder="Какие новые инсайты дала сертификация..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Отмена</Button>
            <Button onClick={handleAdd}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-500" />
              Пост для соцсетей
            </DialogTitle>
          </DialogHeader>
          <Textarea value={shareText} onChange={e => setShareText(e.target.value)} rows={8} className="font-mono text-sm" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Закрыть</Button>
            <Button onClick={copyShareText}>Копировать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            Certification Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                  <th className="text-left py-2 pr-4">Момент в обучении</th>
                  <th className="text-left py-2 pr-4">Сертификация</th>
                  <th className="text-left py-2 pr-4">Платформа</th>
                  <th className="text-right py-2">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(cert => {
                  const mod = cert.module_id ? modules.find(m => m.id === cert.module_id) : null;
                  const done = completedIds.has(cert.id);
                  return (
                    <tr key={cert.id} className={`border-b border-zinc-800/50 ${done ? 'text-emerald-400' : ''}`}>
                      <td className="py-2.5 pr-4">
                        {mod ? `После Модуля ${mod.order_index}` : 'По желанию'}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                          <span>{cert.title}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-500">{cert.provider}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={cert.level === 'free' ? 'secondary' : 'default'} className="text-xs whitespace-nowrap">
                          {cert.cost}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <p className="text-sm text-zinc-500 italic">
          &ldquo;Каждый модуль курса → внешний credential. Артефакты доказывают навык, сертификаты подтверждают знание.&rdquo;
        </p>
      </div>
    </div>
  );
}

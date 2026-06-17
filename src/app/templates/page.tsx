"use client";

import React, { useState } from 'react';
import { templates, templateContents } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { exportToMarkdown } from '@/lib/utils';
import { FileText, Copy, Download, Search } from 'lucide-react';

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (templateId: string) => {
    const content = templateContents[templateId];
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleExport = (templateId: string) => {
    const content = templateContents[templateId];
    const template = templates.find(t => t.id === templateId);
    if (content && template) {
      exportToMarkdown(content, `template-${template.title.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const categoryColors: Record<string, string> = {
    evidence: 'bg-violet-500/10 text-violet-500',
    service: 'bg-blue-500/10 text-blue-500',
    linkmax: 'bg-amber-500/10 text-amber-500',
    academy: 'bg-emerald-500/10 text-emerald-500',
    planning: 'bg-cyan-500/10 text-cyan-500',
    technical: 'bg-pink-500/10 text-pink-500',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3 md:text-3xl">
          <FileText className="h-7 w-7 text-violet-500" />
          Templates
        </h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">
          Шаблоны для артефактов, кейсов, офферов и спецификаций.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          placeholder="Поиск шаблонов..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 pl-9 pr-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedTemplate(template.id)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge className={categoryColors[template.category] || 'bg-zinc-500/10 text-zinc-500'}>
                  {template.category}
                </Badge>
              </div>
              <h3 className="font-semibold mb-1">{template.title}</h3>
              <p className="text-sm text-zinc-400">{template.description}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopy(template.id); }}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Копировать
                </Button>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleExport(template.id); }}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{templates.find(t => t.id === selectedTemplate)?.title}</DialogTitle>
              </DialogHeader>
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800/50 p-4 rounded-lg">
                {templateContents[selectedTemplate] || 'Шаблон в разработке'}
              </pre>
              <DialogFooter>
                <Button variant="outline" onClick={() => { handleCopy(selectedTemplate); }}>
                  <Copy className="h-4 w-4 mr-1" /> Копировать
                </Button>
                <Button onClick={() => { handleExport(selectedTemplate); }}>
                  <Download className="h-4 w-4 mr-1" /> Скачать .md
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

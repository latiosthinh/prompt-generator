'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Download,
  FileText,
  Sparkles,
  RefreshCw,
  Edit3,
  Layers,
  ArrowRight,
  Eye,
  FileCode2,
} from 'lucide-react';
import { Translations } from '@/i18n';

interface PromptViewerProps {
  promptText: string;
  domainName: string;
  isStreaming: boolean;
  roundNumber?: number;
  onEditQuestions: () => void;
  onKeepBuilding: () => void;
  onResetAll: () => void;
  onChangePrompt?: (updatedPrompt: string) => void;
  isRefining?: boolean;
  t: Translations;
}

export function PromptViewer({
  promptText,
  domainName,
  isStreaming,
  roundNumber = 1,
  onEditQuestions,
  onKeepBuilding,
  onResetAll,
  onChangePrompt,
  isRefining = false,
  t,
}: PromptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'markdown' | 'text' | 'edit'>('markdown');

  // Simple word count and token estimation
  const stats = useMemo(() => {
    const text = promptText.trim();
    if (!text) return { words: 0, chars: 0, estimatedTokens: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    // Common approx: ~4 chars per token
    const estimatedTokens = Math.ceil(chars / 4);
    return { words, chars, estimatedTokens };
  }, [promptText]);

  const handleCopy = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = (format: 'md' | 'txt') => {
    if (!promptText) return;
    const safeDomain = domainName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `prompt-${safeDomain}-${new Date().toISOString().slice(0, 10)}.${format}`;
    const blob = new Blob([promptText], {
      type: format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDomainBadge = () => {
    const d = domainName.toLowerCase();
    if (d.includes('hình ảnh') || d.includes('image') || d.includes('art')) {
      return { label: t.promptViewer.badges.image, color: 'bg-pink-500/10 text-pink-700 border-pink-200 dark:border-pink-900/60 dark:text-pink-400' };
    }
    if (d.includes('lập trình') || d.includes('code') || d.includes('tech')) {
      return { label: t.promptViewer.badges.code, color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-900/60 dark:text-emerald-400' };
    }
    if (d.includes('viết') || d.includes('writing') || d.includes('copy')) {
      return { label: t.promptViewer.badges.writing, color: 'bg-purple-500/10 text-purple-700 border-purple-200 dark:border-purple-900/60 dark:text-purple-400' };
    }
    if (d.includes('agent') || d.includes('system')) {
      return { label: t.promptViewer.badges.agent, color: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/60 dark:text-blue-400' };
    }
    return { label: t.promptViewer.badges.general, color: 'bg-[#C15F3D]/10 text-[#C15F3D] border-[#C15F3D]/20 dark:border-[#DA7756]/30 dark:text-[#DA7756]' };
  };

  const badge = getDomainBadge();

  return (
    <div className="w-full space-y-3.5">
      {/* Header card with actions & metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3.5 shadow-2xs dark:border-[#38312C] dark:bg-[#282320]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}>
              <Sparkles className="h-3 w-3" />
              <span>{badge.label}</span>
            </span>
            <span className="rounded-sm border border-[#E6DFD3] bg-[#F5F0E6] px-2 py-0.5 text-[11px] text-[#6B6258] dark:border-[#38312C] dark:bg-[#1F1A18] dark:text-[#B5A89B]">
              {domainName}
            </span>
            {roundNumber > 1 && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-[#C15F3D]/30 bg-[#F9EFE9] px-2 py-0.5 text-[11px] font-semibold text-[#C15F3D] dark:bg-[#33231D] dark:text-[#DA7756]">
                <Layers className="h-3 w-3" />
                <span>{t.promptViewer.round.replace('{round}', String(roundNumber))}</span>
              </span>
            )}
            {isStreaming && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C15F3D] dark:text-[#DA7756] animate-pulse">
                <span className="h-2 w-2 rounded-full bg-[#C15F3D] animate-ping" />
                {t.promptViewer.synthesizing}
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-[#2B2520] dark:text-[#EDE5DC]">
            {t.promptViewer.title}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!promptText || isStreaming}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50 ${
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-[#C15F3D]/30 bg-[#F9EFE9] text-[#C15F3D] hover:bg-[#F3DDD2] dark:border-[#DA7756]/30 dark:bg-[#33231D] dark:text-[#DA7756]'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{t.promptViewer.copied}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{t.promptViewer.copyPrompt}</span>
              </>
            )}
          </button>

          <div className="inline-flex rounded-md border border-[#E6DFD3] bg-[#F5F0E6] p-0.5 dark:border-[#38312C] dark:bg-[#1F1A18]">
            <button
              type="button"
              onClick={() => handleDownload('md')}
              disabled={!promptText || isStreaming}
              title={t.promptViewer.downloadMdTitle}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[#2B2520] hover:bg-[#FFFFFF] disabled:opacity-50 cursor-pointer dark:text-[#EDE5DC] dark:hover:bg-[#282320]"
            >
              <Download className="h-3 w-3" />
              <span>.md</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload('txt')}
              disabled={!promptText || isStreaming}
              title={t.promptViewer.downloadTxtTitle}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[#2B2520] hover:bg-[#FFFFFF] disabled:opacity-50 cursor-pointer dark:text-[#EDE5DC] dark:hover:bg-[#282320]"
            >
              <FileText className="h-3 w-3" />
              <span>.txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar & 3-Mode View Controls: Markdown / Text / Direct Edit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8E8377] dark:text-[#7E7368] px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-medium text-[#2B2520] dark:text-[#EDE5DC]">{stats.words}</span> {t.promptViewer.words.replace('{count} ', '')}
          </div>
          <div className="h-2.5 w-px bg-[#E6DFD3] dark:bg-[#38312C]" />
          <div className="flex items-center gap-1">
            <span className="font-medium text-[#2B2520] dark:text-[#EDE5DC]">{stats.chars}</span> {t.promptViewer.chars.replace('{count} ', '')}
          </div>
          <div className="h-2.5 w-px bg-[#E6DFD3] dark:bg-[#38312C]" />
          <div className="flex items-center gap-1">
            <span className="font-medium text-[#2B2520] dark:text-[#EDE5DC]">{t.promptViewer.tokens.replace('{count}', String(stats.estimatedTokens))}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-center">
          <div className="inline-flex rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-0.5 dark:border-[#38312C] dark:bg-[#282320]">
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'markdown'
                  ? 'bg-[#F5F0E6] text-[#2B2520] font-semibold shadow-2xs dark:bg-[#1F1A18] dark:text-white'
                  : 'text-[#8E8377] hover:text-[#2B2520] dark:hover:text-white'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>{t.promptViewer.tabFormatted}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-[#F5F0E6] text-[#2B2520] font-semibold shadow-2xs dark:bg-[#1F1A18] dark:text-white'
                  : 'text-[#8E8377] hover:text-[#2B2520] dark:hover:text-white'
              }`}
            >
              <FileCode2 className="h-3 w-3" />
              <span>{t.promptViewer.tabRaw}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-[#C15F3D] text-white font-semibold shadow-2xs dark:bg-[#DA7756]'
                  : 'text-[#8E8377] hover:text-[#2B2520] dark:hover:text-white'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>{t.promptViewer.tabEdit}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Prompt Content & Editor Workspace */}
      <div className="relative rounded-md border border-[#E6DFD3] bg-[#221D1A] shadow-2xs dark:border-[#38312C] dark:bg-[#151210] overflow-hidden flex flex-col min-h-[380px] max-h-[65vh]">
        {promptText || activeTab === 'edit' ? (
          <div className="flex-1 overflow-y-auto p-4.5">
            {activeTab === 'markdown' && (
              <div className="text-[#EDE5DC] text-xs sm:text-sm leading-relaxed select-text space-y-3 font-sans">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-base sm:text-lg font-bold text-[#FFFFFF] mt-4 mb-2 pb-1 border-b border-[#38312C] flex items-center gap-2" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-sm sm:text-base font-semibold text-[#FDF4ED] mt-3.5 mb-1.5 flex items-center gap-1.5" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-xs sm:text-sm font-semibold text-[#E6DFD3] mt-2.5 mb-1" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-xs sm:text-sm text-[#EDE5DC] leading-relaxed my-1.5" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-[#EDE5DC] my-2" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-4 space-y-1 text-xs sm:text-sm text-[#EDE5DC] my-2" {...props} />
                    ),
                    li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                    strong: ({ ...props }) => (
                      <strong className="font-semibold text-white" {...props} />
                    ),
                    code: ({ inline, ...props }: { inline?: boolean } & React.HTMLAttributes<HTMLElement>) =>
                      inline ? (
                        <code className="rounded-sm bg-[#151210] px-1.5 py-0.5 font-mono text-[11px] text-[#DA7756] border border-[#38312C]" {...props} />
                      ) : (
                        <code className="block rounded-md bg-[#151210] p-3 font-mono text-xs text-[#EDE5DC] border border-[#38312C] overflow-x-auto my-2" {...props} />
                      ),
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-2 border-[#C15F3D] pl-3 py-0.5 text-[#B5A89B] italic my-2" {...props} />
                    ),
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto my-3 border border-[#38312C] rounded-md">
                        <table className="w-full text-xs text-left border-collapse" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th className="bg-[#191614] border-b border-[#38312C] p-2 font-semibold text-[#EDE5DC]" {...props} />
                    ),
                    td: ({ ...props }) => (
                      <td className="border-b border-[#38312C]/60 p-2 text-[#EDE5DC]" {...props} />
                    ),
                  }}
                >
                  {promptText}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C15F3D] animate-pulse align-middle" />
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div className="rounded-md bg-[#191614] p-3 border border-[#38312C]">
                <pre className="font-mono text-xs text-[#EDE5DC] leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
                  {promptText}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C15F3D] animate-pulse align-middle" />
                  )}
                </pre>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="h-full flex flex-col">
                <textarea
                  value={promptText}
                  onChange={(e) => onChangePrompt?.(e.target.value)}
                  placeholder={t.promptViewer.editorPlaceholder}
                  disabled={isStreaming}
                  className="w-full flex-1 min-h-[320px] bg-transparent text-xs sm:text-sm font-mono text-[#EDE5DC] leading-relaxed resize-none outline-hidden placeholder:text-[#7E7368]"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-[#8E8377]">
            <Sparkles className="h-6 w-6 text-[#C15F3D] animate-bounce mb-2" />
            <p className="text-xs font-medium">{t.promptViewer.waitingStream}</p>
          </div>
        )}
      </div>

      {/* Refinement & Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-[#E6DFD3]/60 pt-3.5 dark:border-[#38312C]/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Keep Building Context Button */}
          <button
            type="button"
            onClick={onKeepBuilding}
            disabled={isStreaming || isRefining}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C15F3D] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#A94E30] disabled:opacity-50 cursor-pointer transition dark:bg-[#DA7756] dark:hover:bg-[#C15F3D]"
          >
            {isRefining ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>{t.promptViewer.refiningPrompt}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>{t.promptViewer.keepBuilding}</span>
                <ArrowRight className="h-3 w-3 ml-0.5 opacity-80" />
              </>
            )}
          </button>

          {/* Edit Answers Button */}
          <button
            type="button"
            onClick={onEditQuestions}
            disabled={isStreaming || isRefining}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#2B2520] hover:bg-[#F3EFE6] disabled:opacity-50 cursor-pointer dark:border-[#38312C] dark:bg-[#282320] dark:text-[#EDE5DC] dark:hover:bg-[#332A26]"
          >
            <Edit3 className="h-3 w-3 text-[#8E8377]" />
            <span>{t.promptViewer.editAnswers}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onResetAll}
          disabled={isStreaming || isRefining}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#2B2520] hover:bg-[#F3EFE6] disabled:opacity-50 cursor-pointer dark:border-[#38312C] dark:bg-[#282320] dark:text-[#EDE5DC] dark:hover:bg-[#332A26]"
        >
          <RefreshCw className="h-3 w-3 text-[#8E8377]" />
          <span>{t.promptViewer.newPrompt}</span>
        </button>
      </div>
    </div>
  );
}


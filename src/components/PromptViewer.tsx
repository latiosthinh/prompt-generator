'use client';

import React, { useState, useMemo } from 'react';
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
  isRefining = false,
  t,
}: PromptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');

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

      {/* Stats Bar & Tab Controls */}
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
              onClick={() => setActiveTab('formatted')}
              className={`rounded-sm px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'formatted'
                  ? 'bg-[#F5F0E6] text-[#2B2520] font-semibold dark:bg-[#1F1A18] dark:text-white'
                  : 'text-[#8E8377] hover:text-[#2B2520] dark:hover:text-white'
              }`}
            >
              {t.promptViewer.tabFormatted}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`rounded-sm px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-[#F5F0E6] text-[#2B2520] font-semibold dark:bg-[#1F1A18] dark:text-white'
                  : 'text-[#8E8377] hover:text-[#2B2520] dark:hover:text-white'
              }`}
            >
              {t.promptViewer.tabRaw}
            </button>
          </div>
        </div>
      </div>

      {/* Main Prompt Content Box */}
      <div className="relative rounded-md border border-[#E6DFD3] bg-[#221D1A] p-4.5 shadow-2xs dark:border-[#38312C] dark:bg-[#151210] max-h-[65vh] overflow-y-auto">
        {promptText ? (
          <div className="relative">
            {activeTab === 'formatted' ? (
              <div className="prose prose-invert max-w-none text-[#EDE5DC] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {promptText}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C15F3D] animate-pulse align-middle" />
                )}
              </div>
            ) : (
              <pre className="font-mono text-xs text-[#EDE5DC] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {promptText}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#C15F3D] animate-pulse align-middle" />
                )}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-[#8E8377]">
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

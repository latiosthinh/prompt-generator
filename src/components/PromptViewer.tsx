'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
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

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

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
      return { label: t.promptViewer.badges.image, color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' };
    }
    if (d.includes('video')) {
      return { label: 'Video Gen Specs', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
    }
    if (d.includes('lập trình') || d.includes('code') || d.includes('tech')) {
      return { label: t.promptViewer.badges.code, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
    if (d.includes('viết') || d.includes('writing') || d.includes('copy')) {
      return { label: t.promptViewer.badges.writing, color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' };
    }
    if (d.includes('agent') || d.includes('system')) {
      return { label: t.promptViewer.badges.agent, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    }
    return { label: t.promptViewer.badges.general, color: 'bg-[#DA7756]/15 text-[#DA7756] border-[#DA7756]/30' };
  };

  const badge = getDomainBadge();

  return (
    <div className="w-full space-y-3.5">
      {/* Header card with actions & metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#38312C] bg-[#1E1917] p-3.5 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${badge.color}`}>
              <Sparkles className="h-3 w-3" />
              <span>{badge.label}</span>
            </span>
            <span className="rounded-sm border border-[#38312C] bg-[#241F1C] px-2 py-0.5 text-[11px] text-[#B5A89B]">
              {domainName}
            </span>
            {roundNumber > 1 && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-[#DA7756]/30 bg-[#33231D] px-2 py-0.5 text-[11px] font-semibold text-[#DA7756]">
                <Layers className="h-3 w-3" />
                <span>{t.promptViewer.round.replace('{round}', String(roundNumber))}</span>
              </span>
            )}
            {isStreaming && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DA7756] animate-pulse">
                <span className="h-2 w-2 rounded-full bg-[#DA7756] animate-ping" />
                {t.promptViewer.synthesizing}
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-[#FBF9F5]">
            {t.promptViewer.title}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!promptText || isStreaming}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 ${
              copied
                ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
                : 'border-[#DA7756]/40 bg-[#DA7756]/20 text-[#DA7756] hover:bg-[#DA7756] hover:text-white'
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

          <div className="inline-flex rounded-lg border border-[#38312C] bg-[#241F1C] p-0.5">
            <button
              type="button"
              onClick={() => handleDownload('md')}
              disabled={!promptText || isStreaming}
              title={t.promptViewer.downloadMdTitle}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[#EDE5DC] hover:bg-[#1E1917] disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3 w-3" />
              <span>.md</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload('txt')}
              disabled={!promptText || isStreaming}
              title={t.promptViewer.downloadTxtTitle}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[#EDE5DC] hover:bg-[#1E1917] disabled:opacity-50 cursor-pointer"
            >
              <FileText className="h-3 w-3" />
              <span>.txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar & 3-Mode View Controls: Formatted Preview / Raw Markdown / Markdown Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8E8377] px-1">
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#EDE5DC]">{stats.words}</span> {t.promptViewer.words.replace('{count} ', '')}
          </div>
          <div className="h-2.5 w-px bg-[#38312C]" />
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#EDE5DC]">{stats.chars}</span> {t.promptViewer.chars.replace('{count} ', '')}
          </div>
          <div className="h-2.5 w-px bg-[#38312C]" />
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#EDE5DC]">{t.promptViewer.tokens.replace('{count}', String(stats.estimatedTokens))}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-center">
          <div className="inline-flex rounded-lg border border-[#38312C] bg-[#1E1917] p-0.5">
            {/* Tab 1: Formatted View */}
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-[#241F1C] text-white font-bold shadow-xs'
                  : 'text-[#8E8377] hover:text-white'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>{t.promptViewer.tabRaw}</span>
            </button>

            {/* Tab 2: Raw Markdown Source */}
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                activeTab === 'markdown'
                  ? 'bg-[#241F1C] text-white font-bold shadow-xs'
                  : 'text-[#8E8377] hover:text-white'
              }`}
            >
              <FileCode2 className="h-3 w-3" />
              <span>{t.promptViewer.tabFormatted}</span>
            </button>

            {/* Tab 3: Interactive Markdown Editor */}
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-[#DA7756] text-white font-bold shadow-xs'
                  : 'text-[#8E8377] hover:text-white'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>{t.promptViewer.tabEdit}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Prompt Content & Editor Workspace */}
      <div className="relative rounded-xl border border-[#38312C] bg-[#14110F] shadow-md overflow-hidden flex flex-col min-h-[360px] max-h-[60vh]">
        {promptText || activeTab === 'edit' ? (
          <div className="flex-1 overflow-y-auto p-4.5">
            {/* View-Text: Rendered formatted Markdown Viewer */}
            {activeTab === 'text' && (
              <div className="text-[#EDE5DC] text-xs sm:text-sm leading-relaxed select-text space-y-3 font-sans break-words whitespace-pre-wrap">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-base sm:text-lg font-bold text-[#FFFFFF] mt-4 mb-2 pb-1 border-b border-[#38312C] flex items-center gap-2 break-words" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-sm sm:text-base font-semibold text-[#FDF4ED] mt-3.5 mb-1.5 flex items-center gap-1.5 break-words" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-xs sm:text-sm font-semibold text-[#EDE5DC] mt-2.5 mb-1 break-words" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-xs sm:text-sm text-[#EDE5DC] leading-relaxed my-1.5 break-words whitespace-pre-wrap" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-[#EDE5DC] my-2 break-words" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-4 space-y-1 text-xs sm:text-sm text-[#EDE5DC] my-2 break-words" {...props} />
                    ),
                    li: ({ ...props }) => <li className="leading-relaxed break-words" {...props} />,
                    strong: ({ ...props }) => (
                      <strong className="font-semibold text-white break-words" {...props} />
                    ),
                    code: ({ inline, ...props }: { inline?: boolean } & React.HTMLAttributes<HTMLElement>) =>
                      inline ? (
                        <code className="rounded-sm bg-[#1E1917] px-1.5 py-0.5 font-mono text-[11px] text-[#DA7756] border border-[#38312C] break-words whitespace-pre-wrap" {...props} />
                      ) : (
                        <code className="block rounded-md bg-[#1E1917] p-3 font-mono text-xs text-[#EDE5DC] border border-[#38312C] break-words whitespace-pre-wrap my-2" {...props} />
                      ),
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-2 border-[#DA7756] pl-3 py-0.5 text-[#B5A89B] italic my-2 break-words" {...props} />
                    ),
                    table: ({ ...props }) => (
                      <div className="my-3 border border-[#38312C] rounded-md">
                        <table className="w-full text-xs text-left border-collapse" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th className="bg-[#1E1917] border-b border-[#38312C] p-2 font-semibold text-[#EDE5DC] break-words" {...props} />
                    ),
                    td: ({ ...props }) => (
                      <td className="border-b border-[#38312C]/60 p-2 text-[#EDE5DC] break-words" {...props} />
                    ),
                  }}
                >
                  {promptText}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#DA7756] animate-pulse align-middle" />
                )}
              </div>
            )}

            {/* View-Markdown: Raw Markdown Source Text */}
            {activeTab === 'markdown' && (
              <div className="rounded-lg bg-[#191614] p-3.5 border border-[#38312C]">
                <pre className="font-mono text-xs text-[#EDE5DC] leading-relaxed whitespace-pre-wrap break-words break-all select-text overflow-hidden">
                  {promptText}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#DA7756] animate-pulse align-middle" />
                  )}
                </pre>
              </div>
            )}

            {/* Markdown Editor */}
            {activeTab === 'edit' && (
              <div className="h-full flex flex-col" data-color-mode="dark">
                <MDEditor
                  value={promptText}
                  onChange={(val) => onChangePrompt?.(val || '')}
                  preview="live"
                  height={360}
                  textareaProps={{
                    placeholder: t.promptViewer.editorPlaceholder,
                    disabled: isStreaming,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-[#8E8377]">
            <Sparkles className="h-6 w-6 text-[#DA7756] animate-bounce mb-2" />
            <p className="text-xs font-medium">{t.promptViewer.waitingStream}</p>
          </div>
        )}
      </div>

      {/* Refinement & Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-[#2B2520] pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Keep Building Context Button */}
          <button
            type="button"
            onClick={onKeepBuilding}
            disabled={isStreaming || isRefining}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#DA7756] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#C15F3D] disabled:opacity-50 cursor-pointer transition"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#38312C] bg-[#1E1917] px-3 py-1.5 text-xs font-semibold text-[#EDE5DC] hover:border-[#DA7756] disabled:opacity-50 cursor-pointer transition"
          >
            <Edit3 className="h-3 w-3 text-[#DA7756]" />
            <span>{t.promptViewer.editAnswers}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onResetAll}
          disabled={isStreaming || isRefining}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#38312C] bg-[#1E1917] px-3.5 py-1.5 text-xs font-semibold text-[#EDE5DC] hover:border-[#DA7756] disabled:opacity-50 cursor-pointer transition"
        >
          <RefreshCw className="h-3 w-3 text-[#8E8377]" />
          <span>{t.promptViewer.newPrompt}</span>
        </button>
      </div>
    </div>
  );
}

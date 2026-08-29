'use client';

import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Loader2,
  Paperclip,
  X,
  FileText,
  ScanSearch,
  UploadCloud,
} from 'lucide-react';
import { DomainConfig } from '@/config/domains';
import { Translations } from '@/i18n';
import { Attachment } from '@/types/schemas';

interface SeedInputProps {
  seed: string;
  onChangeSeed: (val: string) => void;
  selectedDomain: DomainConfig;
  onGenerateQuestions: () => void;
  isLoading: boolean;
  disabled?: boolean;
  attachments?: Attachment[];
  onChangeAttachments?: (attachments: Attachment[]) => void;
  onDeconstruct?: () => void;
  isDeconstructing?: boolean;
  t: Translations;
}

export function SeedInput({
  seed,
  onChangeSeed,
  selectedDomain,
  onGenerateQuestions,
  isLoading,
  disabled = false,
  attachments = [],
  onChangeAttachments,
  onDeconstruct,
  isDeconstructing = false,
  t,
}: SeedInputProps) {
  const charCount = seed.length;
  const maxRecommended = 1000;
  const maxFiles = 5;
  const maxSizeBytes = 2 * 1024 * 1024; // 2MB

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (seed.trim() && !isLoading && !disabled && !isDeconstructing) {
        onGenerateQuestions();
      }
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!onChangeAttachments) return;
    setErrorMessage(null);

    const fileArray = Array.from(files);
    if (attachments.length + fileArray.length > maxFiles) {
      setErrorMessage(t.seedInput.maxFilesExceeded);
      return;
    }

    const newAttachments: Attachment[] = [];

    for (const file of fileArray) {
      if (file.size > maxSizeBytes) {
        setErrorMessage(t.seedInput.fileTooLarge.replace('{name}', file.name));
        continue;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        });
      } else {
        // Read text/markdown/json files
        const textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        newAttachments.push({
          id,
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          textContent,
        });
      }
    }

    if (newAttachments.length > 0) {
      onChangeAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading && !isDeconstructing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isLoading || isDeconstructing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    if (!onChangeAttachments) return;
    onChangeAttachments(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="seed-textarea"
          className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8377] dark:text-[#7E7368]"
        >
          {t.seedInput.label}
        </label>
        <span
          className={`text-xs font-mono tabular-nums ${
            charCount > maxRecommended
              ? 'text-[#C15F3D] font-medium'
              : 'text-[#8E8377] dark:text-[#7E7368]'
          }`}
        >
          {t.seedInput.charCount.replace('{count}', String(charCount))}
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-md border transition-colors duration-150 p-2 shadow-2xs ${
          isDragging
            ? 'border-[#C15F3D] bg-[#FDF6F0] ring-2 ring-[#C15F3D]/30 dark:border-[#DA7756] dark:bg-[#33231D]'
            : 'border-[#E6DFD3] bg-[#FFFFFF] focus-within:border-[#C15F3D] focus-within:ring-1 focus-within:ring-[#C15F3D]/20 dark:border-[#38312C] dark:bg-[#282320]'
        }`}
      >
        <textarea
          id="seed-textarea"
          value={seed}
          onChange={(e) => onChangeSeed(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedDomain.placeholder}
          disabled={disabled || isLoading || isDeconstructing}
          className="w-full min-h-[360px] resize-y rounded bg-transparent p-2 text-sm leading-relaxed text-[#2B2520] placeholder:text-[#8E8377] focus:outline-hidden dark:text-[#EDE5DC] dark:placeholder:text-[#7E7368]"
        />

        {/* Drop zone overlay indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#FDF6F0]/90 dark:bg-[#282320]/90 rounded-md flex flex-col items-center justify-center pointer-events-none z-10">
            <UploadCloud className="h-10 w-10 text-[#C15F3D] dark:text-[#DA7756] animate-bounce" />
            <p className="mt-2 text-sm font-semibold text-[#C15F3D] dark:text-[#DA7756]">
              {t.seedInput.dragActive}
            </p>
          </div>
        )}

        {/* Attachment preview chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-t border-[#E6DFD3]/60 dark:border-[#38312C]/60">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 rounded-md border border-[#E6DFD3] bg-[#F5F0E6]/80 px-2 py-1 text-xs text-[#2B2520] dark:border-[#38312C] dark:bg-[#1F1A18] dark:text-[#EDE5DC]"
              >
                {att.dataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="h-6 w-6 rounded object-cover border border-[#E6DFD3] dark:border-[#38312C]"
                  />
                ) : (
                  <FileText className="h-4 w-4 text-[#8E8377] dark:text-[#7E7368]" />
                )}
                <span className="max-w-[120px] truncate text-[11px] font-medium" title={att.name}>
                  {att.name}
                </span>
                <span className="text-[10px] text-[#8E8377] dark:text-[#7E7368]">
                  ({Math.round(att.size / 1024)}KB)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  disabled={disabled || isLoading || isDeconstructing}
                  className="rounded p-0.5 text-[#8E8377] hover:bg-[#E6DFD3] hover:text-[#C15F3D] dark:text-[#7E7368] dark:hover:bg-[#38312C] dark:hover:text-[#DA7756]"
                  aria-label={`Remove ${att.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errorMessage && (
          <p className="px-2 py-1 text-xs font-medium text-[#C15F3D] dark:text-[#DA7756]">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD3]/60 pt-2 px-1 dark:border-[#38312C]/60">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png,image/jpeg,image/webp,.txt,.md,.json"
              onChange={(e) => {
                if (e.target.files) {
                  processFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading || isDeconstructing || attachments.length >= maxFiles}
              className="inline-flex items-center gap-1 rounded border border-[#E6DFD3] bg-[#F5F0E6]/50 px-2 py-1 text-xs font-medium text-[#6B6258] transition hover:border-[#C15F3D]/50 hover:bg-[#F9EFE9] hover:text-[#C15F3D] disabled:opacity-50 dark:border-[#38312C] dark:bg-[#1F1A18] dark:text-[#B5A89B] dark:hover:border-[#DA7756]/50 dark:hover:text-[#DA7756] cursor-pointer"
              title={t.seedInput.attachFiles}
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>{t.seedInput.attachFiles}</span>
              {attachments.length > 0 && (
                <span className="ml-0.5 rounded-full bg-[#C15F3D]/10 px-1.5 py-0.2 text-[10px] font-bold text-[#C15F3D] dark:bg-[#DA7756]/20 dark:text-[#DA7756]">
                  {attachments.length}/{maxFiles}
                </span>
              )}
            </button>

            {attachments.length > 0 && onDeconstruct && (
              <button
                type="button"
                onClick={onDeconstruct}
                disabled={disabled || isLoading || isDeconstructing}
                className="inline-flex items-center gap-1 rounded border border-[#C15F3D]/30 bg-[#FDF6F0] px-2 py-1 text-xs font-medium text-[#C15F3D] transition hover:bg-[#C15F3D] hover:text-white disabled:opacity-50 dark:border-[#DA7756]/30 dark:bg-[#33231D] dark:text-[#DA7756] dark:hover:bg-[#DA7756] dark:hover:text-white cursor-pointer"
                title={t.seedInput.deconstructPrompt}
              >
                {isDeconstructing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t.seedInput.deconstructing}</span>
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-3.5 w-3.5" />
                    <span>{t.seedInput.deconstructPrompt}</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-[11px] text-[#8E8377] dark:text-[#7E7368]">
              {t.seedInput.shortcutHint.replace('{shortcut}', 'Ctrl+Enter')}
            </p>

            <button
              type="button"
              onClick={onGenerateQuestions}
              disabled={(!seed.trim() && attachments.length === 0) || isLoading || disabled || isDeconstructing}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#C15F3D] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#A94E30] active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#DA7756] dark:hover:bg-[#C15F3D] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t.seedInput.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.seedInput.generateQuestions}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {selectedDomain.examples && selectedDomain.examples.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-[#8E8377] dark:text-[#7E7368]">
            {t.seedInput.examplePrompt}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedDomain.examples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                disabled={disabled || isLoading || isDeconstructing}
                onClick={() => onChangeSeed(example)}
                className="rounded-md border border-[#E6DFD3] bg-[#F5F0E6]/60 px-2 py-1 text-left text-xs text-[#6B6258] transition hover:border-[#C15F3D]/50 hover:bg-[#F9EFE9] hover:text-[#C15F3D] disabled:opacity-50 dark:border-[#38312C] dark:bg-[#1F1A18] dark:text-[#B5A89B] dark:hover:border-[#DA7756]/50 dark:hover:bg-[#33231D] dark:hover:text-[#DA7756] cursor-pointer"
              >
                &ldquo;{example.length > 60 ? `${example.slice(0, 60)}...` : example}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

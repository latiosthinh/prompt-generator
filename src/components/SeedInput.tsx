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
import { Attachment, PinnedAttributes } from '@/types/schemas';

interface SeedInputProps {
  seed: string;
  onChangeSeed: (val: string) => void;
  selectedDomain: DomainConfig;
  pinnedAttributes?: PinnedAttributes;
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
  pinnedAttributes = {},
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
  const maxRecommended = 2000;
  const maxFiles = 5;
  const maxSizeBytes = 100 * 1024 * 1024; // 100MB limit

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if ((seed.trim() || attachments.length > 0) && !isLoading && !disabled && !isDeconstructing) {
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

  // Active pinned attribute badges
  const activePins = Object.entries(pinnedAttributes).filter(([, val]) => !!val);

  return (
    <div className="w-full space-y-2">
      {/* Command Composer Container (Option 1 TALL Style) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border transition-all duration-150 p-3 shadow-xl ${
          isDragging
            ? 'border-[#DA7756] bg-[#33231D] ring-2 ring-[#DA7756]/40'
            : 'border-[#38312C] bg-[#1E1917] focus-within:border-[#DA7756] focus-within:ring-1 focus-within:ring-[#DA7756]/40'
        }`}
      >
        {/* Top Token Pills & Ingested Files inside Command Box */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-[#2B2520]/80">
          <span className="px-2 py-0.5 rounded-sm bg-[#DA7756]/20 border border-[#DA7756]/40 text-[#DA7756] text-[11px] font-mono font-bold">
            /{selectedDomain.id}
          </span>

          {activePins.map(([key, val]) => (
            <span
              key={key}
              className="px-2 py-0.5 rounded-sm bg-[#241F1C] border border-[#38312C] text-[#B5A89B] text-[11px] font-mono"
            >
              :{key} {String(val)}
            </span>
          ))}

          {/* Attached File Chips */}
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#241F1C] border border-[#38312C] text-[11px] text-[#EDE5DC]"
            >
              {att.dataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="h-3.5 w-3.5 rounded object-cover"
                />
              ) : (
                <FileText className="h-3 w-3 text-[#DA7756]" />
              )}
              <span className="max-w-[110px] truncate font-mono text-[10px]" title={att.name}>
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                disabled={disabled || isLoading || isDeconstructing}
                className="hover:text-red-400 text-[10px] ml-0.5 cursor-pointer"
                aria-label={`Remove ${att.name}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* Reverse Deconstruct Button (Visible when files attached) */}
          {attachments.length > 0 && onDeconstruct && (
            <button
              type="button"
              onClick={onDeconstruct}
              disabled={disabled || isLoading || isDeconstructing}
              className="px-2 py-0.5 rounded-sm bg-[#241F1C] hover:bg-[#DA7756] hover:text-white border border-[#38312C] text-[10px] text-[#DA7756] font-semibold transition flex items-center gap-1 ml-auto cursor-pointer"
              title={t.seedInput.deconstructPrompt}
            >
              {isDeconstructing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{t.seedInput.deconstructing}</span>
                </>
              ) : (
                <>
                  <ScanSearch className="h-3 w-3" />
                  <span>{t.seedInput.deconstructPrompt}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Big/TALL Textarea */}
        <textarea
          id="seed-textarea"
          value={seed}
          onChange={(e) => onChangeSeed(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedDomain.placeholder}
          disabled={disabled || isLoading || isDeconstructing}
          className="w-full min-h-[90px] md:min-h-[110px] max-h-[220px] resize-y rounded bg-transparent p-1.5 text-xs sm:text-sm leading-relaxed text-[#EDE5DC] placeholder:text-[#8E8377] focus:outline-hidden font-mono"
        />

        {/* Drag active overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#1E1917]/95 rounded-xl flex flex-col items-center justify-center pointer-events-none z-10">
            <UploadCloud className="h-9 w-9 text-[#DA7756] animate-bounce" />
            <p className="mt-1.5 text-xs font-bold text-[#DA7756]">
              {t.seedInput.dragActive}
            </p>
          </div>
        )}

        {errorMessage && (
          <p className="px-1 py-1 text-xs font-medium text-red-400">
            {errorMessage}
          </p>
        )}

        {/* Bottom Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2B2520]/80">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*,.txt,.md,.json,.pdf,.doc,.docx,.yaml,.yml,.csv"
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
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#38312C] bg-[#241F1C] px-2.5 py-1 text-xs font-medium text-[#B5A89B] hover:border-[#DA7756] hover:text-[#EDE5DC] transition cursor-pointer disabled:opacity-50"
              title={t.seedInput.attachFiles}
            >
              <Paperclip className="h-3.5 w-3.5 text-[#DA7756]" />
              <span>{t.seedInput.attachFiles}</span>
              {attachments.length > 0 && (
                <span className="ml-0.5 rounded-full bg-[#DA7756]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#DA7756]">
                  {attachments.length}/{maxFiles}
                </span>
              )}
            </button>
            <span className="text-[10px] text-[#8E8377] font-mono hidden sm:inline">
              {charCount} / {maxRecommended} chars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8E8377] font-mono hidden md:inline">
              {t.seedInput.shortcutHint.replace('{shortcut}', 'Ctrl+Enter')}
            </span>

            <button
              type="button"
              onClick={onGenerateQuestions}
              disabled={(!seed.trim() && attachments.length === 0) || isLoading || disabled || isDeconstructing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#DA7756] to-[#C15F3D] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:opacity-95 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t.seedInput.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.seedInput.generateQuestions}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

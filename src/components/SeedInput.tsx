'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { DomainConfig } from '@/config/domains';
import { Translations } from '@/i18n';

interface SeedInputProps {
  seed: string;
  onChangeSeed: (val: string) => void;
  selectedDomain: DomainConfig;
  onGenerateQuestions: () => void;
  isLoading: boolean;
  disabled?: boolean;
  t: Translations;
}

export function SeedInput({
  seed,
  onChangeSeed,
  selectedDomain,
  onGenerateQuestions,
  isLoading,
  disabled = false,
  t,
}: SeedInputProps) {
  const charCount = seed.length;
  const maxRecommended = 1000;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (seed.trim() && !isLoading && !disabled) {
        onGenerateQuestions();
      }
    }
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

      <div className="relative rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-2 shadow-2xs focus-within:border-[#C15F3D] focus-within:ring-1 focus-within:ring-[#C15F3D]/20 dark:border-[#38312C] dark:bg-[#282320]">
        <textarea
          id="seed-textarea"
          value={seed}
          onChange={(e) => onChangeSeed(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedDomain.placeholder}
          disabled={disabled || isLoading}
          className="w-full min-h-[400px] resize-y rounded bg-transparent p-2 text-sm leading-relaxed text-[#2B2520] placeholder:text-[#8E8377] focus:outline-hidden dark:text-[#EDE5DC] dark:placeholder:text-[#7E7368]"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD3]/60 pt-2 px-1 dark:border-[#38312C]/60">
          <p className="text-[11px] text-[#8E8377] dark:text-[#7E7368]">
            {t.seedInput.shortcutHint.replace('{shortcut}', 'Ctrl+Enter')}
          </p>

          <button
            type="button"
            onClick={onGenerateQuestions}
            disabled={!seed.trim() || isLoading || disabled}
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
                disabled={disabled || isLoading}
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

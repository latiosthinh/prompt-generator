'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, Wand2, Plus, CornerDownLeft } from 'lucide-react';
import { Question, UserAnswer } from '@/types/schemas';
import { Translations } from '@/i18n';

interface QuestionCardProps {
  question: Question;
  index: number;
  answer?: UserAnswer;
  onChangeAnswer: (answer: UserAnswer) => void;
  disabled?: boolean;
  t: Translations;
}

export function QuestionCard({
  question,
  index,
  answer,
  onChangeAnswer,
  disabled = false,
  t,
}: QuestionCardProps) {
  const selectedOptionIds = answer?.selectedOptionIds || [];
  const customText = answer?.customText || '';
  const isMulti = question.type === 'multi';

  const [showOtherInput, setShowOtherInput] = useState<boolean>(() => Boolean(customText.trim()));
  const [localOtherText, setLocalOtherText] = useState<string>(customText);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external answer customText to local input state if updated externally
  useEffect(() => {
    setLocalOtherText(customText);
    if (customText.trim()) {
      setShowOtherInput(true);
    }
  }, [customText]);

  // Focus input when toggled on
  useEffect(() => {
    if (showOtherInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showOtherInput]);

  const handleSelectOption = (optId: string) => {
    if (disabled) return;

    if (isMulti) {
      const alreadySelected = selectedOptionIds.includes(optId);
      const newSelected = alreadySelected
        ? selectedOptionIds.filter((id) => id !== optId)
        : [...selectedOptionIds, optId];

      onChangeAnswer({
        questionId: question.id,
        selectedOptionIds: newSelected,
        customText: localOtherText,
      });
    } else {
      // Single choice
      const isAlreadyActive = selectedOptionIds.length === 1 && selectedOptionIds[0] === optId;
      onChangeAnswer({
        questionId: question.id,
        selectedOptionIds: isAlreadyActive ? [] : [optId],
        customText: localOtherText,
      });
    }
  };

  const handleLetAiDecide = () => {
    if (disabled) return;
    onChangeAnswer({
      questionId: question.id,
      selectedOptionIds: [],
      customText: '',
    });
    setShowOtherInput(false);
    setLocalOtherText('');
  };

  const handleOtherBlur = () => {
    onChangeAnswer({
      questionId: question.id,
      selectedOptionIds,
      customText: localOtherText.trim(),
    });
  };

  const handleOtherKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleOtherBlur();
    }
  };

  const isAiDecided = selectedOptionIds.length === 0 && !customText.trim() && !showOtherInput;

  return (
    <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-4 shadow-2xs transition dark:border-[#38312C] dark:bg-[#282320]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#F9EFE9] font-mono text-[11px] font-bold text-[#C15F3D] dark:bg-[#33231D] dark:text-[#DA7756]">
            {index + 1}
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-[#2B2520] dark:text-[#EDE5DC]">
            {question.text}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="rounded-sm bg-[#F5F0E6] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#8E8377] dark:bg-[#1F1A18] dark:text-[#7E7368]">
            {isMulti ? t.questionCard.multiChoice : t.questionCard.singleChoice}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={handleLetAiDecide}
            title={t.questionCard.aiDecideTooltip}
            className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium transition cursor-pointer disabled:opacity-50 ${
              isAiDecided
                ? 'bg-[#F9EFE9] text-[#C15F3D] font-semibold dark:bg-[#33231D] dark:text-[#DA7756]'
                : 'text-[#8E8377] hover:bg-[#F5F0E6] hover:text-[#2B2520] dark:text-[#7E7368] dark:hover:bg-[#1F1A18] dark:hover:text-[#EDE5DC]'
            }`}
          >
            <Wand2 className="h-3 w-3" />
            <span>{t.questionCard.aiDecide}</span>
          </button>
        </div>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
        {question.options.map((opt) => {
          const isSelected = selectedOptionIds.includes(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectOption(opt.id)}
              className={`flex items-start gap-2.5 rounded-md border p-2 text-left text-xs transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-[#C15F3D] bg-[#F9EFE9] font-medium text-[#2B2520] dark:border-[#DA7756] dark:bg-[#33231D] dark:text-[#EDE5DC]'
                  : 'border-[#E6DFD3] bg-[#FBF9F5] text-[#6B6258] hover:border-[#D5CCBE] hover:bg-[#F3EFE6] dark:border-[#38312C] dark:bg-[#191614] dark:text-[#B5A89B] dark:hover:border-[#4A413B] dark:hover:bg-[#221D1A]'
              }`}
            >
              <div
                className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs transition-colors ${
                  isMulti ? 'rounded-xs' : 'rounded-full'
                } ${
                  isSelected
                    ? 'bg-[#C15F3D] text-white dark:bg-[#DA7756]'
                    : 'border border-[#D5CCBE] bg-white dark:border-[#4A413B] dark:bg-[#282320]'
                }`}
              >
                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
              <div className="flex flex-col">
                <span className="leading-snug">{opt.label}</span>
                {opt.description && (
                  <span className="text-[10px] text-[#8E8377] dark:text-[#7E7368] mt-0.5 leading-tight">
                    {opt.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Other Text Section */}
      {question.allowOther && (
        <div className="mt-2.5 pt-2 border-t border-[#E6DFD3]/60 dark:border-[#38312C]/60">
          {!showOtherInput ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowOtherInput(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#C15F3D] hover:text-[#A94E30] font-medium cursor-pointer disabled:opacity-50 dark:text-[#DA7756]"
            >
              <Plus className="h-3 w-3" />
              <span>{t.questionCard.addCustom}</span>
            </button>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#8E8377] dark:text-[#7E7368]">
                {t.questionCard.customLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={localOtherText}
                  onChange={(e) => setLocalOtherText(e.target.value)}
                  onBlur={handleOtherBlur}
                  onKeyDown={handleOtherKeyDown}
                  placeholder={t.questionCard.customPlaceholder}
                  disabled={disabled}
                  className="w-full rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1 pr-7 text-xs text-[#2B2520] placeholder:text-[#8E8377] focus:border-[#C15F3D] focus:outline-hidden dark:border-[#38312C] dark:bg-[#191614] dark:text-[#EDE5DC]"
                />
                <button
                  type="button"
                  onClick={handleOtherBlur}
                  className="absolute right-2 text-[#8E8377] hover:text-[#2B2520] dark:hover:text-white cursor-pointer"
                  title={t.questionCard.confirm}
                >
                  <CornerDownLeft className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

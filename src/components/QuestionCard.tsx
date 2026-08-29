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

  useEffect(() => {
    setLocalOtherText(customText);
    if (customText.trim()) {
      setShowOtherInput(true);
    }
  }, [customText]);

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
    <div className="rounded-xl border border-[#38312C] bg-[#1E1917] p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#DA7756]/20 font-mono text-[11px] font-bold text-[#DA7756]">
            {index + 1}
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-[#EDE5DC]">
            {question.text}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="rounded-sm bg-[#241F1C] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#8E8377]">
            {isMulti ? t.questionCard.multiChoice : t.questionCard.singleChoice}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={handleLetAiDecide}
            title={t.questionCard.aiDecideTooltip}
            className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium transition cursor-pointer disabled:opacity-50 ${
              isAiDecided
                ? 'bg-[#DA7756]/20 text-[#DA7756] font-semibold'
                : 'text-[#8E8377] hover:bg-[#241F1C] hover:text-[#EDE5DC]'
            }`}
          >
            <Wand2 className="h-3 w-3" />
            <span>{t.questionCard.aiDecide}</span>
          </button>
        </div>
      </div>

      {/* Options grid (Option 4 Pill Card style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt) => {
          const isSelected = selectedOptionIds.includes(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectOption(opt.id)}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left text-xs transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-[#DA7756] bg-[#DA7756] text-white font-bold shadow-xs'
                  : 'border-[#38312C] bg-[#241F1C] text-[#B5A89B] hover:border-[#DA7756] hover:text-[#EDE5DC]'
              }`}
            >
              <div
                className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs transition-colors ${
                  isMulti ? 'rounded-xs' : 'rounded-full'
                } ${
                  isSelected
                    ? 'bg-white text-[#DA7756]'
                    : 'border border-[#4A413B] bg-[#1E1917]'
                }`}
              >
                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
              <div className="flex flex-col">
                <span className="leading-snug">{opt.label}</span>
                {opt.description && (
                  <span className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-white/80' : 'text-[#8E8377]'}`}>
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
        <div className="pt-2 border-t border-[#2B2520]">
          {!showOtherInput ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowOtherInput(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#DA7756] hover:underline font-medium cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              <span>{t.questionCard.addCustom}</span>
            </button>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#8E8377]">
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
                  className="w-full rounded-md border border-[#38312C] bg-[#14110F] px-2.5 py-1 pr-7 text-xs text-[#EDE5DC] placeholder:text-[#8E8377] focus:border-[#DA7756] focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={handleOtherBlur}
                  className="absolute right-2 text-[#8E8377] hover:text-white cursor-pointer"
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

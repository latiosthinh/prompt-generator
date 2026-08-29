'use client';

import React from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { Question, UserAnswer } from '@/types/schemas';
import { ArrowRight, Wand2, RefreshCw, Loader2 } from 'lucide-react';
import { Translations } from '@/i18n';

interface QuestionnaireFormProps {
  questions: Question[];
  analysis?: string;
  answers: UserAnswer[];
  onChangeAnswer: (answer: UserAnswer) => void;
  onSetAllAiDecide: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting: boolean;
  t: Translations;
}

export function QuestionnaireForm({
  questions,
  analysis,
  answers,
  onChangeAnswer,
  onSetAllAiDecide,
  onSubmit,
  onReset,
  isSubmitting,
  t,
}: QuestionnaireFormProps) {
  const answerMap = new Map<string, UserAnswer>(answers.map((a) => [a.questionId, a]));

  const answeredCount = answers.filter(
    (a) => (a.selectedOptionIds && a.selectedOptionIds.length > 0) || (a.customText && a.customText.trim().length > 0)
  ).length;

  return (
    <div className="w-full space-y-4">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#38312C] bg-[#1E1917] p-3.5 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#FBF9F5]">
            {t.questionnaire.title}
          </h2>
          {analysis ? (
            <p className="text-xs text-[#8E8377] mt-0.5 max-w-xl">
              {analysis}
            </p>
          ) : (
            <p className="text-xs text-[#8E8377] mt-0.5">
              {t.questionnaire.defaultSubtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onSetAllAiDecide}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#38312C] bg-[#241F1C] px-2.5 py-1 text-xs font-semibold text-[#EDE5DC] hover:border-[#DA7756] hover:text-[#DA7756] disabled:opacity-50 cursor-pointer transition"
          >
            <Wand2 className="h-3 w-3 text-[#DA7756]" />
            <span>{t.questionnaire.aiDecideAll}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#38312C] bg-[#241F1C] px-2.5 py-1 text-xs font-semibold text-[#EDE5DC] hover:border-[#DA7756] disabled:opacity-50 cursor-pointer transition"
          >
            <RefreshCw className="h-3 w-3 text-[#8E8377]" />
            <span>{t.questionnaire.reset}</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            answer={answerMap.get(q.id)}
            onChangeAnswer={onChangeAnswer}
            disabled={isSubmitting}
            t={t}
          />
        ))}
      </div>

      {/* Submission Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2B2520] pt-3">
        <div className="text-xs text-[#8E8377] font-mono">
          {t.questionnaire.answeredProgress
            .replace('{answered}', String(answeredCount))
            .replace('{total}', String(questions.length))}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#DA7756] to-[#C15F3D] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:opacity-95 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t.questionnaire.generatingPrompt}</span>
            </>
          ) : (
            <>
              <span>{t.questionnaire.generatePrompt}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

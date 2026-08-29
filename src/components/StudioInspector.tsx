'use client';

import React, { useState } from 'react';
import { DomainConfig, getDomainPinnedAttributes } from '@/config/domains';
import { PinnedAttributes } from '@/types/schemas';
import { Translations } from '@/i18n';
import { Sliders, BookOpen, Layers } from 'lucide-react';

interface StudioInspectorProps {
  domain: DomainConfig;
  pinnedAttributes: PinnedAttributes;
  onChangePinnedAttributes: (next: PinnedAttributes) => void;
  onAppendCheatKeyword?: (kw: string) => void;
  disabled?: boolean;
  locale: string;
  t: Translations;
}

export function StudioInspector({
  domain,
  pinnedAttributes,
  onChangePinnedAttributes,
  onAppendCheatKeyword,
  disabled = false,
  locale,
  t,
}: StudioInspectorProps) {
  const [activeTab, setActiveTab] = useState<'params' | 'cheats'>('params');
  const isVi = locale === 'vi';

  const allGroups = getDomainPinnedAttributes(t);
  const groups = allGroups[domain.id] || [];

  const handleToggleAttribute = (key: keyof PinnedAttributes, val: string) => {
    if (disabled) return;
    const next = { ...pinnedAttributes };
    if (next[key] === val) {
      delete next[key];
    } else {
      next[key] = val;
    }
    onChangePinnedAttributes(next);
  };

  const getVocabularyForDomain = () => {
    switch (domain.id) {
      case 'image-generation':
        return [
          'Volumetric lighting',
          'Golden hour',
          'Cinematic 35mm',
          'Octane render 8k',
          'Unreal Engine 5',
          'Rim light',
          'Macro f/1.4',
          'Hyperrealistic',
        ];
      case 'video-generation':
        return [
          '+ FPV Drone Dive',
          '+ 360° Orbit Arc',
          '+ Dolly Vertigo Zoom',
          '+ Volumetric Mist',
          '+ Golden Hour Dusk',
          '+ 180° Shutter Blur',
          '+ 60fps Slow Motion',
        ];
      case 'coding-tech':
        return [
          'TypeScript Strict',
          'Zod Validation',
          'Zero Runtime Panic',
          'Clean Architecture',
          'Idempotent API',
          'TDD Test Harness',
        ];
      case 'creative-writing':
        return [
          'PAS Hook Framework',
          'AIDA Structure',
          'Socratic Tone',
          'Punchy & Concise',
          'High Conversion',
        ];
      case 'agents-system':
        return [
          'ReAct Loop',
          'Strict JSON Output',
          'Safety Guardrails',
          'Tool Calling Contract',
          'Self-Verification Checklist',
        ];
      default:
        return [
          'Step-by-step Framework',
          'CRISPE Structure',
          'Clear Constraints',
          'Actionable Output',
        ];
    }
  };

  return (
    <aside className="w-80 border-l border-[#2B2520] bg-[#14110F] flex flex-col shrink-0 overflow-hidden select-none">
      {/* Inspector Top Tabs */}
      <div className="h-10 border-b border-[#2B2520] flex items-center bg-[#191614] text-xs font-semibold shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('params')}
          className={`flex-1 h-full flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'params'
              ? 'border-b-2 border-[#DA7756] text-[#EDE5DC]'
              : 'text-[#8E8377] hover:text-[#EDE5DC]'
          }`}
        >
          <Sliders className="h-3 w-3 text-[#DA7756]" />
          <span>{isVi ? 'Tham số' : 'Parameters'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cheats')}
          className={`flex-1 h-full flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'cheats'
              ? 'border-b-2 border-[#DA7756] text-[#EDE5DC]'
              : 'text-[#8E8377] hover:text-[#EDE5DC]'
          }`}
        >
          <BookOpen className="h-3 w-3 text-[#DA7756]" />
          <span>{isVi ? 'Tra cứu' : 'Cheatsheet'}</span>
        </button>
      </div>

      {/* Inspector Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {activeTab === 'params' ? (
          <div className="space-y-3.5">
            {groups.length > 0 ? (
              groups.map((group) => {
                const currentValue = pinnedAttributes[group.key as keyof PinnedAttributes];

                return (
                  <div key={group.key} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#8E8377] uppercase tracking-wider">
                      {group.label}
                    </label>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                      {group.options.map((opt) => {
                        const isSelected = currentValue === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              handleToggleAttribute(group.key as keyof PinnedAttributes, opt.value)
                            }
                            aria-pressed={isSelected}
                            className={`rounded-sm px-2 py-1 transition cursor-pointer disabled:opacity-50 ${
                              isSelected
                                ? 'bg-[#DA7756] text-white font-bold shadow-xs'
                                : 'border border-[#38312C] bg-[#1E1917] text-[#B5A89B] hover:border-[#DA7756] hover:text-[#EDE5DC]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-[#2B2520] bg-[#191614] p-3 text-center text-[#8E8377]">
                <p>{isVi ? 'Không có tham số ghim cho lĩnh vực này' : 'No pinned attributes for this domain'}</p>
              </div>
            )}
          </div>
        ) : (
          /* Cheatsheet & Vocabulary Tab */
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#8E8377] uppercase tracking-wider">
                {isVi ? 'Từ khóa gợi ý chuyên sâu' : 'Domain Keywords & Tags'}
              </div>
              <div className="flex flex-wrap gap-1">
                {getVocabularyForDomain().map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => onAppendCheatKeyword && onAppendCheatKeyword(kw)}
                    className="rounded-sm border border-[#38312C] bg-[#1E1917] px-2 py-1 text-[10px] text-[#EDE5DC] hover:border-[#DA7756] hover:bg-[#241F1C] transition cursor-pointer"
                    title={isVi ? 'Bấm để thêm vào ý tưởng' : 'Click to append to seed idea'}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#241F1C] space-y-1.5 text-xs text-[#8E8377]">
              <div className="flex items-center gap-1 font-bold text-[#EDE5DC] uppercase text-[11px]">
                <Layers className="h-3 w-3 text-[#DA7756]" />
                <span>{domain.name}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#B5A89B]">
                {domain.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

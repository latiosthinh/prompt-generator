'use client';

import React from 'react';
import { getDomainPinnedAttributes, PinnedAttributeGroup } from '@/config/domains';
import { PinnedAttributes } from '@/types/schemas';
import { Translations } from '@/i18n';
import { SlidersHorizontal } from 'lucide-react';

interface PinnedAttributesSelectorProps {
  domainId: string;
  value: PinnedAttributes;
  onChange: (next: PinnedAttributes) => void;
  disabled?: boolean;
  t: Translations;
}

export function PinnedAttributesSelector({
  domainId,
  value,
  onChange,
  disabled = false,
  t,
}: PinnedAttributesSelectorProps) {
  const allGroups = getDomainPinnedAttributes(t);
  const groups: PinnedAttributeGroup[] = allGroups[domainId] || [];

  if (groups.length === 0) {
    return null;
  }

  const handleToggle = (key: keyof PinnedAttributes, val: string) => {
    if (disabled) return;
    const next = { ...value };
    if (next[key] === val) {
      delete next[key];
    } else {
      next[key] = val;
    }
    onChange(next);
  };

  const activeCount = Object.keys(value).filter((k) => !!value[k as keyof PinnedAttributes]).length;

  return (
    <div className="space-y-2 rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-3 shadow-2xs dark:border-[#38312C] dark:bg-[#282320]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8E8377] dark:text-[#7E7368]">
          <SlidersHorizontal className="h-3 w-3 text-[#C15F3D] dark:text-[#DA7756]" />
          <span>{t.pinnedAttributes.title}</span>
        </div>
        {activeCount > 0 && (
          <span className="rounded-full bg-[#C15F3D]/10 px-2 py-0.5 text-[10px] font-bold text-[#C15F3D] dark:bg-[#DA7756]/20 dark:text-[#DA7756]">
            {activeCount} selected
          </span>
        )}
      </div>

      <div className="space-y-2 pt-1">
        {groups.map((group) => {
          const currentValue = value[group.key as keyof PinnedAttributes];

          return (
            <div key={group.key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
              <span className="min-w-[100px] shrink-0 text-[11px] font-medium text-[#6B6258] dark:text-[#B5A89B]">
                {group.label}:
              </span>
              <div className="flex flex-wrap gap-1">
                {group.options.map((opt) => {
                  const isSelected = currentValue === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleToggle(group.key as keyof PinnedAttributes, opt.value)}
                      aria-pressed={isSelected}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected
                          ? 'bg-[#C15F3D] text-white shadow-2xs dark:bg-[#DA7756]'
                          : 'border border-[#E6DFD3] bg-[#F5F0E6]/50 text-[#6B6258] hover:border-[#C15F3D]/50 hover:bg-[#FDF6F0] dark:border-[#38312C] dark:bg-[#1E1917] dark:text-[#B5A89B] dark:hover:border-[#DA7756]/50 dark:hover:bg-[#33231D]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

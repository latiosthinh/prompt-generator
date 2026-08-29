'use client';

import React from 'react';
import { getDomainPinnedAttributes, PinnedAttributeGroup } from '@/config/domains';
import { PinnedAttributes } from '@/types/schemas';
import { Translations } from '@/i18n';
import { Pin } from 'lucide-react';

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

  return (
    <div className="w-full space-y-2.5 rounded-md border border-[#E6DFD3] bg-[#FDFCF9] p-3 dark:border-[#38312C] dark:bg-[#1E1917]">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8E8377] dark:text-[#7E7368]">
        <Pin className="h-3 w-3 text-[#C15F3D] dark:text-[#DA7756]" />
        <span>{t.pinnedAttributes.title}</span>
      </div>

      <div className="space-y-2">
        {groups.map((group) => {
          const currentValue = value[group.key as keyof PinnedAttributes];

          return (
            <div key={group.key} className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="min-w-[110px] text-[11px] font-medium text-[#6B6258] dark:text-[#B5A89B]">
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
                      className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected
                          ? 'border-[#C15F3D] bg-[#C15F3D] text-white shadow-2xs dark:border-[#DA7756] dark:bg-[#DA7756]'
                          : 'border-[#E6DFD3] bg-[#FFFFFF] text-[#6B6258] hover:border-[#C15F3D]/40 hover:bg-[#F9EFE9] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B] dark:hover:border-[#DA7756]/40 dark:hover:bg-[#33231D]'
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

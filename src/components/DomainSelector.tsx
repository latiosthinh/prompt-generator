'use client';

import React from 'react';
import { Image, Video, Code, PenTool, Bot, Sparkles, LucideIcon } from 'lucide-react';
import { DomainConfig } from '@/config/domains';
import { Translations } from '@/i18n';

const ICON_MAP: Record<DomainConfig['iconName'], LucideIcon> = {
  Image,
  Video,
  Code,
  PenTool,
  Bot,
  Sparkles,
};

interface DomainSelectorProps {
  domains: DomainConfig[];
  selectedDomainId: string;
  onSelectDomain: (domainId: string) => void;
  disabled?: boolean;
  t: Translations;
}

export function DomainSelector({
  domains,
  selectedDomainId,
  onSelectDomain,
  disabled = false,
  t,
}: DomainSelectorProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E8377] dark:text-[#7E7368]">
          {t.domainSelector.label}
        </label>
      </div>

      {/* Modern pill tabs with Icon + Short Name */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 rounded-lg border border-[#E6DFD3] bg-[#F5F0E6]/50 dark:border-[#38312C] dark:bg-[#1E1917]">
        {domains.map((domain) => {
          const Icon = ICON_MAP[domain.iconName];
          const isSelected = domain.id === selectedDomainId;

          // Short label formatting
          const shortName = domain.name.split('(')[0].trim();

          return (
            <button
              key={domain.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDomain(domain.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-left ${
                isSelected
                  ? 'bg-[#C15F3D] text-white shadow-2xs dark:bg-[#DA7756] dark:text-white'
                  : 'bg-transparent text-[#6B6258] hover:bg-[#FFFFFF] hover:text-[#2B2520] dark:text-[#B5A89B] dark:hover:bg-[#282320] dark:hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#8E8377] dark:text-[#7E7368]'}`} />
              <span className="truncate">{shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

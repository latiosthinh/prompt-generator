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
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8377] dark:text-[#7E7368]">
        {t.domainSelector.label}
      </label>
      <div className="flex items-center gap-2">
        {domains.map((domain) => {
          const Icon = ICON_MAP[domain.iconName];
          const isSelected = domain.id === selectedDomainId;

          return (
            <div key={domain.id} className="relative group/tooltip flex-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelectDomain(domain.id)}
                aria-label={domain.name}
                className={`w-full flex items-center justify-center p-2.5 rounded-md border transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? 'border-[#C15F3D] bg-[#C15F3D] text-white shadow-2xs dark:border-[#DA7756] dark:bg-[#DA7756] dark:text-white'
                    : 'border-[#E6DFD3] bg-[#FFFFFF] hover:border-[#D5CCBE] hover:bg-[#F5F0E6] text-[#6B6258] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B] dark:hover:border-[#4A413B] dark:hover:bg-[#332A26]'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>

              {/* Floating Vintage Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-150 ease-out z-50 transform group-hover/tooltip:-translate-y-0.5">
                <div className="rounded-md border border-[#E6DFD3] bg-[#2B2520] p-2 text-center shadow-lg dark:border-[#4A413B] dark:bg-[#191614]">
                  <p className="text-xs font-semibold text-[#FBF9F5] leading-tight">
                    {domain.name}
                  </p>
                  <p className="mt-1 text-[10px] text-[#B5A89B] leading-snug">
                    {domain.description}
                  </p>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#2B2520] dark:border-t-[#191614]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

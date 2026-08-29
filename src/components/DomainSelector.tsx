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
}: DomainSelectorProps) {
  return (
    <div className="flex items-center p-1 rounded-xl bg-[#1E1917] border border-[#38312C] gap-1 text-xs">
      {domains.map((domain) => {
        const Icon = ICON_MAP[domain.iconName];
        const isSelected = domain.id === selectedDomainId;
        const shortName = domain.name.split('(')[0].trim();

        return (
          <button
            key={domain.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectDomain(domain.id)}
            aria-pressed={isSelected}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? 'bg-[#DA7756] text-white font-bold shadow-xs'
                : 'text-[#8E8377] hover:text-[#EDE5DC]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate">{shortName}</span>
          </button>
        );
      })}
    </div>
  );
}

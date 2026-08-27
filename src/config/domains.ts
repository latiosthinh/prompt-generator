import { Translations } from '@/i18n';

export interface DomainConfig {
  id: string;
  name: string;
  description: string;
  iconName: 'Image' | 'Code' | 'PenTool' | 'Bot' | 'Sparkles';
  examples: string[];
  placeholder: string;
}

export function getDomains(t: Translations): DomainConfig[] {
  return [
    {
      id: 'image-generation',
      name: t.domains.image.name,
      description: t.domains.image.description,
      iconName: 'Image',
      examples: t.domains.image.examples,
      placeholder: t.domains.image.placeholder,
    },
    {
      id: 'coding-tech',
      name: t.domains.code.name,
      description: t.domains.code.description,
      iconName: 'Code',
      examples: t.domains.code.examples,
      placeholder: t.domains.code.placeholder,
    },
    {
      id: 'creative-writing',
      name: t.domains.writing.name,
      description: t.domains.writing.description,
      iconName: 'PenTool',
      examples: t.domains.writing.examples,
      placeholder: t.domains.writing.placeholder,
    },
    {
      id: 'agents-system',
      name: t.domains.agent.name,
      description: t.domains.agent.description,
      iconName: 'Bot',
      examples: t.domains.agent.examples,
      placeholder: t.domains.agent.placeholder,
    },
    {
      id: 'custom-general',
      name: t.domains.custom.name,
      description: t.domains.custom.description,
      iconName: 'Sparkles',
      examples: t.domains.custom.examples,
      placeholder: t.domains.custom.placeholder,
    },
  ];
}

export const DOMAINS = getDomains(require('@/i18n/vi').vi);

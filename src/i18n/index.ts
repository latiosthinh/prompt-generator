import { vi, Translations } from './vi';
import { en } from './en';

export type Locale = 'vi' | 'en';

export const dictionaries: Record<Locale, Translations> = {
  vi,
  en,
};

export const defaultLocale: Locale = 'vi';

export function getDictionary(locale: Locale = defaultLocale): Translations {
  return dictionaries[locale] || vi;
}

export const t = getDictionary(defaultLocale);
export { vi, en };
export type { Translations };

import { formatDistanceToNow, format } from 'date-fns';
import { enUS, es, fr, ar } from 'date-fns/locale';

const locales: Record<string, any> = {
  en: enUS,
  es: es,
  fr: fr,
  ar: ar,
};

export const getLocale = (lang: string) => {
  return locales[lang] || enUS;
};

export const formatTimeAgo = (date: string | Date, lang: string) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: getLocale(lang) 
  });
};

export const formatDate = (date: string | Date, lang: string, formatStr: string = 'PPP') => {
  return format(new Date(date), formatStr, {
    locale: getLocale(lang)
  });
};

import pt from './i18n/pt.json';
import en from './i18n/en.json';

export type Language = 'pt' | 'en';

const DICTIONARY = {
  pt,
  en,
};

export function getT(lang: Language = 'pt') {
  const dict = DICTIONARY[lang] || DICTIONARY.pt;

  return function t(key: string): string {
    const keys = key.split('.');
    let result: any = dict;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  };
}

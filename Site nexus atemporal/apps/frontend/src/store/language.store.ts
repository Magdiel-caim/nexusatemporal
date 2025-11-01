import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

type Language = 'pt-BR' | 'en-US';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'pt-BR',
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

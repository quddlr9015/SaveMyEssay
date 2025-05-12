'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '@/components/LanguageSelector';

interface LanguageState {
    language: Language;
    setLanguage: (language: Language) => void;
    isFirstVisit: boolean;
}

const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.toLowerCase();
    const languageMap: Record<string, Language> = {
        'ko': 'Korean',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'vi': 'Vietnamese',
        'th': 'Thai',
        'id': 'Indonesian',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian'
    };
    const langCode = browserLang.split('-')[0];
    return languageMap[langCode] || 'English';
};

export const useLanguage = create<LanguageState>()(
    persist(
        (set) => ({
            language: getBrowserLanguage(),
            isFirstVisit: true,
            setLanguage: (language) => set({ language, isFirstVisit: false }),
        }),
        {
            name: 'language-storage',
            partialize: (state) => ({
                language: state.language,
                isFirstVisit: state.isFirstVisit,
            }),
        }
    )
); 
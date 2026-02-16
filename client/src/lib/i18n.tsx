import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    formatPrice: (amount: number | string) => string;
    dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to Arabic
    const [language, setLanguageState] = useState<Language>('ar');

    useEffect(() => {
        // Update HTML attributes dynamically
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.documentElement.dir = dir;

        // Update fonts based on language
        if (language === 'ar') {
            document.body.style.fontFamily = '"Cairo", system-ui, sans-serif';
        } else {
            document.body.style.fontFamily = '"Inter", system-ui, sans-serif'; // Or any other EN font
        }
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    // Load saved language on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const t = (key: TranslationKey) => {
        return (translations[language] as any)[key] || key;
    };

    const formatPrice = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        const formatted = (num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return language === 'ar' ? `${formatted} ر.س` : `${formatted} R.S`;
    };

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, formatPrice, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

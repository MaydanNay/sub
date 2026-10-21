import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('shuschool_lang') || 'ru');

    useEffect(() => {
        localStorage.setItem('shuschool_lang', lang);
        // Also update HTML lang attribute
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key) => {
        if (!translations[lang]) return key;
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

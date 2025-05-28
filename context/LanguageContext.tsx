import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

// Define supported languages here
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  ar: 'العربية' // Added Arabic
};
export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translations: Record<string, string>;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const storedLang = localStorage.getItem('appLanguage') as LanguageCode;
    return storedLang && SUPPORTED_LANGUAGES[storedLang] ? storedLang : 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const loadTranslations = useCallback(async (lang: LanguageCode) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}: ${response.statusText} (${response.status})`);
      }
      const textData = await response.text(); // Read as text first
      try {
        const jsonData = JSON.parse(textData); // Then parse
        setTranslations(jsonData);
      } catch (jsonParseError) {
        console.error(`Error parsing JSON for ${lang} at ${new Date().toISOString()}:`, jsonParseError);
        // Log a portion of the text to help identify issues, especially near the error.
        // The error object from JSON.parse might have line/column, but this gives raw context.
        if (jsonParseError instanceof SyntaxError && (jsonParseError as any).message) {
            const match = (jsonParseError as any).message.match(/position (\d+)/);
            if (match && match[1]) {
                const position = parseInt(match[1], 10);
                const contextChars = 100; // Show 100 chars before and after
                const start = Math.max(0, position - contextChars);
                const end = Math.min(textData.length, position + contextChars);
                console.error(`Problematic JSON text around position ${position} for ${lang}: \n...${textData.substring(start, end)}...`);
            } else {
                 console.error(`Problematic JSON text (first 500 chars) for ${lang}: \n${textData.substring(0, 500)}...`);
            }
        } else {
             console.error(`Problematic JSON text (first 500 chars) for ${lang}: \n${textData.substring(0, 500)}...`);
        }
        throw jsonParseError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Fallback to English if current lang fails to load, but not if English itself fails
      if (lang !== 'en') {
        console.warn("Falling back to English translations.");
        // Attempt to load English translations if the current language fails
        try {
            const enResponse = await fetch('/locales/en.json');
            if (!enResponse.ok) throw new Error('Failed to load English fallback (HTTP error).');
            const enTextData = await enResponse.text();
            try {
                const enJsonData = JSON.parse(enTextData);
                setTranslations(enJsonData);
            } catch (enJsonParseError) {
                console.error("Critical error: Failed to parse English fallback translations.", enJsonParseError);
                setTranslations({}); // No translations available
            }
        } catch (enFetchError) {
            console.error("Critical error: Failed to fetch English fallback translations.", enFetchError);
            setTranslations({}); // No translations available
        }
      } else {
        // If English itself fails, there's little we can do but clear translations
        console.error("Critical error: English translations failed to load or parse.");
        setTranslations({}); 
      }
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  const setLanguage = (lang: LanguageCode) => {
    if (SUPPORTED_LANGUAGES[lang]) {
      setLanguageState(lang);
      localStorage.setItem('appLanguage', lang);
    } else {
      console.warn(`Attempted to set unsupported language: ${lang}`);
    }
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[key] || key; // Fallback to key if not found
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  }, [translations]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};

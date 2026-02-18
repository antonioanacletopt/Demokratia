'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    nav: {
      home: 'Início',
      dashboard: 'Dashboard',
      explorer: 'Explorador',
      simulations: 'Simulações',
      factCheck: 'Fact Check',
      legislation: 'Legislação',
      proposals: 'Propostas',
      contact: 'Contacto',
      profile: 'Perfil',
      admin: 'Admin',
      login: 'Iniciar Sessão',
      logout: 'Sair',
      terms: 'Termos de Utilização',
      privacy: 'Privacidade e Cookies'
    },
    common: {
      loading: 'A carregar...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Apagar',
      edit: 'Editar',
      search: 'Pesquisar...',
      noResults: 'Nenhum resultado encontrado.',
      view: 'Ver',
      back: 'Voltar',
      submit: 'Submeter',
      aiResponse: 'Resposta da IA',
      sources: 'Fontes Oficiais',
      share: 'Partilhar com a comunidade',
      error: 'Ocorreu um erro.',
      success: 'Sucesso!',
      portuguese: 'Português',
      english: 'Inglês',
      language: 'Idioma'
    },
    home: {
      title: 'Feed de Atualizações',
      description: 'Acompanhe as últimas alegações, propostas e análises no panorama político português.',
      error: 'Não foi possível carregar as notícias. Por favor, tente novamente mais tarde.'
    },
    profile: {
      title: 'Perfil e Definições',
      description: 'Gira as informações da sua conta e preferências de privacidade.',
      language: 'Idioma da Interface e IA',
      displayName: 'Nome de Apresentação',
      notifications: 'Definições de Notificação',
      dangerZone: 'Zona de Perigo',
      deleteAccount: 'Apagar a minha conta e dados',
      deleteWarning: 'Esta ação é irreversível e apagará todos os seus dados.'
    }
  },
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      explorer: 'Data Explorer',
      simulations: 'Simulations',
      factCheck: 'Fact Check',
      legislation: 'Legislation',
      proposals: 'Proposals',
      contact: 'Contact',
      profile: 'Profile',
      admin: 'Admin',
      login: 'Login',
      logout: 'Logout',
      terms: 'Terms of Use',
      privacy: 'Privacy & Cookies'
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search...',
      noResults: 'No results found.',
      view: 'View',
      back: 'Back',
      submit: 'Submit',
      aiResponse: 'AI Response',
      sources: 'Official Sources',
      share: 'Share with community',
      error: 'An error occurred.',
      success: 'Success!',
      portuguese: 'Portuguese',
      english: 'English',
      language: 'Language'
    },
    home: {
      title: 'Updates Feed',
      description: 'Follow the latest claims, proposals, and analyses in the Portuguese political landscape.',
      error: 'Could not load news. Please try again later.'
    },
    profile: {
      title: 'Profile & Settings',
      description: 'Manage your account information and privacy preferences.',
      language: 'Interface and AI Language',
      displayName: 'Display Name',
      notifications: 'Notification Settings',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete my account and data',
      deleteWarning: 'This action is irreversible and will delete all your data.'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    // 1. Try to load from localStorage
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) {
      setLanguageState(saved);
    } else {
      // 2. Try browser detection
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'pt';
      if (browserLang === 'en') {
        setLanguageState('en');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let result: any = translations[language];
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path;
      }
    }
    return result;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

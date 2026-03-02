"use client";
import React, { createContext, useContext } from 'react';

// Dummy createI18n function to satisfy imports
function createI18n(config: any) {
  const i18n = {
    pt: config.pt,
    en: config.en
  };

  const getI18n = async (lang: 'pt' | 'en' = 'pt') => (key: string) => {
    const keys = key.split('.');
    let result: any = i18n[lang];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if not found
      }
    }
    return result || key;
  };

  const getScopedI18n = async (scope: string, lang: 'pt' | 'en' = 'pt') => (key: string) => {
    return getI18n(lang)(`${scope}.${key}`);
  };

  return {
    getI18n,
    getScopedI18n,
    getStaticParams: () => Object.keys(i18n).map(lang => ({ locale: lang })),
  };
}

// Create the i18n instance
export const { getI18n, getScopedI18n, getStaticParams } = createI18n({
  en: {
    irs_simulator: {
      title: 'IRS Simulator (2026)',
      description: 'Simulate your IRS calculation for 2026 based on the latest proposals.',
    },
    about: {
        title: 'About Project Causa Pública',
        subtitle: 'An independent project to promote transparency and civic engagement in Portugal.',
        missionTitle: "Our Mission",
        missionDesc: "To provide accessible and reliable tools for citizens to understand the data and decisions that shape their country. We believe that an informed public is the cornerstone of a strong democracy.",
        valuesTitle: "Our Values",
        neutrality: "Neutrality and Rigor",
        neutralityDesc: "We do not have a political or ideological agenda. Our only commitment is to data and facts, presenting them in a clear and unbiased way.",
        transparency: "Radical Transparency",
        transparencyDesc: "All our data sources are public and verifiable. Our analysis methodologies are open to scrutiny. We believe trust is built on openness.",
        innovation: "Civic Innovation",
        innovationDesc: "We use technology to create new ways for citizens to engage with public information, making complex topics understandable and relevant.",
        teamTitle: "Our Team",
        teamDesc: "We are a team of engineers, journalists, and data analysts passionate about technology and strengthening civic participation in Portugal."
    }
  },
  pt: {
    irs_simulator: {
      title: 'Simulador de IRS (2026)',
      description: 'Simule o cálculo do seu IRS para 2026 com base nas propostas mais recentes.',
    },
    about: {
        title: 'Sobre o Projeto Causa Pública',
        subtitle: 'Um projeto independente para promover a transparência e a participação cívica em Portugal.',
        missionTitle: "A Nossa Missão",
        missionDesc: "Fornecer ferramentas acessíveis e fidedignas para que os cidadãos compreendam os dados e as decisões que moldam o seu país. Acreditamos que um público informado é a base de uma democracia forte.",
        valuesTitle: "Os Nossos Valores",
        neutrality: "Neutralidade e Rigor",
        neutralityDesc: "Não temos uma agenda política ou ideológica. O nosso único compromisso é com os dados e os factos, apresentando-os de forma clara e isenta.",
        transparency: "Transparência Radical",
        transparencyDesc: "Todas as nossas fontes de dados são públicas e verificáveis. As nossas metodologias de análise estão abertas ao escrutínio. Acreditamos que a confiança se constrói com abertura.",
        innovation: "Inovação Cívica",
        innovationDesc: "Usamos a tecnologia para criar novas formas de os cidadãos interagirem com a informação pública, tornando temas complexos em algo compreensível e relevante.",
        teamTitle: "A Nossa Equipa",
        teamDesc: "Somos uma equipa de engenheiros, jornalistas e analistas de dados apaixonados por tecnologia e pelo fortalecimento da participação cívica em Portugal."
    }
  },
});

// Language Context and Provider
const LanguageContext = createContext({ lang: 'pt', t: (key: string) => key });

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // This is a dummy provider. In a real app, you would get the locale.
  const lang = 'pt'; 
  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = getI18n[lang];
     for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; 
      }
    }
    return result || key;
  };

  return <LanguageContext.Provider value={{ lang, t }}>{children}</LanguageContext.Provider>;
};

// useTranslation Hook
export const useTranslation = () => {
  return useContext(LanguageContext);
};

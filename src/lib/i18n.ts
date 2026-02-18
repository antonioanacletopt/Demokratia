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
      language: 'Idioma',
      warning: 'Aviso',
      close: 'Fechar',
      accept: 'Aceitar',
      translate: 'Traduzir com IA',
      showOriginal: 'Ver Original',
      translating: 'A traduzir...',
      support: 'Apoiar',
      supported: 'Apoiado',
      simulate: 'Simular'
    },
    home: {
      title: 'Feed de Atualizações',
      description: 'Acompanhe as últimas alegações, propostas e análises no panorama político português.',
      error: 'Não foi possível carregar as notícias. Por favor, tente novamente mais tarde.',
      source: 'Fonte',
      date: 'Data',
      newsTypes: {
        'Alegação': 'Alegação',
        'Nova Lei': 'Nova Lei',
        'Análise': 'Análise'
      }
    },
    dashboard: {
      title: 'Dashboard Interativo',
      description: 'Peça à IA para gerar gráficos sobre dados económicos e sociais de Portugal.',
      aiCardTitle: 'Gerar Gráfico com IA',
      aiCardDesc: 'Descreva o gráfico que pretende visualizar. A IA tentará encontrar os dados e geri-lo para si.',
      textareaPlaceholder: "Ex: 'Evolução da taxa de desemprego jovem em Portugal desde 2015'",
      generateBtn: 'Gerar Gráfico',
      saveToDash: 'Guardar no Meu Dashboard',
      saveDialogTitle: 'Guardar Visualização',
      saveDialogDesc: 'Dê um nome e uma descrição a este gráfico para o encontrar mais tarde.',
      viewName: 'Nome',
      viewDescription: 'Descrição (Opcional)',
      savedTitle: 'Meus Dashboards Guardados',
      noSavedTitle: 'Nenhuma visualização guardada',
      noSavedDesc: 'Gere um gráfico com a IA e guarde-o para o ver aqui.',
      mainIndicators: 'Principais Indicadores Económicos',
      dataNotFound: 'Dados não encontrados',
      seedNotice: 'Tente carregar os dados na página de Admin.'
    },
    explorer: {
      title: 'Explorador de Dados',
      description: 'Explore conjuntos de dados sobre demografia, economia e sociedade em Portugal.',
      aiCardTitle: 'Pergunte à IA por uma Estatística',
      aiCardDesc: 'Não encontra o que procura? Descreva a estatística que deseja.',
      textareaPlaceholder: "Ex: 'Qual a evolução da dívida pública em % do PIB nos últimos 5 anos?'",
      searchBtn: 'Procurar Estatística',
      recentQueries: 'Estatísticas Recentes da Comunidade',
      recentQueriesDesc: 'Veja o que outros utilizadores andaram a procurar.',
      noRecentTitle: 'Nenhuma pesquisa pública encontrada',
      noRecentDesc: 'Seja o primeiro a procurar uma estatística!',
      existingDataTitle: 'Explorar Dados Existentes',
      searchPlaceholder: 'Pesquisar por título ou categoria...',
      noResultsTitle: 'Nenhum resultado',
      noResultsDesc: 'A sua pesquisa não encontrou nenhum conjunto de dados.',
      source: 'Fonte',
      category: 'Categoria'
    },
    simulations: {
      title: 'Simulações de Políticas',
      description: 'Simule o impacto de políticas e compare diferentes cenários.',
      newSimTitle: 'Nova Simulação',
      newSimDesc: 'Introduza a proposta que pretende simular.',
      textareaPlaceholder: "Ex: 'Reduzir o IVA na restauração de 13% para 6%'",
      simulateBtn: 'Simular Impacto',
      simulating: 'A simular...',
      resultsTitle: 'Resultados da Análise',
      saveBtn: 'Guardar Simulação',
      impactSummary: 'Sumário do Impacto',
      indicatorsTitle: 'Projeção de Indicadores Chave',
      indicator: 'Indicador',
      currentValue: 'Valor Atual',
      projectedValue: 'Valor Projetado',
      aiReasoning: 'Raciocínio da IA',
      mySimsTitle: 'Minhas Simulações Guardadas',
      mySimsDesc: 'Reveja, apague ou compare as suas simulações anteriores.',
      publicSimsTitle: 'Simulações da Comunidade',
      compareBtn: 'Comparar',
      compareLimit: 'Pode comparar apenas duas simulações.',
      difference: 'Diferença',
      realPolicy: 'Política Real Identificada',
      viewOfficial: 'Ver Fonte Oficial'
    },
    factCheck: {
      title: 'Verificação de Factos',
      description: 'Introduza uma alegação e a IA irá analisá-la com base em fontes fidedignas.',
      cardTitle: 'Analisar uma Alegação',
      cardDesc: 'Cole ou escreva a afirmação que pretende verificar.',
      textareaPlaceholder: "Ex: 'O salário mínimo em Portugal é o mais baixo da Europa'",
      checkBtn: 'Verificar Alegação',
      resultTitle: 'Resultado da Análise',
      verdict: 'Veredicto',
      explanation: 'Explicação Detalhada',
      sources: 'Fontes Utilizadas',
      historyTitle: 'Histórico de Verificações',
      historyDesc: 'As suas verificações anteriores são guardadas aqui.',
      noHistoryTitle: 'Nenhuma verificação encontrada',
      noHistoryDesc: 'Use o formulário acima para fazer a sua primeira verificação.'
    },
    legislation: {
      title: 'Consultar Legislação',
      description: 'Faça uma pergunta e a IA irá responder com base na legislação portuguesa.',
      cardTitle: 'Analisar Legislação',
      cardDesc: 'Faça a sua pergunta em linguagem natural.',
      textareaPlaceholder: "Ex: 'Quais são os meus direitos em caso de voo cancelado?'",
      consultBtn: 'Consultar Legislação',
      resultTitle: 'Resposta da Análise',
      analysis: 'Análise da Legislação',
      sources: 'Fontes Oficiais',
      recentQueries: 'Consultas Recentes da Comunidade',
      historyTitle: 'O Meu Histórico de Consultas',
      noHistoryTitle: 'Nenhuma consulta encontrada'
    },
    proposals: {
      title: 'O Povo Propõe',
      description: 'Submeta as suas próprias propostas de políticas e apoie as ideias da comunidade.',
      newTitle: 'Submeter Nova Proposta',
      newDesc: 'Descreva a sua ideia de forma clara.',
      titleLabel: 'Título da Proposta',
      titlePlaceholder: 'Ex: Passe cultural gratuito para jovens',
      descLabel: 'Descrição Detalhada',
      descPlaceholder: 'Descreva os objetivos e a implementação.',
      submitBtn: 'Submeter Proposta',
      communityTitle: 'Propostas da Comunidade',
      searchPlaceholder: 'Pesquisar propostas...',
      noProposalsTitle: 'Nenhuma proposta encontrada',
      noProposalsDesc: 'Seja o primeiro a submeter uma proposta!',
      voteBtn: 'Apoiar',
      votedBtn: 'Apoiado',
      simulateBtn: 'Simular',
      editTitle: 'Editar Proposta',
      editDesc: 'Refine os detalhes da sua proposta.',
      loginToSubmit: 'para submeter uma proposta.',
      successMsg: 'Proposta submetida com sucesso!',
      titleMinError: 'O título deve ter pelo menos 10 caracteres.',
      descMinError: 'A descrição deve ter pelo menos 30 caracteres.'
    },
    contact: {
      title: 'Contacto',
      description: 'Envie-nos as suas sugestões ou questões.',
      newTitle: 'Enviar Nova Mensagem',
      newDesc: 'A sua mensagem será enviada para a administração.',
      subject: 'Assunto',
      message: 'Mensagem',
      sendBtn: 'Enviar Mensagem',
      historyTitle: 'Minhas Mensagens Enviadas',
      noMessagesTitle: 'Nenhuma mensagem encontrada',
      status: {
        new: 'Nova',
        read: 'Lida',
        archived: 'Arquivada'
      }
    },
    profile: {
      title: 'Perfil e Definições',
      description: 'Gira as informações da sua conta e preferências.',
      language: 'Idioma da Interface e IA',
      displayName: 'Nome de Apresentação',
      notifications: 'Definições de Notificação',
      emailNotif: 'Notificações por Email',
      newsletter: 'Newsletter Semanal',
      dangerZone: 'Zona de Perigo',
      deleteAccount: 'Apagar a minha conta e dados',
      deleteWarning: 'Esta ação é irreversível e apagará todos os seus dados.',
      deleteConfirm: 'Tem a certeza absoluta?',
      deleteConfirmBtn: 'Sim, apagar tudo'
    },
    privacy: {
      title: 'Política de Privacidade e Cookies',
      intro: 'O Demokratia Portugal valoriza a sua privacidade. Esta política descreve como tratamos os seus dados.',
      dataTitle: 'Dados que Recolhemos',
      dataDesc: 'Recolhemos dados via autenticação Google, conteúdo submetido e dados de utilização técnicos.',
      purposeTitle: 'Finalidade do Tratamento',
      purposeDesc: 'Os dados são usados para personalizar a sua experiência e garantir a segurança da plataforma.',
      cookiesTitle: 'Cookies e Publicidade',
      cookiesDesc: 'Usamos cookies essenciais para a sessão e cookies do Google AdSense para publicidade.',
      rightsTitle: 'Os Seus Direitos (RGPD)',
      rightsDesc: 'Tem direito ao acesso, retificação, esquecimento e portabilidade dos seus dados.'
    },
    terms: {
      title: 'Termos de Utilização',
      intro: 'Ao aceder ao Demokratia Portugal, aceita os seguintes termos.',
      aiTitle: 'Isenção de Responsabilidade (IA)',
      aiDesc: 'As respostas da IA podem conter imprecisões. O conteúdo é meramente informativo e não substitui aconselhamento oficial.',
      usageTitle: 'Utilização da Plataforma',
      usageDesc: 'O utilizador deve usar a plataforma de forma lícita e ética.',
      ipTitle: 'Propriedade Intelectual',
      ipDesc: 'A estrutura e design são propriedade da plataforma. Dados públicos pertencem às fontes citadas.'
    },
    cookies: {
      title: 'Respeitamos a sua privacidade',
      desc: 'Utilizamos cookies para melhorar a sua experiência. Ao continuar, aceita a nossa'
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
      language: 'Language',
      warning: 'Warning',
      close: 'Close',
      accept: 'Accept',
      translate: 'Translate with AI',
      showOriginal: 'Show Original',
      translating: 'Translating...',
      support: 'Support',
      supported: 'Supported',
      simulate: 'Simulate'
    },
    home: {
      title: 'Updates Feed',
      description: 'Follow the latest claims, proposals, and analyses in the Portuguese political landscape.',
      error: 'Could not load news. Please try again later.',
      source: 'Source',
      date: 'Date',
      newsTypes: {
        'Alegação': 'Claim',
        'Nova Lei': 'New Law',
        'Análise': 'Analysis'
      }
    },
    dashboard: {
      title: 'Interactive Dashboard',
      description: 'Ask AI to generate charts about economic and social data in Portugal.',
      aiCardTitle: 'Generate Chart with AI',
      aiCardDesc: 'Describe the chart you want to see. AI will find the data and generate it for you.',
      textareaPlaceholder: "e.g., 'Evolution of youth unemployment rate in Portugal since 2015'",
      generateBtn: 'Generate Chart',
      saveToDash: 'Save to My Dashboard',
      saveDialogTitle: 'Save Visualization',
      saveDialogDesc: 'Give this chart a name and description to find it later.',
      viewName: 'Name',
      viewDescription: 'Description (Optional)',
      savedTitle: 'My Saved Dashboards',
      noSavedTitle: 'No saved visualizations',
      noSavedDesc: 'Generate an AI chart and save it to see it here.',
      mainIndicators: 'Key Economic Indicators',
      dataNotFound: 'Data not found',
      seedNotice: 'Try loading data on the Admin page.'
    },
    explorer: {
      title: 'Data Explorer',
      description: 'Explore datasets about demography, economy, and society in Portugal.',
      aiCardTitle: 'Ask AI for a Statistic',
      aiCardDesc: "Can't find what you're looking for? Describe the statistic you want.",
      textareaPlaceholder: "e.g., 'What is the evolution of public debt as % of GDP in the last 5 years?'",
      searchBtn: 'Search Statistic',
      recentQueries: 'Recent Community Statistics',
      recentQueriesDesc: 'See what other users have been searching for.',
      noRecentTitle: 'No public searches found',
      noRecentDesc: 'Be the first to search for a statistic!',
      existingDataTitle: 'Explore Existing Data',
      searchPlaceholder: 'Search by title or category...',
      noResultsTitle: 'No results',
      noResultsDesc: 'Your search did not find any existing datasets.',
      source: 'Source',
      category: 'Category'
    },
    simulations: {
      title: 'Policy Simulations',
      description: 'Simulate policy impacts and compare different scenarios.',
      newSimTitle: 'New Simulation',
      newSimDesc: 'Enter the policy proposal you want to simulate.',
      textareaPlaceholder: "e.g., 'Reduce VAT on restaurants from 13% to 6%'",
      simulateBtn: 'Simulate Impact',
      simulating: 'Simulating...',
      resultsTitle: 'Analysis Results',
      saveBtn: 'Save Simulation',
      impactSummary: 'Impact Summary',
      indicatorsTitle: 'Key Indicators Projection',
      indicator: 'Indicator',
      currentValue: 'Current Value',
      projectedValue: 'Projected Value',
      aiReasoning: 'AI Reasoning',
      mySimsTitle: 'My Saved Simulations',
      mySimsDesc: 'Review, delete, or compare your previous simulations.',
      publicSimsTitle: 'Community Simulations',
      compareBtn: 'Compare',
      compareLimit: 'You can only compare two simulations.',
      difference: 'Difference',
      realPolicy: 'Real Policy Identified',
      viewOfficial: 'View Official Source'
    },
    factCheck: {
      title: 'Fact Checking',
      description: 'Enter a claim and AI will analyze it based on reliable sources.',
      cardTitle: 'Analyze a Claim',
      cardDesc: 'Paste or write the statement you want to verify.',
      textareaPlaceholder: "e.g., 'Portugal's minimum wage is the lowest in Europe'",
      checkBtn: 'Verify Claim',
      resultTitle: 'Analysis Result',
      verdict: 'Verdict',
      explanation: 'Detailed Explanation',
      sources: 'Sources Used',
      historyTitle: 'Verification History',
      historyDesc: 'Your previous verifications are saved here.',
      noHistoryTitle: 'No verifications found',
      noHistoryDesc: 'Use the form above to make your first verification.'
    },
    legislation: {
      title: 'Consult Legislation',
      description: 'Ask a question and AI will answer based on Portuguese law.',
      cardTitle: 'Analyze Legislation',
      cardDesc: 'Ask your question in natural language.',
      textareaPlaceholder: "e.g., 'What are my rights in case of a cancelled flight?'",
      consultBtn: 'Consult Legislation',
      resultTitle: 'Analysis Response',
      analysis: 'Legislation Analysis',
      sources: 'Official Sources',
      recentQueries: 'Recent Community Queries',
      historyTitle: 'My Query History',
      noHistoryTitle: 'No queries found'
    },
    proposals: {
      title: 'The People Propose',
      description: 'Submit your own policy proposals and support the community.',
      newTitle: 'Submit New Proposal',
      newDesc: 'Describe your idea clearly.',
      titleLabel: 'Proposal Title',
      titlePlaceholder: 'e.g., Free cultural pass for youth',
      descLabel: 'Detailed Description',
      descPlaceholder: 'Describe the goals and implementation.',
      submitBtn: 'Submit Proposal',
      communityTitle: 'Community Proposals',
      searchPlaceholder: 'Search proposals...',
      noProposalsTitle: 'No proposals found',
      noProposalsDesc: 'Be the first to submit a proposal!',
      voteBtn: 'Support',
      votedBtn: 'Supported',
      simulateBtn: 'Simulate',
      editTitle: 'Edit Proposal',
      editDesc: 'Refine the details of your proposal.',
      loginToSubmit: 'to submit a proposal.',
      successMsg: 'Proposal submitted successfully!',
      titleMinError: 'Title must be at least 10 characters long.',
      descMinError: 'Description must be at least 30 characters long.'
    },
    contact: {
      title: 'Contact',
      description: 'Send us your suggestions or questions.',
      newTitle: 'Send New Message',
      newDesc: 'Your message will be sent to the administration.',
      subject: 'Subject',
      message: 'Message',
      sendBtn: 'Send Message',
      historyTitle: 'My Sent Messages',
      noMessagesTitle: 'No messages found',
      status: {
        new: 'New',
        read: 'Read',
        archived: 'Archived'
      }
    },
    profile: {
      title: 'Profile & Settings',
      description: 'Manage your account information and preferences.',
      language: 'Interface & AI Language',
      displayName: 'Display Name',
      notifications: 'Notification Settings',
      emailNotif: 'Email Notifications',
      newsletter: 'Weekly Newsletter',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete my account and data',
      deleteWarning: 'This action is irreversible and will delete all your data.',
      deleteConfirm: 'Are you absolutely sure?',
      deleteConfirmBtn: 'Yes, delete everything'
    },
    privacy: {
      title: 'Privacy & Cookie Policy',
      intro: 'Demokratia Portugal values your privacy. This policy describes how we handle your data.',
      dataTitle: 'Data We Collect',
      dataDesc: 'We collect data via Google authentication, submitted content, and technical usage data.',
      purposeTitle: 'Purpose of Processing',
      purposeDesc: 'Data is used to personalize your experience and ensure platform security.',
      cookiesTitle: 'Cookies & Advertising',
      cookiesDesc: 'We use essential session cookies and Google AdSense cookies for advertising.',
      rightsTitle: 'Your Rights (GDPR)',
      rightsDesc: 'You have the right to access, rectify, erase, and data portability.'
    },
    terms: {
      title: 'Terms of Use',
      intro: 'By accessing Demokratia Portugal, you accept the following terms.',
      aiTitle: 'AI Disclaimer',
      aiDesc: 'AI responses may contain inaccuracies. Content is for information only and not official advice.',
      usageTitle: 'Platform Usage',
      usageDesc: 'Users must use the platform lawfully and ethically.',
      ipTitle: 'Intellectual Property',
      ipDesc: 'Structure and design are property of the platform. Public data belongs to cited sources.'
    },
    cookies: {
      title: 'We respect your privacy',
      desc: 'We use cookies to improve your experience. By continuing, you accept our'
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
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) {
      setLanguageState(saved);
    } else {
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

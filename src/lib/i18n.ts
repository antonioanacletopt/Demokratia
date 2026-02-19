'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    nav: {
      home: 'Início', dashboard: 'Dashboard', explorer: 'Explorador', simulations: 'Simulações', factCheck: 'Fact Check',
      legislation: 'Legislação', proposals: 'Propostas', contact: 'Contacto', profile: 'Perfil', admin: 'Admin',
      login: 'Iniciar Sessão', logout: 'Sair', terms: 'Termos de Utilização', privacy: 'Privacidade e Cookies'
    },
    common: {
      loading: 'A carregar...', save: 'Guardar', cancel: 'Cancelar', delete: 'Apagar', edit: 'Editar', search: 'Pesquisar...',
      noResults: 'Nenhum resultado encontrado.', view: 'Ver', back: 'Voltar', submit: 'Submeter', aiResponse: 'Resposta da IA',
      sources: 'Fontes Oficiais', share: 'Partilhar com a comunidade', error: 'Ocorreu um erro.', success: 'Sucesso!',
      portuguese: 'Português', english: 'Inglês', language: 'Idioma', warning: 'Aviso', close: 'Fechar', accept: 'Aceitar',
      translate: 'Traduzir com IA', showOriginal: 'Ver Original', translating: 'A traduzir...', support: 'Apoiar',
      supported: 'Apoiado', simulate: 'Simular'
    },
    home: {
      title: 'Feed de Atualizações', description: 'Acompanhe as últimas alegações, propostas e análises em 2026.',
      error: 'Erro ao carregar notícias.', source: 'Fonte', date: 'Data', newsTypes: { 'Alegação': 'Alegação', 'Nova Lei': 'Nova Lei', 'Análise': 'Análise' }
    },
    dashboard: {
      title: 'Dashboard Interativo', description: 'Gere gráficos dinâmicos sobre Portugal.', aiCardTitle: 'Gráfico com IA',
      aiCardDesc: 'Descreva os dados que pretende visualizar.', textareaPlaceholder: "Ex: 'Evolução do desemprego jovem desde 2015'",
      generateBtn: 'Gerar Gráfico', saveToDash: 'Guardar Dashboard', saveDialogTitle: 'Guardar Visualização',
      saveDialogDesc: 'Dê um nome a este gráfico.', viewName: 'Nome', viewDescription: 'Descrição',
      savedTitle: 'Dashboards Guardados', noSavedTitle: 'Sem gráficos guardados', noSavedDesc: 'Gere e guarde um gráfico.',
      mainIndicators: 'Indicadores Principais', dataNotFound: 'Dados não encontrados', seedNotice: 'Clique em Seed na página Admin.'
    },
    explorer: {
      title: 'Explorador de Dados', description: 'Consulte estatísticas oficiais detalhadas.', aiCardTitle: 'Perguntar à IA',
      aiCardDesc: 'Diga que estatística procura.', textareaPlaceholder: "Ex: 'Qual a evolução da dívida pública?'",
      searchBtn: 'Procurar', recentQueries: 'Pesquisas Recentes', recentQueriesDesc: 'O que outros users procuram.',
      noRecentTitle: 'Sem pesquisas', noRecentDesc: 'Seja o primeiro!', existingDataTitle: 'Dados Disponíveis',
      searchPlaceholder: 'Filtrar por título...', noResultsTitle: 'Sem resultados', source: 'Fonte', category: 'Categoria'
    },
    simulations: {
      title: 'Simulações Políticas', description: 'Simule impactos de novas medidas económicas.', newSimTitle: 'Nova Simulação',
      newSimDesc: 'Descreva a política a simular.', textareaPlaceholder: "Ex: 'Aumentar SMN para 1000€'", simulateBtn: 'Simular Impacto',
      simulating: 'A simular...', resultsTitle: 'Análise de Impacto', saveBtn: 'Guardar Simulação', impactSummary: 'Resumo',
      indicatorsTitle: 'Indicadores Projetados', indicator: 'Indicador', currentValue: 'Atual', projectedValue: 'Projetado',
      aiReasoning: 'Raciocínio', mySimsTitle: 'As Minhas Simulações', publicSimsTitle: 'Simulações Públicas', realPolicy: 'Política Real', viewOfficial: 'Ver Fonte'
    },
    factCheck: {
      title: 'Verificação de Factos', description: 'Valide alegações com IA rigorosa.', cardTitle: 'Verificar Alegação',
      cardDesc: 'Introduza a afirmação.', textareaPlaceholder: "Ex: 'Portugal tem os impostos mais altos da UE'", checkBtn: 'Verificar',
      resultTitle: 'Resultado', verdict: 'Veredicto', explanation: 'Explicação', sources: 'Fontes', historyTitle: 'Histórico',
      historyDesc: 'As suas verificações.', noHistoryTitle: 'Sem histórico', noHistoryDesc: 'Faça a sua primeira verificação.'
    },
    legislation: {
      title: 'Consultar Legislação', description: 'Perguntas legais respondidas pela IA.', cardTitle: 'Analisar Legislação',
      cardDesc: 'Faça a sua pergunta.', textareaPlaceholder: "Ex: 'Direitos sobre teletrabalho'", consultBtn: 'Consultar',
      resultTitle: 'Análise Legal', analysis: 'Análise', sources: 'Fontes', recentQueries: 'Consultas Recentes',
      historyTitle: 'Histórico', noHistoryTitle: 'Sem consultas'
    },
    proposals: {
      title: 'O Povo Propõe', description: 'Submeta ideias e apoie a comunidade.', newTitle: 'Nova Proposta',
      newDesc: 'Descreva a sua ideia.', titleLabel: 'Título', descLabel: 'Descrição', submitBtn: 'Submeter',
      communityTitle: 'Ideias da Comunidade', searchPlaceholder: 'Filtrar ideias...', noProposalsTitle: 'Sem ideias',
      voteBtn: 'Apoiar', votedBtn: 'Apoiado', simulateBtn: 'Simular', editTitle: 'Editar', titleMinError: 'Mínimo 10 carateres.',
      descMinError: 'Mínimo 30 carateres.'
    },
    contact: {
      title: 'Contacto e Apoio', description: 'Estamos aqui para ajudar e ouvir as suas sugestões.',
      newTitle: 'Nova Mensagem', newDesc: 'Envie-nos as suas dúvidas ou feedback.',
      subject: 'Assunto', message: 'Mensagem', sendBtn: 'Enviar Mensagem',
      historyTitle: 'Histórico de Contactos', noMessagesTitle: 'Ainda não enviou mensagens.',
      status: { new: 'Nova', read: 'Lida', archived: 'Arquivada' }
    },
    refutation: {
      title: 'Refutar Informação', description: 'Acredita que a IA errou? Submeta provas para correção.', label: 'Explicação',
      evidence: 'Links/Provas', submitBtn: 'Submeter Refutação', refuteBtn: 'Refutar Informação', success: 'Refutação enviada para análise.',
      status: { pending: 'Pendente', approved: 'Aprovada', rejected: 'Rejeitada' }, noRefutations: 'Sem refutações.', adminTitle: 'Gestão de Refutações'
    },
    profile: {
      title: 'O Meu Perfil', description: 'Gira as suas preferências e dados pessoais.', displayName: 'Nome de Apresentação',
      language: 'Idioma Preferido', notifications: 'Preferências de Notificação', dangerZone: 'Zona de Perigo',
      deleteAccount: 'Apagar Conta Permanentemente', deleteWarning: 'Esta ação não pode ser desfeita e removerá todos os seus dados.'
    },
    privacy: {
      title: 'Privacidade e Cookies', intro: 'Respeitamos os seus dados.', dataTitle: 'Dados Recolhidos', dataDesc: 'Recolhemos dados via login Google.',
      purposeTitle: 'Finalidade', purposeDesc: 'Os dados servem para personalizar a sua conta.', cookiesTitle: 'Cookies',
      cookiesDesc: 'Usamos cookies do AdSense para publicidade.', rightsTitle: 'Os Seus Direitos', rightsDesc: 'Tem direito ao esquecimento.'
    },
    terms: {
      title: 'Termos de Utilização', intro: 'Ao usar aceita os termos.', aiTitle: 'Aviso sobre IA', aiDesc: 'A IA pode errar.',
      usageTitle: 'Uso Ético', usageDesc: 'Use para fins cívicos e legais.', ipTitle: 'Propriedade', ipDesc: 'O design pertence à plataforma.'
    },
    cookies: { title: 'Privacidade', desc: 'Usamos cookies para melhorar a experiência. Leia a nossa' }
  },
  en: {
    nav: {
      home: 'Home', dashboard: 'Dashboard', explorer: 'Explorer', simulations: 'Simulations', factCheck: 'Fact Check',
      legislation: 'Legislation', proposals: 'Proposals', contact: 'Contact', profile: 'Profile', admin: 'Admin',
      login: 'Login', logout: 'Logout', terms: 'Terms of Use', privacy: 'Privacy & Cookies'
    },
    common: {
      loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', search: 'Search...',
      noResults: 'No results found.', view: 'View', back: 'Back', submit: 'Submit', aiResponse: 'AI Response',
      sources: 'Official Sources', share: 'Share with community', error: 'An error occurred.', success: 'Success!',
      portuguese: 'Portuguese', english: 'English', language: 'Language', warning: 'Warning', close: 'Close', accept: 'Accept',
      translate: 'Translate with AI', showOriginal: 'Show Original', translating: 'Translating...', support: 'Support',
      supported: 'Supported', simulate: 'Simulate'
    },
    home: {
      title: 'Updates Feed', description: 'Follow claims and analyses in 2026.', error: 'Error loading news.',
      source: 'Source', date: 'Date', newsTypes: { 'Alegação': 'Claim', 'Nova Lei': 'New Law', 'Análise': 'Analysis' }
    },
    dashboard: {
      title: 'Interactive Dashboard', description: 'Generate charts about Portugal with AI.', aiCardTitle: 'AI Chart',
      aiCardDesc: 'Describe what you want to see.', textareaPlaceholder: "e.g., 'Youth unemployment since 2015'",
      generateBtn: 'Generate Chart', saveToDash: 'Save to Dashboard', saveDialogTitle: 'Save View',
      saveDialogDesc: 'Give this chart a name.', viewName: 'Name', viewDescription: 'Description',
      savedTitle: 'Saved Dashboards', noSavedTitle: 'No saved charts', noSavedDesc: 'Generate and save a chart.',
      mainIndicators: 'Main Indicators', dataNotFound: 'Data not found', seedNotice: 'Click Seed in Admin.'
    },
    explorer: {
      title: 'Data Explorer', description: 'Check detailed official stats.', aiCardTitle: 'Ask AI',
      aiCardDesc: 'What stat are you looking for?', textareaPlaceholder: "e.g., 'Public debt evolution'",
      searchBtn: 'Search', recentQueries: 'Recent Searches', recentQueriesDesc: 'What others look for.',
      noRecentTitle: 'No searches', noRecentDesc: 'Be the first!', existingDataTitle: 'Available Data',
      searchPlaceholder: 'Filter by title...', noResultsTitle: 'No results', source: 'Source', category: 'Category'
    },
    simulations: {
      title: 'Policy Simulations', description: 'Simulate impacts of economic measures.', newSimTitle: 'New Simulation',
      newSimDesc: 'Describe the policy.', textareaPlaceholder: "e.g., 'Minimum wage to 1000€'", simulateBtn: 'Simulate',
      simulating: 'Simulating...', resultsTitle: 'Impact Analysis', saveBtn: 'Save Simulation', impactSummary: 'Summary',
      indicatorsTitle: 'Projected Indicators', indicator: 'Indicator', currentValue: 'Current', projectedValue: 'Projected',
      aiReasoning: 'Reasoning', mySimsTitle: 'My Simulations', publicSimsTitle: 'Public Simulations', realPolicy: 'Real Policy', viewOfficial: 'View Source'
    },
    factCheck: {
      title: 'Fact Checking', description: 'Validate claims with rigorous AI.', cardTitle: 'Check Claim',
      cardDesc: 'Enter statement.', textareaPlaceholder: "e.g., 'Highest taxes in EU'", checkBtn: 'Check',
      resultTitle: 'Result', verdict: 'Verdict', explanation: 'Explanation', sources: 'Sources', historyTitle: 'History',
      historyDesc: 'Your checks.', noHistoryTitle: 'No history', noHistoryDesc: 'Make your first check.'
    },
    legislation: {
      title: 'Consult Legislation', description: 'Legal questions answered by AI.', cardTitle: 'Analyze Legislation',
      cardDesc: 'Ask your question.', textareaPlaceholder: "e.g., 'Remote work rights'", consultBtn: 'Consult',
      resultTitle: 'Legal Analysis', analysis: 'Analysis', sources: 'Sources', recentQueries: 'Recent Queries',
      historyTitle: 'History', noHistoryTitle: 'No queries'
    },
    proposals: {
      title: 'The People Propose', description: 'Submit ideas and support community.', newTitle: 'New Proposal',
      newDesc: 'Describe your idea.', titleLabel: 'Title', descLabel: 'Description', submitBtn: 'Submit',
      communityTitle: 'Community Ideas', searchPlaceholder: 'Filter ideas...', noProposalsTitle: 'No ideas',
      voteBtn: 'Support', votedBtn: 'Supported', simulateBtn: 'Simulate', editTitle: 'Edit', titleMinError: 'Min 10 chars.',
      descMinError: 'Min 30 chars.'
    },
    contact: {
      title: 'Contact & Support', description: 'We are here to help and listen to your suggestions.',
      newTitle: 'New Message', newDesc: 'Send us your questions or feedback.',
      subject: 'Subject', message: 'Message', sendBtn: 'Send Message',
      historyTitle: 'Contact History', noMessagesTitle: 'You haven\'t sent any messages yet.',
      status: { new: 'New', read: 'Read', archived: 'Archived' }
    },
    refutation: {
      title: 'Refute Information', description: 'Believe the AI is wrong? Submit evidence for correction.', label: 'Explanation',
      evidence: 'Links/Proof', submitBtn: 'Submit Refutation', refuteBtn: 'Refute Info', success: 'Refutation sent for review.',
      status: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }, noRefutations: 'No refutations.', adminTitle: 'Manage Refutations'
    },
    profile: {
      title: 'My Profile', description: 'Manage your preferences and personal data.', displayName: 'Display Name',
      language: 'Preferred Language', notifications: 'Notification Preferences', dangerZone: 'Danger Zone',
      deleteAccount: 'Delete Account Permanently', deleteWarning: 'This action cannot be undone and will remove all your data.'
    },
    privacy: {
      title: 'Privacy & Cookies', intro: 'We respect your data.', dataTitle: 'Data Collected', dataDesc: 'We collect data via Google login.',
      purposeTitle: 'Purpose', purposeDesc: 'Data is used to personalize your account.', cookiesTitle: 'Cookies',
      cookiesDesc: 'We use AdSense cookies for ads.', rightsTitle: 'Your Rights', rightsDesc: 'You have the right to be forgotten.'
    },
    terms: {
      title: 'Terms of Use', intro: 'Using accept terms.', aiTitle: 'AI Notice', aiDesc: 'AI can make mistakes.',
      usageTitle: 'Ethical Use', usageDesc: 'Use for civic and legal purposes.', ipTitle: 'Property', ipDesc: 'Design belongs to the platform.'
    },
    cookies: { title: 'Privacy', desc: 'We use cookies to improve experience. Read our' }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => any;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) {
      setLanguageState(saved);
    } else {
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'pt';
      if (browserLang === 'en') setLanguageState('en');
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
      if (result && result[key] !== undefined) result = result[key];
      else return path;
    }
    return result;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
}

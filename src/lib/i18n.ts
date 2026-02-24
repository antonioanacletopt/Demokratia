
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
      supported: 'Apoiado', simulate: 'Simular', actions: 'Ações', translating_ai: 'IA a traduzir conteúdo...',
      confirm_delete: 'Tem a certeza que deseja apagar?'
    },
    home: {
      title: 'Feed de Atualizações', description: 'Acompanhe as últimas notícias e análises de 2026.',
      welcomeTitle: 'Bem-vindo à Demokratia',
      welcomeSubtitle: 'Ciência de dados ao serviço da cidadania.',
      welcomeIntro: 'O nosso objetivo é fornecer análises rigorosas, neutras e baseadas em factos puros. Sem partidarismo, apenas dados oficiais e métodos científicos para ajudar a compreender Portugal.',
      howItWorksTitle: 'Como funciona?',
      howItWorksDesc: 'A nossa IA consulta em tempo real bases de dados oficiais (INE, Pordata, Diário da República) para validar alegações, simular impactos económicos e simplificar a legislação para si.',
      ctaProposals: 'Tem uma sugestão ou ideia para o país?',
      ctaProposalsBtn: 'Criar Proposta',
      error: 'Erro ao carregar notícias.', source: 'Fonte', date: 'Data', 
      loadingText: 'A analisar a atualidade política de 2026...',
      newsTypes: { 'Alegação': 'Alegação', 'Nova Lei': 'Nova Lei', 'Análise': 'Análise' }
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
      title: 'Data Explorer', 
      description: 'Consulte estatísticas oficiais detalhadas.', 
      howItWorks: 'Utilizamos dados brutos do INE, Pordata e Banco de Portugal. A IA ajuda a cruzar informações e a criar visualizações que revelam tendências históricas reais.',
      aiCardTitle: 'Perguntar à IA',
      aiCardDesc: 'Diga que estatística procura.', textareaPlaceholder: "Ex: 'Qual a evolução da dívida pública?'",
      searchBtn: 'Procurar', recentQueries: 'Pesquisas Recentes', recentQueriesDesc: 'O que outros users procuram.',
      noRecentTitle: 'Sem pesquisas', noRecentDesc: 'Seja o primeiro!', existingDataTitle: 'Dados Disponíveis',
      searchPlaceholder: 'Filtrar por título...', noResultsTitle: 'Sem resultados', source: 'Fonte', category: 'Categoria',
      suggestSource: 'Sugerir Nova Fonte', suggestSourceDesc: 'Conhece um portal oficial ou API relevante? Ajude-nos a crescer.',
      sourceName: 'Nome da Entidade', sourceUrl: 'URL Oficial', sourcePurpose: 'O que contém?', suggestBtn: 'Enviar Sugestão'
    },
    simulations: {
      title: 'Simulações Políticas', 
      description: 'Simule impactos de novas medidas económicas.', 
      howItWorks: 'Introduza uma política (real ou hipotética) e a nossa IA projetará os seus efeitos no PIB, inflação e desemprego, baseando-se em modelos económicos e dados do OE2026.',
      newSimTitle: 'Nova Simulação',
      newSimDesc: 'Descreva a política a simular.', textareaPlaceholder: "Ex: 'Aumentar SMN para 1000€'", simulateBtn: 'Simular Impacto',
      simulating: 'A simular...', resultsTitle: 'Análise de Impacto', saveBtn: 'Guardar Simulação', impactSummary: 'Resumo',
      indicatorsTitle: 'Indicadores Projetados', indicator: 'Indicator', currentValue: 'Atual', projectedValue: 'Projetado',
      aiReasoning: 'Raciocínio', mySimsTitle: 'As Minhas Simulações', publicSimsTitle: 'Simulações Públicas', realPolicy: 'Política Real', viewOfficial: 'Ver Fonte',
      convertToProposal: 'Transformar em Proposta', convertDesc: 'Partilhe esta ideia com a comunidade para ser votada.',
      suggestVariable: 'Sugerir Indicador', suggestVariableDesc: 'Falta algum dado nas simulações? Sugira novas métricas de análise.',
      variableName: 'Nome do Indicador', variableReason: 'Porque é relevante?'
    },
    factCheck: {
      title: 'Verificação de Factos', 
      description: 'Valide alegações com IA rigorosa.', 
      howItWorks: 'Submeta uma afirmação pública. A IA cruza a informação com fontes oficiais e analisa o contexto temporal para emitir um veredicto imparcial sobre a sua veracidade.',
      cardTitle: 'Verificar Alegação',
      cardDesc: 'Introduza a afirmação.', textareaPlaceholder: "Ex: 'Portugal tem os impostos mais altos da UE'", checkBtn: 'Verificar',
      resultTitle: 'Resultado', verdict: 'Veredicto', explanation: 'Explicação', sources: 'Fontes', historyTitle: 'Histórico',
      historyDesc: 'As suas verificações.', noHistoryTitle: 'Sem histórico', noHistoryDesc: 'Faça a sua primeira verificação.'
    },
    legislation: {
      title: 'Consultar Legislação', 
      description: 'Perguntas legais respondidas pela IA.', 
      howItWorks: 'A IA jurídica analisa o Diário da República e legislação consolidada para responder às suas dúvidas de forma simples, citando sempre as fontes legais diretas.',
      cardTitle: 'Analisar Legislação',
      cardDesc: 'Faça a sua pergunta.', textareaPlaceholder: "Ex: 'Direitos sobre teletrabalho'", consultBtn: 'Consultar',
      resultTitle: 'Análise Legal', analysis: 'Análise', sources: 'Fontes', recentQueries: 'Consultas Recentes',
      historyTitle: 'Histórico', noHistoryTitle: 'Sem consultas'
    },
    proposals: {
      title: 'O Povo Propõe', 
      description: 'Submeta ideias e apoie a comunidade.', 
      howItWorks: 'A democracia é participação. Crie propostas baseadas em simulações que realizou ou em necessidades que identificou. A comunidade vota e debate as melhores ideias.',
      newTitle: 'Nova Proposta',
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
      status: { title: 'Estado', new: 'Nova', read: 'Lida', archived: 'Arquivada' }
    },
    refutation: {
      title: 'Refutar Informação', description: 'Acredita que a IA errou? Submeta provas para correção.', label: 'Explicação',
      placeholder: 'Explique porque a informação está errada...', evidence: 'Links/Provas', 
      evidencePlaceholder: 'Links para fontes oficiais, documentos, etc.',
      submitBtn: 'Submeter Refutação', refuteBtn: 'Refutar Informação', success: 'Refutação enviada para análise.',
      status: { pending: 'Pendente', approved: 'Aprovada', rejected: 'Rejeitada' }, noRefutations: 'Sem refutações.', 
      adminTitle: 'Gestão de Refutações', user: 'Utilizador', targetContent: 'Conteúdo Alvo', submission: 'Submissão'
    },
    admin: {
      title: 'Painel de Administração', description: 'Bem-vindo, António. Gestão centralizada da plataforma.',
      tabs: { refutations: 'Refutações', sources: 'Fontes de Dados', messages: 'Mensagens', seed: 'Configuração (Seed)', data: 'Base de Dados', users: 'Comunidade', simulations: 'Simulações' },
      usersTitle: 'Cidadãos Registados', usersDesc: 'Lista de cidadãos registados na plataforma.', totalUsers: 'Cidadãos',
      registrationDate: 'Data de Registo',
      reachTitle: 'Impacto e Alcance', totalAccesses: 'Total de Acessos', anonymousAccesses: 'Visitas Anónimas',
      registeredAccesses: 'Acessos Registados',
      refutationsDesc: 'Analise as correções e evidências submetidas pela comunidade.',
      reviewTitle: 'Revisão de Refutação', reviewBy: 'Enviada por', userExplanation: 'Explicação do Utilizador:',
      evidenceLinks: 'Links e Provas:', reject: 'Rejeitar', approve: 'Aprovar e Publicar',
      sourcesTitle: 'Fontes de Dados', sourcesDesc: 'Gira as entidades oficiais e APIs ligadas à plataforma.',
      addSource: 'Adicionar Fonte', editSource: 'Editar Fonte', sourceName: 'Nome da Fonte', sourceType: 'Tipo',
      isSystem: 'Sistema', deleteSourceConfirm: 'Apagar Fonte?', deleteSourceDesc: 'Esta ação é permanente.',
      messagesTitle: 'Caixa de Entrada', messagesDesc: 'Mensagens de apoio e contacto dos utilizadores.',
      from: 'De', subject: 'Assunto', status: 'Estado', archive: 'Arquivar',
      seedTitle: 'Carregamento de Dados (Seed)', seedDesc: 'Popula o sistema com os dados de 2026.',
      indicators: 'Indicadores', indicatorsDesc: 'GDP, Inflation and Unemployment.', loadIndicators: 'Carregar Indicadores',
      stats: 'Estatísticas', statsDesc: 'Tabelas para o Explorador.', loadStats: 'Carregar Estatísticas',
      sourcesSeed: 'Fontes', sourcesSeedDesc: 'Entidades oficiais (INE, etc).', loadSources: 'Carregar Fontes',
      simulationsDesc: 'Gira as simulações públicas para remover dados obsoletos ou IDs técnicos.'
    },
    profile: {
      title: 'O Meu Perfil', description: 'Gira as suas preferências e dados pessoais.', displayName: 'Nome de Apresentação',
      language: 'Idioma Preferido', notifications: 'Preferências de Notificação', dangerZone: 'Zona de Perigo',
      deleteAccount: 'Apagar Conta Permanentemente', deleteWarning: 'Esta ação não pode ser desfeita e removerá todos os seus dados.',
      photoTitle: 'Foto de Perfil', photoDesc: 'Gerida pela sua conta Google.', personalInfo: 'Informações Pessoais',
      displayNameDesc: 'Pode alterar o seu nome de apresentação na plataforma.', langDesc: 'Isso afetará também o idioma das respostas da IA.',
      notifDesc: 'Escolha como pretende ser notificado sobre atualizações.', emailNotif: 'Notificações por Email',
      emailNotifDesc: 'Receba avisos sobre novas funcionalidades.', newsletter: 'Newsletter Semanal',
      newsletterDesc: 'Receba um resumo das simulações da semana.', deleting: 'A processar eliminação...',
      deletingDesc: 'A apagar todos os seus dados da plataforma.'
    },
    login: {
      welcome: 'Bem-vindo ao Demokratia', subtitle: 'Para continuar, inicie sessão com a sua conta Google.',
      googleBtn: 'Iniciar sessão com o Google', errorTitle: 'Erro de Autenticação',
      unauthorized: 'Domínio não autorizado na consola Firebase.'
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
      supported: 'Supported', simulate: 'Simulate', actions: 'Actions', translating_ai: 'AI is translating content...',
      confirm_delete: 'Are you sure you want to delete?'
    },
    home: {
      title: 'Updates Feed', description: 'Follow the latest news and analyses in 2026.',
      welcomeTitle: 'Welcome to Demokratia',
      welcomeSubtitle: 'Data science for citizenship.',
      welcomeIntro: 'Our goal is to provide rigorous, neutral, and fact-based analyses. No partisanship, just official data and scientific methods to help understand Portugal.',
      howItWorksTitle: 'How it works?',
      howItWorksDesc: 'Our AI consults official databases (INE, Pordata, Official Gazette) in real-time to validate claims, simulate economic impacts, and simplify legislation for you.',
      ctaProposals: 'Have a suggestion or idea for the country?',
      ctaProposalsBtn: 'Create Proposal',
      error: 'Error loading news.', source: 'Source', date: 'Date', loadingText: 'Analyzing 2026 political current affairs...',
      newsTypes: { 'Alegação': 'Claim', 'Nova Lei': 'New Law', 'Análise': 'Analysis' }
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
      title: 'Data Explorer', 
      description: 'Check detailed official stats.', 
      howItWorks: 'We use raw data from INE, Pordata, and the Bank of Portugal. AI helps cross-reference information and create visualizations that reveal real historical trends.',
      aiCardTitle: 'Ask AI',
      aiCardDesc: 'What stat are you looking for?', textareaPlaceholder: "e.g., 'Public debt evolution'",
      searchBtn: 'Search', recentQueries: 'Recent Searches', recentQueriesDesc: 'What others look for.',
      noRecentTitle: 'No searches', noRecentDesc: 'Be the first!', existingDataTitle: 'Available Data',
      searchPlaceholder: 'Filter by title...', noResultsTitle: 'No results', source: 'Source', category: 'Category',
      suggestSource: 'Suggest Data Source', suggestSourceDesc: 'Know an official portal or relevant API? Help us grow.',
      sourceName: 'Entity Name', sourceUrl: 'Official URL', sourcePurpose: 'What does it contain?', suggestBtn: 'Send Suggestion'
    },
    simulations: {
      title: 'Policy Simulations', 
      description: 'Simulate impacts of economic measures.', 
      howItWorks: 'Enter a policy (real or hypothetical) and our AI will project its effects on GDP, inflation, and unemployment, based on economic models and 2026 budget data.',
      newSimTitle: 'New Simulation',
      newSimDesc: 'Describe the policy.', textareaPlaceholder: "e.g., 'Minimum wage to 1000€'", simulateBtn: 'Simulate',
      simulating: 'Simulating...', resultsTitle: 'Impact Analysis', saveBtn: 'Save Simulation', impactSummary: 'Summary',
      indicatorsTitle: 'Projected Indicators', indicator: 'Indicator', currentValue: 'Current', projectedValue: 'Projected',
      aiReasoning: 'Reasoning', mySimsTitle: 'My Simulations', publicSimsTitle: 'Public Simulations', realPolicy: 'Real Policy', viewOfficial: 'View Source',
      convertToProposal: 'Turn into Proposal', convertDesc: 'Share this idea with the community to be voted on.',
      suggestVariable: 'Suggest Indicator', suggestVariableDesc: 'Is any data missing in simulations? Suggest new analysis metrics.',
      variableName: 'Indicator Name', variableReason: 'Why is it relevant?'
    },
    factCheck: {
      title: 'Fact Checking', 
      description: 'Validate claims with rigorous AI.', 
      howItWorks: 'Submit a public statement. AI cross-references the information with official sources and analyzes the temporal context to issue an impartial verdict on its truthfulness.',
      cardTitle: 'Check Claim',
      cardDesc: 'Enter statement.', textareaPlaceholder: "e.g., 'Highest taxes in EU'", checkBtn: 'Check',
      resultTitle: 'Result', verdict: 'Verdict', explanation: 'Explanation', sources: 'Sources', historyTitle: 'History',
      historyDesc: 'Your checks.', noHistoryTitle: 'No history', noHistoryDesc: 'Make your first check.'
    },
    legislation: {
      title: 'Consult Legislation', 
      description: 'Legal questions answered by AI.', 
      howItWorks: 'The legal AI analyzes the Official Gazette and consolidated legislation to answer your questions simply, always citing direct legal sources.',
      cardTitle: 'Analyze Legislation',
      cardDesc: 'Ask your question.', textareaPlaceholder: "e.g., 'Remote work rights'", consultBtn: 'Consult',
      resultTitle: 'Legal Analysis', analysis: 'Analysis', sources: 'Sources', recentQueries: 'Recent Queries',
      historyTitle: 'History', noHistoryTitle: 'No queries'
    },
    proposals: {
      title: 'The People Propose', 
      description: 'Submit ideas and support community.', 
      howItWorks: 'Democracy is participation. Create proposals based on simulations you performed or needs you identified. The community votes and debates the best ideas.',
      newTitle: 'New Proposal',
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
      status: { title: 'Status', new: 'New', read: 'Read', archived: 'Archived' }
    },
    refutation: {
      title: 'Refute Information', description: 'Believe the AI is wrong? Submit evidence for correction.', label: 'Explanation',
      placeholder: 'Explain why the information is wrong...', evidence: 'Links/Proof', 
      evidencePlaceholder: 'Links to official sources, documents, etc.',
      submitBtn: 'Submit Refutation', refuteBtn: 'Refute Info', success: 'Refutation sent for review.',
      status: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }, noRefutations: 'No refutations.', 
      adminTitle: 'Manage Refutations', user: 'User', targetContent: 'Target Content', submission: 'Submission'
    },
    admin: {
      title: 'Admin Dashboard', description: 'Welcome, António. Centralized platform management.',
      tabs: { refutations: 'Refutations', sources: 'Data Sources', messages: 'Messages', seed: 'Config (Seed)', data: 'Database', users: 'Community', simulations: 'Simulations' },
      usersTitle: 'Registered Citizens', usersDesc: 'List of citizens registered on the platform.', totalUsers: 'Citizens',
      registrationDate: 'Registration Date',
      reachTitle: 'Impact & Reach', totalAccesses: 'Total Accesses', anonymousAccesses: 'Anonymous Visits',
      registeredAccesses: 'Registered Accesses',
      refutationsDesc: 'Review corrections and evidence submitted by the community.',
      reviewTitle: 'Refutation Review', reviewBy: 'Submitted by', userExplanation: 'User Explanation:',
      evidenceLinks: 'Links & Evidence:', reject: 'Reject', approve: 'Approve & Publish',
      sourcesTitle: 'Data Sources', sourcesDesc: 'Manage official entities and APIs connected to the platform.',
      addSource: 'Add Source', editSource: 'Edit Source', sourceName: 'Source Name', sourceType: 'Type',
      isSystem: 'System', deleteSourceConfirm: 'Delete Source?', deleteSourceDesc: 'This action is permanent.',
      messagesTitle: 'Inbox', messagesDesc: 'Support and contact messages from users.',
      from: 'From', subject: 'Subject', status: 'Status', archive: 'Archive',
      seedTitle: 'Data Loading (Seed)', seedDesc: 'Populate the system with 2026 data.',
      indicators: 'Indicators', indicatorsDesc: 'GDP, Inflation and Unemployment.', loadIndicators: 'Load Indicators',
      stats: 'Statistics', statsDesc: 'Tables for the Data Explorer.', loadStats: 'Load Statistics',
      sourcesSeed: 'Sources', sourcesSeedDesc: 'Official entities (INE, etc).', loadSources: 'Load Statistics',
      simulationsDesc: 'Manage public simulations to remove obsolete data or technical IDs.'
    },
    profile: {
      title: 'My Profile', description: 'Manage your preferences and personal data.', displayName: 'Display Name',
      language: 'Preferred Language', notifications: 'Notification Preferences', dangerZone: 'Danger Zone',
      deleteAccount: 'Delete Account Permanently', deleteWarning: 'This action cannot be undone and will remove all your data.',
      photoTitle: 'Profile Picture', photoDesc: 'Managed by your Google account.', personalInfo: 'Personal Information',
      displayNameDesc: 'You can change your display name on the platform.', langDesc: 'This will also affect the AI response language.',
      notifDesc: 'Choose how you want to be notified about updates.', emailNotif: 'Email Notifications',
      emailNotifDesc: 'Receive alerts about new features.', newsletter: 'Weekly Newsletter',
      newsletterDesc: 'Receive a summary of the week simulations.', deleting: 'Processing deletion...',
      deletingDesc: 'Deleting all your data from the platform.'
    },
    login: {
      welcome: 'Welcome to Demokratia', subtitle: 'To continue, please sign in with your Google account.',
      googleBtn: 'Sign in with Google', errorTitle: 'Authentication Error',
      unauthorized: 'Unauthorized domain in Firebase console.'
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

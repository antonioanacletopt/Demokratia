
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    nav: {
      home: 'Início', dashboard: 'Dashboard', explorer: 'Explorador de Dados', simulations: 'Simulações', factCheck: 'Fact Check',
      legislation: 'Legislação', proposals: 'Propostas', contact: 'Contacto', profile: 'Perfil', admin: 'Admin',
      login: 'Iniciar Sessão', logout: 'Sair', terms: 'Termos de Utilização', privacy: 'Privacidade e Cookies',
      scenarios: 'Laboratório Macro', budget: 'Simulador de Carteira', about: 'Quem Somos', faq: 'FAQ'
    },
    common: {
      loading: 'A carregar...', save: 'Guardar', cancel: 'Cancelar', delete: 'Apagar', edit: 'Editar', search: 'Pesquisar...',
      noResults: 'Nenhum resultado encontrado.', view: 'Ver', back: 'Voltar', submit: 'Submeter', aiResponse: 'Resposta da IA',
      sources: 'Fontes Oficiais', share: 'Partilhar Link', copyLink: 'Copiar Link', linkCopied: 'Link copiado!', error: 'Ocorreu um erro.', success: 'Sucesso!',
      portuguese: 'Português', english: 'Inglês', language: 'Idioma', warning: 'Aviso', close: 'Fechar', accept: 'Aceitar',
      translate: 'Traduzir com IA', showOriginal: 'Ver Original', translating: 'A traduzir...', support: 'Apoiar',
      supported: 'Apoiado', simulate: 'Simular', actions: 'Ações', translating_ai: 'IA a traduzir conteúdo...',
      confirm_delete: 'Tem a certeza que deseja apagar?'
    },
    dashboard: {
      savedTitle: 'Vistas Guardadas',
      viewName: 'Nome da Vista',
      viewDescription: 'Descrição da Vista'
    },
    about: {
      title: 'Sobre a Demokratia',
      subtitle: 'Dados Abertos para uma Cidadania Ativa',
      missionTitle: 'A Nossa Missão',
      missionDesc: 'A Demokratia Portugal nasceu da necessidade de tornar a informação económica e política complexa em algo acessível, neutro e factual para todos os cidadãos. Acreditamos que uma democracia forte depende de cidadãos bem informados.',
      valuesTitle: 'Os Nossos Valores',
      neutrality: 'Neutralidade Total',
      neutralityDesc: 'Não temos cor partidária. O nosso compromisso é com o dado bruto e a análise científica.',
      transparency: 'Transparência de Fontes',
      transparencyDesc: 'Todas as informações geradas pela nossa IA citam obrigatoriamente fontes oficiais como o INE, Pordata e o Diário da República.',
      innovation: 'Inovação Cívica',
      innovationDesc: 'Utilizamos inteligência artificial de última geração para processar milhares de páginas de legislação e estatística, entregando o essencial em segundos.',
      teamTitle: 'A Nossa Equipa',
      teamDesc: 'Liderada pelo António Anacleto, a plataforma é mantida por uma rede de colaboradores focados na literacia financeira e cívica nacional.'
    },
    faq: {
      title: 'Perguntas Frequentes',
      q1: 'O que é a Demokratia?',
      a1: 'É uma plataforma de tecnologia cívica que utiliza IA para simplificar o acesso a dados públicos portugueses.',
      q2: 'De onde vêm os dados?',
      a2: 'Trabalhamos exclusivamente com fontes primárias: INE, Banco de Portugal, Pordata, Diário da República e o Portal da Transparência.',
      q3: 'A IA pode cometer erros?',
      a3: 'Sim. Embora utilizemos modelos avançados e contextos atualizados a 2026, a informação da IA deve ser sempre validada junto das fontes oficiais que disponibilizamos.',
      q4: 'Como é garantida a neutralidade?',
      a4: 'A nossa IA é programada com instruções rigorosas para não emitir opiniões políticas, focando-se apenas em correlações económicas e factos legislativos.'
    },
    home: {
      title: 'Feed de Atualizações', description: 'Acompanhe as últimas notícias e análises de 2026.',
      welcomeTitle: 'Bem-vindo à Demokratia',
      welcomeSubtitle: 'Ciência de dados ao serviço da cidadania.',
      welcomeIntro: 'O nosso objetivo é fornecer análises rigorosas, neutras e baseadas em factos puros. Sem partidarismo, apenas dados oficiais e métodos científicos para ajudar a compreender Portugal.',
      methodologyTitle: 'Rigor e Metodologia',
      methodologyDesc: 'A nossa plataforma não gera apenas texto; ela processa indicadores reais. Ao contrário de modelos de IA genéricos, a Demokratia usa contextos específicos da realidade portuguesa de 2026, cruzando-os com o Orçamento de Estado e leis em vigor.',
      howItWorksTitle: 'Como funciona?',
      howItWorksDesc: 'A nossa IA consulta em tempo real bases de dados oficiais (INE, Pordata, Diário da República) para validar alegações, simular impactos económicos e simplificar a legislação para si.',
      ctaProposals: 'Tem uma sugestão ou ideia para o país?',
      ctaProposalsBtn: 'Criar Proposta',
      error: 'Erro ao carregar notícias.', source: 'Fonte', date: 'Data', 
      loadingText: 'A analisar a atualidade política de 2026...',
      newsTypes: { 'Alegação': 'Alegação', 'Nova Lei': 'Nova Lei', 'Análise': 'Análise' }
    },
    budget: {
      title: 'Simulador de Carteira',
      description: 'Como as políticas de 2026 impactam o seu orçamento familiar.',
      howItWorks: 'Configure o seu perfil familiar e as despesas médias. Veja quanto sobra ao fim do mês e receba dicas personalizadas da nossa IA.',
      profileTitle: 'Perfil Familiar',
      adults: 'Adultos',
      children: 'Dependentes',
      income: 'Rendimento Líquido Total',
      expensesTitle: 'Despesas Mensais (Estimativas 2026)',
      housing: 'Habitação (Renda/Crédito)',
      food: 'Supermercado e Alimentação',
      utilities: 'Energia, Água e Net',
      transport: 'Transportes e Combustível',
      health: 'Saúde',
      leisure: 'Lazer e Outros',
      summaryTitle: 'Resumo Mensal',
      totalIncome: 'Rendimento Total',
      totalExpenses: 'Despesa Total',
      balance: 'Saldo Final',
      savingsRate: 'Taxa de Poupança',
      aiAnalysis: 'Análise Financeira IA',
      aiTips: 'Dicas de Poupança',
      getAnalysisBtn: 'Analisar com IA',
      defaultsInfo: 'Os valores iniciais baseiam-se no custo de vida médio em Portugal previsto para 2026.',
      lowSavings: 'Taxa de poupança crítica.',
      healthyBudget: 'Orçamento equilibrado.',
      surplus: 'Excelente capacidade de poupança.'
    },
    scenarios: {
      title: 'Laboratório de Cenários Macro',
      description: 'Ajuste os indicadores e veja o impacto na economia em tempo real.',
      howItWorks: 'Este simulador usa um motor de correlações económicas. Arraste os seletores para mudar as políticas fiscais e veja as projeções automáticas no PIB, Emprego e Contas Públicas.',
      tabs: {
        fiscal: 'Políticas Fiscais',
        budget: 'Orçamento de Estado (OE2026)'
      },
      inputs: 'Políticas e Ajustes',
      outputs: 'Projeções de Resultado',
      irsLabel: 'IRS (Taxa Média)',
      ivaLabel: 'IVA (Taxa Standard)',
      ircLabel: 'IRC (Empresas)',
      investLabel: 'Investimento Público',
      smnLabel: 'Salário Mínimo (SMN)',
      gdpLabel: 'Crescimento do PIB',
      unemploymentLabel: 'Taxa de Desemprego',
      inflationLabel: 'Inflação (Preços)',
      debtLabel: 'Dívida Pública',
      balanceLabel: 'Saldo Orçamental',
      budget: {
        health: 'Saúde (SNS)',
        education: 'Educação',
        social: 'Segurança Social',
        defense: 'Defesa e Segurança',
        infra: 'Infraestruturas',
        total: 'Despesa Total Simulada',
        allocation: 'Alocação de Recursos'
      },
      saveTitle: 'Guardar Exercício',
      saveDesc: 'Dê um nome ao seu cenário para o partilhar.',
      myScenarios: 'Meus Cenários Guardados',
      publicScenarios: 'Cenários da Comunidade',
      aiAnalysis: 'Parecer da IA sobre este Cenário',
      reset: 'Reset para Realidade 2026',
      suggestIndicator: 'Sugerir Indicador',
      suggestIndicatorDesc: 'Que outra variável gostaria de poder controlar ou ver o resultado?'
    },
    explorer: {
      title: 'Explorador de Dados', 
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
      resultTitle: 'Resultado', verdict: 'Veredicto', explanation: 'Explanation', sources: 'Fontes', historyTitle: 'O Meu Histórico',
      historyDesc: 'As suas verificações privadas.', noHistoryTitle: 'Sem histórico', noHistoryDesc: 'Faça a sua primeira verificação.',
      recentChecks: 'Verificações da Comunidade', recentChecksDesc: 'O que os cidadãos andam a verificar.'
    },
    legislation: {
      title: 'Consultar Legislação', 
      description: 'Perguntas legais respondidas pela IA.', 
      howItWorks: 'A IA jurídica analisa o Diário da República e legislação consolidada para responder às suas dúvidas de forma simples, citando sempre as fontes legais diretas.',
      cardTitle: 'Analisar Legislação',
      cardDesc: 'Faça a sua pergunta.', textareaPlaceholder: "Ex: 'Direitos sobre teletrabalho'", consultBtn: 'Consultar',
      resultTitle: 'Análise Legal', analysis: 'Análise', sources: 'Fontes', recentQueries: 'Inteligência Coletiva (Recentes)',
      historyTitle: 'O Meu Histórico', noHistoryTitle: 'Sem consultas'
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
      title: 'Refutar Informação', description: 'Acredita que a IA errou? Submeta provas para correção.', label: 'Explanation',
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
      sourcesSeed: 'Fontes', sourcesSeedDesc: 'Entidades oficiais (INE, etc).', loadSources: 'Carregar Estatísticas',
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
      home: 'Home', dashboard: 'Dashboard', explorer: 'Data Explorer', simulations: 'Simulations', factCheck: 'Fact Check',
      legislation: 'Legislation', proposals: 'Proposals', contact: 'Contact', profile: 'Profile', admin: 'Admin',
      login: 'Login', logout: 'Logout', terms: 'Terms of Use', privacy: 'Privacy & Cookies',
      scenarios: 'Macro Lab', budget: 'Wallet Simulator', about: 'About Us', faq: 'FAQ'
    },
    common: {
      loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', search: 'Search...',
      noResults: 'No results found.', view: 'View', back: 'Back', submit: 'Submit', aiResponse: 'AI Response',
      sources: 'Official Sources', share: 'Share Link', copyLink: 'Copy Link', linkCopied: 'Link copied!', error: 'An error occurred.', success: 'Success!',
      portuguese: 'Portuguese', english: 'English', language: 'Language', warning: 'Warning', close: 'Close', accept: 'Accept',
      translate: 'Translate with AI', showOriginal: 'Show Original', translating: 'Translating...', support: 'Support',
      supported: 'Supported', simulate: 'Simulate', actions: 'Actions', translating_ai: 'AI is translating content...',
      confirm_delete: 'Are you sure you want to delete?'
    },
    dashboard: {
      savedTitle: 'Saved Views',
      viewName: 'View Name',
      viewDescription: 'View Description'
    },
    about: {
      title: 'About Demokratia',
      subtitle: 'Open Data for Active Citizenship',
      missionTitle: 'Our Mission',
      missionDesc: 'Demokratia Portugal was born from the need to make complex economic and political information accessible, neutral, and factual for all citizens. We believe a strong democracy depends on well-informed citizens.',
      valuesTitle: 'Our Values',
      neutrality: 'Total Neutrality',
      neutralityDesc: 'We have no political party colors. Our commitment is to raw data and scientific analysis.',
      transparency: 'Source Transparency',
      transparencyDesc: 'All information generated by our AI must cite official sources like INE, Pordata, and the Official Gazette.',
      innovation: 'Civic Innovation',
      innovationDesc: 'We use state-of-the-art AI to process thousands of pages of legislation and statistics, delivering the essentials in seconds.',
      teamTitle: 'Our Team',
      teamDesc: 'Led by António Anacleto, the platform is maintained by a network of collaborators focused on national financial and civic literacy.'
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'What is Demokratia?',
      a1: 'It is a civic technology platform that uses AI to simplify access to Portuguese public data.',
      q2: 'Where does the data come from?',
      a2: 'We work exclusively with primary sources: INE, Banco de Portugal, Pordata, Official Gazette, and the Transparency Portal.',
      q3: 'Can AI make mistakes?',
      a3: 'Yes. Although we use advanced models and 2026-updated contexts, AI information should always be validated against the official sources we provide.',
      q4: 'How is neutrality guaranteed?',
      a4: 'Our AI is programmed with strict instructions not to emit political opinions, focusing only on economic correlations and legislative facts.'
    },
    home: {
      title: 'Updates Feed', description: 'Follow the latest news and analyses in 2026.',
      welcomeTitle: 'Welcome to Demokratia',
      welcomeSubtitle: 'Data science for citizenship.',
      welcomeIntro: 'Our goal is to provide rigorous, neutral, and fact-based analyses. No partisanship, just official data and scientific methods to help understand Portugal.',
      methodologyTitle: 'Rigor and Methodology',
      methodologyDesc: 'Our platform does not just generate text; it processes real indicators. Unlike generic AI models, Demokratia uses specific contexts of the Portuguese reality of 2026, cross-referencing them with the State Budget and laws in force.',
      howItWorksTitle: 'How it works?',
      howItWorksDesc: 'Our AI consults official databases (INE, Pordata, Official Gazette) in real-time to validate claims, simulate economic impacts, and simplify legislation for you.',
      ctaProposals: 'Have a suggestion or idea for the country?',
      ctaProposalsBtn: 'Create Proposal',
      error: 'Error loading news.', source: 'Source', date: 'Date', loadingText: 'Analyzing 2026 political current affairs...',
      newsTypes: { 'Alegação': 'Claim', 'Nova Lei': 'New Law', 'Análise': 'Analysis' }
    },
    budget: {
      title: 'Wallet Simulator',
      description: 'How 2026 policies impact your family budget.',
      howItWorks: 'Set up your family profile and average expenses. See what\'s left at the end of the month and receive personalized tips from our AI.',
      profileTitle: 'Family Profile',
      adults: 'Adults',
      children: 'Dependents',
      income: 'Total Net Income',
      expensesTitle: 'Monthly Expenses (2026 Estimates)',
      housing: 'Housing (Rent/Mortgage)',
      food: 'Supermarket & Food',
      utilities: 'Utilities, Water & Net',
      transport: 'Transport & Fuel',
      health: 'Health',
      leisure: 'Leisure & Others',
      summaryTitle: 'Monthly Summary',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Final Balance',
      savingsRate: 'Savings Rate',
      aiAnalysis: 'AI Financial Health Check',
      aiTips: 'Saving Tips',
      getAnalysisBtn: 'Analyze with AI',
      defaultsInfo: 'Initial values are based on the average cost of living in Portugal projected for 2026.',
      lowSavings: 'Critical savings rate.',
      healthyBudget: 'Balanced budget.',
      surplus: 'Excellent saving capacity.'
    },
    scenarios: {
      title: 'Macro Scenario Lab',
      description: 'Adjust indicators and see the impact on the economy in real-time.',
      howItWorks: 'This simulator uses an economic correlation engine. Drag the sliders to change fiscal policies and see automatic projections on GDP, Employment and Public Finances.',
      tabs: {
        fiscal: 'Fiscal Policies',
        budget: 'State Budget (OE2026)'
      },
      inputs: 'Policies & Adjustments',
      outputs: 'Outcome Projections',
      irsLabel: 'IRS (Avg Rate)',
      ivaLabel: 'VAT (Std Rate)',
      ircLabel: 'IRC (Corporate)',
      investLabel: 'Public Investment',
      smnLabel: 'Min Wage (SMN)',
      gdpLabel: 'GDP Growth',
      unemploymentLabel: 'Unemployment Rate',
      inflationLabel: 'Inflation (Prices)',
      debtLabel: 'Public Debt',
      balanceLabel: 'Budget Balance',
      budget: {
        health: 'Health (SNS)',
        education: 'Education',
        social: 'Social Security',
        defense: 'Defense & Security',
        infra: 'Infrastructure',
        total: 'Simulated Total Spend',
        allocation: 'Resource Allocation'
      },
      tooltips: {
        irs: 'IRS affects income.',
        iva: 'VAT affects prices.',
        irc: 'Corporate tax affects competition.',
        invest: 'Infrastructure builds future.',
        smn: 'Min wage affects consumption.',
        gdp: 'Economic health.',
        unemployment: 'Jobs.',
        inflation: 'Prices.',
        debt: 'Sustainability.',
        balance: 'Balance.'
      },
      saveTitle: 'Save Exercise',
      saveDesc: 'Name your scenario to share it.',
      myScenarios: 'My Saved Scenarios',
      publicScenarios: 'Community Scenarios',
      aiAnalysis: 'AI Feedback on this Scenario',
      reset: 'Reset to 2026 Reality',
      suggestIndicator: 'Suggest Indicator',
      suggestIndicatorDesc: 'What other variable would you like to control or see as result?'
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
      sourceName: 'Source Name', sourceUrl: 'Official URL', sourcePurpose: 'What does it contain?', suggestBtn: 'Send Suggestion'
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
      resultTitle: 'Result', verdict: 'Verdict', explanation: 'Explanation', sources: 'Sources', historyTitle: 'My History',
      historyDesc: 'Your private checks.', noHistoryTitle: 'No history', noHistoryDesc: 'Make your first check.',
      recentChecks: 'Community Verifications', recentChecksDesc: 'What citizens are checking lately.'
    },
    legislation: {
      title: 'Consult Legislation', 
      description: 'Legal questions answered by IA.', 
      howItWorks: 'The legal AI analyzes the Official Gazette and consolidated legislation to answer your questions simply, always citing direct legal sources.',
      cardTitle: 'Analyze Legislation',
      cardDesc: 'Ask your question.', textareaPlaceholder: "e.g., 'Remote work rights'", consultBtn: 'Consult',
      resultTitle: 'Legal Analysis', analysis: 'Analysis', sources: 'Sources', recentQueries: 'Collective Intelligence (Recent)',
      historyTitle: 'My History', noHistoryTitle: 'No queries'
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
    let finalLang: Language = 'pt';
    
    if (saved && (saved === 'pt' || saved === 'en')) {
      finalLang = saved;
    } else {
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'pt';
      // Se não for português, assume inglês como língua franca internacional
      if (browserLang !== 'pt') {
        finalLang = 'en';
      }
    }
    
    setLanguageState(finalLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = finalLang === 'pt' ? 'pt-PT' : 'en-US';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en-US';
    }
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

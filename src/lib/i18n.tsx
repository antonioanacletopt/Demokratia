"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en';

const DICTIONARY = {
  pt: {
    nav: {
      home: 'Início',
      explorer: 'Explorador',
      map: 'Atlas Regional',
      irs: 'Simulador IRS',
      budget: 'Orçamento',
      simulations: 'Impacto IA',
      scenarios: 'Laboratório',
      factCheck: 'Fact-Check',
      legislation: 'Leis',
      proposals: 'Propostas',
      methodology: 'Metodologia',
      about: 'Sobre',
      faq: 'FAQ',
      contact: 'Contacto',
      profile: 'Perfil',
      admin: 'Admin',
      login: 'Entrar',
      logout: 'Sair'
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      success: 'Sucesso!',
      error: 'Ocorreu um erro.',
      loading: 'A carregar...',
      view: 'Ver Detalhes',
      delete: 'Apagar',
      submit: 'Submeter',
      language: 'Idioma',
      portuguese: 'Português',
      english: 'Inglês',
      learnMore: 'Saber mais',
      simulate: 'Simular',
      share: 'Partilhar',
      supported: 'Apoiado',
      support: 'Apoiar',
      translating: 'A traduzir...',
      translate: 'Traduzir (EN)',
      showOriginal: 'Ver Original',
      linkCopied: 'Link copiado!',
      noResults: 'Sem resultados.',
      warning: 'Aviso',
      confirm_delete: 'Tem a certeza que deseja apagar?'
    },
    home: {
      welcomeTitle: 'Dados, Análises e Simulações para Portugal',
      welcomeSubtitle: 'Transparência Democrática',
      welcomeIntro: 'Explore dados públicos, verifique factos e simule o impacto de políticas económicas com a ajuda de inteligência artificial baseada em fontes oficiais.',
      source: 'Fonte',
      title: 'Atualidade Democrática',
      description: 'Análises geradas por IA sobre as últimas decisões e factos em Portugal.',
      newsTypes: {
        'Alegação': 'Fact-Check',
        'Nova Lei': 'Legislação',
        'Análise': 'Económica'
      },
      methodologyTitle: 'Como funciona a Demokratia?',
      methodologyDesc: 'Utilizamos modelos de IA (RAG) que consultam exclusivamente fontes oficiais como o INE, Pordata e o Diário da República para garantir neutralidade e rigor.'
    },
    explorer: {
      title: 'Explorador de Dados',
      description: 'Consulte estatísticas oficiais de forma intuitiva.',
      howItWorks: 'A IA pesquisa em múltiplos portais oficiais e apresenta os dados em tabelas ou gráficos interativos.',
      aiCardTitle: 'Consulta Inteligente',
      aiCardDesc: 'Descreva os dados que procura (ex: "Evolução do desemprego jovem desde 2010")',
      textareaPlaceholder: 'O que deseja saber sobre Portugal?',
      searchBtn: 'Pesquisar Dados',
      suggestSource: 'Sugerir Fonte',
      suggestSourceDesc: 'Conhece um portal de dados oficiais que não temos?',
      sourceName: 'Nome da Fonte',
      sourceUrl: 'URL do Portal',
      sourcePurpose: 'Tipo de Dados',
      suggestBtn: 'Enviar Sugestão',
      existingDataTitle: 'Datasets Disponíveis',
      officialSourcesTitle: 'Fontes Monitorizadas',
      officialSourcesDesc: 'Portais que a nossa IA consulta em tempo real.'
    },
    budget: {
      title: 'Orçamento Familiar 2026',
      description: 'Simule o seu custo de vida no contexto económico de 2026.',
      howItWorks: 'Ajuste os seus rendimentos e despesas para obter uma análise de sustentabilidade financeira baseada na inflação prevista.',
      profileTitle: 'Perfil do Agregado',
      adults: 'Adultos',
      children: 'Dependentes',
      income: 'Rendimento Mensal Líquido (€)',
      expensesTitle: 'Despesas Mensais',
      defaultsInfo: 'Valores médios estimados para 2026.',
      housing: 'Habitação',
      food: 'Alimentação',
      utilities: 'Energia e Água',
      transport: 'Transportes',
      health: 'Saúde',
      leisure: 'Lazer',
      summaryTitle: 'Resumo Mensal',
      totalIncome: 'Rendimento Total',
      totalExpenses: 'Despesa Total',
      balance: 'Saldo Final',
      savingsRate: 'Taxa de Poupança',
      getAnalysisBtn: 'Analisar com IA',
      aiAnalysis: 'Parecer Financeiro IA',
      aiTips: 'Sugestões de Otimização'
    },
    irs: {
      title: 'Simulador de IRS 2026',
      description: 'Estime o seu acerto fiscal para o próximo ano.',
      personalCard: 'Dados Pessoais',
      maritalStatus: 'Estado Civil',
      single: 'Solteiro / Separado',
      marriedJoint: 'Casado (Conjunto)',
      marriedSeparate: 'Casado (Separado)',
      dependents: 'Dependentes',
      incomeCard: 'Rendimentos Brutos Anuais',
      expensesCard: 'Deduções à Coleta (Despesas)',
      health: 'Saúde',
      education: 'Educação',
      housing: 'Rendas / Juros Habitação',
      general: 'Gerais Familiares',
      retention: 'Retenção na Fonte Total (€)',
      calculateBtn: 'Simular IRS',
      resultCard: 'Resultado Estimado',
      refund: 'Reembolso Previsto',
      payment: 'Pagamento Previsto',
      estimatedTax: 'Imposto Total (Coleta)',
      effectiveRate: 'Taxa Efetiva',
      aiAnalysis: 'Análise do Consultor Fiscal IA',
      tipsTitle: 'Dicas de Otimização Fiscal'
    },
    scenarios: {
      title: 'Laboratório de Políticas',
      description: 'Simule o impacto de alterações macroeconómicas.',
      howItWorks: 'Ajuste variáveis como impostos ou despesa pública para ver projeções no PIB, Desemprego e Dívida Pública.',
      tabs: {
        fiscal: 'Fiscalidade',
        budget: 'Orçamento Estado'
      },
      inputs: 'Variáveis Económicas',
      irsLabel: 'Taxa Média IRS',
      ivaLabel: 'IVA (Consumo)',
      ircLabel: 'IRC (Empresas)',
      smnLabel: 'Salário Mínimo',
      budget: {
        total: 'Despesa Total',
        health: 'Saúde',
        education: 'Educação',
        social: 'Seg. Social',
        infra: 'Infraestruturas'
      },
      outputs: 'Projeção de Impacto (2026)',
      gdpLabel: 'Crescimento PIB',
      unemploymentLabel: 'Taxa Desemprego',
      debtLabel: 'Dívida Pública',
      balanceLabel: 'Défice/Superávit',
      saveTitle: 'Guardar Cenário',
      saveDesc: 'Partilhe o seu modelo económico com a comunidade.',
      aiAnalysis: 'Análise de Viabilidade IA',
      publicScenarios: 'Cenários da Comunidade',
      reset: 'Reset',
      suggestIndicator: 'Sugerir Indicador',
      suggestIndicatorDesc: 'Que outra variável económica gostaria de simular?'
    },
    factCheck: {
      title: 'Verificador de Factos',
      description: 'Valide alegações políticas com fontes oficiais.',
      howItWorks: 'A IA cruza a alegação com dados históricos, legislação e estatísticas reais.',
      cardTitle: 'Verificar Alegação',
      cardDesc: 'Introduza uma frase, promessa ou dado estatístico ouvido na esfera pública.',
      textareaPlaceholder: 'Ex: "A carga fiscal em Portugal é a maior de sempre"',
      checkBtn: 'Verificar Agora',
      resultTitle: 'Veredicto da IA',
      verdict: 'Resultado',
      explanation: 'Análise Detalhada',
      sources: 'Fontes Consultadas',
      recentChecks: 'Verificações Recentes',
      recentChecksDesc: 'O que os cidadãos têm questionado ultimamente.',
      historyTitle: 'O meu Histórico',
      historyDesc: 'Apenas visível para si.',
      noHistoryTitle: 'Sem histórico',
      noHistoryDesc: 'As suas verificações aparecerão aqui.'
    },
    legislation: {
      title: 'Consulta Legislativa',
      description: 'Descomplique a lei portuguesa com ajuda da IA.',
      howItWorks: 'O nosso motor consulta o Diário da República para responder a dúvidas legais em linguagem corrente.',
      cardTitle: 'Pergunta sobre a Lei',
      cardDesc: 'Sobre que tema legal ou alteração legislativa deseja saber mais?',
      textareaPlaceholder: 'Ex: "Quais as novas regras para o teletrabalho em 2026?"',
      consultBtn: 'Consultar Lei',
      resultTitle: 'Explicação Legal',
      analysis: 'Análise Sintetizada',
      sources: 'Diplomas Legais',
      recentQueries: 'Consultas da Comunidade',
      historyTitle: 'As minhas Consultas',
      noHistoryTitle: 'Sem consultas guardadas'
    },
    proposals: {
      title: 'O Povo Propõe',
      description: 'Espaço de participação cívica e ideias para o país.',
      howItWorks: 'Submeta propostas de melhoria para Portugal. As ideias mais votadas são analisadas pelo nosso Simulador IA.',
      communityTitle: 'Ideias da Comunidade',
      newTitle: 'Nova Proposta',
      titleLabel: 'Título da Ideia',
      descLabel: 'Descrição Detalhada',
      submitBtn: 'Publicar Proposta',
      searchPlaceholder: 'Pesquisar ideias...',
      votedBtn: 'Voto registado!',
      editTitle: 'Editar Proposta',
      titleMinError: 'Mínimo 10 caracteres',
      descMinError: 'Mínimo 30 caracteres'
    },
    profile: {
      title: 'A minha Conta',
      description: 'Gira as suas preferências e dados pessoais.',
      photoTitle: 'Foto de Perfil',
      photoDesc: 'Sincronizada via Google Login.',
      personalInfo: 'Informação Pessoal',
      displayName: 'Nome de Exibição',
      displayNameDesc: 'Como aparecerá nas propostas e cenários.',
      language: 'Idioma de Preferência',
      langDesc: 'Altera a interface e as respostas da IA.',
      notifications: 'Notificações',
      notifDesc: 'Como deseja ser informado.',
      emailNotif: 'Alertas de Verificação',
      emailNotifDesc: 'Receba email quando uma proposta sua for analisada.',
      newsletter: 'Newsletter Semanal',
      newsletterDesc: 'Resumo dos dados e factos mais importantes da semana.',
      dangerZone: 'Zona de Perigo',
      deleteAccount: 'Apagar Conta Permanentemente',
      deleteWarning: 'Esta ação é irreversível. Todos os seus cenários e histórico serão apagados.',
      deleting: 'A apagar...',
      deletingDesc: 'A remover todos os seus dados dos nossos sistemas.'
    },
    about: {
      title: 'Sobre a Demokratia',
      subtitle: 'Dados, não Ideologias.',
      missionTitle: 'A Nossa Missão',
      missionDesc: 'Capacitar o cidadão com ferramentas tecnológicas de ponta para navegar na complexidade política e económica, promovendo uma democracia baseada em factos.',
      teamTitle: 'A Equipa',
      teamDesc: 'Projeto independente desenvolvido por especialistas em IA e transparência de dados.',
      valuesTitle: 'Os Nossos Valores',
      neutrality: 'Neutralidade Radical',
      neutralityDesc: 'Os nossos algoritmos não favorecem partidos. Citamos fontes, não opiniões.',
      transparency: 'Transparência de Dados',
      transparencyDesc: 'Todos os dados utilizados são públicos e podem ser verificados nos portais oficiais.',
      innovation: 'Inovação Cívica',
      innovationDesc: 'Usamos a IA para tornar a legislação e a economia compreensíveis para todos.'
    },
    faq: {
      title: 'Perguntas Frequentes',
      q1: 'De onde vêm os dados?',
      a1: 'Os dados vêm exclusivamente de fontes oficiais: INE, Pordata, Banco de Portugal e Diário da República.',
      q2: 'A IA pode inventar factos?',
      a2: 'Utilizamos uma técnica chamada RAG (Retrieval-Augmented Generation) que obriga a IA a basear as suas respostas apenas nos documentos oficiais fornecidos.',
      q3: 'O projeto é partidário?',
      a3: 'Não. A Demokratia é um projeto independente e sem qualquer afiliação política ou financiamento governamental.',
      q4: 'As simulações são exatas?',
      a4: 'As simulações são modelos preditivos baseados em tendências históricas e regras económicas estabelecidas. Devem ser usadas como guia, não como certeza absoluta.'
    },
    contact: {
      title: 'Apoio ao Cidadão',
      description: 'Dúvidas técnicas ou sugestões de melhoria.',
      newTitle: 'Nova Mensagem',
      newDesc: 'Responderemos num prazo de 48h úteis.',
      subject: 'Assunto',
      message: 'Mensagem',
      sendBtn: 'Enviar Mensagem',
      historyTitle: 'As minhas Mensagens',
      noMessagesTitle: 'Sem mensagens enviadas',
      status: {
        title: 'Estado',
        new: 'Enviada',
        read: 'Lida',
        archived: 'Arquivada'
      }
    },
    admin: {
      title: 'Painel de Controlo',
      description: 'Gestão de sistema e conteúdos comunitários.',
      tabs: {
        users: 'Utilizadores',
        simulations: 'Simulações',
        refutations: 'Refutações',
        sources: 'Fontes',
        data: 'Datasets',
        messages: 'Mensagens',
        seed: 'Sistema'
      },
      totalUsers: 'Total Cidadãos',
      totalAccesses: 'Acessos Totais',
      anonymousAccesses: 'Anónimos',
      registeredAccesses: 'Registados',
      usersTitle: 'Utilizadores Registados',
      usersDesc: 'Lista de cidadãos que criaram conta na plataforma.',
      registrationDate: 'Data de Registo',
      simulationsDesc: 'Moderação de simulações públicas.',
      refutationsDesc: 'Correções submetidas pelos utilizadores ao conteúdo da IA.',
      reviewTitle: 'Revisão de Refutação',
      reviewBy: 'Submetido por',
      userExplanation: 'Explicação do Utilizador',
      evidenceLinks: 'Links de Evidência',
      approve: 'Aprovar',
      reject: 'Rejeitar',
      sourcesTitle: 'Fontes de Dados',
      sourcesDesc: 'Repositório de portais oficiais.',
      addSource: 'Adicionar Fonte',
      editSource: 'Editar Fonte',
      deleteSourceConfirm: 'Apagar Fonte?',
      deleteSourceDesc: 'Isto pode afetar as pesquisas da IA relacionadas com esta fonte.',
      messagesTitle: 'Caixa de Entrada',
      messagesDesc: 'Contactos recebidos via formulário.',
      from: 'De',
      subject: 'Assunto',
      status: 'Estado',
      archive: 'Arquivar',
      seedTitle: 'Carga de Dados 2026',
      seedDesc: 'Operações críticas de sistema para o ano de 2026.',
      indicators: 'Indicadores Base',
      indicatorsDesc: 'PIB, Inflação, Desemprego.',
      loadIndicators: 'Carregar Indicadores',
      stats: 'Explorador',
      statsDesc: 'Datasets do mercado de trabalho e social.',
      loadStats: 'Carregar Datasets',
      sourcesSeed: 'Portais Oficiais',
      sourcesSeedDesc: 'DGO, INE, Banco de Portugal.',
      loadSources: 'Carregar Fontes'
    },
    refutation: {
      title: 'Contestar Resposta IA',
      description: 'Encontrou um erro ou imprecisão? Ajude-nos a melhorar o sistema enviando evidências.',
      refuteBtn: 'Contestar IA',
      label: 'Qual é o erro?',
      placeholder: 'Descreva detalhadamente porque é que a resposta da IA está incorreta...',
      evidence: 'Links de Evidência (Fontes Oficiais)',
      evidencePlaceholder: 'Ex: URL do Diário da República ou INE',
      submitBtn: 'Enviar Contestação',
      success: 'Obrigado! A sua refutação será analisada por um moderador.',
      adminTitle: 'Gestão de Refutações',
      user: 'Utilizador',
      targetContent: 'Conteúdo Alvo',
      submission: 'Submetida em',
      noRefutations: 'Sem refutações pendentes.',
      status: {
        pending: 'Pendente',
        approved: 'Corrigido',
        rejected: 'Rejeitado'
      }
    },
    cookies: {
      title: 'Política de Cookies',
      desc: 'Utilizamos cookies para melhorar a sua experiência e personalizar anúncios via Google AdSense.'
    },
    privacy: {
      title: 'Privacidade e RGPD',
      intro: 'A sua privacidade é fundamental.',
      dataTitle: 'Que dados recolhemos?',
      dataDesc: 'Recolhemos apenas o necessário para o funcionamento da plataforma.',
      cookiesTitle: 'Publicidade e Cookies',
      cookiesDesc: 'O site utiliza anúncios para se manter gratuito.',
      purposeTitle: 'Finalidade',
      purposeDesc: 'Melhorar a literacia cívica.',
      rightsTitle: 'Os seus Direitos',
      rightsDesc: 'Pode apagar os seus dados a qualquer momento.'
    },
    terms: {
      title: 'Termos de Utilização',
      intro: 'Ao usar a Demokratia, concorda com os nossos termos.',
      aiTitle: 'Aviso sobre IA',
      aiDesc: 'As respostas da IA são baseadas em fontes oficiais mas não substituem aconselhamento legal ou financeiro profissional.',
      usageTitle: 'Uso Correto',
      usageDesc: 'A plataforma deve ser usada para fins informativos e cívicos.',
      ipTitle: 'Propriedade Intelectual',
      ipDesc: 'O conteúdo gerado é para uso pessoal e democrático.'
    },
    map: {
      title: 'Atlas Regional Portugal 2026',
      description: 'Visualize a disparidade económica e social entre distritos.',
      salary: 'Salário Médio Mensal',
      poverty: 'Taxa de Risco de Pobreza',
      population: 'Densidade Populacional',
      housing: 'Preço Médio Habitação (€/m²)',
      legend: 'Legenda de Intensidade',
      low: 'Baixo',
      high: 'Alto',
      indicators: 'Indicadores Regionais'
    }
  },
  en: {
    nav: {
      home: 'Home',
      explorer: 'Explorer',
      map: 'Regional Atlas',
      irs: 'IRS Simulator',
      budget: 'Budget',
      simulations: 'AI Impact',
      scenarios: 'Laboratory',
      factCheck: 'Fact-Check',
      legislation: 'Laws',
      proposals: 'Proposals',
      methodology: 'Methodology',
      about: 'About',
      faq: 'FAQ',
      contact: 'Contact',
      profile: 'Profile',
      admin: 'Admin',
      login: 'Login',
      logout: 'Logout'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      success: 'Success!',
      error: 'An error occurred.',
      loading: 'Loading...',
      view: 'View Details',
      delete: 'Delete',
      submit: 'Submit',
      language: 'Language',
      portuguese: 'Portuguese',
      english: 'English',
      learnMore: 'Learn more',
      simulate: 'Simulate',
      share: 'Share',
      supported: 'Supported',
      support: 'Support',
      translating: 'Translating...',
      translate: 'Translate',
      showOriginal: 'Show Original',
      linkCopied: 'Link copied!',
      noResults: 'No results.',
      warning: 'Warning',
      confirm_delete: 'Are you sure you want to delete?'
    },
    home: {
      welcomeTitle: 'Data, Analysis and Simulations for Portugal',
      welcomeSubtitle: 'Democratic Transparency',
      welcomeIntro: 'Explore public data, check facts and simulate the impact of economic policies with the help of artificial intelligence based on official sources.',
      source: 'Source',
      title: 'Democratic Current Affairs',
      description: 'AI-generated analysis of the latest decisions and facts in Portugal.',
      newsTypes: {
        'Alegação': 'Fact-Check',
        'Nova Lei': 'Legislation',
        'Análise': 'Economic'
      },
      methodologyTitle: 'How does Demokratia work?',
      methodologyDesc: 'We use AI models (RAG) that exclusively consult official sources such as INE, Pordata and the Diário da República to ensure neutrality and rigor.'
    },
    explorer: {
      title: 'Data Explorer',
      description: 'Consult official statistics intuitively.',
      howItWorks: 'AI searches multiple official portals and presents the data in interactive tables or charts.',
      aiCardTitle: 'Intelligent Query',
      aiCardDesc: 'Describe the data you are looking for (e.g., "Youth unemployment evolution since 2010")',
      textareaPlaceholder: 'What do you want to know about Portugal?',
      searchBtn: 'Search Data',
      suggestSource: 'Suggest Source',
      suggestSourceDesc: 'Know an official data portal we don\'t have?',
      sourceName: 'Source Name',
      sourceUrl: 'Portal URL',
      sourcePurpose: 'Data Type',
      suggestBtn: 'Send Suggestion',
      existingDataTitle: 'Available Datasets',
      officialSourcesTitle: 'Monitored Sources',
      officialSourcesDesc: 'Portals that our AI consults in real-time.'
    },
    budget: {
      title: 'Family Budget 2026',
      description: 'Simulate your cost of living in the 2026 economic context.',
      howItWorks: 'Adjust your income and expenses to get a financial sustainability analysis based on projected inflation.',
      profileTitle: 'Household Profile',
      adults: 'Adults',
      children: 'Dependents',
      income: 'Net Monthly Income (€)',
      expensesTitle: 'Monthly Expenses',
      defaultsInfo: 'Estimated average values for 2026.',
      housing: 'Housing',
      food: 'Food',
      utilities: 'Energy & Water',
      transport: 'Transport',
      health: 'Health',
      leisure: 'Leisure',
      summaryTitle: 'Monthly Summary',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expense',
      balance: 'Final Balance',
      savingsRate: 'Savings Rate',
      getAnalysisBtn: 'Analyze with AI',
      aiAnalysis: 'AI Financial Report',
      aiTips: 'Optimization Suggestions'
    },
    irs: {
      title: 'IRS Simulator 2026',
      description: 'Estimate your tax adjustment for next year.',
      personalCard: 'Personal Data',
      maritalStatus: 'Marital Status',
      single: 'Single / Separated',
      marriedJoint: 'Married (Joint)',
      marriedSeparate: 'Married (Separate)',
      dependents: 'Dependents',
      incomeCard: 'Gross Annual Income',
      expensesCard: 'Tax Deductions (Expenses)',
      health: 'Health',
      education: 'Education',
      housing: 'Rent / Home Interest',
      general: 'General Household',
      retention: 'Total Withholding Tax (€)',
      calculateBtn: 'Simulate IRS',
      resultCard: 'Estimated Result',
      refund: 'Expected Refund',
      payment: 'Expected Payment',
      estimatedTax: 'Total Tax (Collection)',
      effectiveRate: 'Effective Rate',
      aiAnalysis: 'AI Tax Consultant Analysis',
      tipsTitle: 'Tax Optimization Tips'
    },
    scenarios: {
      title: 'Policy Laboratory',
      description: 'Simulate the impact of macroeconomic changes.',
      howItWorks: 'Adjust variables like taxes or public spending to see projections on GDP, Unemployment and Public Debt.',
      tabs: {
        fiscal: 'Taxation',
        budget: 'State Budget'
      },
      inputs: 'Economic Variables',
      irsLabel: 'Average IRS Rate',
      ivaLabel: 'VAT (Consumption)',
      ircLabel: 'IRC (Corporate)',
      smnLabel: 'Minimum Wage',
      budget: {
        total: 'Total Spending',
        health: 'Health',
        education: 'Education',
        social: 'Social Security',
        infra: 'Infrastructure'
      },
      outputs: 'Impact Projection (2026)',
      gdpLabel: 'GDP Growth',
      unemploymentLabel: 'Unemployment Rate',
      debtLabel: 'Public Debt',
      balanceLabel: 'Deficit/Surplus',
      saveTitle: 'Save Scenario',
      saveDesc: 'Share your economic model with the community.',
      aiAnalysis: 'AI Viability Analysis',
      publicScenarios: 'Community Scenarios',
      reset: 'Reset',
      suggestIndicator: 'Suggest Indicator',
      suggestIndicatorDesc: 'What other economic variable would you like to simulate?'
    },
    factCheck: {
      title: 'Fact-Checker',
      description: 'Validate political claims with official sources.',
      howItWorks: 'AI cross-references the claim with historical data, legislation and real statistics.',
      cardTitle: 'Verify Claim',
      cardDesc: 'Enter a phrase, promise or statistical data heard in the public sphere.',
      textareaPlaceholder: 'e.g., "The tax burden in Portugal is the highest ever"',
      checkBtn: 'Verify Now',
      resultTitle: 'AI Verdict',
      verdict: 'Result',
      explanation: 'Detailed Analysis',
      sources: 'Consulted Sources',
      recentChecks: 'Recent Checks',
      recentChecksDesc: 'What citizens have been questioning lately.',
      historyTitle: 'My History',
      historyDesc: 'Only visible to you.',
      noHistoryTitle: 'No history',
      noHistoryDesc: 'Your checks will appear here.'
    },
    legislation: {
      title: 'Legislative Query',
      description: 'Uncomplicate Portuguese law with AI help.',
      howItWorks: 'Our engine consults the Diário da República to answer legal questions in common language.',
      cardTitle: 'Question about the Law',
      cardDesc: 'What legal topic or legislative change do you want to know more about?',
      textareaPlaceholder: 'e.g., "What are the new rules for teleworking in 2026?"',
      consultBtn: 'Consult Law',
      resultTitle: 'Legal Explanation',
      analysis: 'Synthesized Analysis',
      sources: 'Legal Diplomas',
      recentQueries: 'Community Queries',
      historyTitle: 'My Queries',
      noHistoryTitle: 'No saved queries'
    },
    proposals: {
      title: 'The People Propose',
      description: 'Space for civic participation and ideas for the country.',
      howItWorks: 'Submit improvement proposals for Portugal. The most voted ideas are analyzed by our AI Simulator.',
      communityTitle: 'Community Ideas',
      newTitle: 'New Proposal',
      titleLabel: 'Idea Title',
      descLabel: 'Detailed Description',
      submitBtn: 'Publish Proposal',
      searchPlaceholder: 'Search ideas...',
      votedBtn: 'Vote registered!',
      editTitle: 'Edit Proposal',
      titleMinError: 'Minimum 10 characters',
      descMinError: 'Minimum 30 characters'
    },
    profile: {
      title: 'My Account',
      description: 'Manage your preferences and personal data.',
      photoTitle: 'Profile Photo',
      photoDesc: 'Synced via Google Login.',
      personalInfo: 'Personal Information',
      displayName: 'Display Name',
      displayNameDesc: 'How you will appear in proposals and scenarios.',
      language: 'Preferred Language',
      langDesc: 'Changes the interface and AI responses.',
      notifications: 'Notifications',
      notifDesc: 'How you want to be informed.',
      emailNotif: 'Verification Alerts',
      emailNotifDesc: 'Receive email when your proposal is analyzed.',
      newsletter: 'Weekly Newsletter',
      newsletterDesc: 'Summary of the most important data and facts of the week.',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Permanently Delete Account',
      deleteWarning: 'This action is irreversible. All your scenarios and history will be deleted.',
      deleting: 'Deleting...',
      deletingDesc: 'Removing all your data from our systems.'
    },
    about: {
      title: 'About Demokratia',
      subtitle: 'Data, not Ideologies.',
      missionTitle: 'Our Mission',
      missionDesc: 'Empower the citizen with state-of-the-art technological tools to navigate political and economic complexity, promoting a fact-based democracy.',
      teamTitle: 'The Team',
      teamDesc: 'Independent project developed by experts in AI and data transparency.',
      valuesTitle: 'Our Values',
      neutrality: 'Radical Neutrality',
      neutralityDesc: 'Our algorithms do not favor parties. We cite sources, not opinions.',
      transparency: 'Data Transparency',
      transparencyDesc: 'All data used is public and can be verified on official portals.',
      innovation: 'Civic Innovation',
      innovationDesc: 'We use AI to make legislation and economics understandable for everyone.'
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'Where does the data come from?',
      a1: 'Data comes exclusively from official sources: INE, Pordata, Bank of Portugal and Diário da República.',
      q2: 'Can AI invent facts?',
      a2: 'We use a technique called RAG (Retrieval-Augmented Generation) that forces AI to base its answers only on provided official documents.',
      q3: 'Is the project partisan?',
      a3: 'No. Demokratia is an independent project without any political affiliation or government funding.',
      q4: 'Are simulations exact?',
      a4: 'Simulations are predictive models based on historical trends and established economic rules. They should be used as a guide, not absolute certainty.'
    },
    contact: {
      title: 'Citizen Support',
      description: 'Technical questions or improvement suggestions.',
      newTitle: 'New Message',
      newDesc: 'We will respond within 48 business hours.',
      subject: 'Subject',
      message: 'Message',
      sendBtn: 'Send Message',
      historyTitle: 'My Messages',
      noMessagesTitle: 'No messages sent',
      status: {
        title: 'Status',
        new: 'Sent',
        read: 'Read',
        archived: 'Archived'
      }
    },
    admin: {
      title: 'Control Panel',
      description: 'System management and community content.',
      tabs: {
        users: 'Users',
        simulations: 'Simulations',
        refutations: 'Refutations',
        sources: 'Sources',
        data: 'Datasets',
        messages: 'Messages',
        seed: 'System'
      },
      totalUsers: 'Total Citizens',
      totalAccesses: 'Total Accesses',
      anonymousAccesses: 'Anonymous',
      registeredAccesses: 'Registered',
      usersTitle: 'Registered Users',
      usersDesc: 'List of citizens who created an account on the platform.',
      registrationDate: 'Registration Date',
      simulationsDesc: 'Public simulations moderation.',
      refutationsDesc: 'User-submitted corrections to AI content.',
      reviewTitle: 'Refutation Review',
      reviewBy: 'Submitted by',
      userExplanation: 'User Explanation',
      evidenceLinks: 'Evidence Links',
      approve: 'Approve',
      reject: 'Reject',
      sourcesTitle: 'Data Sources',
      sourcesDesc: 'Official portals repository.',
      addSource: 'Add Source',
      editSource: 'Edit Source',
      deleteSourceConfirm: 'Delete Source?',
      deleteSourceDesc: 'This may affect AI searches related to this source.',
      messagesTitle: 'Inbox',
      messagesDesc: 'Contacts received via form.',
      from: 'From',
      subject: 'Subject',
      status: 'Status',
      archive: 'Archive',
      seedTitle: 'Data Load 2026',
      seedDesc: 'Critical system operations for the year 2026.',
      indicators: 'Base Indicators',
      indicatorsDesc: 'GDP, Inflation, Unemployment.',
      loadIndicators: 'Load Indicators',
      stats: 'Explorer',
      statsDesc: 'Labor market and social datasets.',
      loadStats: 'Load Datasets',
      sourcesSeed: 'Official Portals',
      sourcesSeedDesc: 'DGO, INE, Bank of Portugal.',
      loadSources: 'Load Sources'
    },
    refutation: {
      title: 'Challenge AI Response',
      description: 'Found an error or inaccuracy? Help us improve the system by sending evidence.',
      refuteBtn: 'Challenge AI',
      label: 'What is the error?',
      placeholder: 'Describe in detail why the AI response is incorrect...',
      evidence: 'Evidence Links (Official Sources)',
      evidencePlaceholder: 'e.g., URL of Diário da República or INE',
      submitBtn: 'Send Challenge',
      success: 'Thank you! Your refutation will be analyzed by a moderator.',
      adminTitle: 'Refutations Management',
      user: 'User',
      targetContent: 'Target Content',
      submission: 'Submitted on',
      noRefutations: 'No pending refutations.',
      status: {
        pending: 'Pending',
        approved: 'Fixed',
        rejected: 'Rejected'
      }
    },
    cookies: {
      title: 'Cookie Policy',
      desc: 'We use cookies to improve your experience and personalize ads via Google AdSense.'
    },
    privacy: {
      title: 'Privacy and GDPR',
      intro: 'Your privacy is fundamental.',
      dataTitle: 'What data do we collect?',
      dataDesc: 'We collect only what is necessary for the platform to function.',
      cookiesTitle: 'Advertising and Cookies',
      cookiesDesc: 'The site uses ads to stay free.',
      purposeTitle: 'Purpose',
      purposeDesc: 'Improve civic literacy.',
      rightsTitle: 'Your Rights',
      rightsDesc: 'You can delete your data at any time.'
    },
    terms: {
      title: 'Terms of Use',
      intro: 'By using Demokratia, you agree to our terms.',
      aiTitle: 'AI Disclaimer',
      aiDesc: 'AI responses are based on official sources but do not replace professional legal or financial advice.',
      usageTitle: 'Proper Use',
      usageDesc: 'The platform should be used for informative and civic purposes.',
      ipTitle: 'Intellectual Property',
      ipDesc: 'The generated content is for personal and democratic use.'
    },
    map: {
      title: 'Portugal Regional Atlas 2026',
      description: 'Visualize economic and social disparity between districts.',
      salary: 'Average Monthly Wage',
      poverty: 'Poverty Risk Rate',
      population: 'Population Density',
      housing: 'Average Housing Price (€/m²)',
      legend: 'Intensity Legend',
      low: 'Low',
      high: 'High',
      indicators: 'Regional Indicators'
    }
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('demokratia-lang') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('demokratia-lang', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = DICTIONARY[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export interface Update {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  description: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
  };
}

export const updates: Update[] = [
  {
    version: "1.2.0",
    date: "2025-01-23",
    type: "minor",
    title: "Filtros Móveis e Melhorias na Navegação",
    description: "Implementação de filtros colapsáveis para dispositivos móveis e melhorias na experiência do usuário.",
    changes: {
      added: [
        "Filtros colapsáveis na rede de empresas para empreendedores",
        "Filtros colapsáveis na rede de empresas para investidores",
        "Navegação responsiva no perfil do investidor",
        "Indicadores visuais para estado expandido/colapsado dos filtros"
      ],
      changed: [
        "Layout dos tabs do perfil do investidor agora em grade 2x2 no mobile",
        "Tamanhos de texto e espaçamentos otimizados para dispositivos móveis",
        "Botões agora ocupam largura total em telas pequenas"
      ],
      fixed: [
        "Problemas de visualização em dispositivos móveis",
        "Layout quebrado dos filtros em telas pequenas",
        "Navegação difícil de usar em smartphones"
      ]
    }
  },
  {
    version: "1.1.2",
    date: "2025-01-22",
    type: "patch",
    title: "Correções no Sistema de Análise de Crédito",
    description: "Correções importantes no fluxo de análise de solicitações de crédito pelos investidores.",
    changes: {
      fixed: [
        "Solicitações aceitas agora aparecem corretamente na aba 'Minhas Análises'",
        "Nomes das empresas e CNPJ sendo exibidos adequadamente",
        "Cache invalidado corretamente após aceitação de solicitações",
        "Mapeamento correto dos campos de empresa no banco de dados"
      ]
    }
  },
  {
    version: "1.1.1",
    date: "2025-01-21",
    type: "patch",
    title: "Melhorias na Interface de Análise",
    description: "Pequenas correções e melhorias na interface de análise detalhada.",
    changes: {
      fixed: [
        "Dialog de análise detalhada com informações completas da empresa",
        "Sistema de mensagens em tempo real funcionando corretamente",
        "Botões de aprovação e rejeição com feedback visual adequado"
      ],
      changed: [
        "Layout da galeria de imagens no estilo Instagram",
        "Navegação entre imagens mais fluida",
        "Responsividade melhorada para dispositivos móveis"
      ]
    }
  },
  {
    version: "1.1.0",
    date: "2025-01-20",
    type: "minor",
    title: "Sistema de Rede Empresarial",
    description: "Implementação completa do sistema de rede empresarial com galeria de imagens e análise detalhada.",
    changes: {
      added: [
        "Rede empresarial para backoffice com galeria estilo Instagram",
        "Sistema de análise detalhada de empresas",
        "Interface de mensagens em tempo real para análises",
        "Workflow de aprovação e rejeição de solicitações",
        "Galeria de imagens com navegação entre fotos",
        "Filtros avançados por estado e cidade"
      ],
      changed: [
        "Interface do investidor atualizada com novo design",
        "Sistema de navegação entre análises melhorado",
        "Layout responsivo para diferentes dispositivos"
      ]
    }
  },
  {
    version: "1.0.0",
    date: "2025-01-15",
    type: "major",
    title: "Lançamento Inicial da Plataforma Investme",
    description: "Primeira versão da plataforma de análise de crédito e investimentos empresariais.",
    changes: {
      added: [
        "Sistema de autenticação para empreendedores e investidores",
        "Cadastro e gestão de empresas",
        "Sistema de solicitação de crédito",
        "Dashboard para empreendedores",
        "Dashboard para investidores",
        "Sistema básico de análise de crédito",
        "Gestão de perfis de usuário",
        "Sistema de notificações",
        "Interface administrativa (backoffice)"
      ]
    }
  }
];
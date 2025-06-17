# Investme MVP - Documentação do Sistema

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Funcionalidades Principais](#funcionalidades-principais)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [APIs e Endpoints](#apis-e-endpoints)
6. [Fluxos de Trabalho](#fluxos-de-trabalho)
7. [Segurança e Autenticação](#segurança-e-autenticação)
8. [Interface do Usuário](#interface-do-usuário)
9. [Instalação e Configuração](#instalação-e-configuração)
10. [Guias de Uso](#guias-de-uso)

## Visão Geral

O **Investme MVP** é uma plataforma financeira de empréstimos que conecta empreendedores e investidores através de análise inteligente de crédito e tecnologias avançadas. A plataforma oferece um ecossistema completo para solicitação, análise e aprovação de crédito empresarial.

### Características Principais
- **Registro e gestão de empresas** com dados financeiros completos
- **Sistema de valuation** com métodos DCF e múltiplos de mercado
- **Rede de investidores** para análise de solicitações de crédito
- **Backoffice administrativo** com fluxos de aprovação granulares
- **Sistema de mensagens** para comunicação entre partes
- **Auditoria completa** de todas as ações do sistema

## Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Roteamento**: Wouter

### Estrutura de Pastas
```
investme-mvp/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e configurações
│   │   └── hooks/         # Custom hooks
├── server/                # Backend Node.js
│   ├── routes.ts          # Definição de rotas
│   ├── storage.ts         # Camada de dados
│   ├── db.ts             # Configuração do banco
│   └── index.ts          # Servidor principal
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas do banco de dados
├── migrations/           # Migrações do banco
└── uploads/             # Arquivos enviados
```

## Funcionalidades Principais

### 1. Gestão de Usuários
- **Empreendedores**: Cadastro, perfil, gestão de empresas
- **Investidores**: Registro, análise de crédito, rede de oportunidades
- **Administradores**: Backoffice completo com controles granulares

### 2. Sistema de Empresas
- Cadastro completo com dados fiscais e financeiros
- Gestão de sócios e garantias
- Histórico de solicitações de crédito
- Sistema de valuation integrado

### 3. Módulo de Valuation
- **Método DCF (Discounted Cash Flow)**
  - Projeções financeiras de 5 anos
  - Cálculo do valor presente líquido
  - Análise de sensibilidade
- **Método de Múltiplos de Mercado**
  - Comparação com empresas similares
  - Múltiplos de receita, EBITDA e lucro
  - Análise setorial

### 4. Rede de Investidores
- Sistema de matching entre solicitações e investidores
- Análise temporizada (24 horas para resposta)
- Dashboard de oportunidades disponíveis
- Histórico de análises realizadas

### 5. Backoffice Administrativo
- **Dashboard**: Métricas e KPIs do sistema
- **Gestão de Usuários**: Aprovação granular de perfis
- **Análise de Empresas**: Validação de dados empresariais
- **Auditoria**: Log completo de todas as ações
- **Mensagens**: Sistema de comunicação integrado

## Estrutura do Banco de Dados

### Tabelas Principais

#### users
Tabela unificada para empreendedores e investidores
```sql
- id: serial PRIMARY KEY
- cpf: text UNIQUE
- email: text UNIQUE
- nomeCompleto: text
- tipo: text (entrepreneur/investor)
- status: text (ativo/pendente/inativo)
- cadastroAprovado: boolean
- emailConfirmado: boolean
- documentosVerificados: boolean
```

#### companies
Dados das empresas cadastradas
```sql
- id: serial PRIMARY KEY
- razaoSocial: text
- cnpj: text UNIQUE
- faturamento: decimal
- ebitda: decimal
- dividaLiquida: decimal
- status: text
- userId: integer (FK)
```

#### creditRequests
Solicitações de crédito
```sql
- id: serial PRIMARY KEY
- companyId: integer (FK)
- valorSolicitado: decimal
- prazoMeses: integer
- status: text (na_rede/em_analise/aprovada/reprovada)
- investorId: integer (FK)
```

#### valuations
Avaliações de empresas
```sql
- id: serial PRIMARY KEY
- companyId: integer (FK)
- method: text (dcf/multiples)
- enterpriseValue: decimal
- equityValue: decimal
- dcfData: jsonb
- multiplesData: jsonb
```

### Relacionamentos
- Um usuário pode ter múltiplas empresas
- Uma empresa pode ter múltiplas solicitações de crédito
- Uma empresa pode ter múltiplas avaliações
- Solicitações são analisadas por investidores
- Todas as ações são auditadas

## APIs e Endpoints

### Autenticação
```
POST /api/auth/register          # Registro de usuários
POST /api/auth/login             # Login geral
POST /api/entrepreneurs/login    # Login específico empreendedor
POST /api/investors/login        # Login específico investidor
POST /api/admin/auth/login       # Login administrativo
```

### Gestão de Empresas
```
GET    /api/companies            # Listar empresas
POST   /api/companies            # Criar empresa
GET    /api/companies/:id        # Detalhes da empresa
PUT    /api/companies/:id        # Atualizar empresa
POST   /api/companies/:id/shareholders  # Adicionar sócios
POST   /api/companies/:id/guarantees    # Adicionar garantias
```

### Solicitações de Crédito
```
GET    /api/credit-requests      # Listar solicitações
POST   /api/credit-requests      # Criar solicitação
PUT    /api/credit-requests/:id  # Atualizar solicitação
POST   /api/credit-requests/:id/accept    # Aceitar para análise
POST   /api/credit-requests/:id/approve   # Aprovar
POST   /api/credit-requests/:id/reject    # Rejeitar
```

### Valuation
```
GET    /api/valuations           # Listar avaliações
POST   /api/valuations           # Criar avaliação
PUT    /api/valuations/:id       # Atualizar avaliação
DELETE /api/valuations/:id       # Excluir avaliação
GET    /api/valuations/:id/dcf   # Dados DCF específicos
GET    /api/valuations/:id/multiples  # Dados de múltiplos
```

### Administração
```
GET    /api/admin/users          # Listar usuários
POST   /api/admin/users/:id/approve     # Aprovar usuário
POST   /api/admin/users/:id/reject      # Rejeitar usuário
PATCH  /api/admin/entrepreneurs/:id/approve-field  # Aprovação granular
GET    /api/admin/investors      # Listar investidores
GET    /api/admin/stats          # Estatísticas do sistema
GET    /api/admin/audit-logs     # Logs de auditoria
```

## Fluxos de Trabalho

### 1. Fluxo do Empreendedor
1. **Registro**: Cadastro inicial com dados pessoais
2. **Aprovação**: Validação pelo backoffice (3 etapas)
3. **Empresa**: Cadastro da empresa com dados financeiros
4. **Valuation**: Criação de avaliação da empresa
5. **Solicitação**: Criação de solicitação de crédito
6. **Acompanhamento**: Monitoramento do status na rede

### 2. Fluxo do Investidor
1. **Registro**: Cadastro com dados e limite de investimento
2. **Aprovação**: Validação pelo backoffice
3. **Rede**: Acesso às solicitações disponíveis
4. **Análise**: Aceite e análise de solicitações (24h)
5. **Decisão**: Aprovação ou rejeição com justificativa
6. **Histórico**: Acompanhamento de análises realizadas

### 3. Fluxo Administrativo
1. **Dashboard**: Visão geral de métricas
2. **Aprovações**: Validação de usuários e empresas
3. **Monitoramento**: Acompanhamento de solicitações
4. **Auditoria**: Revisão de logs e ações
5. **Comunicação**: Gestão de mensagens do sistema

## Segurança e Autenticação

### Sistema de Autenticação
- **JWT Tokens** com expiração de 7 dias
- **Middleware de autenticação** para rotas protegidas
- **Diferentes níveis de acesso** (usuário, admin)
- **Validação de sessão** em todas as requisições

### Controles de Acesso
- **Role-based access control** (RBAC)
- **Validação de propriedade** de recursos
- **Sanitização de dados** de entrada
- **Criptografia de senhas** com bcrypt

### Auditoria
- **Log completo** de todas as ações administrativas
- **Rastreamento de alterações** em entidades críticas
- **Histórico de aprovações** e rejeições
- **Metadados de sessão** para cada ação

## Interface do Usuário

### Design System
- **shadcn/ui**: Componentes base consistentes
- **Tailwind CSS**: Estilização utilitária
- **Responsive Design**: Compatível com mobile e desktop
- **Dark Mode**: Suporte a tema escuro (configurável)

### Componentes Principais
- **Dashboard Cards**: Métricas e KPIs
- **Data Tables**: Listagens com filtros e ordenação
- **Forms**: Formulários validados com react-hook-form
- **Modals**: Dialogs para visualização e edição
- **Charts**: Gráficos para análises financeiras

### Navegação
- **Sidebar**: Navegação principal contextual
- **Breadcrumbs**: Localização na aplicação
- **Tabs**: Organização de conteúdo relacionado
- **Pagination**: Navegação em listas extensas

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://user:password@localhost:5432/investme
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Instalação
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Iniciar aplicação
npm run dev
```

### Scripts Disponíveis
```bash
npm run dev          # Iniciar em desenvolvimento
npm run build        # Build para produção
npm run db:push      # Aplicar mudanças no schema
npm run db:generate  # Gerar migrações
```

## Guias de Uso

### Para Empreendedores
1. **Cadastro**: Complete todos os dados pessoais
2. **Aguarde Aprovação**: 3 etapas de validação
3. **Cadastre sua Empresa**: Dados completos e precisos
4. **Crie um Valuation**: Use DCF ou múltiplos
5. **Solicite Crédito**: Defina valor e prazo
6. **Acompanhe**: Monitor status na rede

### Para Investidores
1. **Registro**: Defina seu limite de investimento
2. **Aprovação**: Aguarde validação do backoffice
3. **Explore Oportunidades**: Analise solicitações disponíveis
4. **Aceite Análises**: Tenha 24h para decidir
5. **Use o Valuation**: Consulte avaliações das empresas
6. **Decida**: Aprove ou rejeite com justificativa

### Para Administradores
1. **Dashboard**: Monitore métricas gerais
2. **Aprovações**: Valide usuários por etapas
3. **Empresas**: Analise dados empresariais
4. **Rede**: Acompanhe solicitações ativas
5. **Auditoria**: Revise logs do sistema
6. **Mensagens**: Gerencie comunicações

### Melhores Práticas
- **Dados Precisos**: Sempre forneça informações corretas
- **Documentação**: Mantenha documentos atualizados
- **Comunicação**: Use o sistema de mensagens
- **Segurança**: Não compartilhe credenciais
- **Monitoramento**: Acompanhe status regularmente

---

**Investme MVP** - Plataforma Inteligente de Crédito Empresarial
Versão 1.0 | Dezembro 2024
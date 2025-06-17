# Investme MVP - Plataforma Inteligente de Crédito Empresarial

Uma plataforma financeira avançada que conecta empreendedores e investidores através de análise inteligente de crédito e tecnologias de valuation empresarial.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Iniciar aplicação
npm run dev
```

Acesse: `http://localhost:5000`

## 📋 Funcionalidades Principais

### Para Empreendedores
- ✅ Cadastro completo de empresa com dados financeiros
- ✅ Sistema de valuation (DCF e múltiplos de mercado)
- ✅ Solicitação de crédito empresarial
- ✅ Acompanhamento de status em tempo real

### Para Investidores
- ✅ Acesso à rede de oportunidades de crédito
- ✅ Análise detalhada de empresas e valuation
- ✅ Sistema de aceite e análise temporizada (24h)
- ✅ Dashboard de investimentos e histórico

### Para Administradores
- ✅ Backoffice completo com aprovações granulares
- ✅ Dashboard de métricas e KPIs
- ✅ Sistema de auditoria e logs
- ✅ Gestão de usuários e empresas
- ✅ Sistema de mensagens integrado

## 🏗️ Arquitetura

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT com controle granular de permissões
- **UI**: shadcn/ui + Tailwind CSS

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [**Documentação Principal**](./DOCUMENTATION.md) | Visão geral completa do sistema |
| [**API Reference**](./API_REFERENCE.md) | Documentação completa das APIs |
| [**Database Schema**](./DATABASE_SCHEMA.md) | Estrutura completa do banco de dados |
| [**Deployment Guide**](./DEPLOYMENT_GUIDE.md) | Guia de deploy e configuração |

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:push      # Aplicar schema no banco
npm run db:generate  # Gerar migrações
```

## 🗄️ Estrutura do Projeto

```
investme-mvp/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários
│   │   └── hooks/         # Custom hooks
├── server/                # Backend Node.js
│   ├── routes.ts          # Rotas da API
│   ├── storage.ts         # Camada de dados
│   └── db.ts             # Configuração DB
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas Drizzle
└── migrations/           # Migrações do banco
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/investme
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Banco de Dados
```bash
# Inicializar banco PostgreSQL
createdb investme

# Aplicar schema
npm run db:push
```

## 🔐 Autenticação

O sistema possui 3 tipos de usuários:

1. **Empreendedores** - Solicitam crédito
2. **Investidores** - Analisam e aprovam crédito
3. **Administradores** - Gerenciam a plataforma

### Fluxo de Aprovação
- Cadastro → Aprovação Backoffice (3 etapas) → Acesso Completo

## 💰 Sistema de Valuation

### Método DCF (Discounted Cash Flow)
- Projeções financeiras de 5 anos
- Cálculo de fluxo de caixa livre
- Taxa de desconto (WACC)
- Valor terminal
- Análise de sensibilidade

### Método de Múltiplos
- Comparação com empresas similares
- Múltiplos de receita e EBITDA
- Análise setorial
- Ajustes de liquidez

## 🌐 API Endpoints

### Principais Rotas
```
POST /api/auth/login                    # Login
GET  /api/companies                     # Listar empresas
POST /api/credit-requests               # Solicitar crédito
GET  /api/investor/network              # Rede investidores
POST /api/valuations                    # Criar valuation
GET  /api/admin/stats                   # Dashboard admin
```

Veja [API Reference](./API_REFERENCE.md) para documentação completa.

## 🚀 Deploy em Produção

### Usando PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.js

# Monitorar
pm2 monit
```

### Usando Docker
```bash
# Build e iniciar
docker-compose up -d

# Verificar status
docker-compose ps
```

Veja [Deployment Guide](./DEPLOYMENT_GUIDE.md) para instruções completas.

## 📊 Monitoramento

### Métricas Principais
- Total de empresas cadastradas
- Solicitações de crédito ativas
- Taxa de aprovação
- Valor total em análise
- Tempo médio de análise

### Health Checks
```bash
# Status da aplicação
curl http://localhost:5000/health

# Status do banco
curl http://localhost:5000/health/db
```

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Validação de entrada com Zod
- Proteção contra SQL injection (Drizzle ORM)
- Rate limiting configurado
- Headers de segurança
- Auditoria completa de ações

## 📝 Logs e Auditoria

Todas as ações administrativas são registradas:
- Aprovações e rejeições
- Alterações em empresas
- Decisões de crédito
- Mudanças de status

## 🧪 Testes

```bash
# Executar testes
npm test

# Cobertura
npm run test:coverage
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão com banco:**
```bash
# Verificar status PostgreSQL
sudo systemctl status postgresql

# Verificar variáveis de ambiente
echo $DATABASE_URL
```

**Erro de autenticação:**
- Verificar JWT_SECRET configurado
- Verificar expiração do token
- Limpar localStorage do browser

**Erro 404 em aprovações:**
- Verificar se usuário existe na tabela correta
- Verificar logs do servidor para detalhes

## 📞 Suporte

Para questões técnicas:
1. Verificar logs da aplicação
2. Consultar documentação de API
3. Verificar status do banco de dados
4. Revisar configurações de ambiente

## 📄 Licença

Este projeto é propriedade da Investme. Todos os direitos reservados.

---

**Investme MVP** - Transformando o futuro do crédito empresarial
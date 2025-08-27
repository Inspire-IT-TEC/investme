# Guia de Ambientes e Deployment no Replit

## Estrutura de Ambientes

### 1. Desenvolvimento (Development)
- **Branch**: `develop`
- **Ambiente**: Workspace do Replit
- **Configuração**: `config/environments.js` - development
- **Propósito**: Desenvolvimento ativo, testes locais, experimentação

### 2. Staging (Homologação)
- **Branch**: `staging`  
- **Ambiente**: Deployment separado no Replit
- **Configuração**: `config/environments.js` - staging
- **Propósito**: Testes de integração, validação de funcionalidades

### 3. Produção (Production)
- **Branch**: `main`
- **Ambiente**: Replit Deployment principal
- **Configuração**: `config/environments.js` - production
- **Propósito**: Usuários finais, ambiente estável

## Workflow de Desenvolvimento

### 1. Feature Development
```bash
# 1. Criar branch para nova funcionalidade
git checkout develop
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e testar localmente
# 3. Fazer commits da funcionalidade
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 4. Fazer push da branch
git push origin feature/nova-funcionalidade
```

### 2. Code Review e Merge
```bash
# 1. Criar Pull Request no GitHub
# 2. Review do código pela equipe
# 3. Merge para develop após aprovação
git checkout develop
git pull origin develop
```

### 3. Deploy para Staging
```bash
# 1. Mover código testado para staging
git checkout staging
git merge develop
git push origin staging

# 2. Preparar deployment
npm run deploy staging

# 3. Deploy via Replit UI (botão Deploy)
```

### 4. Deploy para Produção
```bash
# 1. Mover código validado para main
git checkout main
git merge staging
git push origin main

# 2. Preparar deployment
npm run deploy production

# 3. Deploy via Replit UI (botão Deploy)
```

## Configuração de Ambientes

### Variáveis de Ambiente por Ambiente

**Development (Workspace):**
- `NODE_ENV=development`
- Debug habilitado
- Logs detalhados
- CORS permissivo
- Seed data habilitado

**Staging:**
- `NODE_ENV=staging`
- Configurações similares à produção
- Logs informativos
- Domínio staging
- Dados de teste

**Production:**
- `NODE_ENV=production`
- `REPLIT_DEPLOYMENT=1` (automático)
- Logs mínimos
- CORS restritivo
- Otimizações habilitadas

### Detecção Automática de Ambiente

O sistema detecta automaticamente o ambiente baseado em:
- `process.env.REPLIT_DEPLOYMENT === '1'` → Production
- `process.env.NODE_ENV` → Development/Staging

## Scripts de Deployment

### Comandos Disponíveis
```bash
# Preparar para desenvolvimento
npm run deploy development

# Preparar para staging  
npm run deploy staging

# Preparar para produção
npm run deploy production

# Ver ajuda
npm run deploy help
```

### Package.json Scripts
```json
{
  "scripts": {
    "deploy": "node scripts/deploy.js",
    "deploy:dev": "node scripts/deploy.js development",
    "deploy:staging": "node scripts/deploy.js staging",
    "deploy:prod": "node scripts/deploy.js production"
  }
}
```

## Configuração de Secrets por Ambiente

### Development
- Usar secrets do Replit Workspace
- Configurações para desenvolvimento

### Staging/Production
- Usar secrets específicos do deployment
- Configurar no Replit Deployment settings

### Secrets Necessários
```
DATABASE_URL - URL do banco de dados
JWT_SECRET - Chave secreta para JWT
AWS_ACCESS_KEY_ID - Chave de acesso AWS
AWS_SECRET_ACCESS_KEY - Chave secreta AWS  
FROM_EMAIL - Email remetente
GITHUB_TOKEN - Token para Git operations
```

## Processo de Deployment no Replit

### 1. Via Replit Interface
1. Vá para a aba "Deploy"
2. Configure o tipo de deployment
3. Selecione a branch correta
4. Configure os secrets
5. Clique em "Deploy"

### 2. Configuração de Deployment
- **Autoscale**: Para aplicações com tráfego variável
- **Static**: Para sites estáticos 
- **Reserved VM**: Para recursos garantidos

### 3. Monitoramento
- Logs de deployment
- Métricas de performance
- Health checks automáticos

## Melhores Práticas

### 1. Controle de Versão
- Sempre trabalhar em branches separadas
- Code review obrigatório
- Commits semânticos (feat, fix, docs, etc.)

### 2. Testes por Ambiente
- **Development**: Testes unitários
- **Staging**: Testes de integração
- **Production**: Monitoramento contínuo

### 3. Rollback
- Manter histórico de deployments
- Preparar rollback rápido se necessário
- Testar rollback em staging

### 4. Segurança
- Secrets diferentes por ambiente
- CORS configurado por ambiente
- Logs sanitizados em produção

## Exemplo de Workflow Completo

```bash
# 1. Nova funcionalidade
git checkout develop
git checkout -b feature/sistema-notificacoes

# 2. Desenvolvimento
# ... código da funcionalidade ...
git add .
git commit -m "feat: adicionar sistema de notificações"
git push origin feature/sistema-notificacoes

# 3. Pull Request e Merge para develop
# ... via GitHub UI ...

# 4. Deploy para Staging
git checkout staging
git pull origin develop
git push origin staging
npm run deploy staging
# Deploy via Replit UI

# 5. Validação em Staging
# ... testes e validação ...

# 6. Deploy para Produção
git checkout main
git pull origin staging  
git push origin main
npm run deploy production
# Deploy via Replit UI
```

Este workflow garante que o código passe por todos os estágios de validação antes de chegar à produção.
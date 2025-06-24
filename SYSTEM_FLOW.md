# Fluxo Básico do Sistema InvestMe

## Visão Geral
O sistema InvestMe é uma plataforma que conecta empreendedores e investidores através de três portais principais: Portal do Empreendedor, Portal do Investidor e Backoffice Administrativo.

## 1. CADASTRO E ONBOARDING

### 1.1 Cadastro de Empreendedor
```
[Página de Registro] → [Formulário de Dados Pessoais] → [Verificação de Email] → [Login no Sistema]
                    ↓
[Dashboard Empreendedor] → [Cadastro de Empresa] → [Aguardando Aprovação da Empresa]
```

**Detalhes:**
- Empreendedor preenche: nome, email, CPF, telefone, senha
- Sistema envia email de verificação
- Após login, empreendedor deve cadastrar empresa com: CNPJ, razão social, dados financeiros, documentos

### 1.2 Cadastro de Investidor
```
[Página de Registro] → [Formulário de Dados Pessoais] → [Verificação de Email] → [Login no Sistema]
                    ↓
[Dashboard Investidor] → [Preenchimento de Perfil] → [Cadastro de Empresa (Opcional)]
```

**Detalhes:**
- Investidor preenche: nome, email, CPF, telefone, renda, experiência em investimentos
- Pode cadastrar empresa própria (opcional)
- Acesso imediato às funcionalidades básicas

## 2. FLUXO DE APROVAÇÃO DE EMPRESAS

### 2.1 Portal do Empreendedor
```
[Cadastro de Empresa] → [Upload de Documentos] → [Submissão para Análise]
                      ↓
[Status: Pendente] → [Aguardando Análise do Backoffice]
                      ↓
[Aprovada] → [Acesso Completo] → [Pode Solicitar Crédito]
[Reprovada] → [Recebe Feedback] → [Pode Corrigir e Reenviar]
```

### 2.2 Backoffice (Análise de Empresas)
```
[Lista de Empresas Pendentes] → [Análise Individual]
                              ↓
[Verificação de Documentos] → [Análise Financeira] → [Decisão]
                              ↓
[Aprovar] → [Empresa Liberada] → [Notificação ao Empreendedor]
[Reprovar] → [Feedback Detalhado] → [Notificação ao Empreendedor]
```

## 3. FLUXO DE SOLICITAÇÃO DE CRÉDITO

### 3.1 Portal do Empreendedor
```
[Empresa Aprovada] → [Solicitar Crédito] → [Formulário de Solicitação]
                   ↓
[Valor, Prazo, Justificativa] → [Upload de Documentos Adicionais] → [Submeter]
                   ↓
[Status: Em Análise] → [Aguardando Investidores]
```

### 3.2 Backoffice (Triagem de Solicitações)
```
[Nova Solicitação] → [Análise Preliminar] → [Verificação de Completude]
                   ↓
[Aprovada para Rede] → [Disponível para Investidores]
[Rejeitada] → [Feedback ao Empreendedor]
```

## 4. FLUXO DE ANÁLISE E INVESTIMENTO

### 4.1 Portal do Investidor
```
[Rede de Empresas] → [Filtrar/Buscar] → [Visualizar Empresa]
                   ↓
[Solicitar Análise] → [Empresa em "Minhas Análises"]
                   ↓
[Analisar Documentos] → [Enviar Mensagens] → [Decisão]
                   ↓
[Aprovar] → [Investimento Realizado] → [Acompanhamento]
[Rejeitar] → [Feedback ao Empreendedor]
```

### 4.2 Sistema de Mensagens
```
[Investidor] ↔ [Sistema de Chat] ↔ [Empreendedor]
           ↓
[Histórico de Conversas] → [Anexos] → [Notificações]
```

## 5. FLUXO DO BACKOFFICE

### 5.1 Gestão de Usuários
```
[Dashboard Admin] → [Lista de Usuários] → [Gerenciar Perfis]
                 ↓
[Analytics] → [Relatórios] → [Métricas do Sistema]
```

### 5.2 Rede Empresarial
```
[Visualizar Todas as Empresas] → [Filtros Avançados] → [Gestão de Status]
                              ↓
[Aprovações Pendentes] → [Histórico de Decisões]
```

## 6. ESTADOS E TRANSIÇÕES

### 6.1 Estados da Empresa
- **Pendente**: Cadastrada, aguardando análise
- **Aprovada**: Liberada para solicitar crédito
- **Reprovada**: Rejeitada, precisa correções
- **Ativa**: Com solicitações de crédito ativas

### 6.2 Estados da Solicitação de Crédito
- **Em Análise**: Submetida, aguardando investidores
- **Aceita**: Investidor aprovou
- **Rejeitada**: Investidor rejeitou
- **Finalizada**: Processo concluído

### 6.3 Estados do Investidor
- **Cadastrado**: Perfil básico preenchido
- **Ativo**: Analisando oportunidades
- **Investindo**: Com análises em andamento

## 7. FUNCIONALIDADES TRANSVERSAIS

### 7.1 Sistema de Notificações
- Email para eventos importantes
- Notificações in-app
- Badge de contadores não lidos

### 7.2 Sistema de Mensagens
- Chat em tempo real entre investidor e empreendedor
- Anexos de documentos
- Histórico completo de conversas

### 7.3 Galeria de Imagens
- Upload de fotos da empresa
- Visualização estilo Instagram
- Navegação por galeria

### 7.4 Relatórios e Analytics
- Dashboard com métricas
- Relatórios de performance
- Análises de conversão

## 8. FLUXO COMPLETO EXEMPLO

```
[Empreendedor se cadastra] 
    ↓
[Cadastra empresa XYZ Ltda]
    ↓
[Backoffice analisa e aprova]
    ↓
[Empreendedor solicita R$ 500.000]
    ↓
[Backoffice libera para rede]
    ↓
[Investidor ABC vê na rede]
    ↓
[Investidor solicita análise]
    ↓
[Troca mensagens com empreendedor]
    ↓
[Investidor aprova investimento]
    ↓
[Sistema registra operação]
    ↓
[Ambos recebem notificações]
    ↓
[Backoffice acompanha métricas]
```

## 9. PONTOS DE CONTROLE

### 9.1 Validações Automáticas
- CNPJ válido
- CPF válido
- Documentos obrigatórios
- Limites de valores

### 9.2 Aprovações Manuais
- Empresa pelo backoffice
- Solicitação de crédito (triagem)
- Investimento pelo investidor

### 9.3 Comunicação
- Emails automáticos
- Notificações push
- Mensagens in-app

## 10. MÉTRICAS E ACOMPANHAMENTO

### 10.1 KPIs do Sistema
- Taxa de aprovação de empresas
- Tempo médio de análise
- Taxa de conversão investidor → investimento
- Volume total transacionado

### 10.2 Dashboards
- **Empreendedor**: Status das solicitações, mensagens
- **Investidor**: Oportunidades, análises em andamento
- **Backoffice**: Aprovações pendentes, métricas gerais

---

*Este fluxo representa o ciclo completo desde o cadastro até a conclusão de um investimento, passando por todas as etapas de validação e aprovação necessárias.*
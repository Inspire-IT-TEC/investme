# API Reference - Investme MVP

## Autenticação

Todas as rotas protegidas requerem um token JWT no header Authorization:
```
Authorization: Bearer <token>
```

## Endpoints de Autenticação

### POST /api/auth/register
Registro geral de usuários

**Body:**
```json
{
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "nomeCompleto": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "cep": "01234-567",
  "rua": "Rua Example",
  "numero": "123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "tipo": "entrepreneur"
}
```

**Response:**
```json
{
  "user": { "id": 1, "email": "joao@email.com", ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/entrepreneurs/login
Login específico para empreendedores

**Body:**
```json
{
  "login": "joao@email.com", // email ou CPF
  "senha": "senha123"
}
```

### POST /api/investors/login
Login específico para investidores

### POST /api/admin/auth/login
Login administrativo

**Body:**
```json
{
  "email": "admin@investme.com",
  "senha": "admin123"
}
```

## Endpoints de Empresas

### GET /api/companies
Lista empresas do usuário logado

**Query Parameters:**
- `userId` (opcional): ID do usuário
- `status` (opcional): Status da empresa
- `search` (opcional): Busca por nome/CNPJ

**Response:**
```json
[
  {
    "id": 1,
    "razaoSocial": "EMPRESA LTDA",
    "cnpj": "12.345.678/0001-90",
    "faturamento": "1000000.00",
    "ebitda": "200000.00",
    "status": "ativa"
  }
]
```

### POST /api/companies
Cria nova empresa

**Body:**
```json
{
  "razaoSocial": "Minha Empresa LTDA",
  "nomeFantasia": "Minha Empresa",
  "cnpj": "12.345.678/0001-90",
  "cep": "01234-567",
  "rua": "Rua Comercial",
  "numero": "100",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cnaePrincipal": "6201-5/00",
  "dataFundacao": "2020-01-01T00:00:00.000Z",
  "faturamento": 1000000,
  "ebitda": 200000,
  "dividaLiquida": 50000
}
```

### GET /api/companies/:id
Detalhes de uma empresa específica

### PUT /api/companies/:id
Atualiza dados da empresa

### POST /api/companies/:id/shareholders
Adiciona sócios à empresa

**Body:**
```json
{
  "shareholders": [
    {
      "nomeCompleto": "João Silva",
      "cpf": "123.456.789-00"
    }
  ]
}
```

### POST /api/companies/:id/guarantees
Adiciona garantias à empresa

**Body:**
```json
{
  "guarantees": [
    {
      "tipo": "imovel",
      "matricula": "12345",
      "valorEstimado": 500000
    }
  ]
}
```

## Endpoints de Solicitações de Crédito

### GET /api/credit-requests
Lista solicitações de crédito

**Query Parameters:**
- `status`: Status da solicitação
- `search`: Busca por empresa

### POST /api/credit-requests
Cria nova solicitação de crédito

**Body:**
```json
{
  "companyId": 1,
  "valorSolicitado": 100000,
  "prazoMeses": 12,
  "finalidade": "Capital de giro"
}
```

### POST /api/credit-requests/:id/accept
Aceita solicitação para análise (investidor)

### POST /api/credit-requests/:id/approve
Aprova solicitação (investidor)

**Body:**
```json
{
  "observacoes": "Empresa com bom histórico financeiro"
}
```

### POST /api/credit-requests/:id/reject
Rejeita solicitação (investidor)

**Body:**
```json
{
  "observacoes": "Risco elevado para o perfil"
}
```

## Endpoints de Valuation

### GET /api/valuations
Lista avaliações do usuário

### POST /api/valuations
Cria nova avaliação

**Body DCF:**
```json
{
  "companyId": 1,
  "method": "dcf",
  "dcfData": {
    "projections": [
      {
        "year": 2024,
        "revenue": 1000000,
        "ebitda": 200000,
        "capex": 50000,
        "workingCapital": 30000
      }
    ],
    "wacc": 0.12,
    "terminalGrowthRate": 0.03
  }
}
```

**Body Múltiplos:**
```json
{
  "companyId": 1,
  "method": "multiples",
  "multiplesData": {
    "comparables": [
      {
        "company": "Concorrente A",
        "revenue": 2000000,
        "ebitda": 400000,
        "marketValue": 5000000
      }
    ],
    "selectedMultiples": {
      "revenueMultiple": 5.0,
      "ebitdaMultiple": 12.5
    }
  }
}
```

### PUT /api/valuations/:id
Atualiza avaliação existente

### DELETE /api/valuations/:id
Remove avaliação

### GET /api/valuations/:id/sensitivity
Análise de sensibilidade

## Endpoints Administrativos

### GET /api/admin/users
Lista usuários para aprovação

**Query Parameters:**
- `tipo`: entrepreneur/investor
- `status`: pendente/ativo/inativo

### POST /api/admin/users/:id/approve
Aprova usuário completamente

### POST /api/admin/users/:id/reject
Rejeita usuário

**Body:**
```json
{
  "reason": "Documentos inválidos"
}
```

### PATCH /api/admin/entrepreneurs/:id/approve-field
Aprovação granular de empreendedores

**Body:**
```json
{
  "field": "cadastroAprovado", // ou emailConfirmado, documentosVerificados
  "approved": true
}
```

### GET /api/admin/investors
Lista investidores

### POST /api/admin/investors/:id/approve
Aprova investidor

### POST /api/admin/investors/:id/reject
Rejeita investidor

### GET /api/admin/companies
Lista empresas para análise

### GET /api/admin/credit-requests
Lista solicitações de crédito

### GET /api/admin/stats
Estatísticas do sistema

**Response:**
```json
{
  "totalCompanies": 150,
  "pendingAnalysis": 12,
  "totalInvestors": 45,
  "activeRequests": 8,
  "approvedRequests": 95,
  "totalValuation": "50000000.00"
}
```

### GET /api/admin/audit-logs
Logs de auditoria

**Query Parameters:**
- `entidadeTipo`: Tipo de entidade
- `acao`: Ação realizada

### GET /api/admin/network
Solicitações na rede

### GET /api/admin/network/stats
Estatísticas da rede

## Endpoints de Mensagens

### GET /api/messages/:conversationId
Mensagens de uma conversa

### POST /api/messages
Envia nova mensagem

**Body:**
```json
{
  "conversationId": "company_1_request_3",
  "conteudo": "Precisamos de mais informações",
  "companyId": 1,
  "creditRequestId": 3
}
```

### POST /api/messages/:conversationId/mark-read
Marca conversa como lida

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Acesso negado
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

## Estrutura de Erro

```json
{
  "message": "Descrição do erro",
  "details": "Informações adicionais (opcional)"
}
```

## Rate Limiting

- Máximo 1000 requests por hora por IP
- Máximo 100 requests por minuto por usuário autenticado

## Versionamento

Atualmente na versão 1.0. Futuras versões serão identificadas no path:
- `/api/v1/...`
- `/api/v2/...`
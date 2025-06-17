# Database Schema - Investme MVP

## Overview

The Investme platform uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema is designed to support multi-user roles, comprehensive financial data, and audit trails.

## Core Tables

### users
Central table for entrepreneurs and investors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| cpf | text | NOT NULL, UNIQUE | Brazilian tax ID |
| rg | text | NOT NULL | Identity document |
| nomeCompleto | text | NOT NULL | Full name |
| email | text | NOT NULL, UNIQUE | Email address |
| senha | text | NOT NULL | Hashed password |
| cep | text | NOT NULL | Postal code |
| rua | text | NOT NULL | Street address |
| numero | text | NOT NULL | Street number |
| complemento | text | NULLABLE | Address complement |
| bairro | text | NOT NULL | Neighborhood |
| cidade | text | NOT NULL | City |
| estado | text | NOT NULL | State |
| tipo | text | NOT NULL, DEFAULT 'entrepreneur' | User type |
| status | text | NOT NULL, DEFAULT 'ativo' | Account status |
| telefone | text | NULLABLE | Phone number |
| limiteInvestimento | text | NULLABLE | Investment limit (investors) |
| cadastroAprovado | boolean | DEFAULT false | Registration approved |
| emailConfirmado | boolean | DEFAULT false | Email confirmed |
| documentosVerificados | boolean | DEFAULT false | Documents verified |
| aprovadoPor | integer | FK admin_users.id | Approved by admin |
| aprovadoEm | timestamp | NULLABLE | Approval date |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `users_cpf_unique` on cpf
- `users_email_unique` on email

### entrepreneurs
Separate table for entrepreneur-specific data (legacy compatibility)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| cpf | text | NOT NULL, UNIQUE | Brazilian tax ID |
| rg | text | NOT NULL | Identity document |
| nomeCompleto | text | NOT NULL | Full name |
| email | text | NOT NULL, UNIQUE | Email address |
| senha | text | NOT NULL | Hashed password |
| cep | text | NOT NULL | Postal code |
| rua | text | NOT NULL | Street address |
| numero | text | NOT NULL | Street number |
| complemento | text | NULLABLE | Address complement |
| bairro | text | NOT NULL | Neighborhood |
| cidade | text | NOT NULL | City |
| estado | text | NOT NULL | State |
| status | text | NOT NULL, DEFAULT 'ativo' | Account status |
| cadastroAprovado | boolean | DEFAULT false | Registration approved |
| emailConfirmado | boolean | DEFAULT false | Email confirmed |
| documentosVerificados | boolean | DEFAULT false | Documents verified |
| aprovadoPor | integer | FK admin_users.id | Approved by admin |
| aprovadoEm | timestamp | NULLABLE | Approval date |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

### investors
Separate table for investor-specific data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| cpf | text | NOT NULL, UNIQUE | Brazilian tax ID |
| rg | text | NOT NULL | Identity document |
| nomeCompleto | text | NOT NULL | Full name |
| email | text | NOT NULL, UNIQUE | Email address |
| senha | text | NOT NULL | Hashed password |
| cep | text | NOT NULL | Postal code |
| rua | text | NOT NULL | Street address |
| numero | text | NOT NULL | Street number |
| complemento | text | NULLABLE | Address complement |
| bairro | text | NOT NULL | Neighborhood |
| cidade | text | NOT NULL | City |
| estado | text | NOT NULL | State |
| limiteInvestimento | text | NULLABLE | Investment limit |
| status | text | NOT NULL, DEFAULT 'pendente' | Account status |
| cadastroAprovado | boolean | DEFAULT false | Registration approved |
| emailConfirmado | boolean | DEFAULT false | Email confirmed |
| documentosVerificados | boolean | DEFAULT false | Documents verified |
| aprovadoPor | integer | FK admin_users.id | Approved by admin |
| aprovadoEm | timestamp | NULLABLE | Approval date |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

### admin_users
Administrative users for backoffice operations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| email | text | NOT NULL, UNIQUE | Email address |
| senha | text | NOT NULL | Hashed password |
| nome | text | NOT NULL | Full name |
| role | text | NOT NULL, DEFAULT 'admin' | Administrative role |
| perfil | text | NOT NULL, DEFAULT 'visualizacao' | Permission profile |
| ativo | boolean | NOT NULL, DEFAULT true | Account active status |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

**Permission Profiles:**
- `visualizacao`: Read-only access
- `aprovacao_empresa`: Company approval permissions
- `aprovacao_credito`: Credit approval permissions
- `admin`: Full administrative access

## Business Entity Tables

### companies
Company registration and financial data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| razaoSocial | text | NOT NULL | Legal company name |
| nomeFantasia | text | NULLABLE | Trade name |
| cnpj | text | NOT NULL, UNIQUE | Company tax ID |
| cep | text | NOT NULL | Postal code |
| rua | text | NOT NULL | Street address |
| numero | text | NOT NULL | Street number |
| complemento | text | NULLABLE | Address complement |
| bairro | text | NOT NULL | Neighborhood |
| cidade | text | NOT NULL | City |
| estado | text | NOT NULL | State |
| telefone | text | NULLABLE | Phone number |
| emailContato | text | NULLABLE | Contact email |
| cnaePrincipal | text | NOT NULL | Primary business code |
| cnaeSecundarios | text[] | NULLABLE | Secondary business codes |
| inscricaoEstadual | text | NULLABLE | State registration |
| inscricaoMunicipal | text | NULLABLE | Municipal registration |
| dataFundacao | timestamp | NOT NULL | Foundation date |
| faturamento | decimal(15,2) | NOT NULL | Annual revenue |
| ebitda | decimal(15,2) | NOT NULL | EBITDA |
| dividaLiquida | decimal(15,2) | NOT NULL | Net debt |
| status | text | NOT NULL, DEFAULT 'pendente_analise' | Company status |
| observacoesInternas | text | NULLABLE | Internal notes |
| analisadoPor | integer | FK admin_users.id | Analyzed by admin |
| dataAnalise | timestamp | NULLABLE | Analysis date |
| userId | integer | FK users.id | Owner user ID |
| entrepreneurId | integer | FK entrepreneurs.id | Owner entrepreneur ID |
| investorId | integer | FK investors.id | Owner investor ID |
| tipoProprietario | text | NOT NULL, DEFAULT 'empreendedor' | Owner type |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

**Status Values:**
- `pendente_analise`: Pending analysis
- `em_analise`: Under analysis
- `aprovada`: Approved
- `reprovada`: Rejected
- `incompleto`: Incomplete

### company_shareholders
Company shareholders/partners

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| companyId | integer | NOT NULL, FK companies.id | Company reference |
| nomeCompleto | text | NOT NULL | Shareholder name |
| cpf | text | NOT NULL | Shareholder tax ID |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |

### company_guarantees
Company collateral/guarantees

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| companyId | integer | NOT NULL, FK companies.id | Company reference |
| tipo | text | NOT NULL | Guarantee type |
| matricula | text | NULLABLE | Property registration (real estate) |
| renavam | text | NULLABLE | Vehicle registration |
| descricao | text | NULLABLE | Description (receivables) |
| valorEstimado | decimal(15,2) | NOT NULL | Estimated value |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |

**Guarantee Types:**
- `imovel`: Real estate
- `veiculo`: Vehicle
- `recebivel`: Receivables

## Financial Operations

### credit_requests
Credit solicitation and analysis

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| companyId | integer | NOT NULL, FK companies.id | Company reference |
| valorSolicitado | decimal(15,2) | NOT NULL | Requested amount |
| prazoMeses | integer | NOT NULL | Term in months |
| finalidade | text | NOT NULL | Purpose of credit |
| documentos | text[] | NULLABLE | Document URLs |
| status | text | NOT NULL, DEFAULT 'na_rede' | Request status |
| investorId | integer | FK users.id | Analyzing investor |
| dataAceite | timestamp | NULLABLE | Acceptance date |
| dataLimiteAnalise | timestamp | NULLABLE | Analysis deadline |
| observacoesAnalise | text | NULLABLE | Analysis notes |
| analisadoPor | integer | FK users.id | Analyzer |
| dataAnalise | timestamp | NULLABLE | Analysis date |
| aprovadoPorBackoffice | integer | FK admin_users.id | Backoffice approval |
| dataAprovacaoBackoffice | timestamp | NULLABLE | Backoffice approval date |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

**Status Flow:**
- `na_rede`: Available in network
- `em_analise`: Under analysis (24h limit)
- `aprovada`: Approved by investor
- `reprovada`: Rejected by investor

### valuations
Company valuation data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| companyId | integer | NOT NULL, FK companies.id | Company reference |
| userId | integer | NOT NULL, FK users.id | Creator user |
| userType | text | NOT NULL | Creator type |
| method | text | NOT NULL | Valuation method |
| status | text | NOT NULL, DEFAULT 'draft' | Valuation status |
| enterpriseValue | decimal(15,2) | NULLABLE | Enterprise value |
| equityValue | decimal(15,2) | NULLABLE | Equity value |
| dcfData | jsonb | NULLABLE | DCF calculation data |
| multiplesData | jsonb | NULLABLE | Multiples data |
| sensitivityData | jsonb | NULLABLE | Sensitivity analysis |
| assumptions | text | NULLABLE | Key assumptions |
| notes | text | NULLABLE | Additional notes |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Update timestamp |

**Valuation Methods:**
- `dcf`: Discounted Cash Flow
- `multiples`: Market Multiples

**DCF Data Structure:**
```json
{
  "projections": [
    {
      "year": 2024,
      "revenue": 1000000,
      "ebitda": 200000,
      "capex": 50000,
      "workingCapital": 30000,
      "freeCashFlow": 150000
    }
  ],
  "wacc": 0.12,
  "terminalGrowthRate": 0.03,
  "terminalValue": 5000000,
  "enterpriseValue": 4500000
}
```

**Multiples Data Structure:**
```json
{
  "comparables": [
    {
      "company": "Competitor A",
      "revenue": 2000000,
      "ebitda": 400000,
      "marketValue": 5000000,
      "revenueMultiple": 2.5,
      "ebitdaMultiple": 12.5
    }
  ],
  "selectedMultiples": {
    "revenueMultiple": 2.5,
    "ebitdaMultiple": 12.0
  },
  "calculatedValue": 2400000
}
```

## System Operations

### audit_log
System audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| acao | text | NOT NULL | Action performed |
| entidadeTipo | text | NOT NULL | Entity type |
| entidadeId | integer | NOT NULL | Entity ID |
| valorAnterior | json | NULLABLE | Previous state |
| valorNovo | json | NULLABLE | New state |
| observacoes | text | NULLABLE | Additional notes |
| adminUserId | integer | NOT NULL, FK admin_users.id | Admin user |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Action timestamp |

**Common Actions:**
- `aprovacao_empresa`: Company approval
- `reprovacao_empresa`: Company rejection
- `aprovacao_credito`: Credit approval
- `reprovacao_credito`: Credit rejection
- `aprovacao_usuario`: User approval
- `edicao_perfil`: Profile edit

### messages
Communication system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Unique identifier |
| conversationId | text | NOT NULL | Conversation identifier |
| assunto | text | NULLABLE | Message subject |
| tipo | text | NOT NULL | Sender type |
| remetenteId | integer | NOT NULL | Sender ID |
| destinatarioTipo | text | NOT NULL | Recipient type |
| conteudo | text | NOT NULL | Message content |
| anexos | text[] | NULLABLE | Attachment URLs |
| lida | boolean | NOT NULL, DEFAULT false | Read status |
| creditRequestId | integer | FK credit_requests.id | Related credit request |
| companyId | integer | FK companies.id | Related company |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |

**Conversation ID Format:** `company_{companyId}_request_{requestId}`

## Relationships

### One-to-Many
- users → companies
- companies → company_shareholders
- companies → company_guarantees
- companies → credit_requests
- companies → valuations
- admin_users → audit_log

### Many-to-One
- companies → users (owner)
- credit_requests → users (investor)
- valuations → users (creator)
- audit_log → admin_users

### Foreign Key Constraints
All foreign key relationships are enforced with `ON DELETE NO ACTION ON UPDATE NO ACTION` to prevent accidental data loss and maintain referential integrity.

## Indexes and Performance

### Primary Indexes
- All tables have auto-incrementing serial primary keys
- Unique constraints on email and CPF fields
- Foreign key indexes automatically created

### Recommended Additional Indexes
```sql
-- Performance indexes for common queries
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_credit_requests_status ON credit_requests(status);
CREATE INDEX idx_valuations_company_method ON valuations(companyId, method);
CREATE INDEX idx_audit_log_entity ON audit_log(entidadeTipo, entidadeId);
CREATE INDEX idx_messages_conversation ON messages(conversationId);
```

## Data Migration Strategy

The schema supports both legacy tables (entrepreneurs, investors) and the unified users table for backward compatibility. Future migrations will consolidate data into the users table and remove legacy tables.

## Backup and Recovery

- Daily automated backups of the full database
- Point-in-time recovery capability
- Audit logs ensure traceability of all changes
- Foreign key constraints prevent orphaned records
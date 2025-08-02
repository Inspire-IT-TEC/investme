-- Migração para Sistema Unificado de Usuários
-- Data: Janeiro 2025
-- Descrição: Migra dados das tabelas separadas para sistema unificado

-- Passo 1: Adicionar novas colunas à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profissao text,
ADD COLUMN IF NOT EXISTS renda_mensal decimal(15,2),
ADD COLUMN IF NOT EXISTS experiencia_investimentos text,
ADD COLUMN IF NOT EXISTS objetivos_investimento text,
ADD COLUMN IF NOT EXISTS data_nascimento text,
ADD COLUMN IF NOT EXISTS entrepreneur_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS investor_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS renda_comprovada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS perfil_investidor boolean DEFAULT false;

-- Passo 2: Migrar dados dos empreendedores existentes
INSERT INTO users (
    cpf, rg, nome_completo, email, senha, telefone, 
    cep, rua, numero, complemento, bairro, cidade, estado,
    user_types, status, entrepreneur_approved, email_confirmado, 
    documentos_verificados, aprovado_por, aprovado_em, created_at, updated_at
)
SELECT 
    cpf, rg, nome_completo, email, senha, telefone,
    cep, rua, numero, complemento, bairro, cidade, estado,
    ARRAY['entrepreneur'] as user_types,
    status, cadastro_aprovado as entrepreneur_approved, email_confirmado,
    documentos_verificados, aprovado_por, aprovado_em, created_at, updated_at
FROM entrepreneurs
WHERE email NOT IN (SELECT email FROM users);

-- Passo 3: Migrar dados dos investidores existentes
INSERT INTO users (
    cpf, rg, nome_completo, email, senha, telefone,
    cep, rua, numero, complemento, bairro, cidade, estado,
    user_types, profissao, renda_mensal, limite_investimento,
    experiencia_investimentos, objetivos_investimento,
    status, investor_approved, email_confirmado, documentos_verificados,
    renda_comprovada, perfil_investidor, aprovado_por, aprovado_em,
    created_at, updated_at
)
SELECT 
    cpf, rg, nome_completo, email, senha, telefone,
    cep, rua, numero, complemento, bairro, cidade, estado,
    ARRAY['investor'] as user_types,
    profissao, renda_mensal, limite_investimento,
    experiencia_investimentos, objetivos_investimento,
    status, cadastro_aprovado as investor_approved, email_confirmado, documentos_verificados,
    renda_comprovada, perfil_investidor, aprovado_por, aprovado_em,
    created_at, updated_at
FROM investors
WHERE email NOT IN (SELECT email FROM users);

-- Passo 4: Atualizar usuários existentes que eram do tipo 'investor' para usar novo sistema
UPDATE users 
SET user_types = ARRAY['investor'], 
    investor_approved = cadastro_aprovado
WHERE tipo = 'investor' AND user_types = '{}';

-- Passo 5: Atualizar usuários existentes que eram do tipo 'entrepreneur' para usar novo sistema  
UPDATE users 
SET user_types = ARRAY['entrepreneur'],
    entrepreneur_approved = cadastro_aprovado
WHERE tipo = 'entrepreneur' AND user_types = '{}';

-- Passo 6: Atualizar tabela companies para usar apenas userId
-- Primeiro, mapear entrepreneurId para userId
UPDATE companies 
SET user_id = e.id 
FROM entrepreneurs e 
WHERE companies.entrepreneur_id = e.id 
AND companies.user_id IS NULL;

-- Mapear investorId para userId (quando aplicável)
UPDATE companies 
SET user_id = i.id 
FROM investors i 
WHERE companies.investor_id = i.id 
AND companies.user_id IS NULL;

-- Adicionar coluna owner_type
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS owner_type text DEFAULT 'entrepreneur';

-- Atualizar owner_type baseado no tipo_proprietario
UPDATE companies 
SET owner_type = CASE 
    WHEN tipo_proprietario = 'investidor' THEN 'investor'
    ELSE 'entrepreneur'
END;

-- Passo 7: Limpar colunas antigas (COMENTADO PARA SEGURANÇA)
-- ALTER TABLE users DROP COLUMN IF EXISTS tipo;
-- ALTER TABLE users DROP COLUMN IF EXISTS cadastro_aprovado;
-- ALTER TABLE companies DROP COLUMN IF EXISTS entrepreneur_id;
-- ALTER TABLE companies DROP COLUMN IF EXISTS investor_id;
-- ALTER TABLE companies DROP COLUMN IF EXISTS tipo_proprietario;

-- Passo 8: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_user_types ON users USING GIN (user_types);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users (cpf);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
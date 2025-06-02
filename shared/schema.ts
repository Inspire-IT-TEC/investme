import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Empreendedores table (quem solicita crédito)
export const entrepreneurs = pgTable("entrepreneurs", {
  id: serial("id").primaryKey(),
  cpf: text("cpf").notNull().unique(),
  rg: text("rg").notNull(),
  nomeCompleto: text("nome_completo").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  cep: text("cep").notNull(),
  rua: text("rua").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  status: text("status").notNull().default("ativo"), // ativo, inativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Investidores table (quem aceita e analisa solicitações)
export const investors = pgTable("investors", {
  id: serial("id").primaryKey(),
  cpf: text("cpf").notNull().unique(),
  rg: text("rg").notNull(),
  nomeCompleto: text("nome_completo").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  cep: text("cep").notNull(),
  rua: text("rua").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  limiteInvestimento: text("limite_investimento"),
  status: text("status").notNull().default("pendente"), // pendente, ativo, inativo
  aprovadoPor: integer("aprovado_por").references(() => adminUsers.id),
  aprovadoEm: timestamp("aprovado_em"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table (mantido para compatibilidade - será removido depois)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  cpf: text("cpf").notNull().unique(),
  rg: text("rg").notNull(),
  nomeCompleto: text("nome_completo").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  cep: text("cep").notNull(),
  rua: text("rua").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  tipo: text("tipo").notNull().default("entrepreneur"), // entrepreneur, investor
  status: text("status").notNull().default("ativo"), // ativo, pendente, inativo
  telefone: text("telefone"),
  limiteInvestimento: text("limite_investimento"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin users table (Investme team)
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  nome: text("nome").notNull(),
  role: text("role").notNull().default("admin"),
  perfil: text("perfil").notNull().default("visualizacao"), // visualizacao, aprovacao_empresa, aprovacao_credito, admin
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  razaoSocial: text("razao_social").notNull(),
  nomeFantasia: text("nome_fantasia"),
  cnpj: text("cnpj").notNull().unique(),
  cep: text("cep").notNull(),
  rua: text("rua").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  telefone: text("telefone"),
  emailContato: text("email_contato"),
  cnaePrincipal: text("cnae_principal").notNull(),
  cnaeSecundarios: text("cnae_secundarios").array(),
  inscricaoEstadual: text("inscricao_estadual"),
  inscricaoMunicipal: text("inscricao_municipal"),
  dataFundacao: timestamp("data_fundacao").notNull(),
  faturamento: decimal("faturamento", { precision: 15, scale: 2 }).notNull(),
  ebitda: decimal("ebitda", { precision: 15, scale: 2 }).notNull(),
  dividaLiquida: decimal("divida_liquida", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("pendente_analise"), // pendente_analise, em_analise, aprovada, reprovada, incompleto
  observacoesInternas: text("observacoes_internas"),
  analisadoPor: integer("analisado_por").references(() => adminUsers.id),
  dataAnalise: timestamp("data_analise"),
  userId: integer("user_id").references(() => users.id),
  entrepreneurId: integer("entrepreneur_id").references(() => entrepreneurs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Company shareholders table
export const companyShareholders = pgTable("company_shareholders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  nomeCompleto: text("nome_completo").notNull(),
  cpf: text("cpf").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company guarantees table
export const companyGuarantees = pgTable("company_guarantees", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  tipo: text("tipo").notNull(), // imovel, veiculo, recebivel
  matricula: text("matricula"), // for imovel
  renavam: text("renavam"), // for veiculo
  descricao: text("descricao"), // for recebivel
  valorEstimado: decimal("valor_estimado", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit requests table
export const creditRequests = pgTable("credit_requests", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  valorSolicitado: decimal("valor_solicitado", { precision: 15, scale: 2 }).notNull(),
  prazoMeses: integer("prazo_meses").notNull(),
  finalidade: text("finalidade").notNull(),
  documentos: text("documentos").array(), // URLs to uploaded documents
  // Novo fluxo: na_rede -> aceita_por_investidor -> em_analise -> aprovada/reprovada
  status: text("status").notNull().default("na_rede"), // na_rede, aceita_por_investidor, em_analise, aprovada, reprovada
  investorId: integer("investor_id").references(() => investors.id), // Quem aceitou da rede
  dataAceite: timestamp("data_aceite"), // Quando foi aceita pelo investidor
  observacoesAnalise: text("observacoes_analise"),
  analisadoPor: integer("analisado_por").references(() => investors.id), // Investidor que está analisando
  dataAnalise: timestamp("data_analise"), // Quando foi analisado
  aprovadoPorBackoffice: integer("aprovado_por_backoffice").references(() => adminUsers.id), // Supervisão do backoffice
  dataAprovacaoBackoffice: timestamp("data_aprovacao_backoffice"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit log table for tracking all important actions
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  acao: text("acao").notNull(), // aprovacao_empresa, reprovacao_empresa, aprovacao_credito, reprovacao_credito, etc
  entidadeTipo: text("entidade_tipo").notNull(), // company, credit_request, user
  entidadeId: integer("entidade_id").notNull(),
  valorAnterior: json("valor_anterior"), // Estado anterior em JSON
  valorNovo: json("valor_novo"), // Novo estado em JSON
  observacoes: text("observacoes"),
  adminUserId: integer("admin_user_id").notNull().references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages/Chat table for communication between backoffice and companies
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull(), // company_id + "_" + credit_request_id
  assunto: text("assunto"), // Subject/topic of the conversation
  tipo: text("tipo").notNull(), // 'company' or 'admin'
  remetenteId: integer("remetente_id").notNull(), // user_id if company, admin_user_id if admin
  destinatarioTipo: text("destinatario_tipo").notNull(), // 'company' or 'admin'
  conteudo: text("conteudo").notNull(),
  anexos: text("anexos").array(), // URLs to uploaded files
  lida: boolean("lida").notNull().default(false),
  creditRequestId: integer("credit_request_id").references(() => creditRequests.id),
  companyId: integer("company_id").references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const entrepreneursRelations = relations(entrepreneurs, ({ many }) => ({
  companies: many(companies),
}));

export const investorsRelations = relations(investors, ({ many }) => ({
  creditRequests: many(creditRequests),
}));

export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  entrepreneur: one(entrepreneurs, {
    fields: [companies.entrepreneurId],
    references: [entrepreneurs.id],
  }),
  shareholders: many(companyShareholders),
  guarantees: many(companyGuarantees),
  creditRequests: many(creditRequests),
}));

export const companyShareholdersRelations = relations(companyShareholders, ({ one }) => ({
  company: one(companies, {
    fields: [companyShareholders.companyId],
    references: [companies.id],
  }),
}));

export const companyGuaranteesRelations = relations(companyGuarantees, ({ one }) => ({
  company: one(companies, {
    fields: [companyGuarantees.companyId],
    references: [companies.id],
  }),
}));

export const creditRequestsRelations = relations(creditRequests, ({ one }) => ({
  company: one(companies, {
    fields: [creditRequests.companyId],
    references: [companies.id],
  }),
  analisadoPorAdmin: one(adminUsers, {
    fields: [creditRequests.analisadoPor],
    references: [adminUsers.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [auditLog.adminUserId],
    references: [adminUsers.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  creditRequest: one(creditRequests, {
    fields: [messages.creditRequestId],
    references: [creditRequests.id],
  }),
  company: one(companies, {
    fields: [messages.companyId],
    references: [companies.id],
  }),
}));

// Zod schemas for validation
export const insertEntrepreneurSchema = createInsertSchema(entrepreneurs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestorSchema = createInsertSchema(investors).omit({
  id: true,
  aprovadoPor: true,
  aprovadoEm: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dataFundacao: z.string().transform((str) => new Date(str)),
});

export const insertCompanyShareholderSchema = createInsertSchema(companyShareholders).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyGuaranteeSchema = createInsertSchema(companyGuarantees).omit({
  id: true,
  createdAt: true,
});

export const insertCreditRequestSchema = createInsertSchema(creditRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  analisadoPor: true,
  dataAnalise: true,
}).extend({
  companyId: z.string().transform((str) => parseInt(str)),
  prazoMeses: z.string().transform((str) => parseInt(str)),
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  lida: true,
});

// Types
export type InsertEntrepreneur = z.infer<typeof insertEntrepreneurSchema>;
export type Entrepreneur = typeof entrepreneurs.$inferSelect;

export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investors.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertCompanyShareholder = z.infer<typeof insertCompanyShareholderSchema>;
export type CompanyShareholder = typeof companyShareholders.$inferSelect;

export type InsertCompanyGuarantee = z.infer<typeof insertCompanyGuaranteeSchema>;
export type CompanyGuarantee = typeof companyGuarantees.$inferSelect;

export type InsertCreditRequest = z.infer<typeof insertCreditRequestSchema>;
export type CreditRequest = typeof creditRequests.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

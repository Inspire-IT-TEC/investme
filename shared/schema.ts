import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, jsonb, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Empreendedores table (quem solicita crédito)
export const entrepreneurs = pgTable("entrepreneurs", {
  id: serial("id").primaryKey(),
  cpf: text("cpf").notNull().unique(),
  rg: text("rg"),
  nomeCompleto: text("nome_completo").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  telefone: text("telefone"),
  dataNascimento: text("data_nascimento"),
  cep: text("cep"),
  rua: text("rua"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  status: text("status").notNull().default("ativo"), // ativo, inativo
  // Campos de aprovação granular
  cadastroAprovado: boolean("cadastro_aprovado").default(false),
  emailConfirmado: boolean("email_confirmado").default(false),
  documentosVerificados: boolean("documentos_verificados").default(false),
  aprovadoPor: integer("aprovado_por").references(() => adminUsers.id),
  aprovadoEm: timestamp("aprovado_em"),
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
  telefone: text("telefone"),
  dataNascimento: text("data_nascimento"),
  profissao: text("profissao"),
  rendaMensal: decimal("renda_mensal", { precision: 15, scale: 2 }),
  cep: text("cep").notNull(),
  rua: text("rua").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento"),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  limiteInvestimento: text("limite_investimento"),
  experienciaInvestimentos: text("experiencia_investimentos"),
  objetivosInvestimento: text("objetivos_investimento"),
  status: text("status").notNull().default("pendente"), // pendente, ativo, inativo
  // Campos de aprovação granular
  cadastroAprovado: boolean("cadastro_aprovado").default(false),
  emailConfirmado: boolean("email_confirmado").default(false),
  documentosVerificados: boolean("documentos_verificados").default(false),
  rendaComprovada: boolean("renda_comprovada").default(false),
  perfilInvestidor: boolean("perfil_investidor").default(false),
  aprovadoPor: integer("aprovado_por").references(() => adminUsers.id),
  aprovadoEm: timestamp("aprovado_em"),
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
  stateId: integer("state_id").references(() => states.id),
  cityId: integer("city_id").references(() => cities.id),
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
  numeroFuncionarios: integer("numero_funcionarios").notNull(),
  descricaoNegocio: text("descricao_negocio"),
  valuation: decimal("valuation", { precision: 15, scale: 2 }), // Valuation opcional da empresa
  images: text("images").array(), // URLs to company images (up to 5)
  status: text("status").notNull().default("aprovada"), // pendente_analise, em_analise, aprovada, reprovada, incompleto
  observacoesInternas: text("observacoes_internas"),
  analisadoPor: integer("analisado_por").references(() => adminUsers.id),
  dataAnalise: timestamp("data_analise"),
  // userId removed - companies now only belong to entrepreneurs
  entrepreneurId: integer("entrepreneur_id").references(() => entrepreneurs.id),
  investorId: integer("investor_id").references(() => investors.id),
  tipoProprietario: text("tipo_proprietario").notNull().default("empreendedor"), // empreendedor, investidor
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
  // Novo fluxo: na_rede -> em_analise -> aprovada/reprovada
  status: text("status").notNull().default("na_rede"), // na_rede, em_analise, aprovada, reprovada
  investorId: integer("investor_id").references(() => investors.id), // Quem aceitou da rede
  dataAceite: timestamp("data_aceite"), // Quando foi aceita pelo investidor
  dataLimiteAnalise: timestamp("data_limite_analise"), // 24 horas após aceite
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

// Email confirmation tokens table
export const emailConfirmationTokens = pgTable("email_confirmation_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  userType: text("user_type").notNull(), // 'entrepreneur' or 'investor'
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pending profile changes for approval
export const pendingProfileChanges = pgTable("pending_profile_changes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userType: text("user_type").notNull(), // 'entrepreneur' or 'investor'
  changedFields: jsonb("changed_fields").notNull(), // JSON object with field changes
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => adminUsers.id),
  reviewComment: text("review_comment"),
});

// Tabela para permitir que uma pessoa física tenha múltiplos perfis (empreendedor e investidor)
export const dualProfiles = pgTable("dual_profiles", {
  id: serial("id").primaryKey(),
  cpf: text("cpf").notNull().unique(),
  entrepreneurId: integer("entrepreneur_id").references(() => entrepreneurs.id),
  investorId: integer("investor_id").references(() => investors.id),
  activeProfile: text("active_profile").notNull().default("entrepreneur"), // entrepreneur, investor
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Valuations table
export const valuations = pgTable("valuations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  userId: integer("user_id").notNull(), // References either entrepreneur or investor ID
  userType: text("user_type").notNull(), // 'entrepreneur' or 'investor'
  method: text("method").notNull(), // 'dcf', 'multiples', or 'inform'
  status: text("status").notNull().default("draft"), // 'draft' or 'completed'
  
  // Common valuation results
  enterpriseValue: decimal("enterprise_value", { precision: 15, scale: 2 }),
  equityValue: decimal("equity_value", { precision: 15, scale: 2 }),
  
  // DCF specific data
  dcfData: jsonb("dcf_data"), // Stores DCF calculations and projections
  
  // Multiples specific data
  multiplesData: jsonb("multiples_data"), // Stores multiples and comparable data
  
  // Inform valuation specific data
  informData: jsonb("inform_data"), // Stores informed valuation data
  
  // Sensitivity analysis data
  sensitivityData: jsonb("sensitivity_data"),
  
  // Metadata
  assumptions: text("assumptions"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const entrepreneursRelations = relations(entrepreneurs, ({ many, one }) => ({
  companies: many(companies),
  dualProfile: one(dualProfiles, {
    fields: [entrepreneurs.cpf],
    references: [dualProfiles.cpf],
  }),
}));

export const investorsRelations = relations(investors, ({ many, one }) => ({
  creditRequests: many(creditRequests),
  dualProfile: one(dualProfiles, {
    fields: [investors.cpf],
    references: [dualProfiles.cpf],
  }),
}));

export const dualProfilesRelations = relations(dualProfiles, ({ one }) => ({
  entrepreneur: one(entrepreneurs, {
    fields: [dualProfiles.entrepreneurId],
    references: [entrepreneurs.id],
  }),
  investor: one(investors, {
    fields: [dualProfiles.investorId],
    references: [investors.id],
  }),
}));



export const companiesRelations = relations(companies, ({ one, many }) => ({
  entrepreneur: one(entrepreneurs, {
    fields: [companies.entrepreneurId],
    references: [entrepreneurs.id],
  }),
  shareholders: many(companyShareholders),
  guarantees: many(companyGuarantees),
  creditRequests: many(creditRequests),
  valuations: many(valuations),
}));

export const valuationsRelations = relations(valuations, ({ one }) => ({
  company: one(companies, {
    fields: [valuations.companyId],
    references: [companies.id],
  }),
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

export const insertDualProfileSchema = createInsertSchema(dualProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestorSchema = createInsertSchema(investors).omit({
  id: true,
  status: true,
  cadastroAprovado: true,
  emailConfirmado: true,
  documentosVerificados: true,
  rendaComprovada: true,
  perfilInvestidor: true,
  aprovadoPor: true,
  aprovadoEm: true,
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
  analisadoPor: true,
  dataAnalise: true,
  observacoesInternas: true,
  userId: true, // Omit userId from schema since we use entrepreneurId
}).extend({
  dataFundacao: z.string().min(1, "Data de fundação é obrigatória").transform((str) => new Date(str)),
  faturamento: z.string().min(1, "Faturamento é obrigatório").transform((val) => val.replace(/[^\d,.-]/g, '').replace(',', '.')),
  ebitda: z.string().min(1, "EBITDA é obrigatório").transform((val) => val.replace(/[^\d,.-]/g, '').replace(',', '.')),
  dividaLiquida: z.string().min(1, "Dívida líquida é obrigatória").transform((val) => val.replace(/[^\d,.-]/g, '').replace(',', '.')),
  numeroFuncionarios: z.string().min(1, "Número de funcionários é obrigatório").transform((val) => parseInt(val)),
  cnaeSecundarios: z.array(z.string()).optional().default([]),
  valuation: z.string().optional().transform((val) => val ? val.replace(/[^\d,.-]/g, '').replace(',', '.') : undefined),
});

export const editCompanySchema = z.object({
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  telefone: z.string().optional(),
  emailContato: z.string().email("Email inválido").optional(),
  cep: z.string().min(1, "CEP é obrigatório"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
  cnaePrincipal: z.string().min(1, "CNAE principal é obrigatório"),
  cnaeSecundarios: z.array(z.string()).optional(),
  dataFundacao: z.date(),
  faturamento: z.string().min(1, "Faturamento é obrigatório"),
  numeroFuncionarios: z.number().min(1, "Número de funcionários é obrigatório"),
  descricaoNegocio: z.string().min(1, "Descrição do negócio é obrigatória"),
  valuation: z.string().optional(),
  tipoProprietario: z.string().optional(),
});

export const passwordChangeSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
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

export const insertValuationSchema = createInsertSchema(valuations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Transform number inputs to string for decimal fields
  enterpriseValue: z.union([z.string(), z.number()]).optional().transform((val) => 
    val !== undefined ? String(val) : val
  ),
  equityValue: z.union([z.string(), z.number()]).optional().transform((val) => 
    val !== undefined ? String(val) : val
  ),
});

export const insertEmailConfirmationTokenSchema = createInsertSchema(emailConfirmationTokens).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

// DCF Schema for validation
export const dcfDataSchema = z.object({
  projectionYears: z.number().min(3).max(15).default(5),
  // Financial Projections
  revenues: z.array(z.number()),
  costs: z.array(z.number()),
  operatingExpenses: z.array(z.number()),
  capex: z.array(z.number()),
  workingCapitalChange: z.array(z.number()),
  // Cost of Capital
  costOfEquity: z.number().min(0).max(1),
  costOfDebt: z.number().min(0).max(1),
  taxRate: z.number().min(0).max(1),
  debtWeight: z.number().min(0).max(1),
  equityWeight: z.number().min(0).max(1),
  // Terminal Value
  terminalGrowthRate: z.number().min(0).max(0.1),
  // Company specific
  netDebt: z.number().optional(),
  sharesOutstanding: z.number().optional(),
});

// Multiples Schema for validation
export const multiplesDataSchema = z.object({
  // Comparable multiples
  peLuMultiple: z.number().optional(),
  evEbitdaMultiple: z.number().optional(),
  pvVpMultiple: z.number().optional(),
  evRevenueMultiple: z.number().optional(),
  // Current financials for application
  netIncome: z.number().optional(),
  ebitda: z.number().optional(),
  bookValue: z.number().optional(),
  revenue: z.number().optional(),
  enterpriseValue: z.number().optional(),
  // Adjustments
  liquidityDiscount: z.number().min(0).max(1).default(0),
  controlPremium: z.number().min(0).max(1).default(0),
  // Sources and notes
  comparablesSources: z.string().optional(),
});

// Types
export type InsertEntrepreneur = z.infer<typeof insertEntrepreneurSchema>;
export type Entrepreneur = typeof entrepreneurs.$inferSelect;

export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investors.$inferSelect;



export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type InsertDualProfile = z.infer<typeof insertDualProfileSchema>;
export type DualProfile = typeof dualProfiles.$inferSelect;
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

export type InsertValuation = z.infer<typeof insertValuationSchema>;
export type Valuation = typeof valuations.$inferSelect;

export type InsertEmailConfirmationToken = z.infer<typeof insertEmailConfirmationTokenSchema>;
export type EmailConfirmationToken = typeof emailConfirmationTokens.$inferSelect;

export type DCFData = z.infer<typeof dcfDataSchema>;
export type MultiplesData = z.infer<typeof multiplesDataSchema>;

// Platform Notifications table
export const platformNotifications = pgTable("platform_notifications", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  conteudo: text("conteudo").notNull(),
  tipoUsuario: text("tipo_usuario").notNull(), // 'entrepreneur', 'investor', 'both'
  usuarioEspecificoId: integer("usuario_especifico_id"), // null = para todos
  tipoUsuarioEspecifico: text("tipo_usuario_especifico"), // 'entrepreneur' ou 'investor' quando usuarioEspecificoId não é null
  criadoPor: integer("criado_por").notNull().references(() => adminUsers.id),
  ativa: boolean("ativa").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User notification reads tracking
export const notificationReads = pgTable("notification_reads", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull().references(() => platformNotifications.id),
  userId: integer("user_id").notNull(),
  userType: text("user_type").notNull(), // 'entrepreneur' ou 'investor'
  readAt: timestamp("read_at").defaultNow(),
});

export const insertPlatformNotificationSchema = createInsertSchema(platformNotifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationReadSchema = createInsertSchema(notificationReads).omit({
  id: true,
  readAt: true,
});

export type InsertPlatformNotification = z.infer<typeof insertPlatformNotificationSchema>;
export type PlatformNotification = typeof platformNotifications.$inferSelect;

export type InsertNotificationRead = z.infer<typeof insertNotificationReadSchema>;
export type NotificationRead = typeof notificationReads.$inferSelect;

// Estados e Cidades para filtros da rede
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  stateId: integer("state_id").notNull().references(() => states.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Imagens das empresas para a rede
export const companyImages = pgTable("company_images", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  caption: text("caption"),
  isMain: boolean("is_main").default(false).notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Posts da rede (estilo Instagram)
export const networkPosts = pgTable("network_posts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  content: text("content"),
  imageUrl: varchar("image_url", { length: 500 }),
  userId: integer("user_id").notNull(),
  userType: varchar("user_type", { length: 50 }).notNull(), // 'entrepreneur', 'investor'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comentários na rede
export const networkComments = pgTable("network_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => networkPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  userType: varchar("user_type", { length: 50 }).notNull(), // 'entrepreneur', 'investor'
  content: text("content").notNull(),
  flagged: boolean("flagged").default(false).notNull(),
  flaggedReason: text("flagged_reason"),
  moderatedBy: integer("moderated_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Curtidas na rede
export const networkLikes = pgTable("network_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => networkPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  userType: varchar("user_type", { length: 50 }).notNull(), // 'entrepreneur', 'investor'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Curtidas em empresas
export const companyLikes = pgTable("company_likes", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull(),
  userType: varchar("user_type", { length: 50 }).notNull(), // 'entrepreneur', 'investor'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userType: varchar("user_type", { length: 50 }).notNull(), // 'entrepreneur', 'investor', 'admin'
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
}));

export const companyImagesRelations = relations(companyImages, ({ one }) => ({
  company: one(companies, {
    fields: [companyImages.companyId],
    references: [companies.id],
  }),
}));

export const networkPostsRelations = relations(networkPosts, ({ one, many }) => ({
  company: one(companies, {
    fields: [networkPosts.companyId],
    references: [companies.id],
  }),
  comments: many(networkComments),
  likes: many(networkLikes),
}));

export const networkCommentsRelations = relations(networkComments, ({ one }) => ({
  post: one(networkPosts, {
    fields: [networkComments.postId],
    references: [networkPosts.id],
  }),
  moderator: one(adminUsers, {
    fields: [networkComments.moderatedBy],
    references: [adminUsers.id],
  }),
}));

export const networkLikesRelations = relations(networkLikes, ({ one }) => ({
  post: one(networkPosts, {
    fields: [networkLikes.postId],
    references: [networkPosts.id],
  }),
}));

// Insert schemas
export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true,
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyImageSchema = createInsertSchema(companyImages).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkPostSchema = createInsertSchema(networkPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNetworkCommentSchema = createInsertSchema(networkComments).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkLikeSchema = createInsertSchema(networkLikes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof states.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

export type InsertCompanyImage = z.infer<typeof insertCompanyImageSchema>;
export type CompanyImage = typeof companyImages.$inferSelect;

export type InsertNetworkPost = z.infer<typeof insertNetworkPostSchema>;
export type NetworkPost = typeof networkPosts.$inferSelect;

export type InsertNetworkComment = z.infer<typeof insertNetworkCommentSchema>;
export type NetworkComment = typeof networkComments.$inferSelect;

export type InsertNetworkLike = z.infer<typeof insertNetworkLikeSchema>;
export type NetworkLike = typeof networkLikes.$inferSelect;

// Validation schemas for password reset
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;

// Pending profile changes types
export const insertPendingProfileChangeSchema = createInsertSchema(pendingProfileChanges).omit({
  id: true,
  requestedAt: true,
  reviewedAt: true,
});

export type InsertPendingProfileChange = z.infer<typeof insertPendingProfileChangeSchema>;
export type PendingProfileChange = typeof pendingProfileChanges.$inferSelect;

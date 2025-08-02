import { 
  users, 
  entrepreneurs,
  investors,
  adminUsers,
  companies, 
  companyShareholders,
  companyGuarantees,
  creditRequests,
  auditLog,
  messages,
  platformNotifications,
  notificationReads,
  states,
  cities,
  companyImages,
  networkPosts,
  networkComments,
  networkLikes,
  passwordResetTokens,
  emailConfirmationTokens,
  pendingProfileChanges,
  type User, 
  type InsertUser,
  type Entrepreneur,
  type InsertEntrepreneur,
  type Investor,
  type InsertInvestor,
  type AdminUser,
  type InsertAdminUser,
  type Company,
  type InsertCompany,
  type CompanyShareholder,
  type InsertCompanyShareholder,
  type CompanyGuarantee,
  type InsertCompanyGuarantee,
  type CreditRequest,
  type InsertCreditRequest,
  type AuditLog,
  type InsertAuditLog,
  type Message,
  type InsertMessage,
  type PlatformNotification,
  type InsertPlatformNotification,
  type NotificationRead,
  type InsertNotificationRead,
  valuations,
  type Valuation,
  type InsertValuation,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type EmailConfirmationToken,
  type InsertEmailConfirmationToken,
  type PendingProfileChange,
  type InsertPendingProfileChange
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, ilike, sql, or, lt, ne, count, asc, isNull, isNotNull, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods - UNIFICADO
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByCpf(cpf: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  addUserType(userId: number, userType: "entrepreneur" | "investor", additionalData?: Partial<InsertUser>): Promise<User | undefined>;
  updateUserApproval(id: number, userType: "entrepreneur" | "investor", approved: boolean, adminId: number): Promise<User | undefined>;

  // DEPRECADO - mantido para compatibilidade temporária
  getEntrepreneur(id: number): Promise<Entrepreneur | undefined>;
  getEntrepreneurByEmail(email: string): Promise<Entrepreneur | undefined>;
  getEntrepreneurByCpf(cpf: string): Promise<Entrepreneur | undefined>;
  createEntrepreneur(entrepreneur: InsertEntrepreneur): Promise<Entrepreneur>;
  updateEntrepreneur(id: number, updateData: Partial<Entrepreneur>): Promise<Entrepreneur | undefined>;
  updateEntrepreneurApproval(id: number, field: 'cadastroAprovado' | 'emailConfirmado' | 'documentosVerificados', approved: boolean, adminId: number): Promise<Entrepreneur | undefined>;

  // Investor methods
  getInvestor(id: number): Promise<Investor | undefined>;
  getInvestorByEmail(email: string): Promise<Investor | undefined>;
  getInvestorByCpf(cpf: string): Promise<Investor | undefined>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  updateInvestor(id: number, updateData: Partial<Investor>): Promise<Investor | undefined>;
  updateInvestorApproval(id: number, field: 'cadastroAprovado' | 'emailConfirmado' | 'documentosVerificados', approved: boolean, adminId: number): Promise<Investor | undefined>;

  // Admin user methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;

  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(userId?: number, status?: string, search?: string): Promise<Company[]>;
  getCompanyWithDetails(id: number): Promise<any>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  getUserCompanies(userId: number): Promise<Company[]>;

  // Company shareholders methods
  getCompanyShareholders(companyId: number): Promise<CompanyShareholder[]>;
  createCompanyShareholder(shareholder: InsertCompanyShareholder): Promise<CompanyShareholder>;
  deleteCompanyShareholders(companyId: number): Promise<void>;

  // Company guarantees methods
  getCompanyGuarantees(companyId: number): Promise<CompanyGuarantee[]>;
  createCompanyGuarantee(guarantee: InsertCompanyGuarantee): Promise<CompanyGuarantee>;
  deleteCompanyGuarantees(companyId: number): Promise<void>;

  // Credit request methods
  getCreditRequest(id: number): Promise<CreditRequest | undefined>;
  getCreditRequests(status?: string, search?: string): Promise<any[]>;
  getCompanyCreditRequests(companyId: number): Promise<CreditRequest[]>;
  createCreditRequest(creditRequest: InsertCreditRequest): Promise<CreditRequest>;
  updateCreditRequest(id: number, creditRequest: Partial<InsertCreditRequest>): Promise<CreditRequest | undefined>;

  // Admin user methods with profiles
  getAdminUsers(): Promise<AdminUser[]>;
  updateAdminUser(id: number, adminUser: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;

  // Audit log methods
  createAuditLog(auditData: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entidadeTipo?: string, acao?: string): Promise<any[]>;

  // Messages methods
  createMessage(messageData: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<any[]>;
  getCompanyConversations(companyId: number): Promise<any[]>;
  getAdminConversations(): Promise<any[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  markConversationAsRead(conversationId: string, userType: string): Promise<void>;
  getAvailableCompaniesForChat(): Promise<any[]>;
  getUserCreditRequests(userId: number): Promise<any[]>;

  // Admin investor management methods
  getInvestors(status?: string): Promise<any[]>;
  approveInvestor(investorId: number): Promise<Investor | undefined>;
  rejectInvestor(investorId: number, reason: string): Promise<Investor | undefined>;

  // Admin entrepreneur management methods  
  getEntrepreneurs(status?: string): Promise<any[]>;
  getEntrepreneur(id: number): Promise<Entrepreneur | undefined>;
  updateEntrepreneur(id: number, updateData: Partial<InsertEntrepreneur>): Promise<Entrepreneur | undefined>;
  approveEntrepreneur(entrepreneurId: number): Promise<Entrepreneur | undefined>;
  rejectEntrepreneur(entrepreneurId: number, reason: string): Promise<Entrepreneur | undefined>;

  // Admin user management methods
  getUsersByTypeAndStatus(tipo?: string, status?: string): Promise<any[]>;
  approveUser(userId: number): Promise<User | undefined>;
  rejectUser(userId: number, reason: string): Promise<User | undefined>;

  // Admin network methods
  getNetworkRequests(status?: string): Promise<any[]>;
  getNetworkStats(): Promise<any>;

  // Valuation methods
  getValuation(id: number): Promise<Valuation | undefined>;
  getCompanyValuations(companyId: number): Promise<Valuation[]>;
  getLatestCompanyValuation(companyId: number): Promise<Valuation | undefined>;
  createValuation(valuation: InsertValuation): Promise<Valuation>;
  updateValuation(id: number, valuation: Partial<InsertValuation>): Promise<Valuation | undefined>;
  deleteValuation(id: number): Promise<void>;
  getUserValuations(userId: number): Promise<any[]>;

  // Platform notification methods
  createPlatformNotification(notification: InsertPlatformNotification): Promise<PlatformNotification>;
  getPlatformNotifications(filters?: { tipoUsuario?: string; ativa?: boolean }): Promise<any[]>;
  updatePlatformNotification(id: number, notification: Partial<InsertPlatformNotification>): Promise<PlatformNotification | undefined>;
  deletePlatformNotification(id: number): Promise<void>;
  getUserNotifications(userId: number, userType: string): Promise<any[]>;
  markNotificationAsRead(notificationId: number, userId: number, userType: string): Promise<void>;
  getUnreadNotificationsCount(userId: number, userType: string): Promise<number>;

  // Network/Location methods
  getStates(): Promise<any[]>;
  getCitiesByState(stateId: number): Promise<any[]>;
  getNetworkCompanies(filters?: { stateId?: number; cityId?: number; search?: string; excludeUserId?: number }): Promise<any[]>;
  
  // Network posts methods
  createNetworkPost(post: any): Promise<any>;
  getNetworkPosts(companyId: number): Promise<any[]>;
  likeNetworkPost(postId: number, userId: number, userType: string): Promise<void>;
  unlikeNetworkPost(postId: number, userId: number, userType: string): Promise<void>;
  
  // Network comments methods
  createNetworkComment(comment: any): Promise<any>;
  getNetworkComments(postId: number): Promise<any[]>;
  flagNetworkComment(commentId: number, reason: string, moderatedBy: number): Promise<void>;
  
  // Company images methods
  createCompanyImage(image: any): Promise<any>;
  getCompanyImages(companyId: number): Promise<any[]>;
  
  // Password reset methods
  createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  usePasswordResetToken(token: string): Promise<void>;
  updateUserPassword(email: string, userType: string, hashedPassword: string): Promise<void>;

  // Email confirmation methods
  createEmailConfirmationToken(tokenData: InsertEmailConfirmationToken): Promise<EmailConfirmationToken>;
  getEmailConfirmationToken(token: string): Promise<EmailConfirmationToken | undefined>;
  useEmailConfirmationToken(token: string): Promise<void>;
  deleteEmailConfirmationToken(id: number): Promise<void>;
  deleteEmailConfirmationTokensByEmail(email: string): Promise<void>;
  confirmUserEmail(email: string, userType: string): Promise<void>;

  // Pending profile changes methods
  createPendingProfileChange(changeData: InsertPendingProfileChange): Promise<PendingProfileChange>;
  getPendingProfileChanges(userType?: string, status?: string): Promise<PendingProfileChange[]>;
  getPendingProfileChangeByUser(userId: number, userType: string): Promise<PendingProfileChange | undefined>;
  reviewPendingProfileChange(id: number, approved: boolean, reviewedBy: number, comment?: string): Promise<PendingProfileChange | undefined>;
  deletePendingProfileChange(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // NOVO: User methods unificados
  async addUserType(userId: number, userType: "entrepreneur" | "investor", additionalData?: Partial<InsertUser>): Promise<User | undefined> {
    // Busca o usuário atual
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;

    // Verifica se já tem esse tipo
    if (currentUser.userTypes?.includes(userType)) {
      return currentUser; // Já tem esse tipo
    }

    // Adiciona o novo tipo
    const newUserTypes = [...(currentUser.userTypes || []), userType];
    
    const updateData: Partial<InsertUser> = {
      userTypes: newUserTypes,
      ...additionalData
    };

    return await this.updateUser(userId, updateData);
  }

  async updateUserApproval(id: number, userType: "entrepreneur" | "investor", approved: boolean, adminId: number): Promise<User | undefined> {
    const approvalField = userType === "entrepreneur" ? "entrepreneurApproved" : "investorApproved";
    
    const updateData: any = {
      [approvalField]: approved,
      aprovadoPor: adminId,
      aprovadoEm: approved ? new Date() : null,
      updatedAt: new Date()
    };

    return await this.updateUser(id, updateData);
  }

  // User methods básicos
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByCpf(cpf: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.cpf, cpf));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Admin user methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return adminUser || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return adminUser || undefined;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const [adminUser] = await db.insert(adminUsers).values(insertAdminUser).returning();
    return adminUser;
  }

  // Entrepreneur methods
  async getEntrepreneur(id: number): Promise<Entrepreneur | undefined> {
    const [entrepreneur] = await db.select().from(entrepreneurs).where(eq(entrepreneurs.id, id));
    return entrepreneur || undefined;
  }

  async getEntrepreneurByEmail(email: string): Promise<Entrepreneur | undefined> {
    const [entrepreneur] = await db.select().from(entrepreneurs).where(eq(entrepreneurs.email, email));
    return entrepreneur || undefined;
  }

  async getEntrepreneurByCpf(cpf: string): Promise<Entrepreneur | undefined> {
    const [entrepreneur] = await db.select().from(entrepreneurs).where(eq(entrepreneurs.cpf, cpf));
    return entrepreneur || undefined;
  }

  async createEntrepreneur(insertEntrepreneur: InsertEntrepreneur): Promise<Entrepreneur> {
    const [entrepreneur] = await db.insert(entrepreneurs).values(insertEntrepreneur).returning();
    return entrepreneur;
  }

  async updateEntrepreneur(id: number, updateData: Partial<Entrepreneur>): Promise<Entrepreneur | undefined> {
    const [entrepreneur] = await db
      .update(entrepreneurs)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(entrepreneurs.id, id))
      .returning();
    return entrepreneur;
  }

  async updateEntrepreneurApproval(id: number, field: 'cadastroAprovado' | 'emailConfirmado' | 'documentosVerificados', approved: boolean, adminId: number): Promise<Entrepreneur | undefined> {
    const updateData: any = {
      [field]: approved,
      updatedAt: new Date()
    };
    
    if (approved) {
      updateData.aprovadoPor = adminId;
      updateData.aprovadoEm = new Date();
    }

    const [entrepreneur] = await db
      .update(entrepreneurs)
      .set(updateData)
      .where(eq(entrepreneurs.id, id))
      .returning();
    
    return entrepreneur || undefined;
  }

  // Investor methods
  async getInvestor(id: number): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.id, id));
    return investor || undefined;
  }

  async getInvestorByEmail(email: string): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.email, email));
    return investor || undefined;
  }

  async getInvestorByCpf(cpf: string): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.cpf, cpf));
    return investor || undefined;
  }

  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const [investor] = await db.insert(investors).values([insertInvestor]).returning();
    return investor;
  }

  async updateInvestorApproval(id: number, field: 'cadastroAprovado' | 'emailConfirmado' | 'documentosVerificados', approved: boolean, adminId: number): Promise<Investor | undefined> {
    const updateData: any = {
      [field]: approved,
      updatedAt: new Date()
    };
    
    if (approved) {
      updateData.aprovadoPor = adminId;
      updateData.aprovadoEm = new Date();
    }

    const [investor] = await db
      .update(investors)
      .set(updateData)
      .where(eq(investors.id, id))
      .returning();
    
    return investor || undefined;
  }

  async updateInvestor(id: number, updateData: Partial<Investor>): Promise<Investor | undefined> {
    const [investor] = await db
      .update(investors)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(investors.id, id))
      .returning();
    
    return investor || undefined;
  }

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(userId?: number, status?: string, search?: string): Promise<Company[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(companies.userId, userId));
    }
    if (status) conditions.push(eq(companies.status, status));
    if (search) {
      conditions.push(
        ilike(companies.razaoSocial, `%${search}%`)
      );
    }

    if (conditions.length > 0) {
      return await db.select().from(companies).where(and(...conditions)).orderBy(desc(companies.createdAt));
    } else {
      return await db.select().from(companies).orderBy(desc(companies.createdAt));
    }
  }

  async getCompanyWithDetails(id: number): Promise<any> {
    const company = await this.getCompany(id);
    if (!company) return undefined;

    const shareholders = await this.getCompanyShareholders(id);
    const guarantees = await this.getCompanyGuarantees(id);
    const creditRequests = await this.getCompanyCreditRequests(id);

    return {
      ...company,
      shareholders,
      guarantees,
      creditRequests
    };
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  async getUserCompanies(userId: number): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .orderBy(desc(companies.createdAt));
  }

  // Company shareholders methods
  async getCompanyShareholders(companyId: number): Promise<CompanyShareholder[]> {
    return await db
      .select()
      .from(companyShareholders)
      .where(eq(companyShareholders.companyId, companyId));
  }

  async createCompanyShareholder(insertShareholder: InsertCompanyShareholder): Promise<CompanyShareholder> {
    const [shareholder] = await db.insert(companyShareholders).values(insertShareholder).returning();
    return shareholder;
  }

  async deleteCompanyShareholders(companyId: number): Promise<void> {
    await db.delete(companyShareholders).where(eq(companyShareholders.companyId, companyId));
  }

  // Company guarantees methods
  async getCompanyGuarantees(companyId: number): Promise<CompanyGuarantee[]> {
    return await db
      .select()
      .from(companyGuarantees)
      .where(eq(companyGuarantees.companyId, companyId));
  }

  async createCompanyGuarantee(insertGuarantee: InsertCompanyGuarantee): Promise<CompanyGuarantee> {
    const [guarantee] = await db.insert(companyGuarantees).values(insertGuarantee).returning();
    return guarantee;
  }

  async deleteCompanyGuarantees(companyId: number): Promise<void> {
    await db.delete(companyGuarantees).where(eq(companyGuarantees.companyId, companyId));
  }

  // Credit request methods
  async getCreditRequest(id: number): Promise<CreditRequest | undefined> {
    const [creditRequest] = await db.select().from(creditRequests).where(eq(creditRequests.id, id));
    return creditRequest || undefined;
  }

  async getCreditRequests(status?: string, search?: string): Promise<any[]> {
    const conditions = [];
    if (status) conditions.push(eq(creditRequests.status, status));
    if (search) {
      conditions.push(ilike(companies.razaoSocial, `%${search}%`));
    }

    if (conditions.length > 0) {
      return await db
        .select({
          id: creditRequests.id,
          valorSolicitado: creditRequests.valorSolicitado,
          prazoMeses: creditRequests.prazoMeses,
          finalidade: creditRequests.finalidade,
          documentos: creditRequests.documentos,
          status: creditRequests.status,
          observacoesAnalise: creditRequests.observacoesAnalise,
          createdAt: creditRequests.createdAt,
          updatedAt: creditRequests.updatedAt,
          companyId: companies.id,
          companyRazaoSocial: companies.razaoSocial,
          companyCnpj: companies.cnpj,
          companyStatus: companies.status,
        })
        .from(creditRequests)
        .leftJoin(companies, eq(creditRequests.companyId, companies.id))
        .where(and(...conditions))
        .orderBy(desc(creditRequests.createdAt));
    } else {
      return await db
        .select({
          id: creditRequests.id,
          valorSolicitado: creditRequests.valorSolicitado,
          prazoMeses: creditRequests.prazoMeses,
          finalidade: creditRequests.finalidade,
          documentos: creditRequests.documentos,
          status: creditRequests.status,
          observacoesAnalise: creditRequests.observacoesAnalise,
          createdAt: creditRequests.createdAt,
          updatedAt: creditRequests.updatedAt,
          companyId: companies.id,
          companyRazaoSocial: companies.razaoSocial,
          companyCnpj: companies.cnpj,
          companyStatus: companies.status,
        })
        .from(creditRequests)
        .leftJoin(companies, eq(creditRequests.companyId, companies.id))
        .orderBy(desc(creditRequests.createdAt));
    }
  }

  async getCompanyCreditRequests(companyId: number): Promise<any[]> {
    return await db
      .select({
        id: creditRequests.id,
        valorSolicitado: creditRequests.valorSolicitado,
        prazoMeses: creditRequests.prazoMeses,
        finalidade: creditRequests.finalidade,
        status: creditRequests.status,
        observacoesAnalise: creditRequests.observacoesAnalise,
        createdAt: creditRequests.createdAt,
        updatedAt: creditRequests.updatedAt,
        companyId: companies.id,
        companyRazaoSocial: companies.razaoSocial,
        companyCnpj: companies.cnpj,
        companyStatus: companies.status,
        // Removido investorId - não existe mais na nova estrutura
      })
      .from(creditRequests)
      .leftJoin(companies, eq(creditRequests.companyId, companies.id))
      .where(eq(creditRequests.companyId, companyId))
      .orderBy(desc(creditRequests.createdAt));
  }

  async createCreditRequest(insertCreditRequest: InsertCreditRequest): Promise<CreditRequest> {
    const [creditRequest] = await db.insert(creditRequests).values(insertCreditRequest).returning();
    return creditRequest;
  }

  async updateCreditRequest(id: number, updateData: Partial<InsertCreditRequest>): Promise<CreditRequest | undefined> {
    const [creditRequest] = await db
      .update(creditRequests)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(creditRequests.id, id))
      .returning();
    return creditRequest || undefined;
  }

  // Admin user methods with profiles
  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
  }

  async updateAdminUser(id: number, updateData: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    const [adminUser] = await db
      .update(adminUsers)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return adminUser;
  }

  // Audit log methods
  async createAuditLog(auditData: InsertAuditLog): Promise<AuditLog> {
    const [audit] = await db
      .insert(auditLog)
      .values(auditData)
      .returning();
    return audit;
  }

  async getAuditLogs(entidadeTipo?: string, acao?: string): Promise<any[]> {
    let query = db
      .select({
        id: auditLog.id,
        acao: auditLog.acao,
        entidadeTipo: auditLog.entidadeTipo,
        entidadeId: auditLog.entidadeId,
        valorAnterior: auditLog.valorAnterior,
        valorNovo: auditLog.valorNovo,
        observacoes: auditLog.observacoes,
        createdAt: auditLog.createdAt,
        adminUserNome: adminUsers.nome,
        adminUserEmail: adminUsers.email,
      })
      .from(auditLog)
      .leftJoin(adminUsers, eq(auditLog.adminUserId, adminUsers.id))
      .orderBy(desc(auditLog.createdAt));

    const conditions = [];
    if (entidadeTipo) {
      conditions.push(eq(auditLog.entidadeTipo, entidadeTipo));
    }
    if (acao) {
      conditions.push(eq(auditLog.acao, acao));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  // Messages methods
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getConversationMessages(conversationId: string): Promise<any[]> {
    const messagesData = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        tipo: messages.tipo,
        remetenteId: messages.remetenteId,
        destinatarioTipo: messages.destinatarioTipo,
        conteudo: messages.conteudo,
        anexos: messages.anexos,
        lida: messages.lida,
        creditRequestId: messages.creditRequestId,
        companyId: messages.companyId,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Add sender information for each message
    const enrichedMessages = await Promise.all(
      messagesData.map(async (message) => {
        let senderName = '';
        
        if (message.tipo === 'investor') {
          // Investors are actually users with investor role
          const user = await this.getUser(message.remetenteId);
          senderName = user?.nomeCompleto || `Investidor #${message.remetenteId}`;
        } else if (message.tipo === 'empresa') {
          const user = await this.getUser(message.remetenteId);
          senderName = user?.nomeCompleto || `Empresa #${message.remetenteId}`;
        } else if (message.tipo === 'admin') {
          const admin = await this.getAdminUser(message.remetenteId);
          senderName = admin?.nome || `Admin #${message.remetenteId}`;
        }

        return {
          ...message,
          senderName
        };
      })
    );

    return enrichedMessages;
  }

  async getCompanyConversations(companyId: number): Promise<any[]> {
    // Get all unique conversations for the company
    const conversationsQuery = await db
      .selectDistinct({
        conversationId: messages.conversationId,
        creditRequestId: messages.creditRequestId,
      })
      .from(messages)
      .where(eq(messages.companyId, companyId));

    const conversationsWithDetails = [];
    for (const conv of conversationsQuery) {
      // Get company info
      let company = null;
      const companyResult = await db
        .select({
          razaoSocial: companies.razaoSocial,
          cnpj: companies.cnpj,
        })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);
      company = companyResult[0];

      // Get the last message and subject for each conversation
      const [lastMessage] = await db
        .select({
          conteudo: messages.conteudo,
          assunto: messages.assunto,
          createdAt: messages.createdAt,
          tipo: messages.tipo,
          remetenteId: messages.remetenteId,
        })
        .from(messages)
        .where(eq(messages.conversationId, conv.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Get participant info (who is talking with the company)
      let participantName = '';
      let participantType = '';
      
      // Find non-company messages to identify the other participant
      const [otherParticipant] = await db
        .select({
          tipo: messages.tipo,
          remetenteId: messages.remetenteId,
        })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.conversationId),
            ne(messages.tipo, 'empresa')
          )
        )
        .limit(1);

      if (otherParticipant) {
        if (otherParticipant.tipo === 'investor') {
          const user = await this.getUser(otherParticipant.remetenteId);
          participantName = user?.nomeCompleto || `Investidor #${otherParticipant.remetenteId}`;
          participantType = 'Investidor';
        } else if (otherParticipant.tipo === 'admin') {
          const admin = await this.getAdminUser(otherParticipant.remetenteId);
          participantName = admin?.nome || `Admin #${otherParticipant.remetenteId}`;
          participantType = 'Suporte';
        }
      }

      // Count unread messages for the company
      const unreadMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.conversationId),
            eq(messages.destinatarioTipo, 'empresa'),
            eq(messages.lida, false)
          )
        );
      
      const unreadCount = unreadMessages.length;

      conversationsWithDetails.push({
        conversationId: conv.conversationId,
        creditRequestId: conv.creditRequestId,
        companyName: company?.razaoSocial || 'Empresa não encontrada',
        companyCnpj: company?.cnpj || '',
        participantName: participantName,
        participantType: participantType,
        assunto: lastMessage?.assunto || 'Sem assunto',
        lastMessage: lastMessage?.conteudo || '',
        lastMessageDate: lastMessage?.createdAt || new Date(),
        unreadCount: unreadCount,
      });
    }

    return conversationsWithDetails.sort((a, b) => 
      new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
  }

  async getAdminConversations(): Promise<any[]> {
    // Get all unique conversations for admin with company info
    const conversationsQuery = await db
      .selectDistinct({
        conversationId: messages.conversationId,
        companyId: messages.companyId,
        creditRequestId: messages.creditRequestId,
      })
      .from(messages);

    const conversationsWithDetails = [];
    for (const conv of conversationsQuery) {
      // Get company info
      let company = null;
      if (conv.companyId) {
        const companyResult = await db
          .select({
            razaoSocial: companies.razaoSocial,
            cnpj: companies.cnpj,
          })
          .from(companies)
          .where(eq(companies.id, conv.companyId))
          .limit(1);
        company = companyResult[0];
      }

      // Get the last message and subject for each conversation
      const [lastMessage] = await db
        .select({
          conteudo: messages.conteudo,
          assunto: messages.assunto,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, conv.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Count unread messages for admin
      const unreadMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.conversationId),
            eq(messages.destinatarioTipo, 'admin'),
            eq(messages.lida, false)
          )
        );

      const unreadCount = unreadMessages.length;

      conversationsWithDetails.push({
        conversationId: conv.conversationId,
        companyId: conv.companyId,
        creditRequestId: conv.creditRequestId,
        companyName: company?.razaoSocial || 'Empresa não encontrada',
        companyCnpj: company?.cnpj || '',
        assunto: lastMessage?.assunto || 'Sem assunto',
        lastMessage: lastMessage?.conteudo || '',
        lastMessageDate: lastMessage?.createdAt || new Date(),
        unreadCount: unreadCount,
      });
    }

    return conversationsWithDetails.sort((a, b) => 
      new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ lida: true })
      .where(eq(messages.id, messageId));
  }

  async markConversationAsRead(conversationId: string, userType: string): Promise<void> {
    const conditions = [eq(messages.conversationId, conversationId)];
    if (userType === 'company') {
      conditions.push(eq(messages.destinatarioTipo, 'company'));
    } else if (userType === 'admin') {
      conditions.push(eq(messages.destinatarioTipo, 'admin'));
    }

    await db
      .update(messages)
      .set({ lida: true })
      .where(and(...conditions));
  }

  async getAvailableCompaniesForChat(): Promise<any[]> {
    return await db
      .select({
        id: companies.id,
        razaoSocial: companies.razaoSocial,
        cnpj: companies.cnpj,
        status: companies.status,
      })
      .from(companies)
      .orderBy(companies.razaoSocial);
  }

  async getUserCreditRequests(userId: number): Promise<any[]> {
    const userCompanies = await this.getUserCompanies(userId);
    const companyIds = userCompanies.map(c => c.id);
    
    if (companyIds.length === 0) return [];

    return await db
      .select({
        id: creditRequests.id,
        companyId: creditRequests.companyId,
        valorSolicitado: creditRequests.valorSolicitado,
        prazoMeses: creditRequests.prazoMeses,
        finalidade: creditRequests.finalidade,
        documentos: creditRequests.documentos,
        observacoesAnalise: creditRequests.observacoesAnalise,
        status: creditRequests.status,
        createdAt: creditRequests.createdAt,
        updatedAt: creditRequests.updatedAt,
        companyRazaoSocial: companies.razaoSocial,
      })
      .from(creditRequests)
      .leftJoin(companies, eq(creditRequests.companyId, companies.id))
      .where(or(...companyIds.map(id => eq(creditRequests.companyId, id))))
      .orderBy(desc(creditRequests.createdAt));
  }

  // Timer and analysis methods
  async checkAndReturnExpiredRequests(): Promise<void> {
    const now = new Date();
    
    // Find requests that are past their 24-hour limit
    const expiredRequests = await db
      .select()
      .from(creditRequests)
      .where(
        and(
          eq(creditRequests.status, 'em_analise'),
          lt(creditRequests.dataLimiteAnalise, now)
        )
      );

    // Return expired requests to the network
    for (const request of expiredRequests) {
      await db
        .update(creditRequests)
        .set({
          status: 'na_rede',
          dataAceite: null,
          dataLimiteAnalise: null,
          updatedAt: new Date()
        })
        .where(eq(creditRequests.id, request.id));
    }
  }

  async getCreditRequestsByInvestor(investorId: number, status: string): Promise<any[]> {
    console.log(`Buscando solicitações para investidor ${investorId} com status ${status}`);
    
    const result = await db
      .select({
        id: creditRequests.id,
        valorSolicitado: creditRequests.valorSolicitado,
        prazoMeses: creditRequests.prazoMeses,
        finalidade: creditRequests.finalidade,
        documentos: creditRequests.documentos,
        status: creditRequests.status,
        dataAceite: creditRequests.dataAceite,
        dataLimiteAnalise: creditRequests.dataLimiteAnalise,
        observacoesAnalise: creditRequests.observacoesAnalise,
        createdAt: creditRequests.createdAt,
        updatedAt: creditRequests.updatedAt,
        companyId: companies.id,
        companyRazaoSocial: companies.razaoSocial,
        companyCnpj: companies.cnpj,
        companyStatus: companies.status,
      })
      .from(creditRequests)
      .leftJoin(companies, eq(creditRequests.companyId, companies.id))
      .where(eq(creditRequests.status, status))
      .orderBy(desc(creditRequests.createdAt));
    
    console.log(`Encontradas ${result.length} solicitações`);
    return result;
  }

  // NOVO: Admin investor management methods - sistema unificado
  async getInvestors(status?: string): Promise<any[]> {
    // Get investors from the unified users table
    let userInvestors = await db
      .select({
        id: users.id,
        email: users.email,
        nomeCompleto: users.nomeCompleto,
        cpf: users.cpf,
        rg: users.rg,
        telefone: users.telefone,
        limiteInvestimento: users.limiteInvestimento,
        cadastroAprovado: users.investorApproved, // Nova coluna
        emailConfirmado: users.emailConfirmado,
        documentosVerificados: users.documentosVerificados,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        source: sql<string>`'users'`.as('source'),
        status: sql<string>`CASE 
          WHEN ${users.investorApproved} = true THEN 'ativo'
          ELSE 'pendente'
        END`.as('status')
      })
      .from(users)
      .where(sql`'investor' = ANY(${users.userTypes})`) // Novo sistema de tipos
      .orderBy(desc(users.createdAt));

    // Get investors from the investors table (approved and active)
    const investorTableResults = await db
      .select({
        id: investors.id,
        email: investors.email,
        nomeCompleto: investors.nomeCompleto,
        cpf: investors.cpf,
        rg: investors.rg,
        telefone: sql<string>`NULL`.as('telefone'),
        limiteInvestimento: investors.limiteInvestimento,
        cadastroAprovado: investors.cadastroAprovado,
        emailConfirmado: investors.emailConfirmado,
        documentosVerificados: investors.documentosVerificados,
        createdAt: investors.createdAt,
        updatedAt: investors.updatedAt,
        source: sql<string>`'investors'`.as('source'),
        status: investors.status
      })
      .from(investors)
      .orderBy(desc(investors.createdAt));

    // Combine results and remove duplicates based on email
    // Priority: investors table over users table (more complete data)
    const allInvestors = [...investorTableResults, ...userInvestors];
    const uniqueInvestors = allInvestors.filter((investor, index, array) => 
      array.findIndex(i => i.email === investor.email) === index
    );

    // Filter by status if provided
    if (status && status !== 'all') {
      return uniqueInvestors.filter(investor => investor.status === status);
    }

    return uniqueInvestors;
  }

  async approveInvestor(investorId: number): Promise<Investor | undefined> {
    const [updatedInvestor] = await db
      .update(investors)
      .set({
        status: 'ativo',
        updatedAt: new Date(),
      })
      .where(eq(investors.id, investorId))
      .returning();

    return updatedInvestor;
  }

  async rejectInvestor(investorId: number, reason: string): Promise<Investor | undefined> {
    const [updatedInvestor] = await db
      .update(investors)
      .set({
        status: 'rejeitado',
        updatedAt: new Date(),
      })
      .where(eq(investors.id, investorId))
      .returning();

    return updatedInvestor;
  }

  // Admin entrepreneur management methods
  async getEntrepreneurs(status?: string): Promise<any[]> {
    // Get entrepreneurs from the entrepreneurs table
    const entrepreneurResults = await db
      .select({
        id: entrepreneurs.id,
        email: entrepreneurs.email,
        nomeCompleto: entrepreneurs.nomeCompleto,
        cpf: entrepreneurs.cpf,
        rg: entrepreneurs.rg,
        telefone: entrepreneurs.telefone,
        rua: entrepreneurs.rua,
        numero: entrepreneurs.numero,
        complemento: entrepreneurs.complemento,
        bairro: entrepreneurs.bairro,
        cidade: entrepreneurs.cidade,
        estado: entrepreneurs.estado,
        cep: entrepreneurs.cep,
        cadastroAprovado: entrepreneurs.cadastroAprovado,
        emailConfirmado: entrepreneurs.emailConfirmado,
        documentosVerificados: entrepreneurs.documentosVerificados,
        createdAt: entrepreneurs.createdAt,
        updatedAt: entrepreneurs.updatedAt,
        status: entrepreneurs.status
      })
      .from(entrepreneurs)
      .orderBy(desc(entrepreneurs.createdAt));

    // Filter by status if provided
    if (status && status !== 'all') {
      return entrepreneurResults.filter(entrepreneur => entrepreneur.status === status);
    }

    return entrepreneurResults;
  }



  async approveEntrepreneur(entrepreneurId: number): Promise<Entrepreneur | undefined> {
    const [updatedEntrepreneur] = await db
      .update(entrepreneurs)
      .set({
        status: 'ativo',
        cadastroAprovado: true,
        updatedAt: new Date(),
      })
      .where(eq(entrepreneurs.id, entrepreneurId))
      .returning();

    return updatedEntrepreneur;
  }

  async rejectEntrepreneur(entrepreneurId: number, reason: string): Promise<Entrepreneur | undefined> {
    const [updatedEntrepreneur] = await db
      .update(entrepreneurs)
      .set({
        status: 'rejeitado',
        updatedAt: new Date(),
      })
      .where(eq(entrepreneurs.id, entrepreneurId))
      .returning();

    return updatedEntrepreneur;
  }

  // Admin network methods
  async getNetworkRequests(status?: string): Promise<any[]> {
    const result = await db
      .select({
        id: creditRequests.id,
        valorSolicitado: creditRequests.valorSolicitado,
        prazoMeses: creditRequests.prazoMeses,
        finalidade: creditRequests.finalidade,
        status: creditRequests.status,
        createdAt: creditRequests.createdAt,
        dataAceite: creditRequests.dataAceite,
        dataLimiteAnalise: creditRequests.dataLimiteAnalise,
        observacoesAnalise: creditRequests.observacoesAnalise,
        companyRazaoSocial: companies.razaoSocial,
        companyCnpj: companies.cnpj,
        companyStatus: companies.status,
        companyId: companies.id,
        // Removido investorId - campo não existe mais
      })
      .from(creditRequests)
      .leftJoin(companies, eq(creditRequests.companyId, companies.id))
      .orderBy(desc(creditRequests.createdAt));

    // Get investor information for each request
    const enrichedResults = await Promise.all(
      result.map(async (request) => {
        let investorName = null;
        let investorEmail = null;
        
        if (request.investorId) {
          const investors = await this.getInvestors();
          const investor = investors.find(inv => inv.id === request.investorId);
          if (investor) {
            investorName = investor.nomeCompleto;
            investorEmail = investor.email;
          }
        }

        return {
          ...request,
          investorName,
          investorEmail,
        };
      })
    );

    // Filter by status if provided
    if (status && status !== 'all') {
      return enrichedResults.filter(request => request.status === status);
    }

    return enrichedResults;
  }

  async getNetworkStats(): Promise<any> {
    const stats = await db
      .select({
        status: creditRequests.status,
        count: sql<number>`COUNT(*)::int`,
        totalValue: sql<number>`SUM(${creditRequests.valorSolicitado})::int`,
      })
      .from(creditRequests)
      .groupBy(creditRequests.status);

    const result = {
      totalInNetwork: 0,
      inAnalysis: 0,
      approved: 0,
      rejected: 0,
      totalValue: 0,
    };

    stats.forEach((stat) => {
      switch (stat.status) {
        case 'na_rede':
          result.totalInNetwork = stat.count;
          break;
        case 'em_analise':
          result.inAnalysis = stat.count;
          break;
        case 'aprovada':
          result.approved = stat.count;
          break;
        case 'reprovada':
          result.rejected = stat.count;
          break;
      }
      result.totalValue += stat.totalValue || 0;
    });

    return result;
  }

  // Admin user management methods
  async getUsersByTypeAndStatus(tipo?: string, status?: string): Promise<any[]> {
    const conditions = [];
    if (tipo) {
      // NOVO: Sistema unificado - busca por tipo no array
      conditions.push(sql`${tipo} = ANY(${users.userTypes})`);
    }
    if (status) {
      conditions.push(eq(users.status, status));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
    }

    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async approveUser(userId: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        status: 'ativo',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async rejectUser(userId: number, reason: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        status: 'rejeitado',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  // Valuation methods
  async getValuation(id: number): Promise<Valuation | undefined> {
    const valuation = await db
      .select()
      .from(valuations)
      .where(eq(valuations.id, id))
      .limit(1);

    return valuation[0];
  }

  async getCompanyValuations(companyId: number): Promise<Valuation[]> {
    return await db
      .select()
      .from(valuations)
      .where(eq(valuations.companyId, companyId))
      .orderBy(desc(valuations.createdAt));
  }

  async getLatestCompanyValuation(companyId: number): Promise<Valuation | undefined> {
    const valuation = await db
      .select()
      .from(valuations)
      .where(and(
        eq(valuations.companyId, companyId),
        eq(valuations.status, 'completed')
      ))
      .orderBy(desc(valuations.createdAt))
      .limit(1);

    return valuation[0];
  }

  async createValuation(insertValuation: InsertValuation): Promise<Valuation> {
    const [valuation] = await db
      .insert(valuations)
      .values(insertValuation)
      .returning();

    return valuation;
  }

  async updateValuation(id: number, updateData: Partial<InsertValuation>): Promise<Valuation | undefined> {
    const [updatedValuation] = await db
      .update(valuations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(valuations.id, id))
      .returning();

    return updatedValuation;
  }

  async deleteValuation(id: number): Promise<void> {
    await db.delete(valuations).where(eq(valuations.id, id));
  }

  async getUserValuations(userId: number): Promise<any[]> {
    return await db
      .select({
        id: valuations.id,
        companyId: valuations.companyId,
        method: valuations.method,
        status: valuations.status,
        enterpriseValue: valuations.enterpriseValue,
        equityValue: valuations.equityValue,
        createdAt: valuations.createdAt,
        updatedAt: valuations.updatedAt,
        companyName: companies.razaoSocial,
        companyFantasyName: companies.nomeFantasia,
      })
      .from(valuations)
      .leftJoin(companies, eq(valuations.companyId, companies.id))
      .where(eq(valuations.userId, userId))
      .orderBy(desc(valuations.createdAt));
  }

  // Platform notification methods
  async createPlatformNotification(notificationData: InsertPlatformNotification): Promise<PlatformNotification> {
    const [notification] = await db.insert(platformNotifications).values(notificationData).returning();
    return notification;
  }

  async getPlatformNotifications(filters?: { tipoUsuario?: string; ativa?: boolean }): Promise<any[]> {
    const conditions = [];
    
    if (filters?.tipoUsuario) {
      conditions.push(eq(platformNotifications.tipoUsuario, filters.tipoUsuario));
    }
    
    if (filters?.ativa !== undefined) {
      conditions.push(eq(platformNotifications.ativa, filters.ativa));
    }

    const query = db
      .select({
        id: platformNotifications.id,
        titulo: platformNotifications.titulo,
        conteudo: platformNotifications.conteudo,
        tipoUsuario: platformNotifications.tipoUsuario,
        usuarioEspecificoId: platformNotifications.usuarioEspecificoId,
        tipoUsuarioEspecifico: platformNotifications.tipoUsuarioEspecifico,
        criadoPor: platformNotifications.criadoPor,
        ativa: platformNotifications.ativa,
        createdAt: platformNotifications.createdAt,
        updatedAt: platformNotifications.updatedAt,
        adminName: adminUsers.nome,
      })
      .from(platformNotifications)
      .leftJoin(adminUsers, eq(platformNotifications.criadoPor, adminUsers.id))
      .where(conditions.length > 0 ? and(...conditions) : sql`1=1`);

    return await query.orderBy(desc(platformNotifications.createdAt));
  }

  async updatePlatformNotification(id: number, updateData: Partial<InsertPlatformNotification>): Promise<PlatformNotification | undefined> {
    const [notification] = await db
      .update(platformNotifications)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(platformNotifications.id, id))
      .returning();
    
    return notification || undefined;
  }

  async deletePlatformNotification(id: number): Promise<void> {
    await db.delete(platformNotifications).where(eq(platformNotifications.id, id));
  }

  async getUserNotifications(userId: number, userType: string): Promise<any[]> {
    // Get notifications that apply to this user
    const notifications = await db
      .select({
        id: platformNotifications.id,
        titulo: platformNotifications.titulo,
        conteudo: platformNotifications.conteudo,
        tipoUsuario: platformNotifications.tipoUsuario,
        usuarioEspecificoId: platformNotifications.usuarioEspecificoId,
        tipoUsuarioEspecifico: platformNotifications.tipoUsuarioEspecifico,
        ativa: platformNotifications.ativa,
        createdAt: platformNotifications.createdAt,
        readAt: notificationReads.readAt,
      })
      .from(platformNotifications)
      .leftJoin(
        notificationReads,
        and(
          eq(notificationReads.notificationId, platformNotifications.id),
          eq(notificationReads.userId, userId),
          eq(notificationReads.userType, userType)
        )
      )
      .where(
        and(
          eq(platformNotifications.ativa, true),
          or(
            // General notifications for user type
            and(
              or(
                eq(platformNotifications.tipoUsuario, userType),
                eq(platformNotifications.tipoUsuario, 'both')
              ),
              sql`${platformNotifications.usuarioEspecificoId} IS NULL`
            ),
            // Specific notifications for this user
            and(
              eq(platformNotifications.usuarioEspecificoId, userId),
              eq(platformNotifications.tipoUsuarioEspecifico, userType)
            )
          )
        )
      )
      .orderBy(desc(platformNotifications.createdAt));

    return notifications;
  }

  async markNotificationAsRead(notificationId: number, userId: number, userType: string): Promise<void> {
    // Check if already read
    const [existing] = await db
      .select()
      .from(notificationReads)
      .where(
        and(
          eq(notificationReads.notificationId, notificationId),
          eq(notificationReads.userId, userId),
          eq(notificationReads.userType, userType)
        )
      );

    if (!existing) {
      await db.insert(notificationReads).values({
        notificationId,
        userId,
        userType,
      });
    }
  }

  async getUnreadNotificationsCount(userId: number, userType: string): Promise<number> {
    const notifications = await this.getUserNotifications(userId, userType);
    return notifications.filter(n => !n.readAt).length;
  }

  // Network/Location methods  
  async getStates(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM states ORDER BY name`);
    return result.rows;
  }

  async getCitiesByState(stateId: number): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM cities WHERE state_id = ${stateId} ORDER BY name`);
    return result.rows;
  }

  async getNetworkCompanies(filters?: { stateId?: number; cityId?: number; search?: string; excludeUserId?: number }): Promise<any[]> {
    let whereConditions = [eq(companies.status, 'aprovada')];

    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(companies.razaoSocial, `%${filters.search}%`),
          ilike(companies.nomeFantasia, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.excludeUserId) {
      whereConditions.push(ne(companies.userId, filters.excludeUserId));
    }

    const result = await db
      .select({
        id: companies.id,
        razaoSocial: companies.razaoSocial,
        nomeFantasia: companies.nomeFantasia,
        cnpj: companies.cnpj,
        cidade: companies.cidade,
        estado: companies.estado,
        cnaePrincipal: companies.cnaePrincipal,
        faturamento: companies.faturamento,
        dataFundacao: companies.dataFundacao,
        descricaoNegocio: companies.descricaoNegocio,
        images: companies.images,
        userId: companies.userId,
        ownerType: companies.ownerType
      })
      .from(companies)
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(companies.razaoSocial);

    return result;
  }

  // Network posts methods
  async createNetworkPost(postData: any): Promise<any> {
    const [post] = await db
      .insert(networkPosts)
      .values(postData)
      .returning();
    return post;
  }

  async getNetworkPosts(companyId: number): Promise<any[]> {
    const posts = await db
      .select({
        id: networkPosts.id,
        content: networkPosts.content,
        imageUrl: networkPosts.imageUrl,
        userId: networkPosts.userId,
        userType: networkPosts.userType,
        createdAt: networkPosts.createdAt,
        companyId: networkPosts.companyId,
      })
      .from(networkPosts)
      .where(eq(networkPosts.companyId, companyId))
      .orderBy(desc(networkPosts.createdAt));

    // Get likes and comments count for each post
    for (const post of posts) {
      const [likesResult] = await db
        .select({ count: count() })
        .from(networkLikes)
        .where(eq(networkLikes.postId, post.id));

      const [commentsResult] = await db
        .select({ count: count() })
        .from(networkComments)
        .where(eq(networkComments.postId, post.id));

      const comments = await db
        .select({
          id: networkComments.id,
          content: networkComments.content,
          userId: networkComments.userId,
          userType: networkComments.userType,
          createdAt: networkComments.createdAt,
        })
        .from(networkComments)
        .where(eq(networkComments.postId, post.id))
        .orderBy(networkComments.createdAt);

      (post as any).likesCount = likesResult.count || 0;
      (post as any).commentsCount = commentsResult.count || 0;
      (post as any).comments = comments;
    }

    return posts;
  }

  async likeNetworkPost(postId: number, userId: number, userType: string): Promise<void> {
    // Check if already liked
    const existingLike = await db
      .select()
      .from(networkLikes)
      .where(and(
        eq(networkLikes.postId, postId),
        eq(networkLikes.userId, userId),
        eq(networkLikes.userType, userType)
      ));

    if (existingLike.length === 0) {
      await db.insert(networkLikes).values({
        postId,
        userId,
        userType,
      });
    }
  }

  async unlikeNetworkPost(postId: number, userId: number, userType: string): Promise<void> {
    await db
      .delete(networkLikes)
      .where(and(
        eq(networkLikes.postId, postId),
        eq(networkLikes.userId, userId),
        eq(networkLikes.userType, userType)
      ));
  }

  // Network comments methods
  async createNetworkComment(commentData: any): Promise<any> {
    const [comment] = await db
      .insert(networkComments)
      .values(commentData)
      .returning();
    return comment;
  }

  async getNetworkComments(postId: number): Promise<any[]> {
    return await db
      .select()
      .from(networkComments)
      .where(eq(networkComments.postId, postId))
      .orderBy(networkComments.createdAt);
  }

  async flagNetworkComment(commentId: number, reason: string, moderatedBy: number): Promise<void> {
    await db
      .update(networkComments)
      .set({
        flagged: true,
        flaggedReason: reason,
        moderatedBy,
      })
      .where(eq(networkComments.id, commentId));
  }

  // Company images methods
  async createCompanyImage(imageData: any): Promise<any> {
    const [image] = await db
      .insert(companyImages)
      .values(imageData)
      .returning();
    return image;
  }

  async getCompanyImages(companyId: number): Promise<any[]> {
    return await db
      .select()
      .from(companyImages)
      .where(eq(companyImages.companyId, companyId))
      .orderBy(desc(companyImages.createdAt));
  }

  // Password reset methods
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db
      .insert(passwordResetTokens)
      .values(tokenData)
      .returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    return resetToken;
  }

  async usePasswordResetToken(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async updateUserPassword(email: string, userType: string, hashedPassword: string): Promise<void> {
    if (userType === 'entrepreneur') {
      await db
        .update(entrepreneurs)
        .set({ senha: hashedPassword })
        .where(eq(entrepreneurs.email, email));
    } else if (userType === 'investor') {
      await db
        .update(investors)
        .set({ senha: hashedPassword })
        .where(eq(investors.email, email));
    } else if (userType === 'admin') {
      await db
        .update(adminUsers)
        .set({ senha: hashedPassword })
        .where(eq(adminUsers.email, email));
    } else {
      // Legacy users table
      await db
        .update(users)
        .set({ senha: hashedPassword })
        .where(eq(users.email, email));
    }
  }

  // Email confirmation methods
  async createEmailConfirmationToken(tokenData: InsertEmailConfirmationToken): Promise<EmailConfirmationToken> {
    const [token] = await db
      .insert(emailConfirmationTokens)
      .values(tokenData)
      .returning();
    return token;
  }

  async getEmailConfirmationToken(token: string): Promise<EmailConfirmationToken | undefined> {
    const [confirmationToken] = await db
      .select()
      .from(emailConfirmationTokens)
      .where(and(
        eq(emailConfirmationTokens.token, token),
        isNull(emailConfirmationTokens.usedAt),
        gte(emailConfirmationTokens.expiresAt, new Date())
      ))
      .limit(1);
    return confirmationToken;
  }

  async useEmailConfirmationToken(token: string): Promise<void> {
    await db
      .update(emailConfirmationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailConfirmationTokens.token, token));
  }

  async deleteEmailConfirmationToken(id: number): Promise<void> {
    await db
      .delete(emailConfirmationTokens)
      .where(eq(emailConfirmationTokens.id, id));
  }

  async deleteEmailConfirmationTokensByEmail(email: string): Promise<void> {
    await db
      .delete(emailConfirmationTokens)
      .where(eq(emailConfirmationTokens.email, email));
  }

  async confirmUserEmail(email: string, userType: string): Promise<void> {
    if (userType === 'entrepreneur') {
      await db
        .update(entrepreneurs)
        .set({ emailConfirmado: true })
        .where(eq(entrepreneurs.email, email));
    } else if (userType === 'investor') {
      await db
        .update(investors)
        .set({ emailConfirmado: true })
        .where(eq(investors.email, email));
    } else {
      // Legacy users table
      await db
        .update(users)
        .set({ emailConfirmado: true })
        .where(eq(users.email, email));
    }
  }

  // Pending profile changes methods
  async createPendingProfileChange(changeData: InsertPendingProfileChange): Promise<PendingProfileChange> {
    const [change] = await db
      .insert(pendingProfileChanges)
      .values(changeData)
      .returning();
    return change;
  }

  async getPendingProfileChanges(userType?: string, status?: string): Promise<PendingProfileChange[]> {
    let query = db.select().from(pendingProfileChanges);
    
    const conditions = [];
    if (userType) {
      conditions.push(eq(pendingProfileChanges.userType, userType));
    }
    if (status) {
      conditions.push(eq(pendingProfileChanges.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(pendingProfileChanges.requestedAt));
  }

  async getPendingProfileChangeByUser(userId: number, userType: string): Promise<PendingProfileChange | undefined> {
    const [change] = await db
      .select()
      .from(pendingProfileChanges)
      .where(and(
        eq(pendingProfileChanges.userId, userId),
        eq(pendingProfileChanges.userType, userType),
        eq(pendingProfileChanges.status, 'pending')
      ))
      .limit(1);
    return change;
  }

  async reviewPendingProfileChange(id: number, approved: boolean, reviewedBy: number, comment?: string): Promise<PendingProfileChange | undefined> {
    try {
      const [change] = await db
        .update(pendingProfileChanges)
        .set({
          status: approved ? 'approved' : 'rejected',
          reviewedAt: new Date(),
          reviewedBy,
          reviewComment: comment
        })
        .where(eq(pendingProfileChanges.id, id))
        .returning();
      
      // If approved, apply the changes to the actual user profile
      if (approved && change && change.changedFields) {
        console.log('Applying changes for user type:', change.userType);
        console.log('Changed fields:', change.changedFields);
        
        const fieldsToUpdate = change.changedFields as Record<string, any>;
        
        if (change.userType === 'entrepreneur') {
          const updateData: Partial<Entrepreneur> = {};
          
          // Only include valid entrepreneur fields
          const validFields = ['nomeCompleto', 'email', 'cpf', 'rg', 'telefone', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'dataNascimento', 'profissao', 'rendaMensal'];
          
          for (const [key, value] of Object.entries(fieldsToUpdate)) {
            if (validFields.includes(key)) {
              (updateData as any)[key] = value;
            }
          }
          
          if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = new Date();
            
            await db
              .update(entrepreneurs)
              .set(updateData)
              .where(eq(entrepreneurs.id, change.userId));
              
            console.log('Entrepreneur updated successfully');
          }
        } else if (change.userType === 'investor') {
          const updateData: Partial<Investor> = {};
          
          // Only include valid investor fields
          const validFields = ['nomeCompleto', 'email', 'cpf', 'rg', 'telefone', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'dataNascimento', 'profissao', 'rendaMensal', 'patrimonioLiquido', 'rendaAnual', 'objetivosInvestimento'];
          
          for (const [key, value] of Object.entries(fieldsToUpdate)) {
            if (validFields.includes(key)) {
              (updateData as any)[key] = value;
            }
          }
          
          if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = new Date();
            
            await db
              .update(investors)
              .set(updateData)
              .where(eq(investors.id, change.userId));
              
            console.log('Investor updated successfully');
          }
        }
      }
      
      return change;
    } catch (error) {
      console.error('Error in reviewPendingProfileChange:', error);
      throw error;
    }
  }

  async deletePendingProfileChange(id: number): Promise<void> {
    await db
      .delete(pendingProfileChanges)
      .where(eq(pendingProfileChanges.id, id));
  }
}

export const storage = new DatabaseStorage();

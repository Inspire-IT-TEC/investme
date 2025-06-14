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
  valuations,
  type Valuation,
  type InsertValuation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, ilike, sql, or, lt, ne } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByCpf(cpf: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Entrepreneur methods
  getEntrepreneur(id: number): Promise<Entrepreneur | undefined>;
  getEntrepreneurByEmail(email: string): Promise<Entrepreneur | undefined>;
  getEntrepreneurByCpf(cpf: string): Promise<Entrepreneur | undefined>;
  createEntrepreneur(entrepreneur: InsertEntrepreneur): Promise<Entrepreneur>;
  updateEntrepreneurApproval(id: number, field: 'cadastroAprovado' | 'emailConfirmado' | 'documentosVerificados', approved: boolean, adminId: number): Promise<Entrepreneur | undefined>;

  // Investor methods
  getInvestor(id: number): Promise<Investor | undefined>;
  getInvestorByEmail(email: string): Promise<Investor | undefined>;
  getInvestorByCpf(cpf: string): Promise<Investor | undefined>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
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
}

export class DatabaseStorage implements IStorage {
  // User methods
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
    const [investor] = await db.insert(investors).values(insertInvestor).returning();
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

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(userId?: number, status?: string, search?: string): Promise<Company[]> {
    const conditions = [];
    if (userId) {
      // Support both old userId and new entrepreneurId structure
      conditions.push(
        or(
          eq(companies.userId, userId),
          eq(companies.entrepreneurId, userId)
        )
      );
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
      .where(
        or(
          eq(companies.userId, userId),
          eq(companies.entrepreneurId, userId)
        )
      )
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
        investorId: creditRequests.investorId,
        // Include approving investor company name if available
        approvingCompanyName: sql<string>`CASE 
          WHEN ${creditRequests.investorId} IS NOT NULL THEN 
            (SELECT c.razao_social FROM companies c WHERE c.investor_id = ${creditRequests.investorId} LIMIT 1)
          ELSE NULL 
        END`.as('approvingCompanyName')
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
        status: creditRequests.status,
        createdAt: creditRequests.createdAt,
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
          investorId: null,
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
      .where(
        and(
          eq(creditRequests.investorId, investorId),
          eq(creditRequests.status, status)
        )
      )
      .orderBy(desc(creditRequests.createdAt));
    
    console.log(`Encontradas ${result.length} solicitações`);
    return result;
  }

  // Admin investor management methods
  async getInvestors(status?: string): Promise<any[]> {
    // Get investors from the users table (newly registered)
    let userInvestors = await db
      .select({
        id: users.id,
        email: users.email,
        nomeCompleto: users.nomeCompleto,
        cpf: users.cpf,
        rg: users.rg,
        cadastroAprovado: users.cadastroAprovado,
        emailConfirmado: users.emailConfirmado,
        documentosVerificados: users.documentosVerificados,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        source: sql<string>`'users'`.as('source'),
        status: sql<string>`CASE 
          WHEN ${users.cadastroAprovado} = true THEN 'ativo'
          ELSE 'pendente'
        END`.as('status')
      })
      .from(users)
      .where(eq(users.tipo, 'investor'))
      .orderBy(desc(users.createdAt));

    // Get investors from the investors table (approved and active)
    const investorTableResults = await db
      .select({
        id: investors.id,
        email: investors.email,
        nomeCompleto: investors.nomeCompleto,
        cpf: investors.cpf,
        rg: investors.rg,
        cadastroAprovado: sql<boolean>`true`.as('cadastroAprovado'),
        emailConfirmado: sql<boolean>`true`.as('emailConfirmado'),
        documentosVerificados: sql<boolean>`true`.as('documentosVerificados'),
        createdAt: investors.createdAt,
        updatedAt: investors.updatedAt,
        source: sql<string>`'investors'`.as('source'),
        status: investors.status
      })
      .from(investors)
      .orderBy(desc(investors.createdAt));

    // Combine results
    const allInvestors = [...userInvestors, ...investorTableResults];

    // Filter by status if provided
    if (status && status !== 'all') {
      return allInvestors.filter(investor => investor.status === status);
    }

    return allInvestors;
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
        investorId: creditRequests.investorId,
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
          const investor = await this.getInvestor(request.investorId);
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
    let query = db.select().from(users);
    
    const conditions = [];
    if (tipo) {
      conditions.push(eq(users.tipo, tipo));
    }
    if (status) {
      conditions.push(eq(users.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(users.createdAt));
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
}

export const storage = new DatabaseStorage();

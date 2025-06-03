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
  type InsertMessage
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

  // Investor methods
  getInvestor(id: number): Promise<Investor | undefined>;
  getInvestorByEmail(email: string): Promise<Investor | undefined>;
  getInvestorByCpf(cpf: string): Promise<Investor | undefined>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;

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

  // Admin network methods
  getNetworkRequests(status?: string): Promise<any[]>;
  getNetworkStats(): Promise<any>;
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

  async getCompanyCreditRequests(companyId: number): Promise<CreditRequest[]> {
    return await db
      .select()
      .from(creditRequests)
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
    let query = db
      .select({
        id: investors.id,
        nomeCompleto: investors.nomeCompleto,
        email: investors.email,
        cpf: investors.cpf,
        telefone: investors.telefone,
        dataNascimento: investors.dataNascimento,
        endereco: investors.endereco,
        status: investors.status,
        createdAt: investors.createdAt,
        updatedAt: investors.updatedAt,
      })
      .from(investors);

    if (status && status !== 'all') {
      query = query.where(eq(investors.status, status));
    }

    return await query.orderBy(desc(investors.createdAt));
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
        observacoes: reason,
        updatedAt: new Date(),
      })
      .where(eq(investors.id, investorId))
      .returning();

    return updatedInvestor;
  }

  // Admin network methods
  async getNetworkRequests(status?: string): Promise<any[]> {
    let query = db
      .select({
        id: creditRequests.id,
        valorSolicitado: creditRequests.valorSolicitado,
        prazoMeses: creditRequests.prazoMeses,
        finalidade: creditRequests.finalidade,
        taxaJuros: creditRequests.taxaJuros,
        status: creditRequests.status,
        createdAt: creditRequests.createdAt,
        dataAceite: creditRequests.dataAceite,
        dataLimiteAnalise: creditRequests.dataLimiteAnalise,
        dataAprovacao: creditRequests.dataAprovacao,
        dataReprovacao: creditRequests.dataReprovacao,
        observacoesAnalise: creditRequests.observacoesAnalise,
        companyRazaoSocial: companies.razaoSocial,
        companyCnpj: companies.cnpj,
        companyStatus: companies.status,
        companyId: companies.id,
        investorName: investors.nomeCompleto,
        investorEmail: investors.email,
      })
      .from(creditRequests)
      .leftJoin(companies, eq(creditRequests.companyId, companies.id))
      .leftJoin(investors, eq(creditRequests.investorId, investors.id));

    if (status && status !== 'all') {
      query = query.where(eq(creditRequests.status, status));
    }

    return await query.orderBy(desc(creditRequests.createdAt));
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
}

export const storage = new DatabaseStorage();

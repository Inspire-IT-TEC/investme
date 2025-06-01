import { 
  users, 
  adminUsers,
  companies, 
  companyShareholders,
  companyGuarantees,
  creditRequests,
  auditLog,
  type User, 
  type InsertUser,
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
  type InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByCpf(cpf: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

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

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(userId?: number, status?: string, search?: string): Promise<Company[]> {
    const conditions = [];
    if (userId) conditions.push(eq(companies.userId, userId));
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
      query = query.where(and(...conditions));
    }

    return await query;
  }
}

export const storage = new DatabaseStorage();

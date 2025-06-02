import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertUserSchema, 
  insertAdminUserSchema,
  insertEntrepreneurSchema,
  insertInvestorSchema,
  insertCompanySchema,
  insertCompanyShareholderSchema,
  insertCompanyGuaranteeSchema,
  insertCreditRequestSchema
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "investme-secret-key";
const SALT_ROUNDS = 10;

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas PDF, JPG ou PNG.'));
    }
  }
});

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Middleware to verify admin token
function authenticateAdminToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    if (user.type !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }
    req.admin = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      const existingCpf = await storage.getUserByCpf(userData.cpf);
      if (existingCpf) {
        return res.status(400).json({ message: 'CPF já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.senha, SALT_ROUNDS);
      userData.senha = hashedPassword;

      const user = await storage.createUser(userData);
      
      const token = jwt.sign(
        { id: user.id, email: user.email, type: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ 
        user: { ...user, senha: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar usuário' });
    }
  });

  // Investor Registration Route
  app.post('/api/investors/register', async (req, res) => {
    try {
      const investorData = insertUserSchema.parse(req.body);
      
      // Check if user already exists by email or CPF
      const existingByEmail = await storage.getUserByEmail(investorData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      
      const existingByCpf = await storage.getUserByCpf(investorData.cpf);
      if (existingByCpf) {
        return res.status(400).json({ message: 'CPF já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(investorData.senha, SALT_ROUNDS);
      
      const investor = await storage.createUser({
        ...investorData,
        senha: hashedPassword
      });

      res.status(201).json({ 
        message: 'Investidor cadastrado com sucesso! Aguarde aprovação do backoffice.',
        investor: { ...investor, senha: undefined } 
      });
    } catch (error: any) {
      console.error('Error registering investor:', error);
      res.status(400).json({ message: error.message || 'Erro ao cadastrar investidor' });
    }
  });

  // Entrepreneur Registration Route
  app.post('/api/entrepreneurs/register', async (req, res) => {
    try {
      const entrepreneurData = insertUserSchema.parse(req.body);
      
      // Check if user already exists by email or CPF
      const existingByEmail = await storage.getUserByEmail(entrepreneurData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      
      const existingByCpf = await storage.getUserByCpf(entrepreneurData.cpf);
      if (existingByCpf) {
        return res.status(400).json({ message: 'CPF já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(entrepreneurData.senha, SALT_ROUNDS);
      
      const entrepreneur = await storage.createUser({
        ...entrepreneurData,
        senha: hashedPassword
      });

      res.status(201).json({ 
        message: 'Empreendedor cadastrado com sucesso!',
        entrepreneur: { ...entrepreneur, senha: undefined } 
      });
    } catch (error: any) {
      console.error('Error registering entrepreneur:', error);
      res.status(400).json({ message: error.message || 'Erro ao cadastrar empreendedor' });
    }
  });

  // Investor Login Route
  app.post('/api/investors/login', async (req, res) => {
    try {
      const { login, senha } = req.body; // login can be email or CPF
      
      console.log('Tentativa de login investidor:', { login, senhaLength: senha?.length });
      
      let user = await storage.getUserByEmail(login);
      console.log('Busca por email:', { found: !!user, email: login });
      
      if (!user) {
        user = await storage.getUserByCpf(login);
        console.log('Busca por CPF:', { found: !!user, cpf: login });
      }

      if (!user) {
        console.log('Usuário não encontrado');
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      console.log('Usuário encontrado:', { id: user.id, email: user.email, cpf: user.cpf });

      const isValidPassword = await bcrypt.compare(senha, user.senha);
      console.log('Verificação de senha:', { isValid: isValidPassword });
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, type: 'investor' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        user: { ...user, senha: undefined }, 
        token 
      });
    } catch (error: any) {
      console.error('Erro no login do investidor:', error);
      res.status(400).json({ message: error.message || 'Erro no login do investidor' });
    }
  });

  // Entrepreneur Login Route
  app.post('/api/entrepreneurs/login', async (req, res) => {
    try {
      const { login, senha } = req.body; // login can be email or CPF
      
      let user = await storage.getUserByEmail(login);
      if (!user) {
        user = await storage.getUserByCpf(login);
      }

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, type: 'entrepreneur' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        user: { ...user, senha: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro no login do empreendedor' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { login, senha } = req.body; // login can be email or CPF
      
      let user = await storage.getUserByEmail(login);
      if (!user) {
        user = await storage.getUserByCpf(login);
      }

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, type: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        user: { ...user, senha: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro no login' });
    }
  });

  // Admin Authentication Routes
  app.post('/api/admin/auth/login', async (req, res) => {
    try {
      const { email, senha } = req.body;
      
      const adminUser = await storage.getAdminUserByEmail(email);
      if (!adminUser) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(senha, adminUser.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: adminUser.id, email: adminUser.email, type: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        user: { ...adminUser, senha: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro no login' });
    }
  });

  // User Profile Routes
  app.get('/api/user/profile', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json({ ...user, senha: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro interno do servidor' });
    }
  });

  // Company Routes
  app.get('/api/companies', authenticateToken, async (req: any, res) => {
    try {
      const companies = await storage.getUserCompanies(req.user.id);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresas' });
    }
  });

  app.get('/api/companies/:id', authenticateToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompanyWithDetails(companyId);
      
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      // Verify ownership
      if (company.userId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresa' });
    }
  });

  app.post('/api/companies', authenticateToken, async (req: any, res) => {
    try {
      const companyData = insertCompanySchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const company = await storage.createCompany(companyData);

      // Create shareholders
      if (req.body.shareholders && Array.isArray(req.body.shareholders)) {
        for (const shareholder of req.body.shareholders) {
          await storage.createCompanyShareholder({
            ...shareholder,
            companyId: company.id
          });
        }
      }

      // Create guarantees
      if (req.body.guarantees && Array.isArray(req.body.guarantees)) {
        for (const guarantee of req.body.guarantees) {
          await storage.createCompanyGuarantee({
            ...guarantee,
            companyId: company.id
          });
        }
      }

      const fullCompany = await storage.getCompanyWithDetails(company.id);
      res.status(201).json(fullCompany);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar empresa' });
    }
  });

  // Credit Request Routes
  app.get('/api/credit-requests', authenticateToken, async (req: any, res) => {
    try {
      const userCompanies = await storage.getUserCompanies(req.user.id);
      const companyIds = userCompanies.map(c => c.id);
      
      const allRequests = [];
      for (const companyId of companyIds) {
        const requests = await storage.getCompanyCreditRequests(companyId);
        allRequests.push(...requests);
      }

      res.json(allRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitações' });
    }
  });

  app.post('/api/credit-requests', authenticateToken, upload.array('documentos', 10), async (req: any, res) => {
    try {
      const creditRequestData = insertCreditRequestSchema.parse(req.body);
      
      // Verify company ownership
      const company = await storage.getCompany(creditRequestData.companyId);
      if (!company || company.userId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Verify company is approved
      if (company.status !== 'aprovada') {
        return res.status(400).json({ message: 'Empresa deve estar aprovada para solicitar crédito' });
      }

      // Handle uploaded files
      const documentos = req.files ? req.files.map((file: any) => `/uploads/${file.filename}`) : [];
      creditRequestData.documentos = documentos;

      const creditRequest = await storage.createCreditRequest(creditRequestData);
      res.status(201).json(creditRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar solicitação de crédito' });
    }
  });

  // Admin Routes
  app.get('/api/admin/companies', authenticateAdminToken, async (req: any, res) => {
    try {
      const { status, search } = req.query;
      const companies = await storage.getCompanies(undefined, status, search);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresas' });
    }
  });

  app.get('/api/admin/companies/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompanyWithDetails(companyId);
      
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresa' });
    }
  });

  app.patch('/api/admin/companies/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const updateData = req.body;

      const company = await storage.updateCompany(companyId, updateData);
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      res.json(company);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao atualizar empresa' });
    }
  });

  app.get('/api/admin/credit-requests', authenticateAdminToken, async (req: any, res) => {
    try {
      const { status, search } = req.query;
      const creditRequests = await storage.getCreditRequests(status, search);
      res.json(creditRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitações' });
    }
  });

  app.get('/api/admin/credit-requests/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const creditRequest = await storage.getCreditRequest(requestId);
      
      if (!creditRequest) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }

      const company = await storage.getCompanyWithDetails(creditRequest.companyId);
      res.json({ ...creditRequest, company });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitação' });
    }
  });

  app.patch('/api/admin/credit-requests/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const updateData = req.body;

      // Get current credit request for audit
      const currentRequest = await storage.getCreditRequest(requestId);
      if (!currentRequest) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }

      // Add admin info to update data
      if (updateData.status && updateData.status !== currentRequest.status) {
        updateData.analisadoPor = req.user.id;
        updateData.dataAnalise = new Date();
        
        // Add admin name to observations
        const adminName = req.user.nome || req.user.email;
        const timestamp = new Date().toLocaleString('pt-BR');
        if (updateData.observacoesAnalise) {
          updateData.observacoesAnalise = `${updateData.observacoesAnalise}\n\n[Analisado por: ${adminName} em ${timestamp}]`;
        } else {
          updateData.observacoesAnalise = `[Analisado por: ${adminName} em ${timestamp}]`;
        }

        // Create audit log
        await storage.createAuditLog({
          acao: `${updateData.status}_credito`,
          entidadeTipo: 'credit_request',
          entidadeId: requestId,
          valorAnterior: { status: currentRequest.status },
          valorNovo: { status: updateData.status },
          observacoes: updateData.observacoesAnalise,
          adminUserId: req.user.id,
        });
      }

      const creditRequest = await storage.updateCreditRequest(requestId, updateData);
      res.json(creditRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao atualizar solicitação' });
    }
  });

  // Admin users management
  app.get('/api/admin/users', authenticateAdminToken, async (req: any, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      res.json(adminUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar usuários' });
    }
  });

  app.post('/api/admin/users', authenticateAdminToken, async (req: any, res) => {
    try {
      const userData = req.body;
      // Hash password before storing
      const bcrypt = await import('bcrypt');
      userData.senha = await bcrypt.default.hash(userData.senha, 10);
      
      const adminUser = await storage.createAdminUser(userData);
      res.status(201).json(adminUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar usuário' });
    }
  });

  app.patch('/api/admin/users/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const adminUser = await storage.updateAdminUser(userId, updateData);
      if (!adminUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      res.json(adminUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao atualizar usuário' });
    }
  });

  // Audit logs
  app.get('/api/admin/audit', authenticateAdminToken, async (req: any, res) => {
    try {
      const { entidadeTipo, acao } = req.query;
      const auditLogs = await storage.getAuditLogs(entidadeTipo, acao);
      res.json(auditLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar auditoria' });
    }
  });

  // Messages/Chat routes
  app.get('/api/messages/conversations', authenticateToken, async (req: any, res) => {
    try {
      // Get user's companies first
      const userCompanies = await storage.getUserCompanies(req.user.id);
      if (userCompanies.length === 0) {
        return res.json([]);
      }
      
      // Get conversations for all user's companies
      const allConversations = [];
      for (const company of userCompanies) {
        const conversations = await storage.getCompanyConversations(company.id);
        allConversations.push(...conversations);
      }
      
      // Sort by last message date
      allConversations.sort((a, b) => 
        new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
      );
      
      res.json(allConversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar conversas' });
    }
  });

  app.get('/api/admin/messages/conversations', authenticateAdminToken, async (req: any, res) => {
    try {
      const conversations = await storage.getAdminConversations();
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar conversas' });
    }
  });

  app.get('/api/messages/:conversationId', authenticateToken, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar mensagens' });
    }
  });

  app.get('/api/admin/messages/:conversationId', authenticateAdminToken, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar mensagens' });
    }
  });

  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const messageData = {
        ...req.body,
        tipo: 'company',
        remetenteId: req.user.id,
        destinatarioTipo: 'admin',
      };
      
      const message = await storage.createMessage(messageData);
      res.status(201).json({ 
        ...message,
        conversationId: messageData.conversationId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao enviar mensagem' });
    }
  });

  app.post('/api/admin/messages', authenticateAdminToken, async (req: any, res) => {
    try {
      console.log('Admin message request body:', req.body);
      console.log('Admin user:', req.admin);
      
      // If companyId is null, extract it from existing conversation
      let companyId = req.body.companyId;
      if (!companyId && req.body.conversationId) {
        const conversations = await storage.getAdminConversations();
        const existingConv = conversations.find(conv => conv.conversationId === req.body.conversationId);
        companyId = existingConv?.companyId;
      }

      const messageData = {
        conversationId: req.body.conversationId,
        companyId: companyId,
        creditRequestId: req.body.creditRequestId,
        conteudo: req.body.conteudo,
        tipo: 'admin',
        remetenteId: req.admin.id,
        destinatarioTipo: req.body.destinatarioTipo || 'company',
      };
      
      const message = await storage.createMessage(messageData);
      res.status(201).json({ 
        ...message,
        conversationId: messageData.conversationId 
      });
    } catch (error: any) {
      console.error('Error creating admin message:', error);
      res.status(400).json({ message: error.message || 'Erro ao enviar mensagem' });
    }
  });

  app.patch('/api/messages/:conversationId/read', authenticateToken, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      await storage.markConversationAsRead(conversationId, 'company');
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao marcar mensagens como lidas' });
    }
  });

  app.patch('/api/admin/messages/:conversationId/read', authenticateAdminToken, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      await storage.markConversationAsRead(conversationId, 'admin');
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao marcar mensagens como lidas' });
    }
  });

  // Routes for starting new conversations
  app.get('/api/credit-requests/user', authenticateToken, async (req: any, res) => {
    try {
      const creditRequests = await storage.getUserCreditRequests(req.user.id);
      res.json(creditRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitações' });
    }
  });

  app.get('/api/admin/companies/for-chat', authenticateAdminToken, async (req: any, res) => {
    try {
      console.log('Fetching companies for chat...');
      const companies = await storage.getAvailableCompaniesForChat();
      console.log('Companies found:', companies);
      res.json(companies);
    } catch (error: any) {
      console.error('Error in companies/for-chat:', error);
      res.status(500).json({ message: error.message || 'Erro ao buscar empresas' });
    }
  });

  // Dashboard stats for admin
  app.get('/api/admin/stats', authenticateAdminToken, async (req: any, res) => {
    try {
      const allCompanies = await storage.getCompanies();
      const allCreditRequests = await storage.getCreditRequests();

      const stats = {
        totalCompanies: allCompanies.length,
        pendingAnalysis: allCreditRequests.filter(r => r.status === 'pendente').length,
        monthlyApprovals: allCreditRequests.filter(r => {
          const now = new Date();
          const requestDate = new Date(r.createdAt);
          return r.status === 'aprovada' && 
                 requestDate.getMonth() === now.getMonth() && 
                 requestDate.getFullYear() === now.getFullYear();
        }).length,
        monthlyVolume: allCreditRequests
          .filter(r => {
            const now = new Date();
            const requestDate = new Date(r.createdAt);
            return r.status === 'aprovada' && 
                   requestDate.getMonth() === now.getMonth() && 
                   requestDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, r) => sum + parseFloat(r.valorSolicitado || '0'), 0)
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar estatísticas' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}

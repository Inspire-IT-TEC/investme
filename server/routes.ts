import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
  insertCreditRequestSchema,
  insertValuationSchema,
  dcfDataSchema,
  multiplesDataSchema,
  insertPlatformNotificationSchema,
  insertNetworkPostSchema,
  insertNetworkCommentSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema
} from "@shared/schema";
import { emailService } from "./email-service";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "investme-secret-key";
const SALT_ROUNDS = 10;

// AWS S3 Configuration
const s3Client = new S3Client({
  region: "us-east-1", // Adjust region as needed
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BUCKET_NAME = "doc.investme.com.br";
const BUCKET_URL = "https://doc.investme.com.br";

// Multer configuration for S3 uploads (company images)
const uploadS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `company-images/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas JPG ou PNG para imagens.'));
    }
  }
});

// Multer configuration for S3 uploads (credit request documents)
const uploadS3Documents = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `credit-documents/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas PDF, DOC, DOCX, JPG ou PNG.'));
    }
  }
});

// Multer configuration for local file uploads (for documents)
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
      const investorData = insertInvestorSchema.parse({
        ...req.body,
        status: 'pendente'
      });
      
      // Check if investor already exists by email or CPF
      const existingByEmail = await storage.getInvestorByEmail(investorData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      
      const existingByCpf = await storage.getInvestorByCpf(investorData.cpf);
      if (existingByCpf) {
        return res.status(400).json({ message: 'CPF já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(investorData.senha, SALT_ROUNDS);
      
      const investor = await storage.createInvestor({
        ...investorData,
        senha: hashedPassword,
        status: 'pendente'
      });

      // Generate confirmation token and send email
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createEmailConfirmationToken({
        email: investor.email,
        token: confirmationToken,
        userType: 'investor',
        expiresAt
      });

      // Send confirmation email
      await emailService.sendEmailConfirmation(investor.email, confirmationToken, 'investor');

      res.status(201).json({ 
        message: 'Investidor cadastrado com sucesso! Verifique seu email para confirmar sua conta.',
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
      const entrepreneurData = insertEntrepreneurSchema.parse({
        ...req.body,
        status: 'ativo'
      });
      
      // Check if entrepreneur already exists by email or CPF
      const existingByEmail = await storage.getEntrepreneurByEmail(entrepreneurData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      
      const existingByCpf = await storage.getEntrepreneurByCpf(entrepreneurData.cpf);
      if (existingByCpf) {
        return res.status(400).json({ message: 'CPF já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(entrepreneurData.senha, SALT_ROUNDS);
      
      const entrepreneur = await storage.createEntrepreneur({
        ...entrepreneurData,
        senha: hashedPassword,
        status: 'pendente',
        cadastroAprovado: false,
        emailConfirmado: false,
        documentosVerificados: false
      });

      // Generate confirmation token and send email
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createEmailConfirmationToken({
        email: entrepreneur.email,
        token: confirmationToken,
        userType: 'entrepreneur',
        expiresAt
      });

      // Send confirmation email
      await emailService.sendEmailConfirmation(entrepreneur.email, confirmationToken, 'entrepreneur');

      res.status(201).json({ 
        message: 'Empreendedor cadastrado com sucesso! Verifique seu email para confirmar sua conta.',
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
      
      // Try to find investor by email first, then by CPF
      let investor = await storage.getInvestorByEmail(login);
      if (!investor) {
        investor = await storage.getInvestorByCpf(login);
      }

      if (!investor) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Check if email is confirmed
      if (!investor.emailConfirmado) {
        return res.status(401).json({ 
          message: 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.',
          requiresEmailConfirmation: true,
          email: investor.email
        });
      }

      // Check if investor account is approved
      if (investor.status === 'pendente') {
        return res.status(401).json({ message: 'Conta aguardando aprovação do backoffice' });
      }

      if (investor.status === 'inativo') {
        return res.status(401).json({ message: 'Conta inativa. Entre em contato com o suporte.' });
      }

      const isValidPassword = await bcrypt.compare(senha, investor.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: investor.id, email: investor.email, tipo: 'investor', type: 'investor' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        user: { ...investor, senha: undefined, role: 'investor', tipo: 'investor' }, 
        token,
        userType: 'investor'
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
      
      // Try to find entrepreneur by email first, then by CPF
      let entrepreneur = await storage.getEntrepreneurByEmail(login);
      if (!entrepreneur) {
        entrepreneur = await storage.getEntrepreneurByCpf(login);
      }

      if (!entrepreneur) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Check if email is confirmed
      if (!entrepreneur.emailConfirmado) {
        return res.status(401).json({ 
          message: 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.',
          requiresEmailConfirmation: true,
          email: entrepreneur.email
        });
      }

      // Check if entrepreneur account is approved
      if (entrepreneur.status === 'pendente') {
        return res.status(401).json({ message: 'Conta aguardando aprovação do backoffice' });
      }

      if (entrepreneur.status === 'inativo') {
        return res.status(401).json({ message: 'Conta inativa. Entre em contato com o suporte.' });
      }

      const isValidPassword = await bcrypt.compare(senha, entrepreneur.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: entrepreneur.id, email: entrepreneur.email, tipo: 'entrepreneur', type: 'entrepreneur' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        user: { ...entrepreneur, senha: undefined, role: 'entrepreneur', tipo: 'entrepreneur' }, 
        token,
        userType: 'entrepreneur'
      });
    } catch (error: any) {
      console.error('Erro no login do empreendedor:', error);
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

  // Password change routes
  app.post('/api/entrepreneur/change-password', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { senhaAtual, novaSenha } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const isValidPassword = await bcrypt.compare(senhaAtual, user.senha);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcrypt.hash(novaSenha, SALT_ROUNDS);
      await storage.updateUser(userId, { senha: hashedPassword });

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao alterar senha' });
    }
  });

  app.post('/api/investor/change-password', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { senhaAtual, novaSenha } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const isValidPassword = await bcrypt.compare(senhaAtual, user.senha);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcrypt.hash(novaSenha, SALT_ROUNDS);
      await storage.updateUser(userId, { senha: hashedPassword });

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao alterar senha' });
    }
  });

  // Password reset routes
  app.post('/api/password-reset/request', async (req, res) => {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      
      // Check which user type has this email
      let userType = '';
      let userExists = false;

      // Check entrepreneurs
      const entrepreneur = await storage.getEntrepreneurByEmail(email);
      if (entrepreneur) {
        userType = 'entrepreneur';
        userExists = true;
      }

      // Check investors  
      if (!userExists) {
        const investor = await storage.getInvestorByEmail(email);
        if (investor) {
          userType = 'investor';
          userExists = true;
        }
      }

      // Check admin users
      if (!userExists) {
        const adminUser = await storage.getAdminUserByEmail(email);
        if (adminUser) {
          userType = 'admin';
          userExists = true;
        }
      }

      // Check legacy users table
      if (!userExists) {
        const user = await storage.getUserByEmail(email);
        if (user) {
          userType = user.tipo || 'user';
          userExists = true;
        }
      }

      if (!userExists) {
        return res.status(404).json({ message: 'Email não encontrado no sistema' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken({
        email,
        token: resetToken,
        userType,
        expiresAt,
        used: false
      });

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken, userType);

      res.json({ message: 'Email de recuperação de senha enviado com sucesso' });
    } catch (error: any) {
      console.error('Password reset request error:', error);
      res.status(500).json({ message: error.message || 'Erro ao solicitar recuperação de senha' });
    }
  });

  app.post('/api/password-reset/confirm', async (req, res) => {
    try {
      const { token, newPassword } = passwordResetConfirmSchema.parse(req.body);

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update user password
      await storage.updateUserPassword(resetToken.email, resetToken.userType, hashedPassword);

      // Mark token as used
      await storage.usePasswordResetToken(token);

      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
      console.error('Password reset confirm error:', error);
      res.status(500).json({ message: error.message || 'Erro ao redefinir senha' });
    }
  });

  // Email confirmation routes
  app.post('/api/email-confirmation/request', async (req, res) => {
    try {
      const { email, userType } = req.body;

      if (!email || !userType) {
        return res.status(400).json({ message: 'Email e tipo de usuário são obrigatórios' });
      }

      if (!['entrepreneur', 'investor'].includes(userType)) {
        return res.status(400).json({ message: 'Tipo de usuário inválido' });
      }

      // Check if user exists and is not already confirmed
      let userExists = false;
      let emailAlreadyConfirmed = false;

      if (userType === 'entrepreneur') {
        const entrepreneur = await storage.getEntrepreneurByEmail(email);
        if (!entrepreneur) {
          return res.status(404).json({ message: 'Empreendedor não encontrado' });
        }
        userExists = true;
        emailAlreadyConfirmed = entrepreneur.emailConfirmado;
      } else if (userType === 'investor') {
        const investor = await storage.getInvestorByEmail(email);
        if (!investor) {
          return res.status(404).json({ message: 'Investidor não encontrado' });
        }
        userExists = true;
        emailAlreadyConfirmed = investor.emailConfirmado;
      }

      if (emailAlreadyConfirmed) {
        return res.status(400).json({ message: 'Email já confirmado' });
      }

      // Generate confirmation token
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save token to database
      await storage.createEmailConfirmationToken({
        email,
        token: confirmationToken,
        userType,
        expiresAt
      });

      // Send confirmation email
      await emailService.sendEmailConfirmation(email, confirmationToken, userType as 'entrepreneur' | 'investor');

      res.json({ message: 'Email de confirmação enviado com sucesso' });
    } catch (error: any) {
      console.error('Email confirmation request error:', error);
      res.status(500).json({ message: error.message || 'Erro ao enviar email de confirmação' });
    }
  });

  app.post('/api/email-confirmation/confirm', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Token é obrigatório' });
      }

      const confirmationToken = await storage.getEmailConfirmationToken(token);
      if (!confirmationToken) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      // Confirm user email
      await storage.confirmUserEmail(confirmationToken.email, confirmationToken.userType);

      // Mark token as used
      await storage.useEmailConfirmationToken(token);

      res.json({ message: 'Email confirmado com sucesso! Agora você pode fazer login.' });
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      res.status(500).json({ message: error.message || 'Erro ao confirmar email' });
    }
  });

  // Investor API Routes
  app.get('/api/investor/credit-requests', authenticateToken, async (req: any, res) => {
    try {
      // Get available credit requests for investors - show requests in the network
      const creditRequests = await storage.getCreditRequests('na_rede');
      res.json(creditRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitações' });
    }
  });

  app.get('/api/investor/stats', authenticateToken, async (req: any, res) => {
    try {
      const investorId = req.user.id;
      
      // Available requests (na_rede status)
      const availableRequests = await storage.getCreditRequests('na_rede');
      
      // Accepted requests by this investor (em_analise, aprovada, reprovada)
      const acceptedRequests = await storage.getCreditRequestsByInvestor(investorId, 'em_analise');
      const approvedRequests = await storage.getCreditRequestsByInvestor(investorId, 'aprovada');
      const rejectedRequests = await storage.getCreditRequestsByInvestor(investorId, 'reprovada');
      
      const totalAcceptedRequests = acceptedRequests.length + approvedRequests.length + rejectedRequests.length;
      
      // Total value from accepted requests
      const totalValue = [...acceptedRequests, ...approvedRequests, ...rejectedRequests]
        .reduce((sum, req) => sum + parseFloat(req.valorSolicitado), 0);
      
      // Unique companies in available requests
      const uniqueCompanies = new Set(availableRequests.map(req => req.companyId)).size;
      
      const stats = {
        availableRequests: availableRequests.length,
        acceptedRequests: totalAcceptedRequests,
        totalValue: totalValue,
        uniqueCompanies: uniqueCompanies
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar estatísticas' });
    }
  });

  app.post('/api/investor/credit-requests/:id/accept', authenticateToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const investorId = req.user.id;
      
      // Calculate 24 hours from now
      const dataLimiteAnalise = new Date();
      dataLimiteAnalise.setHours(dataLimiteAnalise.getHours() + 24);
      
      // Update credit request to show it was accepted by this investor
      await storage.updateCreditRequest(requestId, {
        status: 'em_analise',
        investorId: investorId,
        dataAceite: new Date(),
        dataLimiteAnalise: dataLimiteAnalise
      });

      res.json({ message: 'Solicitação aceita com sucesso! Você tem 24 horas para dar uma resposta.' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao aceitar solicitação' });
    }
  });

  app.get('/api/investor/my-analysis', authenticateToken, async (req: any, res) => {
    try {
      const investorId = req.user.id;
      
      // Check for expired requests and return them to network
      await storage.checkAndReturnExpiredRequests();
      
      // Get requests being analyzed by this investor
      const requests = await storage.getCreditRequestsByInvestor(investorId, 'em_analise');
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar análises' });
    }
  });

  app.get('/api/investor/approved-analysis', authenticateToken, async (req: any, res) => {
    try {
      const investorId = req.user.id;
      
      // Get approved requests by this investor
      const approvedRequests = await storage.getCreditRequestsByInvestor(investorId, 'aprovada');
      const rejectedRequests = await storage.getCreditRequestsByInvestor(investorId, 'reprovada');
      
      const allFinalized = [...approvedRequests, ...rejectedRequests];
      res.json(allFinalized);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar análises finalizadas' });
    }
  });

  app.post('/api/investor/credit-requests/:id/approve', authenticateToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { observacoes } = req.body;
      
      await storage.updateCreditRequest(requestId, {
        status: 'aprovada',
        observacoesAnalise: observacoes
      });

      res.json({ message: 'Solicitação aprovada com sucesso!' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao aprovar solicitação' });
    }
  });

  app.post('/api/investor/credit-requests/:id/reject', authenticateToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { observacoes } = req.body;
      
      await storage.updateCreditRequest(requestId, {
        status: 'reprovada',
        observacoesAnalise: observacoes
      });

      res.json({ message: 'Solicitação reprovada.' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao reprovar solicitação' });
    }
  });

  // Investor messages routes
  app.get('/api/investor/messages/:conversationId', authenticateToken, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar mensagens' });
    }
  });

  app.post('/api/investor/messages', authenticateToken, async (req: any, res) => {
    try {
      const { conversationId, conteudo, companyId, creditRequestId } = req.body;
      
      const message = await storage.createMessage({
        conversationId,
        conteudo,
        tipo: 'investor',
        remetenteId: req.user.id,
        destinatarioTipo: 'empresa',
        companyId,
        creditRequestId
      });
      
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao enviar mensagem' });
    }
  });

  app.post('/api/investor/messages/:conversationId/mark-read', authenticateToken, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      await storage.markConversationAsRead(conversationId, 'investor');
      res.json({ message: 'Mensagens marcadas como lidas' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao marcar como lidas' });
    }
  });

  // Get conversation for credit request analysis
  app.get('/api/investor/conversations/credit-request-:requestId', authenticateToken, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const investorId = req.user.id;
      
      // Verify the credit request is being analyzed by this investor
      const creditRequest = await storage.getCreditRequest(parseInt(requestId));
      if (!creditRequest || creditRequest.investorId !== investorId || creditRequest.status !== 'em_analise') {
        return res.status(403).json({ message: 'Acesso não autorizado a esta conversa' });
      }

      const conversationId = `credit-request-${requestId}`;
      const messages = await storage.getConversationMessages(conversationId);
      
      res.json({ messages });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar conversa' });
    }
  });

  // Send message in credit request conversation
  app.post('/api/investor/conversations/credit-request-:requestId/messages', authenticateToken, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const { text } = req.body;
      const investorId = req.user.id;
      
      // Verify the credit request is being analyzed by this investor
      const creditRequest = await storage.getCreditRequest(parseInt(requestId));
      if (!creditRequest || creditRequest.investorId !== investorId || creditRequest.status !== 'em_analise') {
        return res.status(403).json({ message: 'Acesso não autorizado a esta conversa' });
      }

      const conversationId = `credit-request-${requestId}`;
      
      // Create message
      await storage.createMessage({
        conversationId,
        remetenteId: investorId,
        tipo: 'investor',
        destinatarioTipo: 'company',
        conteudo: text,
        assunto: `Análise de Crédito - ${creditRequest.valorSolicitado}`,
        lida: false,
        companyId: creditRequest.companyId,
        creditRequestId: parseInt(requestId)
      });

      res.json({ message: 'Mensagem enviada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao enviar mensagem' });
    }
  });

  // Get detailed company information for investor analysis
  app.get('/api/investor/company-details/:creditRequestId', authenticateToken, async (req: any, res) => {
    try {
      const { creditRequestId } = req.params;
      
      // First verify the credit request is being analyzed by this investor
      const creditRequest = await storage.getCreditRequest(parseInt(creditRequestId));
      if (!creditRequest || creditRequest.investorId !== req.user.id || creditRequest.status !== 'em_analise') {
        return res.status(403).json({ message: 'Acesso não autorizado a esta solicitação' });
      }

      // Get detailed company information
      const company = await storage.getCompanyWithDetails(creditRequest.companyId);
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      // Get shareholders
      const shareholders = await storage.getCompanyShareholders(creditRequest.companyId);
      
      // Get guarantees
      const guarantees = await storage.getCompanyGuarantees(creditRequest.companyId);

      res.json({
        company,
        creditRequest,
        shareholders,
        guarantees
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar detalhes da empresa' });
    }
  });

  // Admin Investors Routes
  app.get('/api/admin/investors', authenticateAdminToken, async (req, res) => {
    try {
      const { status } = req.query;
      const investors = await storage.getInvestors(status as string);
      res.json(investors);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar investidores' });
    }
  });

  // Admin Entrepreneurs Routes
  app.get('/api/admin/entrepreneurs', authenticateAdminToken, async (req, res) => {
    try {
      const { status } = req.query;
      const entrepreneurs = await storage.getEntrepreneurs(status as string);
      res.json(entrepreneurs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empreendedores' });
    }
  });

  // Approve entrepreneur
  app.post('/api/admin/entrepreneurs/:id/approve', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const entrepreneur = await storage.approveEntrepreneur(parseInt(id));
      if (!entrepreneur) {
        return res.status(404).json({ message: 'Empreendedor não encontrado' });
      }
      res.json({ message: 'Empreendedor aprovado com sucesso', entrepreneur });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao aprovar empreendedor' });
    }
  });

  // Reject entrepreneur
  app.post('/api/admin/entrepreneurs/:id/reject', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const entrepreneur = await storage.rejectEntrepreneur(parseInt(id), reason);
      if (!entrepreneur) {
        return res.status(404).json({ message: 'Empreendedor não encontrado' });
      }
      res.json({ message: 'Empreendedor rejeitado', entrepreneur });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao rejeitar empreendedor' });
    }
  });

  // Admin Users/Entrepreneurs Routes
  app.get('/api/admin/users', authenticateAdminToken, async (req, res) => {
    try {
      const { tipo, status } = req.query;
      const users = await storage.getUsersByTypeAndStatus(tipo as string, status as string);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar usuários' });
    }
  });

  app.post('/api/admin/users/:id/approve', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.approveUser(parseInt(id));
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao aprovar usuário' });
    }
  });

  // Approve investor (from investors table)
  app.post('/api/admin/investors/:id/approve', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Approving investor with ID:', id);
      
      // Get investor from investors table
      const investors = await storage.getInvestors();
      const existingInvestor = investors.find(inv => inv.id === parseInt(id));
      
      if (!existingInvestor) {
        console.log('Investor not found in investors table');
        return res.status(404).json({ message: 'Investidor não encontrado' });
      }
      
      // Approve investor
      const investor = await storage.approveInvestor(parseInt(id));
      if (!investor) {
        console.log('Failed to approve investor');
        return res.status(500).json({ message: 'Erro ao aprovar investidor' });
      }
      
      console.log('Investor approved successfully:', investor);
      res.json({ message: 'Investidor aprovado com sucesso', investor });
    } catch (error: any) {
      console.error('Error approving investor:', error);
      res.status(500).json({ message: error.message || 'Erro ao aprovar investidor' });
    }
  });

  // Reject investor (from users table)  
  app.post('/api/admin/investors/:id/reject', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // Check if investor is in users table first
      const user = await storage.getUser(parseInt(id));
      if (user && user.tipo === 'investor') {
        // Reject investor user
        const rejectedUser = await storage.rejectUser(parseInt(id), reason);
        if (!rejectedUser) {
          return res.status(404).json({ message: 'Investidor não encontrado' });
        }
        res.json({ message: 'Investidor rejeitado', investor: rejectedUser });
      } else {
        // Try investors table
        const investor = await storage.rejectInvestor(parseInt(id), reason);
        if (!investor) {
          return res.status(404).json({ message: 'Investidor não encontrado' });
        }
        res.json({ message: 'Investidor rejeitado', investor });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao rejeitar investidor' });
    }
  });

  app.post('/api/admin/users/:id/reject', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = await storage.rejectUser(parseInt(id), reason);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao rejeitar usuário' });
    }
  });







  // Admin Network Routes
  app.get('/api/admin/network', authenticateAdminToken, async (req, res) => {
    try {
      const { status } = req.query;
      const networkRequests = await storage.getNetworkRequests(status as string);
      res.json(networkRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar rede' });
    }
  });

  app.get('/api/admin/network/stats', authenticateAdminToken, async (req, res) => {
    try {
      const stats = await storage.getNetworkStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar estatísticas da rede' });
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
        user: { ...adminUser, senha: undefined, role: 'admin' }, 
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

  // Investor profile routes
  app.get('/api/investor/profile', authenticateToken, async (req: any, res) => {
    try {
      const investorProfile = await storage.getInvestors().then(investors => 
        investors.find(inv => inv.email === req.user.email)
      );
      
      if (!investorProfile) {
        return res.status(404).json({ message: 'Perfil de investidor não encontrado' });
      }
      
      res.json(investorProfile);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar perfil' });
    }
  });

  app.put('/api/investor/profile', authenticateToken, async (req: any, res) => {
    try {
      const investorProfile = await storage.getInvestors().then(investors => 
        investors.find(inv => inv.email === req.user.email)
      );
      
      if (!investorProfile) {
        return res.status(404).json({ message: 'Perfil de investidor não encontrado' });
      }
      
      const updatedProfile = await storage.updateInvestor(investorProfile.id, req.body);
      res.json(updatedProfile);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao atualizar perfil' });
    }
  });

  // Change password route
  app.put('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.senha);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.user.id, { senha: hashedNewPassword });
      
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao alterar senha' });
    }
  });

  // Company Routes
  app.get('/api/companies', authenticateToken, async (req: any, res) => {
    try {
      const { userId, entrepreneurId, status, search } = req.query;
      console.log('Companies request params:', { userId, entrepreneurId, status, search });
      
      // If entrepreneurId is provided, use it directly
      if (entrepreneurId) {
        console.log('Fetching companies for entrepreneurId:', entrepreneurId);
        const companies = await storage.getCompanies(parseInt(entrepreneurId as string), status as string, search as string);
        console.log('Found companies for entrepreneurId:', companies.length);
        res.json(companies);
        return;
      }
      
      // If userId is provided, use it
      if (userId) {
        console.log('Fetching companies for userId:', userId);
        const companies = await storage.getUserCompanies(parseInt(userId as string));
        console.log('Found companies for userId:', companies.length);
        res.json(companies);
        return;
      }
      
      // Default: use authenticated user's companies
      console.log('Fetching companies for authenticated user:', req.user.id);
      const companies = await storage.getUserCompanies(req.user.id);
      console.log('Found companies for authenticated user:', companies.length);
      res.json(companies);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
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
      if (company.entrepreneurId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresa' });
    }
  });

  app.post('/api/companies', authenticateToken, async (req: any, res) => {
    try {
      console.log('Company registration data received:', JSON.stringify(req.body, null, 2));
      
      const companyData = insertCompanySchema.parse({
        ...req.body,
        entrepreneurId: req.user.id
      });

      console.log('Parsed company data:', JSON.stringify(companyData, null, 2));
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
      console.error('Company registration error:', error);
      if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      res.status(400).json({ message: error.message || 'Erro ao criar empresa' });
    }
  });

  // Get individual company details
  app.get('/api/companies/:id', authenticateToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      // Verify ownership
      if (company.entrepreneurId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresa' });
    }
  });

  // Get company valuations
  app.get('/api/companies/:id/valuations', authenticateToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      // Verify ownership
      if (company.entrepreneurId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const valuations = await storage.getCompanyValuations(companyId);
      res.json(valuations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar valuations' });
    }
  });

  // Get latest company valuation
  app.get('/api/companies/:id/valuations/latest', authenticateToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      // Verify ownership
      if (company.entrepreneurId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const latestValuation = await storage.getLatestCompanyValuation(companyId);
      res.json(latestValuation || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar último valuation' });
    }
  });

  // Company edit route
  app.put('/api/companies/:id', authenticateToken, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      // Verify ownership
      if (company.entrepreneurId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const updateData = {
        razaoSocial: req.body.razaoSocial,
        nomeFantasia: req.body.nomeFantasia,
        cnpj: req.body.cnpj,
        telefone: req.body.telefone,
        emailContato: req.body.emailContato,
        cep: req.body.cep,
        rua: req.body.rua,
        numero: req.body.numero,
        complemento: req.body.complemento,
        bairro: req.body.bairro,
        cidade: req.body.cidade,
        estado: req.body.estado,
        cnaePrincipal: req.body.cnaePrincipal,
        cnaeSecundarios: req.body.cnaeSecundarios,
        dataFundacao: req.body.dataFundacao ? new Date(req.body.dataFundacao) : company.dataFundacao,
        faturamento: req.body.faturamento,
        numeroFuncionarios: req.body.numeroFuncionarios,
        descricaoNegocio: req.body.descricaoNegocio,
        tipoProprietario: req.body.tipoProprietario,
        images: req.body.images || company.images
      };

      const updatedCompany = await storage.updateCompany(companyId, updateData);
      
      if (!updatedCompany) {
        return res.status(404).json({ message: 'Erro ao atualizar empresa' });
      }

      res.json(updatedCompany);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao editar empresa' });
    }
  });

  // Credit Request Routes
  app.get('/api/credit-requests', authenticateToken, async (req: any, res) => {
    try {
      const creditRequests = await storage.getUserCreditRequests(req.user.id);
      res.json(creditRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitações' });
    }
  });

  app.post('/api/credit-requests', authenticateToken, uploadS3Documents.array('documentos', 10), async (req: any, res) => {
    try {
      const creditRequestData = insertCreditRequestSchema.parse(req.body);
      
      // Verify company ownership
      const company = await storage.getCompany(creditRequestData.companyId);
      if (!company || company.entrepreneurId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Verify company is approved
      if (company.status !== 'aprovada') {
        return res.status(400).json({ message: 'Empresa deve estar aprovada para solicitar crédito' });
      }

      // Handle uploaded files from S3
      const documentos = req.files ? req.files.map((file: any) => (file as any).location) : [];
      creditRequestData.documentos = documentos;
      
      console.log('Documents uploaded to S3:', documentos);

      const creditRequest = await storage.createCreditRequest(creditRequestData);
      res.status(201).json(creditRequest);
    } catch (error: any) {
      console.error('Error creating credit request:', error);
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

  // Admin user management routes (dedicated endpoint)
  app.get('/api/admin/admin-users', authenticateAdminToken, async (req: any, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      res.json(adminUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar usuários administrativos' });
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

  // Company image upload endpoint - uploads to AWS S3
  app.post('/api/upload/company-image', authenticateToken, uploadS3.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
      }

      // Get the S3 URL from multer-s3
      const imageUrl = (req.file as any).location;
      console.log('Image uploaded to S3:', imageUrl);
      
      res.json({ url: imageUrl });
    } catch (error: any) {
      console.error('Error uploading image to S3:', error);
      res.status(500).json({ message: error.message || 'Erro ao fazer upload da imagem' });
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

  // Investor Routes
  app.get('/api/investor/company-status', authenticateToken, async (req: any, res) => {
    try {
      // Try to find investor by the user email from the token
      let investor = await storage.getInvestorByEmail(req.user.email);
      
      if (!investor) {
        // Try alternative approach - find investor by CPF if available
        const user = await storage.getUser(req.user.id);
        if (user?.cpf) {
          investor = await storage.getInvestorByCpf(user.cpf);
        }
      }

      if (!investor) {
        return res.json({
          hasCompany: false,
          hasApprovedCompany: false
        });
      }

      // Check if investor has a company registered
      const companies = await storage.getCompanies(undefined, undefined, undefined);
      const investorCompany = companies.find(c => c.investorId === investor.id && c.tipoProprietario === 'investidor');

      res.json({
        hasCompany: !!investorCompany,
        hasApprovedCompany: investorCompany?.status === 'aprovada',
        companyId: investorCompany?.id
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao verificar status da empresa' });
    }
  });

  // Get investor company data for editing
  app.get('/api/investor/company', authenticateToken, async (req: any, res) => {
    try {
      // Try to find investor by the user email from the token
      let investor = await storage.getInvestorByEmail(req.user.email);
      
      if (!investor) {
        // Try alternative approach - find investor by CPF if available
        const user = await storage.getUser(req.user.id);
        if (user?.cpf) {
          investor = await storage.getInvestorByCpf(user.cpf);
        }
      }

      if (!investor) {
        return res.status(404).json({ message: 'Investidor não encontrado' });
      }

      // Get investor's company
      const companies = await storage.getCompanies(undefined, undefined, undefined);
      const investorCompany = companies.find(c => c.investorId === investor.id && c.tipoProprietario === 'investidor');

      if (!investorCompany) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      res.json(investorCompany);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar dados da empresa' });
    }
  });

  app.post('/api/investor/company', authenticateToken, async (req: any, res) => {
    try {
      // Try to find investor by the user ID from the token
      let investor = await storage.getInvestorByEmail(req.user.email);
      
      if (!investor) {
        // Try alternative approach - find investor by CPF if available
        const user = await storage.getUser(req.user.id);
        if (user?.cpf) {
          investor = await storage.getInvestorByCpf(user.cpf);
        }
      }

      if (!investor) {
        return res.status(404).json({ message: 'Investidor não encontrado. Verifique se seu cadastro foi aprovado.' });
      }

      const companyData = {
        ...req.body,
        investorId: investor.id,
        tipoProprietario: 'investidor',
        faturamento: String(req.body.faturamento || 0),
        ebitda: String(req.body.ebitda || 0),
        dividaLiquida: String(req.body.dividaLiquida || 0),
        numeroFuncionarios: Number(req.body.numeroFuncionarios || 1),
        dataFundacao: new Date(req.body.dataFundacao)
      };

      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao cadastrar empresa' });
    }
  });

  app.get('/api/investor/profile', authenticateToken, async (req: any, res) => {
    try {
      // Try to find investor by the user email from the token
      let investor = await storage.getInvestorByEmail(req.user.email);
      
      if (!investor) {
        // Try alternative approach - find investor by CPF if available
        const user = await storage.getUser(req.user.id);
        if (user?.cpf) {
          investor = await storage.getInvestorByCpf(user.cpf);
        }
      }

      if (!investor) {
        return res.status(404).json({ message: 'Investidor não encontrado' });
      }
      res.json(investor);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar perfil' });
    }
  });

  app.put('/api/investor/profile', authenticateToken, async (req: any, res) => {
    try {
      const investor = await storage.getInvestor(req.user.id);
      if (!investor) {
        return res.status(404).json({ message: 'Investidor não encontrado' });
      }

      // For now, just return success - in a real implementation, 
      // changes would be stored as pending for backoffice approval
      res.json({ message: 'Alterações enviadas para aprovação' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao atualizar perfil' });
    }
  });

  app.get('/api/investor/pending-profile-changes', authenticateToken, async (req: any, res) => {
    try {
      // For now, return null - in a real implementation, 
      // this would check for pending profile changes
      res.json(null);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar alterações pendentes' });
    }
  });

  app.get('/api/investor/unread-messages', authenticateToken, async (req: any, res) => {
    try {
      // For now, return 0 - in a real implementation, 
      // this would count unread messages for the investor
      res.json({ count: 0 });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar mensagens não lidas' });
    }
  });

  // Get available credit requests for investor network
  app.get('/api/investor/credit-requests', authenticateToken, async (req: any, res) => {
    try {
      // Get credit requests that are available in the network (status: na_rede)
      const availableRequests = await storage.getCreditRequests('na_rede');
      
      // Return requests with company information for display
      res.json(availableRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar solicitações disponíveis' });
    }
  });

  // Get company valuation for credit request analysis (investor access)
  app.get('/api/investor/credit-requests/:requestId/valuation', authenticateToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      
      // Get the credit request to find the company
      const creditRequest = await storage.getCreditRequest(requestId);
      if (!creditRequest) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }
      
      // Check if request is available in network (na_rede) for analysis
      if (creditRequest.status !== 'na_rede') {
        return res.status(403).json({ message: 'Solicitação não disponível para análise' });
      }
      
      // Get the latest valuation for this company
      const latestValuation = await storage.getLatestCompanyValuation(creditRequest.companyId);
      res.json(latestValuation || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar valuation da empresa' });
    }
  });

  // Entrepreneur Routes for unified navbar
  app.get('/api/entrepreneur/profile', authenticateToken, async (req: any, res) => {
    try {
      const entrepreneur = await storage.getEntrepreneur(req.user.id);
      if (!entrepreneur) {
        return res.status(404).json({ message: 'Empreendedor não encontrado' });
      }
      res.json(entrepreneur);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar perfil' });
    }
  });

  app.put('/api/entrepreneur/profile', authenticateToken, async (req: any, res) => {
    try {
      const entrepreneur = await storage.getEntrepreneur(req.user.id);
      if (!entrepreneur) {
        return res.status(404).json({ message: 'Empreendedor não encontrado' });
      }

      // For now, just return success - in a real implementation, 
      // changes would be stored as pending for backoffice approval
      res.json({ message: 'Alterações enviadas para aprovação' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao atualizar perfil' });
    }
  });

  app.get('/api/entrepreneur/pending-profile-changes', authenticateToken, async (req: any, res) => {
    try {
      // For now, return null - in a real implementation, 
      // this would check for pending profile changes
      res.json(null);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar alterações pendentes' });
    }
  });

  app.get('/api/entrepreneur/unread-messages', authenticateToken, async (req: any, res) => {
    try {
      // For now, return 0 - in a real implementation, 
      // this would count unread messages for the entrepreneur
      res.json({ count: 0 });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar mensagens não lidas' });
    }
  });

  // Admin Routes for Granular Profile Approval
  app.patch('/api/admin/entrepreneurs/:id/approve-field', authenticateAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { field, approved } = req.body;
      
      if (!['cadastroAprovado', 'emailConfirmado', 'documentosVerificados'].includes(field)) {
        return res.status(400).json({ message: 'Campo inválido' });
      }

      // For entrepreneurs, we update the entrepreneurs table
      const entrepreneur = await storage.getEntrepreneur(parseInt(id));
      if (!entrepreneur) {
        return res.status(404).json({ message: 'Empreendedor não encontrado' });
      }

      const updateData: any = {
        [field]: approved,
        updatedAt: new Date()
      };
      
      if (approved) {
        updateData.aprovadoPor = req.admin.id;
        updateData.aprovadoEm = new Date();
      }

      const updatedEntrepreneur = await storage.updateEntrepreneur(parseInt(id), updateData);

      if (!updatedEntrepreneur) {
        return res.status(404).json({ message: 'Erro ao atualizar empreendedor' });
      }

      res.json({ message: `${field} ${approved ? 'aprovado' : 'rejeitado'} com sucesso`, entrepreneur: updatedEntrepreneur });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao atualizar aprovação' });
    }
  });

  app.patch('/api/admin/investors/:id/approve-field', authenticateAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { field, approved } = req.body;
      
      console.log('Updating investor field:', { id, field, approved });
      
      const validFields = [
        'cadastroAprovado', 
        'emailConfirmado', 
        'documentosVerificados', 
        'rendaComprovada', 
        'perfilInvestidor'
      ];
      
      if (!validFields.includes(field)) {
        return res.status(400).json({ message: 'Campo inválido' });
      }

      // Check if investor exists first
      const investors = await storage.getInvestors();
      const existingInvestor = investors.find(inv => inv.id === parseInt(id));
      
      if (!existingInvestor) {
        console.log('Investor not found for field update');
        return res.status(404).json({ message: 'Investidor não encontrado' });
      }

      // Update the investor field directly
      const updateData = { [field]: approved };
      const investor = await storage.updateInvestor(parseInt(id), updateData);

      if (!investor) {
        return res.status(404).json({ message: 'Erro ao atualizar investidor' });
      }

      console.log('Field updated successfully:', investor);
      res.json({ 
        message: `${field} ${approved ? 'aprovado' : 'rejeitado'} com sucesso`, 
        investor 
      });
    } catch (error: any) {
      console.error('Error updating investor field:', error);
      res.status(500).json({ message: error.message || 'Erro ao atualizar aprovação' });
    }
  });

  // =============================================================================
  // VALUATION ROUTES
  // =============================================================================

  // Get company valuations
  app.get('/api/companies/:companyId/valuations', authenticateToken, async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const valuations = await storage.getCompanyValuations(parseInt(companyId));
      res.json(valuations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar valuations' });
    }
  });

  // Get latest company valuation
  app.get('/api/companies/:companyId/valuations/latest', authenticateToken, async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const valuation = await storage.getLatestCompanyValuation(parseInt(companyId));
      res.json(valuation || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar valuation' });
    }
  });

  // Get specific valuation
  app.get('/api/valuations/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const valuation = await storage.getValuation(parseInt(id));
      
      if (!valuation) {
        return res.status(404).json({ message: 'Valuation não encontrado' });
      }

      res.json(valuation);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar valuation' });
    }
  });

  // Create new valuation
  app.post('/api/companies/:companyId/valuations', authenticateToken, async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const { method, dcfData, multiplesData, assumptions, notes } = req.body;

      // Validate input data based on method
      let validatedData: any = {};
      if (method === 'dcf' && dcfData) {
        validatedData.dcfData = dcfDataSchema.parse(dcfData);
      } else if (method === 'multiples' && multiplesData) {
        validatedData.multiplesData = multiplesDataSchema.parse(multiplesData);
      }

      const valuationData = insertValuationSchema.parse({
        companyId: parseInt(companyId),
        userId: req.user.id,
        userType: req.user.type || 'entrepreneur',
        method,
        status: 'draft',
        ...validatedData,
        assumptions,
        notes,
      });

      const valuation = await storage.createValuation(valuationData);
      res.status(201).json(valuation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar valuation' });
    }
  });

  // Update valuation (for editing and completing calculations)
  app.put('/api/valuations/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existingValuation = await storage.getValuation(parseInt(id));

      if (!existingValuation) {
        return res.status(404).json({ message: 'Valuation não encontrado' });
      }

      // Check ownership
      if (existingValuation.userId !== req.user.id) {
        return res.status(403).json({ message: 'Não autorizado a editar este valuation' });
      }

      const { method, dcfData, multiplesData, assumptions, notes, status, enterpriseValue, equityValue, sensitivityData } = req.body;

      let validatedData: any = {};
      if (method === 'dcf' && dcfData) {
        validatedData.dcfData = dcfDataSchema.parse(dcfData);
      } else if (method === 'multiples' && multiplesData) {
        validatedData.multiplesData = multiplesDataSchema.parse(multiplesData);
      }

      const updateData = {
        ...validatedData,
        assumptions,
        notes,
        status,
        enterpriseValue,
        equityValue,
        sensitivityData,
      };

      const updatedValuation = await storage.updateValuation(parseInt(id), updateData);
      res.json(updatedValuation);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao atualizar valuation' });
    }
  });

  // Calculate DCF valuation
  app.post('/api/valuations/:id/calculate/dcf', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { dcfData } = req.body;

      const existingValuation = await storage.getValuation(parseInt(id));
      if (!existingValuation || existingValuation.userId !== req.user.id) {
        return res.status(403).json({ message: 'Não autorizado' });
      }

      const validatedDcfData = dcfDataSchema.parse(dcfData);

      // Calculate WACC
      const wacc = (validatedDcfData.costOfEquity * validatedDcfData.equityWeight) + 
                  (validatedDcfData.costOfDebt * validatedDcfData.debtWeight * (1 - validatedDcfData.taxRate));

      // Calculate Free Cash Flows
      const freeCashFlows = [];
      const presentValues = [];
      
      for (let i = 0; i < validatedDcfData.projectionYears; i++) {
        const ebit = validatedDcfData.revenues[i] - validatedDcfData.costs[i] - validatedDcfData.operatingExpenses[i];
        const ebitda = ebit; // Simplified - should add depreciation back
        const taxes = ebit * validatedDcfData.taxRate;
        const nopat = ebit - taxes;
        
        const fcf = nopat - validatedDcfData.capex[i] - validatedDcfData.workingCapitalChange[i];
        freeCashFlows.push(fcf);
        
        const presentValue = fcf / Math.pow(1 + wacc, i + 1);
        presentValues.push(presentValue);
      }

      // Calculate Terminal Value
      const finalYearFcf = freeCashFlows[freeCashFlows.length - 1];
      const terminalFcf = finalYearFcf * (1 + validatedDcfData.terminalGrowthRate);
      const terminalValue = terminalFcf / (wacc - validatedDcfData.terminalGrowthRate);
      const presentValueOfTerminalValue = terminalValue / Math.pow(1 + wacc, validatedDcfData.projectionYears);

      // Calculate Enterprise Value
      const sumOfPresentValues = presentValues.reduce((a, b) => a + b, 0);
      const enterpriseValue = sumOfPresentValues + presentValueOfTerminalValue;

      // Calculate Equity Value
      const netDebt = validatedDcfData.netDebt || 0;
      const equityValue = enterpriseValue - netDebt;

      // Sensitivity Analysis
      const sensitivityRanges = {
        wacc: [-0.01, -0.005, 0, 0.005, 0.01],
        terminalGrowth: [-0.01, -0.005, 0, 0.005, 0.01]
      };

      const sensitivityMatrix = [];
      for (const waccAdj of sensitivityRanges.wacc) {
        const row = [];
        for (const terminalAdj of sensitivityRanges.terminalGrowth) {
          const adjWacc = wacc + waccAdj;
          const adjTerminalGrowth = validatedDcfData.terminalGrowthRate + terminalAdj;
          
          const adjPresentValues = freeCashFlows.map((fcf, i) => fcf / Math.pow(1 + adjWacc, i + 1));
          const adjTerminalValue = (finalYearFcf * (1 + adjTerminalGrowth)) / (adjWacc - adjTerminalGrowth);
          const adjPvTerminal = adjTerminalValue / Math.pow(1 + adjWacc, validatedDcfData.projectionYears);
          const adjEnterpriseValue = adjPresentValues.reduce((a, b) => a + b, 0) + adjPvTerminal;
          const adjEquityValue = adjEnterpriseValue - netDebt;
          
          row.push(adjEquityValue);
        }
        sensitivityMatrix.push(row);
      }

      const calculationResults = {
        wacc,
        freeCashFlows,
        presentValues,
        terminalValue,
        presentValueOfTerminalValue,
        enterpriseValue,
        equityValue,
        sensitivityMatrix,
        assumptions: {
          projectionYears: validatedDcfData.projectionYears,
          costOfEquity: validatedDcfData.costOfEquity,
          costOfDebt: validatedDcfData.costOfDebt,
          taxRate: validatedDcfData.taxRate,
          terminalGrowthRate: validatedDcfData.terminalGrowthRate,
        }
      };

      // Update valuation with results
      await storage.updateValuation(parseInt(id), {
        dcfData: validatedDcfData,
        enterpriseValue: enterpriseValue.toString(),
        equityValue: equityValue.toString(),
        sensitivityData: { dcf: sensitivityMatrix },
        status: 'completed'
      });

      res.json(calculationResults);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro no cálculo DCF' });
    }
  });

  // Calculate Multiples valuation
  app.post('/api/valuations/:id/calculate/multiples', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { multiplesData } = req.body;

      const existingValuation = await storage.getValuation(parseInt(id));
      if (!existingValuation || existingValuation.userId !== req.user.id) {
        return res.status(403).json({ message: 'Não autorizado' });
      }

      const validatedMultiplesData = multiplesDataSchema.parse(multiplesData);

      const results: any = {};

      // P/E Multiple Valuation
      if (validatedMultiplesData.peLuMultiple && validatedMultiplesData.netIncome) {
        results.peValuation = validatedMultiplesData.peLuMultiple * validatedMultiplesData.netIncome;
      }

      // EV/EBITDA Multiple Valuation
      if (validatedMultiplesData.evEbitdaMultiple && validatedMultiplesData.ebitda) {
        results.evEbitdaValuation = validatedMultiplesData.evEbitdaMultiple * validatedMultiplesData.ebitda;
      }

      // P/BV Multiple Valuation
      if (validatedMultiplesData.pvVpMultiple && validatedMultiplesData.bookValue) {
        results.pvVpValuation = validatedMultiplesData.pvVpMultiple * validatedMultiplesData.bookValue;
      }

      // EV/Revenue Multiple Valuation
      if (validatedMultiplesData.evRevenueMultiple && validatedMultiplesData.revenue) {
        results.evRevenueValuation = validatedMultiplesData.evRevenueMultiple * validatedMultiplesData.revenue;
      }

      // Calculate average valuation
      const valuations = Object.values(results).filter(v => v !== undefined) as number[];
      const averageValuation = valuations.length > 0 ? valuations.reduce((a, b) => a + b, 0) / valuations.length : 0;

      // Apply adjustments
      const liquidityAdjustment = 1 - validatedMultiplesData.liquidityDiscount;
      const controlAdjustment = 1 + validatedMultiplesData.controlPremium;
      const adjustedValuation = averageValuation * liquidityAdjustment * controlAdjustment;

      results.averageValuation = averageValuation;
      results.adjustedValuation = adjustedValuation;
      results.adjustments = {
        liquidityDiscount: validatedMultiplesData.liquidityDiscount,
        controlPremium: validatedMultiplesData.controlPremium,
      };

      // Update valuation with results
      await storage.updateValuation(parseInt(id), {
        multiplesData: validatedMultiplesData,
        enterpriseValue: adjustedValuation.toString(),
        equityValue: adjustedValuation.toString(), // For multiples, assuming enterprise = equity
        status: 'completed'
      });

      res.json(results);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro no cálculo por múltiplos' });
    }
  });

  // Delete valuation
  app.delete('/api/valuations/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existingValuation = await storage.getValuation(parseInt(id));

      if (!existingValuation) {
        return res.status(404).json({ message: 'Valuation não encontrado' });
      }

      // Check ownership
      if (existingValuation.userId !== req.user.id) {
        return res.status(403).json({ message: 'Não autorizado a excluir este valuation' });
      }

      await storage.deleteValuation(parseInt(id));
      res.json({ message: 'Valuation excluído com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao excluir valuation' });
    }
  });

  // Get user's valuations
  app.get('/api/users/me/valuations', authenticateToken, async (req: any, res) => {
    try {
      const valuations = await storage.getUserValuations(req.user.id);
      res.json(valuations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar valuations do usuário' });
    }
  });

  // Network API for investors to view companies with valuations
  app.get('/api/network/companies', authenticateToken, async (req: any, res) => {
    try {
      const { search, sector, status } = req.query;
      
      // Get companies with their latest valuations for the network view
      const companiesList = await storage.getCompanies(undefined, 'aprovada', search);
      
      // Get latest valuations for each company
      const companiesWithValuations = await Promise.all(
        companiesList.map(async (company: any) => {
          const latestValuation = await storage.getLatestCompanyValuation(company.id);
          return {
            ...company,
            latestValuation
          };
        })
      );

      res.json(companiesWithValuations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresas da rede' });
    }
  });

  // =============================================================================
  // END VALUATION ROUTES
  // =============================================================================

  // =============================================================================
  // PLATFORM NOTIFICATIONS ROUTES
  // =============================================================================

  // Admin: Create platform notification
  app.post('/api/admin/notifications', authenticateAdminToken, async (req: any, res) => {
    try {
      const notificationData = insertPlatformNotificationSchema.parse({
        ...req.body,
        criadoPor: req.user.id,
      });

      const notification = await storage.createPlatformNotification(notificationData);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar notificação' });
    }
  });

  // Admin: Get all platform notifications
  app.get('/api/admin/notifications', authenticateAdminToken, async (req: any, res) => {
    try {
      const { tipoUsuario, ativa } = req.query;
      const filters: any = {};
      
      if (tipoUsuario) filters.tipoUsuario = tipoUsuario as string;
      if (ativa !== undefined) filters.ativa = ativa === 'true';

      const notifications = await storage.getPlatformNotifications(filters);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar notificações' });
    }
  });

  // Admin: Update platform notification
  app.put('/api/admin/notifications/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = insertPlatformNotificationSchema.partial().parse(req.body);

      const notification = await storage.updatePlatformNotification(parseInt(id), updateData);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notificação não encontrada' });
      }

      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao atualizar notificação' });
    }
  });

  // Admin: Delete platform notification
  app.delete('/api/admin/notifications/:id', authenticateAdminToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePlatformNotification(parseInt(id));
      res.json({ message: 'Notificação excluída com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao excluir notificação' });
    }
  });

  // User: Get notifications for current user
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    try {
      const userType = req.user.type === 'admin' ? 'entrepreneur' : req.user.type;
      const notifications = await storage.getUserNotifications(req.user.id, userType);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar notificações' });
    }
  });

  // User: Mark notification as read
  app.post('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userType = req.user.type === 'admin' ? 'entrepreneur' : req.user.type;
      
      await storage.markNotificationAsRead(parseInt(id), req.user.id, userType);
      res.json({ message: 'Notificação marcada como lida' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao marcar notificação como lida' });
    }
  });

  // User: Get unread notifications count
  app.get('/api/notifications/unread/count', authenticateToken, async (req: any, res) => {
    try {
      const userType = req.user.type === 'admin' ? 'entrepreneur' : req.user.type;
      const count = await storage.getUnreadNotificationsCount(req.user.id, userType);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar contagem de notificações' });
    }
  });

  // Get users for notification targeting (Admin only)
  app.get('/api/admin/users/for-notifications', authenticateAdminToken, async (req: any, res) => {
    try {
      const { userType } = req.query;
      
      if (userType === 'entrepreneur') {
        const entrepreneurs = await storage.getUsersByTypeAndStatus('entrepreneur', 'ativo');
        res.json(entrepreneurs.map(user => ({
          id: user.id,
          nome: user.nomeCompleto || user.nome,
          email: user.email,
          tipo: 'entrepreneur'
        })));
      } else if (userType === 'investor') {
        const investors = await storage.getInvestors('ativo');
        res.json(investors.map(user => ({
          id: user.id,
          nome: user.nomeCompleto || user.nome,
          email: user.email,
          tipo: 'investor'
        })));
      } else {
        res.json([]);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar usuários' });
    }
  });

  // =============================================================================
  // END PLATFORM NOTIFICATIONS ROUTES
  // =============================================================================

  // =============================================================================
  // NETWORK ROUTES
  // =============================================================================

  // Get states
  app.get('/api/states', authenticateToken, async (req: any, res) => {
    try {
      const states = await storage.getStates();
      res.json(states);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar estados' });
    }
  });

  // Get cities by state
  app.get('/api/cities', authenticateToken, async (req: any, res) => {
    try {
      const { stateId } = req.query;
      if (!stateId) {
        return res.status(400).json({ message: 'State ID é obrigatório' });
      }
      const cities = await storage.getCitiesByState(parseInt(stateId as string));
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar cidades' });
    }
  });

  // Get network companies
  app.get('/api/network/companies', authenticateToken, async (req: any, res) => {
    try {
      const { stateId, cityId, search } = req.query;
      const filters: any = {
        excludeUserId: req.user.id, // Don't show user's own companies
      };
      
      if (stateId) filters.stateId = parseInt(stateId as string);
      if (cityId) filters.cityId = parseInt(cityId as string);
      if (search) filters.search = search as string;

      const companies = await storage.getNetworkCompanies(filters);
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar empresas da rede' });
    }
  });

  // Get network posts for a company
  app.get('/api/network/posts', authenticateToken, async (req: any, res) => {
    try {
      const { companyId } = req.query;
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID é obrigatório' });
      }
      const posts = await storage.getNetworkPosts(parseInt(companyId as string));
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao buscar posts' });
    }
  });

  // Create network post
  app.post('/api/network/posts', authenticateToken, async (req: any, res) => {
    try {
      const postData = insertNetworkPostSchema.parse({
        ...req.body,
        userId: req.user.id,
        userType: req.user.type || 'entrepreneur',
      });

      const post = await storage.createNetworkPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao criar post' });
    }
  });

  // Like/Unlike network post
  app.post('/api/network/posts/:id/like', authenticateToken, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userType = req.user.type || 'entrepreneur';
      
      await storage.likeNetworkPost(postId, req.user.id, userType);
      res.json({ message: 'Post curtido' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao curtir post' });
    }
  });

  // Comment on network post
  app.post('/api/network/posts/:id/comments', authenticateToken, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertNetworkCommentSchema.parse({
        postId,
        userId: req.user.id,
        userType: req.user.type || 'entrepreneur',
        content: req.body.content,
      });

      const comment = await storage.createNetworkComment(commentData);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erro ao comentar' });
    }
  });

  // Admin: Flag comment
  app.post('/api/admin/network/comments/:id/flag', authenticateAdminToken, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { reason } = req.body;
      
      await storage.flagNetworkComment(commentId, reason, req.user.id);
      res.json({ message: 'Comentário sinalizado' });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Erro ao sinalizar comentário' });
    }
  });

  // =============================================================================
  // END NETWORK ROUTES
  // =============================================================================

  // Password Reset Routes
  app.post('/api/password-reset/request', async (req, res) => {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      
      // Find user in entrepreneurs, investors, or admin users table
      let user = null;
      let userType = '';
      
      // Check entrepreneurs
      const entrepreneurs = await storage.getUsers('empreendedor');
      const entrepreneur = entrepreneurs.find(u => u.email === email);
      if (entrepreneur) {
        user = entrepreneur;
        userType = 'entrepreneur';
      }
      
      // Check investors
      if (!user) {
        const investors = await storage.getInvestors();
        const investor = investors.find(u => u.email === email);
        if (investor) {
          user = investor;
          userType = 'investor';
        }
      }
      
      // Check admin users
      if (!user) {
        const adminUsers = await storage.getAdminUsers();
        const adminUser = adminUsers.find(u => u.email === email);
        if (adminUser) {
          user = adminUser;
          userType = 'admin';
        }
      }
      
      if (!user) {
        // Return success even if user not found (security)
        return res.json({ message: 'Se o email existir, um link de recuperação será enviado.' });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Store token in database
      await storage.createPasswordResetToken({
        email,
        token: resetToken,
        userType,
        expiresAt,
        used: false
      });
      
      // Send email
      await emailService.sendPasswordResetEmail(email, resetToken, userType);
      
      res.json({ message: 'Se o email existir, um link de recuperação será enviado.' });
    } catch (error: any) {
      console.error('Password reset request error:', error);
      
      // Provide more specific error messages based on the error type
      if (error.message.includes('AWS credentials')) {
        res.status(500).json({ 
          message: 'Serviço de email temporariamente indisponível. Tente novamente mais tarde.' 
        });
      } else if (error.message.includes('FROM_EMAIL')) {
        res.status(500).json({ 
          message: 'Configuração de email pendente. Entre em contato com o administrador.' 
        });
      } else {
        res.status(500).json({ 
          message: 'Erro ao enviar email. Tente novamente em alguns minutos.' 
        });
      }
    }
  });

  app.post('/api/password-reset/confirm', async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = passwordResetConfirmSchema.parse(req.body);
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
      }
      
      // Find and validate token
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken || resetToken.used || new Date() > new Date(resetToken.expiresAt)) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      
      // Update user password based on type
      if (resetToken.userType === 'entrepreneur') {
        const entrepreneurs = await storage.getUsers('empreendedor');
        const user = entrepreneurs.find(u => u.email === resetToken.email);
        if (user) {
          await storage.updateUser(user.id, { senha: hashedPassword });
        }
      } else if (resetToken.userType === 'investor') {
        const investors = await storage.getInvestors();
        const user = investors.find(u => u.email === resetToken.email);
        if (user) {
          await storage.updateInvestor(user.id, { senha: hashedPassword });
        }
      } else if (resetToken.userType === 'admin') {
        const adminUsers = await storage.getAdminUsers();
        const user = adminUsers.find(u => u.email === resetToken.email);
        if (user) {
          await storage.updateAdminUser(user.id, { senha: hashedPassword });
        }
      }
      
      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(resetToken.id);
      
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
      console.error('Password reset confirm error:', error);
      res.status(500).json({ message: error.message || 'Erro ao redefinir senha' });
    }
  });

  // Email Confirmation Routes
  app.post('/api/email-confirmation/confirm', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'Token é obrigatório' });
      }

      const confirmationToken = await storage.getEmailConfirmationToken(token);
      
      if (!confirmationToken) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      if (confirmationToken.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Token expirado. Solicite um novo email de confirmação.' });
      }

      // Update user email confirmation status based on user type
      if (confirmationToken.userType === 'entrepreneur') {
        const entrepreneur = await storage.getEntrepreneurByEmail(confirmationToken.email);
        if (entrepreneur) {
          await storage.updateEntrepreneur(entrepreneur.id, { emailConfirmado: true });
        }
      } else if (confirmationToken.userType === 'investor') {
        const investor = await storage.getInvestorByEmail(confirmationToken.email);
        if (investor) {
          await storage.updateInvestor(investor.id, { emailConfirmado: true });
        }
      }

      // Delete the confirmation token
      await storage.deleteEmailConfirmationToken(confirmationToken.id);

      res.json({ message: 'Email confirmado com sucesso! Você já pode fazer login na plataforma.' });
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      res.status(500).json({ message: error.message || 'Erro ao confirmar email' });
    }
  });

  app.post('/api/email-confirmation/request', async (req, res) => {
    try {
      const { email, userType } = req.body;
      
      if (!email || !userType) {
        return res.status(400).json({ message: 'Email e tipo de usuário são obrigatórios' });
      }

      // Verify user exists and hasn't confirmed email yet
      let user = null;
      if (userType === 'entrepreneur') {
        user = await storage.getEntrepreneurByEmail(email);
      } else if (userType === 'investor') {
        user = await storage.getInvestorByEmail(email);
      }

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (user.emailConfirmado) {
        return res.status(400).json({ message: 'Email já foi confirmado' });
      }

      // Delete any existing confirmation tokens for this email
      await storage.deleteEmailConfirmationTokensByEmail(email);

      // Generate new confirmation token
      const confirmationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createEmailConfirmationToken({
        email,
        token: confirmationToken,
        userType,
        expiresAt
      });

      // Send confirmation email
      await emailService.sendEmailConfirmation(email, confirmationToken, userType);

      res.json({ message: 'Email de confirmação enviado com sucesso' });
    } catch (error: any) {
      console.error('Email confirmation request error:', error);
      res.status(500).json({ message: error.message || 'Erro ao solicitar confirmação de email' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}

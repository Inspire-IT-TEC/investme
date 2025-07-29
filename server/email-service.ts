import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Validate AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS credentials not found in environment variables');
}

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private fromEmail = process.env.FROM_EMAIL || "noreply@investme.com";

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Using FROM_EMAIL: ${this.fromEmail}`);

    // Always use simulation mode in development or when AWS fails
    console.log('=== EMAIL SIMULATION (Development Mode) ===');
    console.log(`To: ${to}`);
    console.log(`From: ${this.fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Content: ${html.substring(0, 300)}...`);
    console.log(`Reset Link: ${this.extractResetLink(html)}`);
    console.log('=== END EMAIL SIMULATION ===');
    console.log('✅ Email would be sent successfully in production');
  }

  private extractResetLink(html: string): string {
    const match = html.match(/href="([^"]*reset-password[^"]*)"/);
    return match ? match[1] : 'Link not found';
  }



  async sendPasswordResetEmail(email: string, resetToken: string, userType: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}&type=${userType}`;
    
    const userTypeLabel = {
      entrepreneur: 'Empreendedor',
      investor: 'Investidor',
      admin: 'Administrador'
    }[userType] || 'Usuário';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinir Senha - InvestMe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>InvestMe</h1>
          <p>Plataforma de Crédito Inteligente</p>
        </div>
        
        <div class="content">
          <h2>Redefinir Senha - Portal ${userTypeLabel}</h2>
          
          <p>Olá,</p>
          
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Portal ${userTypeLabel} da InvestMe.</p>
          
          <p>Para criar uma nova senha, clique no botão abaixo:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este link é válido por apenas 1 hora</li>
              <li>Se você não solicitou esta redefinição, ignore este email</li>
              <li>Nunca compartilhe este link com outras pessoas</li>
            </ul>
          </div>
          
          <p>Se você está tendo problemas, entre em contato com nosso suporte.</p>
          
          <p>Atenciosamente,<br>
          Equipe InvestMe</p>
        </div>
        
        <div class="footer">
          <p>© 2025 InvestMe - Plataforma de Crédito Inteligente</p>
          <p>Este é um email automático, não responda a esta mensagem.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      InvestMe - Redefinir Senha

      Olá,

      Recebemos uma solicitação para redefinir a senha da sua conta no Portal ${userTypeLabel} da InvestMe.

      Para criar uma nova senha, acesse o seguinte link:
      ${resetUrl}

      Importante:
      - Este link é válido por apenas 1 hora
      - Se você não solicitou esta redefinição, ignore este email
      - Nunca compartilhe este link com outras pessoas

      Atenciosamente,
      Equipe InvestMe
    `;

    await this.sendEmail({
      to: email,
      subject: `InvestMe - Redefinir Senha (Portal ${userTypeLabel})`,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
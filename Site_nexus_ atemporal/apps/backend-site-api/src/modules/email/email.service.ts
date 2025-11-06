import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendWelcomeEmail = async (email: string, name: string, plan: string) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6D4CFF 0%, #2463FF 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #6D4CFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo ao Nexus Atemporal!</h1>
    </div>
    <div class="content">
      <p>Olá ${name || 'Cliente'},</p>

      <p>Obrigado por assinar o plano <strong>${plan}</strong>! Sua conta foi criada com sucesso.</p>

      <p><strong>Próximos passos:</strong></p>
      <ol>
        <li>Acesse o sistema através do link abaixo</li>
        <li>Use o email <strong>${email}</strong> para fazer login</li>
        <li>Você receberá suas credenciais em instantes</li>
        <li>Explore todos os recursos do sistema</li>
      </ol>

      <div style="text-align: center;">
        <a href="https://one.nexusatemporal.com.br" class="button">
          Acessar Sistema
        </a>
      </div>

      <p>Se tiver qualquer dúvida, nossa equipe está à disposição:</p>
      <ul>
        <li>Email: <a href="mailto:suporte@nexusatemporal.com.br">suporte@nexusatemporal.com.br</a></li>
        <li>WhatsApp: +55 (11) 9999-9999</li>
      </ul>

      <p>Seja bem-vindo à família Nexus Atemporal! 🚀</p>

      <p>Atenciosamente,<br>
      <strong>Equipe Nexus Atemporal</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Nexus Atemporal. Todos os direitos reservados.</p>
      <p>Este é um email automático, por favor não responda.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'contato@nexusatemporal.com.br',
      to: email,
      subject: '🎉 Bem-vindo ao Nexus Atemporal!',
      html: htmlContent,
    });

    console.log('Welcome email sent to:', email);
  } catch (error: any) {
    console.error('Email error:', error.message);
    // Don't throw - email failure shouldn't block the flow
  }
};

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #6D4CFF; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📧 Nova mensagem do formulário de contato</h2>

    <div class="field">
      <div class="label">Nome:</div>
      <div>${data.name}</div>
    </div>

    <div class="field">
      <div class="label">Email:</div>
      <div>${data.email}</div>
    </div>

    ${data.phone ? `
    <div class="field">
      <div class="label">Telefone:</div>
      <div>${data.phone}</div>
    </div>
    ` : ''}

    <div class="field">
      <div class="label">Mensagem:</div>
      <div>${data.message}</div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'contato@nexusatemporal.com.br',
      to: process.env.SMTP_FROM || 'contato@nexusatemporal.com.br',
      replyTo: data.email,
      subject: `Contato: ${data.name}`,
      html: htmlContent,
    });

    console.log('Contact email sent from:', data.email);
  } catch (error: any) {
    console.error('Email error:', error.message);
    throw error;
  }
};

const nodemailer = require('nodemailer');

const users = [
  {
    email: 'ti.nexus@nexusatemporal.com.br',
    name: 'TI Nexus',
    password: 'Nexus@2025#TI'
  },
  {
    email: 'daniel@clinicaempireexcellence.com.br',
    name: 'Daniel',
    password: 'Empire@2025#Daniel'
  },
  {
    email: 'automacao@nexusatemporal.com.br',
    name: 'Automação Nexus',
    password: 'Nexus@2025#Auto'
  }
];

// Configurar transporter (usar as variáveis de ambiente do backend se disponíveis)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

function createEmailHTML(user) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boas-vindas ao Nexus Atemporal CRM</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                🎉 Bem-vindo ao Nexus Atemporal CRM
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">

                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Olá <strong>${user.name}</strong>,
                            </p>

                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Sua conta de <strong>Usuário Master (Administrador)</strong> foi criada com sucesso! 🚀
                            </p>

                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Você tem acesso total ao sistema Nexus Atemporal CRM e pode realizar todas as operações administrativas.
                            </p>

                            <!-- Credentials Box -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="margin: 0 0 15px; color: #667eea; font-size: 18px;">
                                    🔐 Suas Credenciais de Acesso
                                </h3>

                                <p style="margin: 0 0 10px; color: #555; font-size: 14px;">
                                    <strong>URL do Sistema:</strong><br>
                                    <a href="https://one.nexusatemporal.com.br" style="color: #667eea; text-decoration: none; font-size: 16px;">
                                        https://one.nexusatemporal.com.br
                                    </a>
                                </p>

                                <p style="margin: 15px 0 10px; color: #555; font-size: 14px;">
                                    <strong>Email:</strong><br>
                                    <span style="color: #333; font-size: 16px;">${user.email}</span>
                                </p>

                                <p style="margin: 15px 0 0; color: #555; font-size: 14px;">
                                    <strong>Senha Temporária:</strong><br>
                                    <code style="background-color: #fff; padding: 8px 12px; border-radius: 4px; color: #d63384; font-size: 16px; font-weight: bold; display: inline-block; margin-top: 5px;">
                                        ${user.password}
                                    </code>
                                </p>
                            </div>

                            <!-- Instructions -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="margin: 0 0 15px; color: #856404; font-size: 18px;">
                                    📌 Instruções Importantes
                                </h3>

                                <ol style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.8;">
                                    <li>Acesse o sistema usando as credenciais acima</li>
                                    <li>Recomendamos alterar sua senha após o primeiro login</li>
                                    <li>Você tem permissões de <strong>Administrador Master</strong></li>
                                    <li>Pode criar, editar e excluir leads, agendamentos e usuários</li>
                                </ol>
                            </div>

                            <!-- Development Notice -->
                            <div style="background-color: #cfe2ff; border-left: 4px solid #0d6efd; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="margin: 0 0 15px; color: #084298; font-size: 18px;">
                                    ⚠️ Sistema em Desenvolvimento
                                </h3>

                                <p style="margin: 0; color: #084298; font-size: 14px; line-height: 1.6;">
                                    O Nexus Atemporal CRM está em desenvolvimento ativo. Podem ocorrer:
                                </p>

                                <ul style="margin: 10px 0 0; padding-left: 20px; color: #084298; line-height: 1.8; font-size: 14px;">
                                    <li>Quedas temporárias do sistema</li>
                                    <li>Atualizações e melhorias constantes</li>
                                    <li>Mudanças de interface e funcionalidades</li>
                                </ul>

                                <p style="margin: 15px 0 0; color: #084298; font-size: 14px; line-height: 1.6;">
                                    Agradecemos sua compreensão e feedback! 🙏
                                </p>
                            </div>

                            <!-- Features -->
                            <h3 style="margin: 30px 0 15px; color: #333; font-size: 18px;">
                                ✨ Principais Funcionalidades
                            </h3>

                            <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8; font-size: 14px;">
                                <li>Gestão completa de Leads e Pipeline de Vendas</li>
                                <li>Sistema de Agendamentos com retornos automáticos</li>
                                <li>Prontuários Médicos com anamnese completa</li>
                                <li>Integração com WhatsApp para atendimento</li>
                                <li>Exportação e Importação de Leads (PDF, Excel, CSV, JSON)</li>
                                <li>Dark Mode para conforto visual</li>
                                <li>Múltiplas visualizações: Kanban, Lista, Grade, Timeline</li>
                            </ul>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0 20px;">
                                <a href="https://one.nexusatemporal.com.br" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                                    🚀 Acessar o Sistema Agora
                                </a>
                            </div>

                            <!-- Support -->
                            <p style="margin: 30px 0 0; color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                                Precisa de ajuda? Entre em contato com o suporte:<br>
                                <a href="mailto:suporte@nexusatemporal.com.br" style="color: #667eea; text-decoration: none;">
                                    suporte@nexusatemporal.com.br
                                </a>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                <strong>Nexus Atemporal CRM</strong>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                Sistema de Gestão Empresarial
                            </p>
                            <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                                © 2025 Nexus Atemporal. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

async function sendEmails() {
  console.log('🚀 Iniciando envio de emails de boas-vindas...\n');

  for (const user of users) {
    try {
      const mailOptions = {
        from: `"Nexus Atemporal CRM" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '🎉 Bem-vindo ao Nexus Atemporal CRM - Acesso Master Criado',
        html: createEmailHTML(user),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado para ${user.name} (${user.email})`);
      console.log(`   Message ID: ${info.messageId}\n`);
    } catch (error) {
      console.error(`❌ Erro ao enviar email para ${user.email}:`, error.message);
    }
  }

  console.log('✅ Processo de envio concluído!');
}

sendEmails();
